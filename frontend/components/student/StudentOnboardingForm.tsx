"use client"

import { userAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
import React, { ChangeEvent, useState } from "react"
import { Card, CardContent } from "../ui/card"
import { Phone, User } from "lucide-react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Button } from "../ui/button"
import { Alert, AlertDescription } from "../ui/alert"

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
      guardian: {
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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome {user?.name} to Shikshak
        </h1>

        <p className="text-gray-600">
          Complete your profile to start booking tutors
        </p>
      </div>

      {/* Progress step */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-300 text-gray-400"
                }`}
              >
                {step}
              </div>

              {step < 3 && (
                <div
                  className={`w-20 h-1 ${
                    currentStep > step ? "bg-blue-600" : "bg-gray-300"
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <User className="w-5 h-5 text-blue-600" />

                <h2 className="text-xl font-semibold">Basic Information</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number </Label>

                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    placeholder="+91 985467238"
                    onChange={handleInputChnage}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth </Label>
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleInputChnage}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>

                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      handleSelectChange("gender", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender"></SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>

                      <SelectItem value="female">Female</SelectItem>

                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="educationLevel">Education Level</Label>

                  <Select
                    value={formData.educationLevel}
                    onValueChange={(value) =>
                      handleSelectChange("educationLevel", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Education Level"></SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>

                      <SelectItem value="secondary">Secondary</SelectItem>

                      <SelectItem value="high-school">High School</SelectItem>

                      <SelectItem value="college">College</SelectItem>

                      <SelectItem value="university">University</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <Phone className="w-5 h-5 text-blue-600" />

                <h2 className="text-xl font-semibold">Guardian Contact</h2>
              </div>

              <Alert>
                <AlertDescription>
                  This information will be used to contact someone on your
                  behalf in case of any problem during tutoring.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="guardianName">Contact Name</Label>

                  <Input
                    id="guardianName"
                    value={formData.guardian.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleGurdianChnage("name", e.target.value)
                    }
                    placeholder="Full name"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="guardianPhone">Contact Phone</Label>

                  <Input
                    id="guardianPhone"
                    value={formData.guardian.phone}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleGurdianChnage("phone", e.target.value)
                    }
                    placeholder="+91 9919326233"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>

                  <Select
                    value={formData.guardian.relationship}
                    onValueChange={(value) =>
                      handleGurdianChnage("relationship", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship"></SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="father">Father</SelectItem>

                      <SelectItem value="mother">Mother</SelectItem>

                      <SelectItem value="brother">Brother</SelectItem>

                      <SelectItem value="friend">Friend</SelectItem>

                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                disabled={
                  (currentStep === 1 &&
                    (!formData.phone || !formData.dob || !formData.gender)) ||
                  (currentStep === 2 &&
                    (!formData.guardian.name ||
                      !formData.guardian.phone ||
                      !formData.guardian.relationship)) ||
                  (currentStep === 3 &&
                    (!formData.academicBackground.previousQualifications ||
                      !formData.academicBackground.areasOfDifficulty ||
                      !formData.academicBackground.specialRequirements))
                }
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

export default StudentOnboardingForm
