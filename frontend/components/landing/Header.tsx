"use client"

import { Bell, Calendar, PersonStanding } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"

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

  const isAuthenticated = false

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
            <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <PersonStanding className="w-5 h-5 text-white" />
            </div>

            <div className="text-2xl font-bold bg-linear-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Shikshak
            </div>
          </Link>

          {/* Dashboard navigation */}
          {isAuthenticated && showDashboardNav && (
            <nav className="hidden md:flex items-center space-x-6">
              {getDashboardNavigation().map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 transition-colors ${
                    item.active
                      ? "text-blue-600 font-semibold"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.lable}</span>
                </Link>
              ))}
            </nav>
          )}
        </div>

        {isAuthenticated && showDashboardNav ? (
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-red-500 hover:bg-red-600">
                4
              </Badge>
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            {!isAuthenticated ? (
              <>
                <Link href="/login/student">
                  <Button
                    variant="ghost"
                    className="text-blue-900 font-medium hover:text-blue-700"
                  >
                    Log in
                  </Button>
                </Link>

                <Link href="/signup/student" className="hidden md:block">
                  <Button className="bg-linear-to-r from-blue-600 to-blue-700 font-medium hover:from-blue-700 hover:to-blue-800 rounded-full px-6">
                    Book a Tutor
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="hidden md:block text-sm text-gray-700 font-medium whitespace-nowrap">
                  Welcome,&nbsp;{user?.name}
                </span>

                <Link href={`/${user?.type}/dashboard`}>
                  <Button
                    variant="ghost"
                    className="text-blue-900 font-medium hover:text-blue-700"
                  >
                    Dashboard
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
