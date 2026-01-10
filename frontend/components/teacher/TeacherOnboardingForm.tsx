"use client"

import { TeacherFormData } from "@/lib/types"
import React, { useState } from "react"

const TeacherOnboardingForm = () => {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [formData, setFormData] = useState<TeacherFormData>({
    subject: "",
    categories: [],
    qualification: "",
    experience: "",
    hourlyRate: "",
    about: "",
    locationInfo: {
      name: "",
      address: "",
      city: "",
    },
    availabilityRange: {
      startDate: "",
      endDate: "",
      excludedWeekdays: [],
    },
    dailyTimeRanges: [
      { start: "09:00", end: "12:00" },
      { start: "14:00", end: "17:00" },
    ],
    slotDurationMinutes: 30,
  })

  return <div>TeacherOnboardingForm</div>
}

export default TeacherOnboardingForm
