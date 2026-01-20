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
      console.error("Doctor appointment fetch error", error)

      res.serverError("Failed to fetch appointment", [error.message])
    }
  },
)
