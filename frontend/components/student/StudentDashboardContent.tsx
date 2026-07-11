"use client"

import React, { useEffect, useState } from "react"
import Header from "../landing/Header"
import { userAuthStore } from "@/store/authStore"
import { Appointment, useAppointmentStore } from "@/store/appointmentStore"
import { Card, CardContent } from "../ui/card"
import Link from "next/link"
import { Button } from "../ui/button"
import { Calendar, Clock, FileText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"

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

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card>
      <CardContent></CardContent>
    </Card>
  )

  const EmptyState = ({ tab }: { tab: string }) => {
    const emptyStates = {
      upcoming: {
        icon: Clock,
        title: "No Upcoming Appointments",
        description: "You have no upcoming appointments scheduled.",
        showBookButton: true,
      },
      past: {
        icon: FileText,
        title: "No Past Appointments",
        description: "Your Completed consultations will appear here.",
        showBookButton: false,
      },
    }

    const state = emptyStates[tab as keyof typeof emptyStates]

    const Icon = state.icon

    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {state.title}
          </h3>

          <p className="text-gray-600 mb-6">{state.description}</p>

          {state.showBookButton && (
            <Link href="/teacher-list">
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                Book Your First Appointment
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Header showDashboardNav={true} />

      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-md md:text-3xl font-bold text-gray-900">
                My Appointment
              </h1>

              <p className="text-xs md:text-lg text-gray-600">
                Manage your tutor appointments
              </p>
            </div>

            <div className="flex items-center space-x-4 ">
              <Link href="/teacher-list">
                <Button>
                  <Calendar className="w-4 h-4 mr-2 " />
                  Book <span className="hidden md:block">New Appointment</span>
                </Button>
              </Link>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="upcoming"
                className="flex items-center space-x-2"
              >
                <Clock className="w-4 h-4" />

                <span>Upcoming ({tabCounts.upcoming})</span>
              </TabsTrigger>

              <TabsTrigger value="past" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />

                <span>Past ({tabCounts.past})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>

                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>

                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>

                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : appointments.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {appointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment._id}
                      appointment={appointment}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState tab="upcoming" />
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>

                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>

                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>

                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : appointments.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {appointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment?._id}
                      appointment={appointment}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState tab="past" />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}

export default StudentDashboardContent
