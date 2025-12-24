const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const Student = require("../model/student")
const Teacher = require("../model/teacher")

require("dotenv").config()

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const userType = req.query.state || "student"

        const { emails, displayName, photos } = profile

        const email = emails?.[0]?.value

        const photo = photos?.[0]?.value

        if (userType === "teacher") {
          let user = await Teacher.findOne({ email })

          if (!user) {
            user = await Teacher.create({
              googleId: profile.id,
              email,
              name: displayName,
              profileImage: photo,
              isVerified: true,
            })
          } else {
            if (!user.googleId) {
              user.googleId = profile.id
              user.profileImage = photo
              await user.save()
            }
          }

          return done(null, { user, type: "teacher" })
        } else {
          let user = await Student.findOne({ email })

          if (!user) {
            user = await Student.create({
              googleId: profile.id,
              email,
              name: displayName,
              profileImage: photo,
              isVerified: true,
            })
          } else {
            if (!user.googleId) {
              user.googleId = profile.id
              user.profileImage = photo
              await user.save()
            }
          }

          return done(null, { user, type: "student" })
        }
      } catch (error) {
        return done(error)
      }
    }
  )
)

module.exports = passport
