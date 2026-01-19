"use client"
import { TeacherFilters } from "@/lib/types"
import { useTeacherStore } from "@/store/teacherStore"
import { useSearchParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import Header from "../landing/Header"
import { FilterIcon, Search } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"

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

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Header />

      <div className="bg-white border-b ">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Choose your Teacher
              </h1>
              <p className="text-gray-600 mt-1">
                Find the perfect teacher for your needs
              </p>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 " />

              <Input
                placeholder="Search teachers by name , subjects..."
                className="pl-10 h-12 text-base"
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              className="h-12 px-4"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterIcon className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-blue-300 text-blue-800"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherListPage
