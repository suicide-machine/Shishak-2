const express = require("express")
const { body } = require("express-validator")
const validate = require("../middleware/validate")

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Teacher = require("../model/teacher")

const router = express.Router()

const signToken = (id, type) =>
  jwt.sign({ id, type }, process.env.JWT_SECRET, { expiresIn: "7d" })

router.post(
  "/teacher/register",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  validate,
  async (req, res) => {
    try {
      const exists = await Teacher.findOne({ email: req.body.email })

      if (exists) return res.badRequest("Teacher alredy exists")

      const hashed = await bcrypt.hash(req.body.password, 12)

      const teacher = await Teacher.create({ ...req.body, password: hashed })

      const token = signToken(teacher._id, "teacher")

      res.created(
        { token, user: { id: teacher._id, type: "teacher" } },
        "Teacher registered"
      )
    } catch (error) {
      res.serverError("Registration failed", [error.message])
    }
  }
)

router.post(
  "/teacher/login",
  [body("email").isEmail(), body("password").isLength({ min: 6 })],
  validate,
  async (req, res) => {
    try {
      const teacher = await Teacher.findOne({ email: req.body.email })

      if (!teacher || !teacher.password)
        return res.unauthorized("Invalid credentials")

      const match = await bcrypt.compare(req.body.password, teacher.password)

      if (!match) return res.unauthorized("Invalid credentials")

      const token = signToken(teacher._id, "teacher")

      res.created(
        { token, user: { id: teacher._id, type: "teacher" } },
        "Login successful"
      )
    } catch (error) {
      res.serverError("Login failed", [error.message])
    }
  }
)
