"use client"

import { minutesToTime, toLocalYMD } from "@/lib/dateUtils"
import { useAppointmentStore } from "@/store/appointmentStore"
import { useTeacherStore } from "@/store/teacherStore"
import { useParams, useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

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

  return <div>Page</div>
}

export default Page
