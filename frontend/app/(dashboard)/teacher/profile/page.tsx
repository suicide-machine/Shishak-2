import ProfilePage from "@/components/profilePage/ProfilePage"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Teacher Profile | Shikshak",
  description: "View and manage your teacher profile in Shikshak.",
}

export default function Page() {
  return <ProfilePage userType="teacher" />
}
