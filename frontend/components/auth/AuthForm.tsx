import { userAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
import React, { useState } from "react"

interface AuthFormProps {
  type: "login" | "signup"
  userRole: "teacher" | "student"
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

const AuthForm = ({ type, userRole }: AuthFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const {
    registerStudent,
    registerTeacher,
    loginStudent,
    loginTeacher,
    loading,
    error,
  } = userAuthStore()

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (type === "signup" && !agreeToTerms) return

    try {
      if (type === "signup") {
        if (userRole === "teacher") {
          await registerTeacher({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          })
        } else {
          await registerStudent({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          })
        }

        router.push(`/onboarding/${userRole}`)
      } else {
        if (userRole === "teacher") {
          await loginTeacher(formData.email, formData.password)
          router.push("/teacher/dashboard")
        } else {
          await loginStudent(formData.email, formData.password)
          router.push("/student/dashboard")
        }
      }
    } catch (error) {
      console.log(error)
      console.error(`${type} failed:`, error)
    }
  }

  const handleGoogleAuth = () => {
    window.location.href = `${BASE_URL}/auth/google?type=${userRole}`
  }
  return <div>AuthForm</div>
}

export default AuthForm
