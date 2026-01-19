"use client"
import { TeacherFilters } from "@/lib/types"
import { useTeacherStore } from "@/store/teacherStore"
import { useSearchParams } from "next/navigation"
import React, { useEffect, useState } from "react"

const TeacherListPage = () => {
  const searchParams = useSearchParams()
  const categoryParams = searchParams.get("category")

  const { teachers, loading, fetchTeachers } = useTeacherStore()

  const [filters, setFilters] = useState<TeacherFilters>({
    search: "",
    subject: "",
    category: categoryParams || "",
    city: "",
    sortBy: "experience",
    sortOrder: "desc",
  })

  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchTeachers(filters)
  }, [fetchTeachers, filters])

  const handleFilterChange = (key: keyof TeacherFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      subject: "",
      category: categoryParams || "",
      city: "",
      sortBy: "experience",
      sortOrder: "desc",
    })
  }

  const activeFilterCount = Object.values(filters).filter(
    (value) => value && value !== "experience" && value !== "desc"
  ).length

  return <div>TeacherListPage</div>
}

export default TeacherListPage
