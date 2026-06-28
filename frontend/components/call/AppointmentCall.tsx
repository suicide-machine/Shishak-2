import { Appointment } from "@/store/appointmentStore"
import React, { useRef } from "react"

interface AppointmentCallInterface {
  appointment: Appointment
  currentUser: {
    id: string
    name: string
    role: "teacher" | "student"
  }
  onCallEnd: () => void
  joinAppointment: (appointmentId: string) => Promise<void>
}

const AppointmentCall = ({
  appointment,
  currentUser,
  onCallEnd,
  joinAppointment,
}: AppointmentCallInterface) => {
  const zpRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const initializationRef = useRef(false)
  const isComponentMountedRef = useRef(true)
  return <div>AppointmentCall</div>
}

export default AppointmentCall
