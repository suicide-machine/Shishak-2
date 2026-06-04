const express = require("express")
const { query, body } = require("express-validator")
const Teacher = require("../model/teacher")
const { authenticate, requireRole } = require("../middleware/auth")
const validate = require("../middleware/validate")

const router = express.Router()

router.get(
  "/list",
  [
    query("search").optional().isString(),
    query("subject").optional().isString(),
    query("city").optional().isString(),
    query("category").optional().isString(),
    query("minFees").optional().isInt({ min: 0 }),
    query("maxFees").optional().isInt({ min: 0 }),
    query("sortBy")
      .optional()
      .isIn(["fees", "experience", "name", "createdAt"]),
    query("sortOrder").optional().isIn(["asc", "desc"]),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  async (req, res) => {
    try {
      const {
        search,
        subject,
        city,
        category,
        minFees,
        maxFees,
        sortBy = "createdAt",
        sortOrder = "desc",
        page = 1,
        limit = 20,
      } = req.query

      const filter = { isVerified: true }

      if (subject)
        filter.subject = {
          $regex: `^${subject}$`,
          $options: "i",
        }

      if (city) filter["locationInfo.city"] = { $regex: city, $options: "i" }

      if (category) {
        filter.category = category
      }

      if (minFees || maxFees) {
        filter.hourlyRate = {}
        if (minFees) filter.hourlyRate.$gte = Number(minFees)
        if (maxFees) filter.hourlyRate.$lte = Number(maxFees)
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
          { "locationInfo.name": { $regex: search, $options: "i" } },
        ]
      }

      const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 }

      const skip = (Number(page) - 1) * Number(limit)

      const [items, total] = await Promise.all([
        Teacher.find(filter)
          .select("-password -googleId")
          .sort(sort)
          .skip(skip)
          .limit(Number(limit)),

        Teacher.countDocuments(filter),
      ])

      res.ok(items, "Teachers fetched", {
        page: Number(page),
        limit: Number(limit),
        total,
      })
    } catch (error) {
      console.error("Teacher fetched failed", error)

      res.serverError("Doctor fetched failed", [error.message])
    }
  },
)

//Get the profile of teacher
router.get("/me", authenticate, requireRole("teacher"), async (req, res) => {
  const teacher = await Teacher.findById(req.user._id).select(
    "-password -googleId",
  )

  res.ok(teacher, "Profile fetched")
})

//update teacher profile
router.put(
  "/onboarding/update",
  authenticate,
  requireRole("teacher"),
  [
    body("name").optional().notEmpty(),
    body("subject").optional().notEmpty(),
    body("qualification").optional().notEmpty(),
    body("category").optional().notEmpty(),
    body("experience").optional().isInt({ min: 0 }),
    body("about").optional().isString(),
    body("hourlyRate").optional().isInt({ min: 0 }),
    body("locationInfo").optional().isObject(),
    body("availabilityRange.startDate").optional().isISO8601(),
    body("availabilityRange.endDate").optional().isISO8601(),
    body("availabilityRange.excludedWeekdays").optional().isArray(),
    body("dailyTimeRanges").isArray({ min: 1 }),
    body("dailyTimeRanges.*.start").isString(),
    body("dailyTimeRanges.*.end").isString(),
    body("slotDurationMinutes").optional().isInt({ min: 5, max: 180 }),
  ],
  validate,
  async (req, res) => {
    try {
      const updated = { ...req.body }

      delete updated.password

      updated.isVerified = true

      const teacher = await Teacher.findByIdAndUpdate(req.user._id, updated, {
        new: true,
      }).select("-password -googleId")

      res.ok(teacher, "Profile updated")
    } catch (error) {
      res.serverError("updated failed", [error.message])
    }
  },
)

router.get("/:teacherId", validate, async (req, res) => {
  try {
    const { teacherId } = req.params
    const teacher = await Teacher.findById(teacherId)
      .select("-password -googleId")
      .lean()

    if (!teacher) {
      return res.notFound("Teacher not found")
    }

    res.ok(teacher, "teacher details fetched successfully")
  } catch (error) {
    res.serverError("Fetching teacher failed", [error.message])
  }
})

//teacher dashboard
router.get(
  "/dashboard",
  authenticate,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const teacherId = req.auth.id
      const now = new Date()

      //Proper date range calculation
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0,
      )

      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      )

      const teacher = await Teacher.findById(teacherId)
        .select("-password -googleId")
        .lean()

      if (!teacher) {
        return res.notFound("teacher not found")
      }

      //Today's appointment with full population
      const todayAppointments = await Appointment.find({
        teacherId,
        slotStartIso: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: "Cancelled" },
      })
        .populate("studentId", "name profileImage age email phone")
        .populate("teacherId", "name hourlyRate profileImage subject")
        .sort({ slotStartIso: 1 })

      //upcoming appointment with full population
      const upcomingAppointments = await Appointment.find({
        teacherId,
        slotStartIso: { $gt: endOfDay },
        status: { $ne: "Cancelled" },
      })
        .populate("studentId", "name profileImage age email phone")
        .populate("teacherId", "name hourlyRate profileImage subject")
        .sort({ slotStartIso: 1 })
        .limit(5)

      const uniqueStudentIds = await Appointment.distinct("studentId", {
        teacherId,
      })

      const totalStudents = uniqueStudentIds.length

      const completedAppointmentCount = await Appointment.countDocuments({
        teacherId,
        status: "Completed",
      })

      const totalAppointment = await Appointment.find({
        teacherId,
        status: "Completed",
      })

      const totalRevenue = totalAppointment.reduce(
        (sum, apt) => sum + (apt.fees || teacher.hourlyRate || 0),
        0,
      )

      const dashboardData = {
        user: {
          name: teacher.name,
          hourlyRate: teacher.hourlyRate,
          profileImage: teacher.profileImage,
          subject: teacher.subject,
          locationInfo: teacher.locationInfo,
        },

        stats: {
          totalStudents,
          todayAppointments: todayAppointments.length,
          totalRevenue,
          completedAppointments: completedAppointmentCount,
          averageRating: 4.8,
        },

        todayAppointments,
        upcomingAppointments,

        performance: {
          studentSatisfaction: 4.8,
          completionRate: 98,
          responseTime: "< 2min",
        },
      }

      res.ok(dashboardData, "Dashboard data retrived")
    } catch (error) {
      console.error("Dashboard error", error)
      res.serverError("failed to fetch teacher dashboard", [error.message])
    }
  },
)

module.exports = router
