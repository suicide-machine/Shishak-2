const mongoose = require("mongoose")
const { computeAgeFromDob } = require("../utils/date")

const guardianSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relationship: {
      type: String,
      required: true,
    },
  },
  { _id: false }
)

// Academic History Schema (replaces medicalHistory)
const academicHistorySchema = new mongoose.Schema(
  {
    previousQualifications: { type: String, default: "" }, // e.g., "10th CBSE - 95%"
    areasOfDifficulty: { type: String, default: "" }, // Subjects/topics struggling with
    specialRequirements: { type: String, default: "" }, // Any special learning needs
  },
  { _id: false }
)

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String },

    googleId: { type: String, unique: true, sparse: true },

    profileImage: { type: String, default: "" },

    phone: { type: String },

    dob: { type: Date },

    age: { type: Number },

    gender: { type: String, enum: ["male", "female", "other"] },

    currentInstitution: { type: String },

    class: { type: String },

    board: {
      type: String,
      enum: ["CBSE", "ICSE", "State Board", "Other"],
    },

    // Academic Information
    preferredTutorGender: {
      type: String,
      enum: ["male", "female", "any", "no-preference"],
      default: "no-preference",
    },

    preferredTeachingMedium: {
      type: [String],
      enum: ["offline", "online"],
      default: ["offline"],
    },

    guardian: guardianSchema,

    academicBackground: academicHistorySchema,
  },
  { timestamps: true }
)

studentSchema.pre("save", function (next) {
  if (this.dob && this.isModified("dob")) {
    this.age = computeAgeFromDob(this.dob)
  }
  next()
})

module.exports = mongoose.model("Student", studentSchema)
