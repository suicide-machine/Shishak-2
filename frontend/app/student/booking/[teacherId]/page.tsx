"use client"

import { useAppointmentStore } from "@/store/appointmentStore"
import { useTeacherStore } from "@/store/teacherStore"
import { useParams, useRouter } from "next/navigation"
import React, { useState } from "react"

const Page = () => {
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

  return <div>Page</div>
}

export default Page
