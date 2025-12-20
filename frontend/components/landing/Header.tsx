import { Calendar } from "lucide-react"
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

  return <div>Header</div>
}

export default Header
