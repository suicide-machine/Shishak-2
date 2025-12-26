const express = require("express")
const { query } = require("express-validator")
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

//Get the profile of doctor
router.get("/me", authenticate, requireRole("teacher"), async (req, res) => {
  const teacher = await Teacher.findById(req.user._id).select(
    "-password -googleId"
  )

  res.ok(teacher, "Profile fetched")
})
