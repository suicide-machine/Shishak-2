const express = require("express")
const { body } = require("express-validator")
const validate = require("../middleware/validate")

const router = express.Router()

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
    } catch (error) {}
  }
)
