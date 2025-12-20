"use client"

import Header from "@/components/landing/Header"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const user = { type: "student" }
  const router = useRouter()

  useEffect(() => {
    if (user?.type === "teacher") {
      router.replace("/teacher/dashboard")
    }
  }, [user, router])

  if (user?.type === "teacher") {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <Header showDashboardNav={false} />
    </div>
  )
}
