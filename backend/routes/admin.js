const express = require("express")
const { body } = require("express-validator")
const validate = require("../middleware/validate")
const Admin = require("../model/admin")
const bcrypt = require("bcryptjs")
const { authenticate, requireAdmin } = require("../middleware/auth")
const admin = require("../model/admin")

const jwt = require("jsonwebtoken")


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

module.exports = router
