"use client"

import { LocationInfo, TeacherFormData } from "@/lib/types"
import { userAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
import React, { ChangeEvent, useState } from "react"
import { Card, CardContent } from "../ui/card"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { subjectCategoriesList, subjects } from "@/lib/constant"
import { Input } from "../ui/input"
import { Checkbox } from "../ui/checkbox"
import { Button } from "../ui/button"

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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardContent className="p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">
                Professional Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="specialization">Teaching Subject</Label>

                  <Select
                    value={formData.subject}
                    onValueChange={(value: string) =>
                      setFormData((prev) => ({
                        ...prev,
                        subject: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject"></SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                      {subjects.map((subject: string) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience </Label>

                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    value={formData.experience}
                    placeholder="e.g., 5"
                    onChange={handleInputChnage}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Other Subject Categories</Label>

                <p className="text-sm text-gray-600">
                  Select the other subject areas you provide tutoring for
                  (Select at least one)
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {subjectCategoriesList.map((category: string) => (
                    <div className="flex items-center space-x-2" key={category}>
                      <Checkbox
                        id={category}
                        checked={formData.categories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />

                      <label
                        htmlFor={category}
                        className="text-sm font-medium cursor-pointer hover:text-blue-600"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>

                {formData.categories.length === 0 && (
                  <p className="text-red-500 text-xs">
                    Please select at least one category
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification </Label>

                <Input
                  id="qualification"
                  name="qualification"
                  type="text"
                  value={formData.qualification}
                  placeholder="e.g., B. Tech, M.Sc, B. Sc"
                  onChange={handleInputChnage}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="about">About You </Label>

                <Input
                  id="about"
                  name="about"
                  type="text"
                  value={formData.about}
                  placeholder="Tell students about your expertise and approach to tutoring..."
                  onChange={handleInputChnage}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Fee (₹) </Label>

                <Input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  value={formData.hourlyRate}
                  placeholder="e.g., 500"
                  onChange={handleInputChnage}
                  required
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
            </div>
          )}

          <div className="flex justify-between pt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 1 && formData.categories.length === 0}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "Completing Setup..." : "Complete Profile"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TeacherOnboardingForm
