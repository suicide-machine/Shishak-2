const express = require("express")
const Appointment = require("../model/appointment")
const { authenticate, requireRole } = require("../middleware/auth")
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

router.post(
  "/book",
  authenticate,
  requireRole("student"),
  [
    body("teacherId").isMongoId().withMessage("valid teacher ID is required"),
    body("slotStartIso")
      .isISO8601()
      .withMessage("valid start time is required"),
    body("slotEndIso").isISO8601().withMessage("valid end time is required"),
    body("appointmentType")
      .isIn(["Video Appointment", "Voice Call"])
      .withMessage("valid Appointment type required"),
    body("subject").isString().trim().withMessage("subject is required"),
    body("appointmentFees")
      .isNumeric()
      .withMessage("appointmentFees is required"),
    body("platformFees").isNumeric().withMessage("platformFees is required"),
    body("totalAmount").isNumeric().withMessage("totalAmount is required"),
  ],
  validate,
  async (req, res) => {
    try {
      const {
        teacherId,
        slotStartIso,
        slotEndIso,
        date,
        appointmentType,
        subject,
        appointmentFees,
        platformFees,
        totalAmount,
      } = req.body

      const confictingAppointment = await Appointment.findOne({
        doctorId,
        status: { $in: ["Scheduled", "In Progress"] },
        $or: [
          {
            slotStartIso: { $lt: new Date(slotEndIso) },
            slotEndIso: { $gt: new Date(slotStartIso) },
          },
        ],
      })

      if (confictingAppointment) {
        return res.forbidden("This time slot is alredy booked")
      }

      //Generate unique roomId
      const zegoRoomId = `room_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`

      const appointment = new Appointment({
        teacherId,
        studentId: req.auth.id,
        date: new Date(date),
        slotStartIso: new Date(slotStartIso),
        slotEndIso: new Date(slotEndIso),
        appointmentType,
        subject,
        zegoRoomId,
        status: "Scheduled",
        appointmentFees,
        platformFees,
        totalAmount,
        paymentStatus: "Pending",
        payoutStatus: "Pending",
      })

      await appointment.save()

      await appointment.populate(
        "teacherId",
        "name hourlyRate phone subject profileImage locationInfo",
      )

      await appointment.populate("studentId", "name email")

      res.created(appointment, "Appointment booked successfully")
    } catch (error) {
      console.error("Book appointment error", error)
      res.serverError("Failed to book appointment", [error.message])
    }
  },
)

//Get single appointment by id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.find(filter)
      .populate(
        "teacherId",
        "name hourlyRate phone subject locationInfo profileImage",
      )
      .populate("studentId", "name email profileImage dob age")

    if (!appointment) {
      return res.notFound("Appointment not found")
    }

    //check if user has access to this appointment
    const userRole = req.auth.type

    if (
      userRole === "teacher" &&
      appointment.teacherId._id.toString() !== req.auth.id
    ) {
      return res.forbidden("Access denied")
    }

    if (
      userRole === "student" &&
      appointment.studentId._id.toString() !== req.auth.id
    ) {
      return res.forbidden("Access denied")
    }

    res.ok({ appointment }, "Appointment fetched successfully")
  } catch (error) {
    console.error("Get appointment error", error)
    res.serverError("Failed to Get appointment", [error.message])
  }
})

//Join
router.get("/join/:id", authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("studentId", "name ")
      .populate("teacherId", "name")

    if (!appointment) {
      return res.notFound("Appointment not found")
    }

    appointment.status = "In Progress"

    await appointment.save()

    res.ok(
      { roomId: appointment.zegoRoomId, appointment },
      "Appointment joined successfully",
    )
  } catch (error) {
    console.error("Join appointment error", error)
    res.serverError("Failed to Join appointment", [error.message])
  }
})

//End
router.put("/end/:id", authenticate, async (req, res) => {
  try {
    const { feedback, notes } = req.body

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status: "Completed",
        feedback,
        notes,
        updatedAt: new Date(),
      },
      { new: true },
    ).populate("studentId teacherId")

    if (!appointment) {
      return res.notFound("Appointment not found")
    }

    res.ok(appointment, "Appointment completed successfully")
  } catch (error) {
    console.error("End appointment error", error)
    res.serverError("Failed to End appointment", [error.message])
  }
})

//update appointment status by teacher
router.put(
  "/status/:id",
  authenticate,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const { status } = req.body
      const appointment = await Appointment.findById(req.params.id).populate(
        "studentId teacherId",
      )

      if (!appointment) {
        return res.notFound("Appointment not found")
      }

      if (appointment.teacherId._id.toString() !== req.auth.id) {
        return res.forbidden("Access denied")
      }

      appointment.status = status
      appointment.updatedAt = new Date()
      await appointment.save()

      res.ok(appointment, "Appointment status updated successfully")
    } catch (error) {
      console.error("updated Appointment status error", error)
      res.serverError("Failed to updated Appointment status", [error.message])
    }
  },
)

module.exports = router
