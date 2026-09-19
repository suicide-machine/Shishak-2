const express = require("express")
const { body, param } = require("express-validator")
const validate = require("../middleware/validate")
const Admin = require("../model/admin")
const bcrypt = require("bcryptjs")
const {
  authenticate,
  requireAdmin,
  requirePermission,
} = require("../middleware/auth")
const admin = require("../model/admin")

const jwt = require("jsonwebtoken")
const Student = require("../model/student")
const Teacher = require("../model/teacher")
const Appointment = require("../model/appointment")

const router = express.Router()

const signToken = (id, type) =>
  jwt.sign({ id, type }, process.env.JWT_SECRET, { expiresIn: "7d" })

router.post(
  "/auth/login",
  [body("email").isEmail(), body("password").notEmpty()],
  validate,
  async (req, res) => {
    try {
      const admin = await Admin.findOne({ email: req.body.email })

      if (!admin || !admin.isActive) {
        return res.forbidden("Invalid credentials or invalid account")
      }

      const validatePassword = await bcrypt.compare(
        req.body.password,
        admin.password,
      )

      if (!validatePassword) return res.unauthorized("Invalid credentials")

      admin.lastLogin = new Date()

      await admin.save()

      const token = signToken(admin._id, "admin")

      res.ok(
        {
          token,
          user: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions,
            type: "admin",
          },
        },
        "Admin login successfully",
      )
    } catch (error) {
      res.serverError("Login failed", [error.message])
    }
  },
)

// Get admin profile
router.get("/profile", authenticate, requireAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select("-password")

    res.ok(admin, "Admin profile fetched successfully")
  } catch (error) {
    res.serverError("Profile fetched failed", [e.message])
  }
})

