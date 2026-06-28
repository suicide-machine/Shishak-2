import { userAuthStore } from "@/store/authStore"
import React, { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PaymentStepInterface {
  selectedDate: Date | undefined
  selectedSlot: string
  appointmentType: string
  teacherName: string
  slotDuration: number
  appointmentFee: number
  isProcessing: boolean
  onBack: () => void
  onConfirm: () => void
  onPaymentSuccess?: (appointment: any) => void
  loading: boolean
  appointmentId?: string
  studentName?: string
}

const PaymentStep = ({
  selectedDate,
  selectedSlot,
  appointmentType,
  teacherName,
  slotDuration,
  appointmentFee,
  isProcessing,
  onBack,
  onConfirm,
  onPaymentSuccess,
  loading,
  appointmentId,
  studentName,
}: PaymentStepInterface) => {
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle")

  const { user } = userAuthStore()

  const [error, setError] = useState<string>("")
  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false)

  const platformFees = Math.round(appointmentFee * 0.1)
  const totalAmount = appointmentFee + platformFees

  const [shouldAutoOpen, setShouldAutoOpen] = useState(true)
  const modelCloseCountRef = useRef<number>(0)

  //Load Razorpay script and auto-trigger payment
  useEffect(() => {
    if (appointmentId && studentName && !window.Razorpay) {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      document.body.appendChild(script)
    }
  }, [appointmentId, studentName])

  return <div>PaymentStep</div>
}

export default PaymentStep
