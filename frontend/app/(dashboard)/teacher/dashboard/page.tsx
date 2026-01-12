import Loader from "@/components/Loader"
import TeacherDashboardContent from "@/components/teacher/TeacherDashboardContent"
import React, { Suspense } from "react"

const page = () => {
  return (
    <Suspense fallback={<Loader />}>
      <TeacherDashboardContent />
    </Suspense>
  )
}

export default page
