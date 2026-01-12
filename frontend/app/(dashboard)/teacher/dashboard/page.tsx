import Loader from "@/components/Loader"
import React, { Suspense } from "react"

const page = () => {
  return <Suspense fallback={<Loader />}>page</Suspense>
}

export default page
