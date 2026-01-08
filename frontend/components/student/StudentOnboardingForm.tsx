"use client"

import React, { useState } from "react"

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
  return <div>SudentOnboardingForm</div>
}

export default StudentOnboardingForm
