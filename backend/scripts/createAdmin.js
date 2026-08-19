const mongoose = require("mongoose")
const Admin = require("../model/admin")
const bcrypt = require("bcryptjs")
const path = require("path")

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
})

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    console.log("Connected to db")

    const existingAdmin = await Admin.findOne({ email: "admin@gmail.com" })

    if (existingAdmin) {
      console.log("Admin user alredy exists")
      process.exit(1)
    }

    const hashedPassword = await bcrypt.hash("admin@gmail.com", 12)

    const admin = new Admin({
      name: "System_Administrator",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "super_admin",
      isActive: true,
      permissions: {
        userManagement: true,
        teacherManagement: true,
        paymentManagement: true,
        analytics: true,
      },
    })

    await admin.save()
    console.log("Admin user created successfully")
    console.log(admin.email)
    console.log(admin.password)
  } catch (error) {
    console.log("Error creating admin user", error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

createAdmin()
