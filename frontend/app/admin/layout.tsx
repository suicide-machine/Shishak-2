"use client"

import Loader from "@/components/Loader"
import { userAuthStore } from "@/store/authStore"
import { CreditCard, LayoutDashboard, Users } from "lucide-react"
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

  return <div className="min-h-screen"></div>
}

export default AdminLayout
