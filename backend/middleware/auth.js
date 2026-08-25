const jwt = require("jsonwebtoken")
const Teacher = require("../model/teacher")
const Student = require("../model/student")
const teacher = require("../model/teacher")
const admin = require("../model/admin")

module.exports = {
  authenticate: async (req, res, next) => {
    try {
      const header = req.headers.authorization

      const token = header.startsWith("Bearer ") ? header.slice(7) : null

      if (!token) return res.unauthorized("Missing token")

      const decode = jwt.verify(token, process.env.JWT_SECRET)

      req.auth = decode

      if (decode.type === "teacher") {
        req.user = await Teacher.findById(decode.id)
      } else if (decode.type === "student") {
        req.user = await Student.findById(decode.id)
      } else if (decode.type === "admin") {
        req.user = await admin.findById(decode.id)
      }

      if (!req.user) return res.unauthorized("Invalid user")

      next()
    } catch (error) {
      return res.unauthorized("Invalid or expired token")
    }
  },

  requireRole: (role) => (req, res, next) => {
    if (!req.auth || req.auth.type !== role) {
      return res.forbidden("Insufficient role permissions")
    }
    next()
  },

  requireAdmin: (req, res, next) => {
    if (!req.auth || req.auth.type !== "admin") {
      return res.forbidden("Admin access required")
    }

    if (!req.user || !req.user.isActive) {
      return res.forbidden("Admin Account inactive")
    }

    next()
  },

  requirePermission: (permission) => (req, res, next) => {
    if (
      !req.user ||
      !req.user.permissions ||
      !req.user.permissions[permission]
    ) {
      return res.forbidden(`Permission required: ${permission}`)
    }

    next()
  },
}
