const express = require("express")
const { query, body } = require("express-validator")
const Teacher = require("../model/teacher")
const { authenticate } = require("../middleware/auth")

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
  }
)

//Get the profile of teacher
router.get("/me", authenticate, requireRole("teacher"), async (req, res) => {
  const teacher = await Teacher.findById(req.user._id).select(
    "-password -googleId"
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
  }
)
