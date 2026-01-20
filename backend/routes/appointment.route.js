const express = require("express")
const Appointment = require("../modal/Appointment")
const { authenticate } = require("../middleware/auth")
const { query, body } = require("express-validator")
const validate = require("../middleware/validate")

const router = express.Router()

//Teacher's appointment

router.get(
  "/teacher",
  authenticate,
  requireRole("teacher"),
  [
    query("status").optional().isArray().withMessage("Status can be an array"),
    query("status.*")
      .optional()
      .isString()
      .withMessage("Each status must be an string"),
  ],
  validate,
  async (req, res) => {
    try {
      const { status } = req.query
      const filter = { teacherId: req.auth.id }

      if (status) {
        const statusArray = Array.isArray(status) ? status : [status]
        filter.status = { $in: statusArray }
      }

      const appointment = await Appointment.find(filter)
        .populate("studentId", "name email phone dob age profileImage")
        .populate(
          "teacherId",
          "name hourlyRate phone subject profileImage locationInfo",
        )
        .sort({ slotStartIso: 1, slotEndIso: 1 })

      res.ok(appointment, "Appointment fetched successfully")
    } catch (error) {
      console.error("Teacher appointment fetch error", error)

      res.serverError("Failed to fetch appointment", [error.message])
    }
  },
)

//student appointment
router.get(
  "/student",
  authenticate,
  requireRole("student"),
  [
    query("status").optional().isArray().withMessage("Status can be an array"),
    query("status.*")
      .optional()
      .isString()
      .withMessage("Each status must be an string"),
  ],
  validate,
  async (req, res) => {
    try {
      const { status } = req.query
      const filter = { studentId: req.auth.id }

      if (status) {
        const statusArray = Array.isArray(status) ? status : [status]
        filter.status = { $in: statusArray }
      }

      const appointment = await Appointment.find(filter)
        .populate(
          "teacherId",
          "name hourlyRate phone subject locationInfo profileImage",
        )
        .populate("studentId", "name email profileImage")
        .sort({ slotStartIso: 1, slotEndIso: 1 })

      res.ok(appointment, "Appointment fetched successfully")
    } catch (error) {
      console.error("Student appointment fetch error", error)
      res.serverError("Failed to fetch appointment", [error.message])
    }
  },
)

//Get booked slot for tutor on specific date
router.get("/booked-slots/:teacherId/:date", async (req, res) => {
  try {
    const { teacherId, date } = req.params

    const startDay = new Date(date)
    startDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const bookedAppointment = await Appointment.find({
      teacherId,
      slotStartIso: { $gte: startDay, $lte: endOfDay },
      status: { $ne: "Cancelled" },
    }).select("slotStartIso")

    const bookedSlot = bookedAppointment.map((apt) => apt.slotStartIso)

    res.ok(bookedSlot, "Booked slot retrieved")
  } catch (error) {
    res.serverError("Failed to fetch booked slot", [error.message])
  }
})
