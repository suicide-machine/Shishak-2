"use client"

import { LocationInfo, TeacherFormData } from "@/lib/types"
import { userAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
import React, { ChangeEvent, useState } from "react"

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

  const { updateProfile, user, loading } = userAuthStore()
  const router = useRouter()

  const handleCategoryToggle = (category: string): void => {
    setFormData((prev: TeacherFormData) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c: string) => c !== category)
        : [...prev.categories, category],
    }))
  }

  const handleInputChnage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = event.target
    setFormData((prev: TeacherFormData) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLocationInfoChange = (
    field: keyof LocationInfo,
    value: string
  ): void => {
    setFormData((prev) => ({
      ...prev,
      locationInfo: {
        ...prev.locationInfo,
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (): Promise<void> => {
    try {
      await updateProfile({
        subject: formData.subject,
        category: formData.categories,
        qualification: formData.qualification,
        experience: formData.experience,
        about: formData.about,
        hourlyRate: formData.hourlyRate,
        locationInfo: formData.locationInfo,
        availabilityRange: {
          startDate: new Date(formData.availabilityRange.startDate),
          endDate: new Date(formData.availabilityRange.endDate),
          excludedWeekdays: formData.availabilityRange.excludedWeekdays,
        },
        dailyTimeRanges: formData.dailyTimeRanges,
        slotDurationMinutes: formData.slotDurationMinutes,
      })

      router.push("/teacher/dashboard")
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

  return <div></div>
}

export default TeacherOnboardingForm
