import React from "react"

interface AuthFormProps {
  type: "login" | "signup"
  userRole: "teacher" | "student"
}

const AuthForm = ({ type, userRole }: AuthFormProps) => {
  return <div>AuthForm</div>
}

export default AuthForm
