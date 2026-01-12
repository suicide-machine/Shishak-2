import Loader from "@/components/Loader"
import TeacherListPage from "@/components/student/TeacherListPage"
import React, { Suspense } from "react"

const Page = () => {
  return (
    <Suspense fallback={<Loader />}>
      <TeacherListPage />
    </Suspense>
  )
}

export default Page
