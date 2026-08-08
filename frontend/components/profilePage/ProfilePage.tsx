"use client"

import { subjectCategories } from "@/lib/constant"
import { userAuthStore } from "@/store/authStore"
import {
  Award,
  BookOpen,
  Briefcase,
  Clock,
  DollarSign,
  FileText,
  MapPin,
  Phone,
  User,
  Users,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import Header from "../landing/Header"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"

interface ProfileProps {
  userType: "teacher" | "student"
}

const ProfilePage = ({ userType }: ProfileProps) => {
  const { user, fetchProfile, updateProfile, loading } = userAuthStore()
  const [activeSection, setActiveSection] = useState("about")
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    educationLevel: "",
    about: "",
    subject: "",
    category: [],
    qualification: "",
    experience: 0,
    hourlyRate: 0,
    locationInfo: {
      name: "",
      address: "",
      city: "",
    },
    academicBackground: {
      previousQualifications: "",
      areasOfDifficulty: "",
      specialRequirements: "",
    },
    guardian: {
      name: "",
      phone: "",
      relationship: "",
    },

    availabilityRange: {
      startDate: "",
      endDate: "",
      excludedWeekdays: [],
    },
    dailyTimeRanges: [],
    slotDurationMinutes: 30,
  })

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        dob: user.dob || "",
        gender: user.gender || "",
        educationLevel: user.educationLevel || "",
        about: user.about || "",
        subject: user.subject || "",
        category: user.category || [],
        qualification: user.qualification || "",
        experience: user.experience || 0,
        hourlyRate: user.hourlyRate || 0,
        locationInfo: {
          name: user.locationInfo?.name || "",
          address: user.locationInfo?.address || "",
          city: user.locationInfo?.city || "",
        },
        academicBackground: {
          allergies: user.academicBackground?.previousQualifications || "",
          currentMedications: user.academicBackground?.areasOfDifficulty || "",
          chronicConditions: user.academicBackground?.specialRequirements || "",
        },
        guardian: {
          name: user.guardian?.name || "",
          phone: user.guardian?.phone || "",
          relationship: user.guardian?.relationship || "",
        },
        availabilityRange: {
          startDate: user.availabilityRange?.startDate || "",
          endDate: user.availabilityRange?.endDate || "",
          excludedWeekdays: user.availabilityRange?.excludedWeekdays || [],
        },
        dailyTimeRanges: user.dailyTimeRanges || [],
        slotDurationMinutes: user.slotDurationMinutes || 30,
      })
    }
  }, [user])

  const handleInputChnage = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev: any) => ({ ...prev, [field]: value }))
    }
  }

  const handleArrayChnage = (
    field: string,
    index: number,
    subField: string,
    value: any,
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].map((item: any, i: number) =>
        i === index ? { ...item, [subField]: value } : item,
      ),
    }))
  }

  const handleCategorySelect = (category: any): void => {
    if (!formData.category.includes(category.title)) {
      handleInputChnage("category", [...formData.category, category.title])
    }
  }

  const handleCategoryDelete = (indexToDelete: number) => {
    const currentCategories = [...formData.category]
    const newCategories = currentCategories.filter(
      (_: any, i: number) => i !== indexToDelete,
    )
    setFormData((prev: any) => ({
      ...prev,
      category: newCategories,
    }))
  }

  const getAvailableCategories = () => {
    return subjectCategories.filter(
      (cat) => !formData.category.includes(cat.title),
    )
  }

  const addTimeRange = () => {
    setFormData((prev: any) => ({
      ...prev,
      dailyTimeRanges: [
        ...prev.dailyTimeRanges,
        { start: "09:00", end: "17:00" },
      ],
    }))
  }

  const removeTimeRange = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      dailyTimeRanges: prev.dailyTimeRanges.filter(
        (_: any, i: number) => i !== index,
      ),
    }))
  }

  const handleWeekdayToggle = (weekday: number) => {
    const excludedWeekdays = [...formData.availabilityRange.excludedWeekdays]
    const index = excludedWeekdays.indexOf(weekday)

    if (index > -1) {
      excludedWeekdays.splice(index, 1)
    } else {
      excludedWeekdays.push(weekday)
    }

    handleInputChnage("availabilityRange.excludedWeekdays", excludedWeekdays)
  }

  const handleSave = async () => {
    try {
      await updateProfile(formData)
      setIsEditing(false)
    } catch (error) {
      console.error(error)
    }
  }

  const formatDateForInput = (isoDate: string): string => {
    if (!isoDate) return ""
    const date = new Date(isoDate)
    if (isNaN(date.getTime())) return ""
    return date.toISOString().split("T")[0]
  }

  const sidebarItems =
    userType === "teacher"
      ? [
          { id: "about", label: "About", icon: User },
          {
            id: "professional",
            label: "Professional Info",
            icon: Briefcase, // or GraduationCap
          },
          { id: "subjects", label: "Subjects Taught", icon: BookOpen },
          { id: "qualifications", label: "Qualifications", icon: Award },
          { id: "availability", label: "Availability", icon: Clock },
          { id: "pricing", label: "Pricing & Rates", icon: DollarSign },
          { id: "location", label: "Location", icon: MapPin },
        ]
      : [
          { id: "about", label: "About", icon: User },
          { id: "contact", label: "Contact Information", icon: Phone },
          { id: "guardian", label: "Guardian Information", icon: Users },
          { id: "academic", label: "Academic Background", icon: FileText },
        ]

  const renderAboutSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <Label>Legal first name</Label>

          <Input
            value={formData.name}
            onChange={(e) => handleInputChnage("name", e.target.value)}
            disabled={!isEditing}
            className="w-80"
          />
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "about":
        return renderAboutSection()
    }
  }

  return (
    <>
      <Header showDashboardNav={true} />

      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Records</h1>
          </div>

          <div className="flex items-center space-x-8 mb-8">
            <div className="flex flex-col items-center">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.profileImage} alt={user?.name} />

                <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <p className="mt-2 text-lg font-semibold">{user?.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? "bg-blue-100 text-blue-600 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />

                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold capitalize">
                      {
                        sidebarItems.find((item) => item.id === activeSection)
                          ?.label
                      }
                    </h2>

                    <div className="flex space-x-2">
                      {isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>

                          <Button onClick={handleSave} disabled={loading}>
                            {loading ? "Saving..." : "Save"}
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => setIsEditing(true)}>Edit</Button>
                      )}
                    </div>
                  </div>

                  {renderContent()}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfilePage
