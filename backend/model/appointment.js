const mongoose = require("mongoose")

const appointmentSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    date: { type: Date, required: true },

    slotStartIso: { type: String, required: true },

    slotEndIso: { type: String, required: true },

    appointmentType: {
      type: String,
      enum: ["Video Appointment", "Voice Call"],
      default: "Video Appointment",
    },

    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled", "In Progress"],
      default: "Scheduled",
    },

    subject: { type: String, default: "" },

    zegoRoomId: { type: String, default: "" },

    feedback: { type: String, default: "" },

    notes: { type: String, default: "" },

    //Payment fields
    appointmentFees: { type: Number, required: true },

    platformFees: { type: Number, required: true },

    totalAmount: { type: Number, required: true },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "refunded"],
      default: "Pending",
    },

    payoutStatus: {
      type: String,
      enum: ["Pending", "Paid", "Cancelled"],
      default: "Pending",
    },

    payoutDate: { type: Date },

    paymentMethod: { type: String, default: "Online" },

    //razorPay payment field
    razorpayOrderId: { type: String },

    razorpayPaymentId: { type: String },

    razorpaySignature: { type: String },

    paymentDate: { type: Date },
  },
  { timestamps: true },
)

// 1 means ascending order
// unique: true means uniqueness is enforced across that combination of fields
appointmentSchema.index(
  { teacherId: 1, date: 1, slotStartIso: 1 },
  { unique: true },
)

module.exports = mongoose.model("Appointment", appointmentSchema)
