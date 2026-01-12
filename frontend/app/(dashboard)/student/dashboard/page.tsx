import Loader from "@/components/Loader"
import StudentDashboardContent from "@/components/student/StudentDashboardContent"
import React, { Suspense } from "react"

const page = () => {
  return (
    <Suspense fallback={<Loader />}>
      <StudentDashboardContent />
    </Suspense>
  )
}

export default page