// Using Cluade
router.get("/dashboard", authenticate, requireAdmin, async (req, res) => {
  try {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5) // include current month = 6 months total
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const [
      totalStudents,
      totalTeachers,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      totalRevenueAgg,
      monthlyRevenueAgg,
      studentGrowthAgg,
      teacherGrowthAgg,
      appointmentStatsAgg,
    ] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "Completed" }),
      Appointment.countDocuments({ status: "Scheduled" }),

      // total revenue (all-time)
      Appointment.aggregate([
        { $match: { status: "Completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      // monthly revenue, last 6 months
      Appointment.aggregate([
        {
          $match: {
            status: "Completed",
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            total: { $sum: "$totalAmount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // student growth, last 6 months
      Student.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // teacher growth, last 6 months
      Teacher.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // appointment breakdown by status
      Appointment.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ])

    // --- shape monthly revenue into a fixed 6-month array (fills in zero months) ---
    const monthLabels = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setDate(1)
      d.setMonth(d.getMonth() - i)
      monthLabels.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1, // 1-indexed to match $month
        label: d.toLocaleString("en-US", { month: "short", year: "numeric" }),
      })
    }

    const monthlyRevenue = monthLabels.map(({ year, month, label }) => {
      const found = monthlyRevenueAgg.find(
        (m) => m._id.year === year && m._id.month === month,
      )
      return { month: label, revenue: found?.total || 0 }
    })

    // --- shape user growth (students + teachers combined per month) ---
    const userGrowth = monthLabels.map(({ year, month, label }) => {
      const students =
        studentGrowthAgg.find(
          (m) => m._id.year === year && m._id.month === month,
        )?.count || 0
      const teachers =
        teacherGrowthAgg.find(
          (m) => m._id.year === year && m._id.month === month,
        )?.count || 0
      return { month: label, students, teachers, total: students + teachers }
    })

    // --- shape appointment status breakdown into a clean object ---
    const appointmentStats = appointmentStatsAgg.reduce((acc, s) => {
      acc[s._id] = s.count
      return acc
    }, {})

    const stats = {
      totalStudents,
      totalTeachers,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      totalRevenue: totalRevenueAgg[0]?.total || 0,
      monthlyRevenue,
      userGrowth,
      appointmentStats,
    }

    res.ok(stats, "Admin dashboard data retrieved")
  } catch (error) {
    console.error("Admin dashboard error", error)
    res.serverError("Failed to fetch admin dashboard", [error.message])
  }
})

// Get all users (using claude)
router.get(
  "/users",
  authenticate,
  requireAdmin,
  requirePermission("userManagement"),
  async (req, res) => {
    try {
      const {
        type = "all", // "student" | "teacher" | "all"
        search = "",
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query

      const pageNum = Math.max(1, parseInt(page))
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
      const skip = (pageNum - 1) * limitNum
      const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 }

      const searchFilter = search
        ? {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
            ],
          }
        : {}

      const fetchStudents = type === "all" || type === "student"
      const fetchTeachers = type === "all" || type === "teacher"

      const [students, studentCount, teachers, teacherCount] =
        await Promise.all([
          fetchStudents
            ? Student.find(searchFilter)
                .select("-password")
                .sort(sort)
                .skip(type === "all" ? 0 : skip) // pagination handled after merge when type=all
                .limit(type === "all" ? 0 : limitNum)
                .lean()
            : Promise.resolve([]),

          fetchStudents
            ? Student.countDocuments(searchFilter)
            : Promise.resolve(0),

          fetchTeachers
            ? Teacher.find(searchFilter)
                .select("-password")
                .sort(sort)
                .skip(type === "all" ? 0 : skip)
                .limit(type === "all" ? 0 : limitNum)
                .lean()
            : Promise.resolve([]),

          fetchTeachers
            ? Teacher.countDocuments(searchFilter)
            : Promise.resolve(0),
        ])

      // Tag each record with its type
      const taggedStudents = students.map(({ _id, ...s }) => ({
        ...s,
        id: _id.toString(),
        userType: "student",
      }))
      const taggedTeachers = teachers.map(({ _id, ...t }) => ({
        ...t,
        id: _id.toString(),
        userType: "teacher",
      }))

      let users, total

      if (type === "all") {
        // Merge, sort, then paginate in-memory
        const merged = [...taggedStudents, ...taggedTeachers].sort((a, b) => {
          const valA = a[sortBy] ?? ""
          const valB = b[sortBy] ?? ""
          if (valA < valB) return sortOrder === "asc" ? -1 : 1
          if (valA > valB) return sortOrder === "asc" ? 1 : -1
          return 0
        })

        total = merged.length
        users = merged.slice(skip, skip + limitNum)
      } else {
        users = type === "student" ? taggedStudents : taggedTeachers
        total = type === "student" ? studentCount : teacherCount
      }

      res.ok(
        {
          users,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
          },
          summary: { students: studentCount, teachers: teacherCount },
        },
        "Users fetched successfully",
      )
    } catch (error) {
      res.serverError("Failed to fetch users", [error.message])
    }
  },
)

// Update user status
/**
 * PUT /admin/users/:userId/status
 *
 * Toggles `isActive` or `isVerified` (or both) for a Student or Teacher.
 *
 * Request body:
 * {
 *   type:       "student" | "teacher"   — which collection to update (required)
 *   isActive:   boolean                 — optional: enable / disable account
 *   isVerified: boolean                 — optional: approve / revoke verification
 * }
 *
 * At least one of `isActive` or `isVerified` must be provided.
 */
