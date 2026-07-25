"use client"

import Loader from "@/components/Loader"
import TeacherAppointmentContent from "@/components/teacher/TeacherAppointmentContent"
import React, { Suspense } from "react"

const page = () => {
  return (
    <Suspense fallback={<Loader />}>
      <TeacherAppointmentContent />
    </Suspense>
  )
}

export default page
