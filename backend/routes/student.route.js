const express = require("express")
const Student = require("../model/student")
const { authenticate, requireRole } = require("../middleware/auth")
const { body } = require("express-validator")
const validate = require("../middleware/validate")
const { computeAgeFromDob } = require("../utils/date")

const router = express.Router()

//Get the profile of student
router.get("/me", authenticate, requireRole("student"), async (req, res) => {
  const student = await Student.findById(req.user._id).select(
    "-password -googleId"
  )

  res.ok(student, "Profile fetched")
})

//update student profile
router.put(
  "/onboarding/update",
  authenticate,
  requireRole("student"),
  [
    body("name").optional().notEmpty(),
    body("phone").optional().isString(),
    body("dob").optional().isISO8601(),
    body("gender").optional().isIn(["male", "female", "other"]),
    body("educationLevel").optional().isString(),
    body("guardian").optional().isObject(),
    body("guardian.name").optional().isString().notEmpty(),
    body("guardian.phone").optional().isString().notEmpty(),
    body("guardian.relationship").optional().isString().notEmpty(),

    body("academicBackground").optional().isObject(),
    body("academicBackground.previousQualifications")
      .optional()
      .isString()
      .notEmpty(),
    body("academicBackground.areasOfDifficulty")
      .optional()
      .isString()
      .notEmpty(),
    body("academicBackground.specialRequirements")
      .optional()
      .isString()
      .notEmpty(),
  ],
  validate,
  async (req, res) => {
    try {
      const updated = { ...req.body }

      if (updated.dob) {
        updated.age = computeAgeFromDob(updated.dob)
      }

      delete updated.password

      updated.isVerified = true

      const student = await Student.findByIdAndUpdate(req.user._id, updated, {
        new: true,
      }).select("-password -googleId")

      res.ok(student, "Profile updated")
    } catch (error) {
      res.serverError("updated failed", [error.message])
    }
  }
)

module.exports = router
