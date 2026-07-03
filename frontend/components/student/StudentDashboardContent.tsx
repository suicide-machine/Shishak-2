import React, { useEffect, useState } from "react"
import Header from "../landing/Header"
import { userAuthStore } from "@/store/authStore"
import { useAppointmentStore } from "@/store/appointmentStore"

const StudentDashboardContent = () => {
  const { user } = userAuthStore()
  const { appointments, fetchAppointments, loading } = useAppointmentStore()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [tabCounts, setTabCounts] = useState({
    upcoming: 0,
    past: 0,
  })

  useEffect(() => {
    if (user?.type === "student") {
      fetchAppointments("student", activeTab)
    }
  }, [user, activeTab, fetchAppointments])

  //update tab counts whever appointmnet chnage
  useEffect(() => {
    const now = new Date()

    //filter the upcoming appointments
    const upcomingAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.slotStartIso)
      return (
        (aptDate >= now || apt.status === "In Progress") &&
        (apt.status === "Scheduled" || apt.status === "In Progress")
      )
    })

    //filter the past appointmnet
    const pastAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.slotStartIso)
      return (
        aptDate < now ||
        apt.status === "Completed" ||
        apt.status === "Cancelled"
      )
    })

    setTabCounts({
      upcoming: upcomingAppointments.length,
      past: pastAppointments.length,
    })
  }, [appointments])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isToday = (dateString: string) => {
    const today = new Date()
    const appointmentDate = new Date(dateString)
    return appointmentDate.toDateString() === today.toDateString()
  }

  const canJoinCall = (appointment: any) => {
    const appointmentTime = new Date(appointment.slotStartIso)
    const now = new Date()
    const diffMintues =
      (appointmentTime.getTime() - now.getTime()) / (1000 * 60)

    return (
      isToday(appointment.slotStartIso) &&
      diffMintues <= 15 && //not earliar than 15 min before start
      diffMintues >= -120 && //not later than 2 hours after start
      (appointment.status === "Scheduled" ||
        appointment.status === "In Progress")
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Header showDashboardNav={true} />
    </>
  )
}

export default StudentDashboardContent
