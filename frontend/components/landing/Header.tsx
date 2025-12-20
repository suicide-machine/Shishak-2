"use client"

import { Calendar } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

interface HeaderProps {
  showDashboardNav?: boolean
}

interface NavigationItem {
  lable: string
  icon: React.ComponentType<any>
  href: string
  active: boolean
}

const Header: React.FC<HeaderProps> = ({ showDashboardNav = false }) => {
  const user = { type: "student" }

  const pathname = usePathname()

  const getDashboardNavigation = (): NavigationItem[] => {
    if (!user || !showDashboardNav) return []

    if (user?.type === "student") {
      return [
        {
          lable: "Appointments",
          icon: Calendar,
          href: "/student/dashboard",
          active: pathname?.includes("/student/dashboard") || false,
        },
      ]
    } else if (user?.type === "teacher") {
      return [
        {
          lable: "Dashboard",
          icon: Calendar,
          href: "/teacher/dashboard",
          active: pathname?.includes("/teacher/dashboard") || false,
        },
        {
          lable: "Appointments",
          icon: Calendar,
          href: "/teacher/appointments",
          active: pathname?.includes("/teacher/appointments") || false,
        },
      ]
    }

    return []
  }

  return (
    <header className="border-b bg-white/95 backdrop:blur-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left side -> logo  + navigation */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-2xl text-gray-800">Shikshak</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
