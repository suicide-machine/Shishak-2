"use client"

import { useSearchParams } from "next/navigation"
import Header from "../landing/Header"
import { userAuthStore } from "@/store/authStore"
import { useTeacherStore } from "@/store/teacherStore"
import { Activity, useEffect, useState } from "react"
import { useAppointmentStore } from "@/store/appointmentStore"
import { Calendar, DollarSign, MapPin, Star, Users } from "lucide-react"
import FeedbackModal from "./FeedbackModal"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

const TeacherDashboardContent = () => {
  const searchParams = useSearchParams()
  const { user } = userAuthStore()
  const {
    dashboard: dashboardData,
    fetchDashboard,
    loading,
  } = useTeacherStore()

  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [completingAppointmentId, setCompletingAppointmentId] = useState<
    string | null
  >(null)
  const [modalLoading, setModalLoading] = useState(false)
  const { endAppointment, fetchAppointmentById, currentAppointment } =
    useAppointmentStore()

  useEffect(() => {
    if (user?.type === "teacher") {
      fetchDashboard(user?.type)
    }
  }, [user, fetchDashboard])

  useEffect(() => {
    const completedCallId = searchParams.get("completedCall")
    if (completedCallId) {
      setCompletingAppointmentId(completedCallId)
      fetchAppointmentById(completedCallId)
      setShowFeedbackModal(true)
    }
  }, [searchParams, fetchAppointmentById])

  const handleSavePrescription = async (feedback: string, notes: string) => {
    if (!completingAppointmentId) return
    setModalLoading(true)

    try {
      await endAppointment(completingAppointmentId, feedback, notes)
      setShowFeedbackModal(false)
      setCompletingAppointmentId(null)

      if (user?.type) {
        fetchDashboard(user.type)
      }

      const url = new URL(window.location.href)
      url.searchParams.delete("completedCall")
      window.history.replaceState({}, "", url.pathname)
    } catch (error) {
      console.error("failed to complete appointment", error)
    } finally {
      setModalLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowFeedbackModal(false)
    setCompletingAppointmentId(null)
    const url = new URL(window.location.href)
    url.searchParams.delete("completedCall")
    window.history.replaceState({}, "", url.pathname)
  }

  const formateDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const canJoinCall = (appointment: any) => {
    const appointmentTime = new Date(appointment.slotStartIso)
    const now = new Date()
    const diffMintues =
      (appointmentTime.getTime() - now.getTime()) / (1000 * 60)

    return (
      diffMintues <= 15 && //not earliar than 15 min before start
      diffMintues >= -120 && //not later than 2 hours after start
      (appointment.status === "Scheduled" ||
        appointment.status === "In Progress")
    )
  }

  if (loading || !dashboardData) {
    return (
      <>
        <Header showDashboardNav={true} />
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-8">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-300 rounded w-64"></div>
                  <div className="h-4 bg-gray-300 rounded w-48"></div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const studentName = currentAppointment?.studentId?.name

  const statsCards = [
    {
      title: "Total Students",
      value: dashboardData?.stats?.totalPatients?.toString() || "0",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+12%",
      changeColor: "text-green-600",
    },
    {
      title: "Today's Appointments",
      value: dashboardData?.stats?.todayAppointments?.toString() || "0",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+8%",
      changeColor: "text-green-600",
    },
    {
      title: "Total Revenue",
      value: `₹${dashboardData?.stats?.totalRevenue?.toLocaleString() || "0"}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+25%",
      changeColor: "text-green-600",
    },
    {
      title: "Completed",
      value: dashboardData?.stats?.completedAppointments?.toString() || "0",
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: "+18%",
      changeColor: "text-green-600",
    },
  ]

  return (
    <>
      <Header showDashboardNav={true} />

      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 ">
                <Avatar className="w-20 h-20 ring-4 ring-blue-100">
                  <AvatarImage
                    src={dashboardData?.user?.profileImage}
                    alt={dashboardData?.user?.name}
                  />

                  <AvatarFallback>
                    {dashboardData?.user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h1 className="text-md md:text-3xl font-bold text-gray-900">
                    Hi, {dashboardData?.user?.name}
                  </h1>

                  <p className="text-gray-600 text-xs md:text-lg">
                    {dashboardData?.user?.subject}
                  </p>

                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />

                      <span>
                        {dashboardData?.user?.locationInfo?.name},{" "}
                        {dashboardData?.user?.locationInfo?.city}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-orange-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-700">
                        {dashboardData?.stats?.averageRating}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-3"></div>
            </div>
          </div>
        </div>
      </div>

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={handleCloseModal}
        onSave={handleSavePrescription}
        studentName={studentName}
      />
    </>
  )
}

export default TeacherDashboardContent
