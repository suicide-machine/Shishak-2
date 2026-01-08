"use client"

import { userAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
import React, { ChangeEvent, useState } from "react"

interface Guardian {
  name: string
  phone: string
  relationship: string
}

interface AcademicBackground {
  previousQualifications: string
  areasOfDifficulty: string
  specialRequirements: string
}

interface StudentOnboardingData {
  phone: string
  dob: string
  gender: string
  educationLevel?: string
  guardian: Guardian
  academicBackground: AcademicBackground
}

const StudentOnboardingForm = () => {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [formData, setFormData] = useState<StudentOnboardingData>({
    phone: "",
    dob: "",
    gender: "",
    educationLevel: "",
    guardian: {
      name: "",
      phone: "",
      relationship: "",
    },
    academicBackground: {
      previousQualifications: "",
      areasOfDifficulty: "",
      specialRequirements: "",
    },
  })

  const { updateProfile, user, loading } = userAuthStore()

  const router = useRouter()

  const handleInputChnage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string): void => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGurdianChnage = (field: keyof Guardian, value: string): void => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.guardian,
        [field]: value,
      },
    }))
  }

  const handleAcademicBackgroundChnage = (
    field: keyof AcademicBackground,
    value: string
  ): void => {
    setFormData((prev) => ({
      ...prev,
      medicalHistory: {
        ...prev.academicBackground,
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (): Promise<void> => {
    try {
      await updateProfile({
        Phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender,
        educationLevel: formData.educationLevel,
        guardian: formData.guardian,
        academicBackground: formData.academicBackground,
      })

      router.push("/")
    } catch (error) {
      console.error("Profile update failed", error)
    }
  }

  const handleNext = (): void => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = (): void => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return <div>SudentOnboardingForm</div>
}

export default StudentOnboardingForm
