const express = require("express")
const { body } = require("express-validator")
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

module.exports = router
