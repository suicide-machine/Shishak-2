const express = require("express")
const mongoose = require("mongoose")
const helmet = require("helmet")
const morgan = require("morgan")
const cors = require("cors")
const bodyParser = require("body-parser")

require("dotenv").config()

const response = require("./middleware/response")

const app = express()

//helmet is a security middleware for Express
//It helps protect your app by settings various HTTP headers
app.use(helmet())

//morgan is an HTTP request logger middleware
app.use(morgan("dev"))

app.use(
  cors({
    origin:
      (process.env.ALLOWED_ORIGINS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) || "*",
    credentials: true,
  })
)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//used response
app.use(response)

//Mongodb connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err))

app.get("/health", (req, res) =>
  res.ok({ time: new Date().toISOString() }, "OK")
)

const PORT = process.env.PORT || 8000

app.listen(PORT, () => console.log(`Server listening on ${PORT}`))
