const mongoose = require("mongoose")

const subjectCategoriesList = [
  "Mathematics",
  "Science",
  "English & Writing",
  "Programming & CS",
  "Test Prep",
  "Foreign Languages",
  "Humanities & Arts",
  "Business & Finance",
  "Homework Help",
]

const availabilityRangeSchema = new mongoose.Schema(
  {
    startDate: { type: String },
    endDate: { type: String },
    excludedWeekdays: { type: [Number], default: [] }, //0-6 (Sun-Sat)
  },
  { _id: false }
)

const dailyTimeRangeSchema = new mongoose.Schema(
  {
    start: { type: String }, //09:00
    end: { type: String }, //12:00
  },
  { _id: false }
)

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String },

  googleId: { type: String, unique: true, sparse: true },

  profileImage: { type: String, default: "" },

  subject: {
    type: String,
    enum: [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "English",
      "Computer Science",
      "History",
      "Economics",
      "Programming",
      "Test Prep",
    ],
  },

  category: { type: [String], enum: subjectCategoriesList, required: false },

  qualification: { type: String, required: false },

  experience: { type: Number },

  about: { type: String },

  hourlyRate: { type: Number },

  locationInfo: {
    name: String,
    address: String,
    city: String,
  },

  availabilityRange: availabilityRangeSchema,

  dailyTimeRanges: { type: [dailyTimeRangeSchema], default: [] },

  slotDurationMinutes: { type: Number, default: 60 },

  isVerified: { type: Boolean, default: false },
})

module.exports = mongoose.model("Teacher", teacherSchema)
