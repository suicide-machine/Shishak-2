const express = require("express")
const { body } = require("express-validator")
const validate = require("../middleware/validate")
const Admin = require("../model/admin")
const bcrypt = require("bcryptjs")
const { authenticate, requireAdmin } = require("../middleware/auth")
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

module.exports = router