router.put(
  "/users/:userId/status",
  authenticate,
  requireAdmin,
  requirePermission("userManagement"),
  async (req, res) => {
    try {
      const { userId } = req.params
      const { type, isActive, isVerified } = req.body

      // ── 1. Validate user type ────────────────────────────────────────────
      if (!type || !["student", "teacher"].includes(type)) {
        return res.badRequest("User type must be 'student' or 'teacher'")
      }

      // ── 2. Ensure at least one status field was actually sent ────────────
      const hasActive = typeof isActive === "boolean"
      const hasVerified = typeof isVerified === "boolean"

      if (!hasActive && !hasVerified) {
        return res.badRequest(
          "Provide at least one of: isActive (boolean), isVerified (boolean)",
        )
      }

      // ── 3. Pick the right model based on type ───────────────────────────
      const Model = type === "student" ? Student : Teacher

      // ── 4. Build only the fields that were explicitly sent ───────────────
      //    Avoids accidentally overwriting a field that wasn't in the request
      const updateFields = {}
      if (hasActive) updateFields.isActive = isActive
      if (hasVerified) updateFields.isVerified = isVerified

      // ── 5. Find and update, return the updated doc (without password) ────
      const updatedUser = await Model.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true, select: "-password" }, // `new: true` → return updated doc
      )

      if (!updatedUser) {
        return res.notFound(`${type} not found`)
      }

      // ── 6. Build a human-readable summary of what changed ───────────────
      const changes = []
      if (hasActive) changes.push(`isActive → ${isActive}`)
      if (hasVerified) changes.push(`isVerified → ${isVerified}`)

      res.ok(
        { user: { ...updatedUser.toObject(), userType: type } },
        `User status updated: ${changes.join(", ")}`,
      )
    } catch (error) {
      // Mongoose throws a CastError when userId is not a valid ObjectId
      if (error.name === "CastError") {
        return res.badRequest("Invalid user ID format")
      }
      res.serverError("Failed to update user status", [error.message])
    }
  },
)

// Payment get for payout to teachers
router.get(
  "/payments",
  authenticate,
  requireAdmin,
  requirePermission("paymentManagement"),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        payoutStatus, // e.g. "Pending" | "Paid" | "Failed" — undefined means fetch all
      } = req.query

      const pageNum = Math.max(1, parseInt(page))
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
      const skip = (pageNum - 1) * limitNum

      // ── Match query ───────────────────────────────────────────────────────
      // Always scope to Completed appointments only — only completed
      // appointments are eligible for teacher payout
      const matchQuery = { status: "Completed" }
      if (payoutStatus) matchQuery.payoutStatus = payoutStatus

      // Get completed appointment with payment details
      const result = await Appointment.aggregate([
        {
          $match: matchQuery,
        },
        {
          $lookup: {
            from: "teachers",
            localField: "teacherId",
            foreignField: "_id",
            as: "teacher",
          },
        },
        {
          $unwind: "$teacher",
        },
        {
          $lookup: {
            from: "students",
            localField: "studentId",
            foreignField: "_id",
            as: "student",
          },
        },
        {
          $unwind: "$student",
        },
        {
          $project: {
            _id: 1,
            appointmentType: 1,
            subject: 1,
            date: 1,
            slotStartIso: 1,
            slotEndIso: 1,
            status: 1,
            appointmentFees: 1,
            platformFees: 1,
            totalAmount: 1,
            paymentStatus: 1,
            paymentMethod: 1,
            paymentDate: 1,
            payoutStatus: 1,
            razorpayPaymentId: 1,
            razorpayOrderId: 1,
            createdAt: 1,

            teacher: {
              _id: "$teacher._id",
              name: "$teacher.name",
              email: "$teacher.email",
              phone: "$teacher.phone",
              hourlyRate: "$teacher.hourlyRate",
              subject: "$teacher.subject",
              profileImage: "$teacher.profileImage",
              locationInfo: "$teacher.locationInfo",
            },

            student: {
              _id: "$student._id",
              name: "$student.name",
              email: "$student.email",
              phone: "$student.phone",
              profileImage: "$student.profileImage",
            },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: limitNum }],
            totalCount: [{ $count: "count" }],
          },
        },
      ])

      const payments = result[0]?.data || []
      const total = result[0]?.totalCount[0]?.count || 0

      res.ok(
        {
          payments,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
          },
        },
        "Payments retrieved successfully",
      )
    } catch (error) {
      console.error("Fetch payments error", error)
      res.serverError("Failed to fetch payments", [error.message])
    }
  },
)

// Process payout to teacher
// Needs: const { body, param } = require("express-validator")  ← add `param` to your existing import

