import AuthForm from "@/components/auth/AuthForm"
import React from "react"

export const metadata = {
  title: "Student Login - Shikshak",
  description:
    "Expert tutoring that's affordable, with or without a subscription. Quality learning, accessible anytime, anywhere.",
}

export default function StudentSignUpPage() {
  return <AuthForm type="signup" userRole="student" />
}
