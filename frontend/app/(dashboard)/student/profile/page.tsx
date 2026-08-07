import ProfilePage from "@/components/profilePage/ProfilePage"
import { Metadata } from "next"
import React from "react"

export const metadata: Metadata = {
  title: "Student Profile | Shikshak",
  description: "View and manage your student profile in shikshak.",
}

const page = () => {
  return <ProfilePage userType="student" />
}

export default page
