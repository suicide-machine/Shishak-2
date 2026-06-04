"use client"

import TeacherProfile from "@/components/bookingSteps/TeacherProfile"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { convertTo24Hour, minutesToTime, toLocalYMD } from "@/lib/dateUtils"
import { useAppointmentStore } from "@/store/appointmentStore"
import { useTeacherStore } from "@/store/teacherStore"
import { ArrowLeft, Check } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import CalendarStep from "@/components/bookingSteps/CalendarStep"
import ConsultationStep from "@/components/bookingSteps/ConsultationStep"
import PaymentStep from "@/components/bookingSteps/PaymentStep"

const page = () => {
  const params = useParams()
  const router = useRouter()
  const teacherId = params.teacherId as string

  const { currentTeacher, fetchTeacherById } = useTeacherStore()

  const { bookAppointment, loading, fetchBookedSlots, bookedSlots } =
    useAppointmentStore()

  //state
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedSlot, setSelectedSlot] = useState("")
  const [appointmentType, setAppointmentType] = useState("Video Appointment")
  const [subject, setSubject] = useState("")
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [createdAppointmentId, setCreatedAppointmentId] = useState<
    string | null
  >(null)
  const [studentName, setStudentName] = useState<string>("")

  useEffect(() => {
    if (teacherId) {
      fetchTeacherById(teacherId)
    }
  }, [teacherId, fetchTeacherById])

  useEffect(() => {
    if (selectedDate && teacherId) {
      const dateString = toLocalYMD(selectedDate)
      fetchBookedSlots(teacherId, dateString)
    }
  }, [selectedDate, teacherId, fetchBookedSlots])

  //Generate avaiable dates
  useEffect(() => {
    if (currentTeacher?.availabilityRange) {
      const startDate = new Date(currentTeacher?.availabilityRange.startDate)
      //Convert doctor's start date string into a Date Object

      const endDate = new Date(currentTeacher?.availabilityRange.endDate)
      //Convert doctor's end date string into a Date Object

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      //get today's date and reset time to midnight

      const dates: string[] = []
      //Empty list to hold avaiable dates

      const iterationStart = new Date(
        Math.max(today.getTime(), startDate.getTime()),
      )

      for (
        let d = new Date(iterationStart);
        d <= endDate && dates.length < 90;
        d.setDate(d.getDate() + 1)
      ) {
        dates.push(toLocalYMD(d))
        //Convert date into YYYY-MM-DD format and add to list
      }

      setAvailableDates(dates)
    }
  }, [currentTeacher])

  //Generate avaiable slots
  useEffect(() => {
    if (selectedDate && currentTeacher?.dailyTimeRanges) {
      const slots: string[] = []
      //Empty list to hold avaiable dates

      const slotDuration = currentTeacher?.slotDurationMinutes || 30

      currentTeacher.dailyTimeRanges.forEach((timeRange: any) => {
        const startMintues = timeToMinutes(timeRange.start)
        //Convert start time (e.g, "12:00") => total mintues (e.g., 540)

        const endMintues = timeToMinutes(timeRange.end)
        //Convert end time (e.g, "3:00") => total mintues (e.g., 740)

        for (
          let minutes = startMintues;
          minutes < endMintues;
          minutes += slotDuration
        ) {
          slots.push(minutesToTime(minutes))

          //Convert mintues back to HH:MM format and add to slots
        }
      })

      setAvailableSlots(slots)
    }
  }, [selectedDate, currentTeacher])

  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return hours * 60 + minutes
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot || !subject.trim()) {
      alert("please complete all required fields")
      return
    }

    setIsPaymentProcessing(true)

    try {
      const dateString = toLocalYMD(selectedDate)
      const slotStart = new Date(
        `${dateString}T${convertTo24Hour(selectedSlot)}`,
      )
      const slotEnd = new Date(
        slotStart.getTime() +
          (currentTeacher!.slotDurationMinutes || 30) * 60000,
      )

      const appointmentFees = getAppointmentPrice()
      const platformFees = Math.round(appointmentFees * 0.1)
      const totalAmount = appointmentFees + platformFees

      const appointment = await bookAppointment({
        teacherId: teacherId,
        slotStartIso: slotStart.toISOString(),
        slotEndIso: slotEnd.toISOString(),
        appointmentType,
        subject,
        date: dateString,
        appointmentFees,
        platformFees,
        totalAmount,
      })

      //store appointemnt Id and student name for payment
      if (appointment && appointment?._id) {
        setCreatedAppointmentId(appointment._id)

        setStudentName(appointment.studentId.name || "Student")
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000))

        router.push("/student/dashboard")
      }
    } catch (error: any) {
      console.error(error)
      setIsPaymentProcessing(false)
    }
  }

  const getAppointmentPrice = (): number => {
    const basePrice = currentTeacher?.hourlyRate || 0
    const typePrice = appointmentType === "Voice Call" ? -100 : 0
    return Math.max(0, basePrice + typePrice)
  }

  if (!currentTeacher) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teacher information...</p>
        </div>
      </div>
    )
  }

  console.log("this is my current teacher", currentTeacher)

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="bg-white border-b border-gray-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/teacher-list">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Teachers
                </Button>
              </Link>

              <div className="h-6 w-px bg-gray-300" />

              <div>
                <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                  Book Appointment
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  with {currentTeacher.name}
                </p>
              </div>
            </div>

            {/* Process Indicator */}
            <div className="hidden md:flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`flex items-center space-x-2 transition-colors duration-200 ${
                      currentStep >= step ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        currentStep >= step
                          ? "bg-blue-600 border-blue-600 shadow-md"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {currentStep > step ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <span
                          className={`text-sm font-semibold ${
                            currentStep >= step ? "text-white" : "text-gray-500"
                          }`}
                        >
                          {step}
                        </span>
                      )}
                    </div>

                    <span className="text-sm font-medium">
                      {step === 1
                        ? "Select Time"
                        : step === 2
                          ? "Details"
                          : "Payment"}
                    </span>
                  </div>

                  {step < 3 && (
                    <div
                      className={`w-12 h-px transition-colors duration-200 ${
                        currentStep > step ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <TeacherProfile teacher={currentTeacher} />
          </div>

          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardContent className="p-8">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <CalendarStep
                      // selectedDate={selectedDate}
                      // setSelectedDate={setSelectedDate}
                      // selectedSlot={selectedSlot}
                      // setSelectedSlot={setSelectedSlot}
                      // availableSlots={availableSlots}
                      // availableDates={availableDates}
                      // excludedWeekdays={
                      //   currentTeacher?.availabilityRange?.excludedWeekdays ||
                      //   []
                      // }
                      // bookedSlots={bookedSlots}
                      // onContinue={() => setCurrentStep(2)}
                      />
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <ConsultationStep
                      // appointmentType={appointmentType}
                      // setAppointmentType={setAppointmentType}
                      // setSubject={setSubject}
                      // symptoms={subject}
                      // appointmentFees={currentTeacher?.hourlyRate}
                      // onBack={() => setCurrentStep(1)}
                      // onContinue={() => setCurrentStep(3)}
                      />
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <PaymentStep />
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
