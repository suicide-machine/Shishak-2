"use client"

import Loader from "@/components/Loader"
import { Button } from "@/components/ui/button"
import { userAuthStore } from "@/store/authStore"
import { CreditCard, LayoutDashboard, LogOut, Users } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isAuthenticated, loading, logout } = userAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)

  //   don't check in isLoginPage
  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    setHasMounted(true)

    const timer = setTimeout(() => {
      setIsChecking(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!hasMounted) return

    if (isLoginPage) {
      setIsChecking(false)
      return
    }

    if (loading) {
      setIsChecking(true)
      return
    }

    if (!isAuthenticated || user?.type !== "admin") {
      return router.push("/admin/login")
    }

    setIsChecking(false)
  }, [isAuthenticated, user, loading, router, hasMounted, isLoginPage])

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }

  const navigationItem = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      current: pathname === "/admin/dashboard",
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      current: pathname === "/admin/users",
    },
    {
      name: "Payments",
      href: "/admin/payments",
      icon: CreditCard,
      current: pathname === "/admin/payments",
    },
  ]

  if (isLoginPage) {
    return <>{children}</>
  }

  if (loading || isChecking) {
    return <Loader />
  }

  if (!isAuthenticated || user?.type !== "admin") {
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">
                Admin Portal
              </h1>

              <p className="text-xs md:text-sm text-gray-500">
                Welcome back, {user?.name}
              </p>
            </div>

            <div>
              <Button variant={"outline"} onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 py-2 overflow-x-auto">
            {navigationItem.map((item) => {
              const Icon = item.icon

              return (
                <Button
                  key={item.name}
                  variant={item.current ? "default" : "ghost"}
                  onClick={() => router.push(item.href)}
                  className={
                    item.current
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-gray-600 hover:text-gray-900"
                  }
                  // CHANGED: className now switches on item.current so the
                  // active nav item is visually distinct, instead of every
                  // button always rendering as "ghost" regardless of route.
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Button>
              )
            })}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

export default AdminLayout
