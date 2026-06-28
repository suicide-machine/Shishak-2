"use client"

import AppointmentCall from "@/components/call/AppointmentCall"
import { useAppointmentStore } from "@/store/appointmentStore"
import { userAuthStore } from "@/store/authStore"
import { useParams } from "next/navigation"
import { useRouter } from "next/router"
import React, { useCallback, useEffect, useState } from "react"

const page = () => {
  const params = useParams()
  const router = useRouter()
  const appointmentId = params.appointmentId as string
  const { currentAppointment, fetchAppointmentById, joinAppointment } =
    useAppointmentStore()
  const { user } = userAuthStore()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentById(appointmentId)
    }
  }, [appointmentId, fetchAppointmentById])

  const handleCallEnd = useCallback(async () => {
    if (isNavigating) return
    try {
      setIsNavigating(true)

      if (user?.type === "teacher") {
        router.push(`/teacher/dashboard?completedCall=${appointmentId}`)
      } else {
        router.push("/student/dashboard")
      }
    } catch (error) {
      console.error(error)
      router.push("/")
    } finally {
      setIsNavigating(false)
    }
  }, [user?.type, router, appointmentId, isNavigating])

  if (!currentAppointment || !user) {
    return (
      <div className="h-screen  bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading call room...</p>
        </div>
      </div>
    )
  }

  const currentUserData = {
    id: user.id,
    name: user.name,
    role: user.type as "teacher" | "student",
  }
  return (
    <AppointmentCall
      appointment={currentAppointment}
      currentUser={currentUserData}
      onCallEnd={handleCallEnd}
      joinAppointment={joinAppointment}
    />
  )
}

export default page
