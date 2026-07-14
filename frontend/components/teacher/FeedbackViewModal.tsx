import { Appointment } from "@/store/appointmentStore"
import React from "react"

interface FeedbackViewModalProps {
  appointment: Appointment
  userType: "teacher" | "student"
  trigger: React.ReactNode
}

const FeedbackViewModal = ({
  appointment,
  userType,
  trigger,
}: FeedbackViewModalProps) => {
  return <div>FeedbackViewModal</div>
}

export default FeedbackViewModal
