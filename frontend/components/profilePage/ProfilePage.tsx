"use client"

import { subjectCategories } from "@/lib/constant"
import { userAuthStore } from "@/store/authStore"
import { useEffect, useState } from "react"

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

  return <div>ProfilePage</div>
}

export default ProfilePage