// Process payout to teacher
router.put(
  "/payments/:appointmentId/payout",
  authenticate,
  requireAdmin,
  requirePermission("paymentManagement"),
  [
    // CHANGED: validate the ID shape and restrict payoutStatus to real enum values
    param("appointmentId")
      .isMongoId()
      .withMessage("Valid appointment ID is required"),
    body("payoutStatus")
      .isIn(["Pending", "Paid", "Failed"])
      .withMessage("payoutStatus must be one of: Pending, Paid, Failed"),
  ],
  validate,
  async (req, res) => {
    try {
      const { appointmentId } = req.params
      const { payoutStatus } = req.body

      const appointment = await Appointment.findById(appointmentId)

      if (!appointment) {
        return res.notFound("Appointment not found")
      }

      if (appointment.status !== "Completed") {
        return res.badRequest(
          "Can only process payouts for completed appointments",
        )
      }

      // CHANGED: don't allow paying a teacher before the student's payment
      // has actually been collected
      if (appointment.paymentStatus !== "Paid") {
        return res.badRequest(
          "Cannot process payout before payment is collected",
        )
      }

      // CHANGED: guard against re-processing an already-completed payout
      if (appointment.payoutStatus === "Paid" && payoutStatus === "Paid") {
        return res.badRequest("Payout has already been processed")
      }

      const payoutAmount = appointment.appointmentFees
      const platformFees = appointment.platformFees

      // CHANGED: wrapped in $set — without this, Mongo treats the object as a
      // full document replacement and deletes every other field on save
      const updateData = {
        $set: {
          payoutStatus,
          ...(payoutStatus === "Paid" && { payoutDate: new Date() }),
        },
      }

      const updateAppointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        updateData,
        { new: true },
      )
        .populate("teacherId", "name email")
        .populate("studentId", "name email")

      res.ok(
        {
          ...updateAppointment.toObject(),
          payoutAmount,
          platformFees,
        },
        payoutStatus === "Paid"
          ? `Payout marked as paid. Teacher receives ${payoutAmount}, platform fee is ${platformFees}`
          : `Payout ${payoutStatus.toLowerCase()} successfully`,
      )
    } catch (error) {
      // CHANGED: consistent CastError handling + server-side logging,
      // matching the rest of this file
      if (error.name === "CastError") {
        return res.badRequest("Invalid appointment ID format")
      }
      console.error("Process payout error", error)
      res.serverError("Failed to process payout", [error.message])
    }
  },
)

// hardcoded
// router.put(
//   "/payments/:appointmentId/payout",
//   authenticate,
//   requireAdmin,
//   requirePermission("paymentManagement"),
//   async (req, res) => {
//     try {
//       const { appointmentId } = req.params
//       const { payoutStatus } = req.body

//       const appointment = await Appointment.findById(appointmentId)

//       if (!appointment) {
//         return res.notFound("Appointment not found")
//       }

//       if (appointment.status !== "Completed") {
//         return res.badRequest(
//           "Can only process payouts for completed appointments",
//         )
//       }

//       const payoutAmount = appointment.appointmentFees
//       const platformFees = appointment.platformFees

//       const updateData = {
//         payoutStatus,
//       }

//       if (payoutStatus === "Paid") {
//         updateData.payoutDate = new Date()
//       }

//       const updateAppointment = await Appointment.findByIdAndUpdate(
//         appointmentId,
//         updateData,
//         { new: true },
//       )
//         .populate("teacherId", "name email")
//         .populate("studentId", "name email")

//       res.ok(
//         {
//           ...updateAppointment.toObject(),
//           payoutAmount,
//           platformFees,
//           message:
//             payoutStatus === "Paid"
//               ? `Payout marked as paid. Teacher receive ${payoutAmount}, platform fees is ${platformFees}`
//               : `Payout ${payoutStatus.toLowerCase()} successfully`,
//         },
//         `Payout ${payoutStatus.toLowerCase()} successfully`,
//       )
//     } catch (error) {
//       res.serverError("Failed to payout payments", [error.message])
//     }
//   },
// )

module.exports = router
