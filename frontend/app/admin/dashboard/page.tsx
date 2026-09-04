"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AdminDashboardStats,
  AppointmentStats,
  AppointmentStatus,
  MonthlyRevenue,
  UserGrowthPoint,
} from "@/lib/types"
import { getWithAuth } from "@/service/httpService"
import { Calendar, CreditCard, UserCheck, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// TODO: move to @/constants/chart.ts
const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#8b5cf6",
  "#0891b2",
]

const page = () => {
  const router = useRouter()
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([])
  const [reportData, setReportData] = useState<any>(null) // ⚠️ replace `any` once ReportData shape is known
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await getWithAuth("/admin/dashboard")

      setStats(response.data || null)
      setMonthlyRevenue(response.data?.monthlyRevenue || [])
      setReportData({
        userGrowth: response.data?.userGrowth || [],
        appointmentStats: response.data?.appointmentStats || {},
      })
    } catch (error: any) {
      console.log("Error fetching dashboard data", error)
      setStats(null)
      setMonthlyRevenue([])
      setReportData({
        userGrowth: [],
        appointmentStats: {},
      })
    } finally {
      setLoading(false)
    }
  }

  const formatRevenueData = (data: MonthlyRevenue[]) => {
    return data.map((item) => ({
      month: item.month,
      revenue: item.revenue,
    }))
  }

  const formateAppointmentStats = (data: AppointmentStats) => {
    return (Object.entries(data) as [AppointmentStatus, number][]).map(
      ([status, count]) => ({
        status,
        count,
      }),
    )
  }

  const formatUserGrowth = (data: UserGrowthPoint[]) => {
    return data.map((item) => ({
      month: item.month,
      students: item.students,
      teachers: item.teachers,
      total: item.total,
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-indigo-50">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  // Computed once — avoids calling the formatter twice per render (data + Cells)
  const appointmentStatsData = formateAppointmentStats(
    reportData?.appointmentStats || {},
  )
  const userGrowthData = formatUserGrowth(reportData?.userGrowth || [])

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Students
            </CardTitle>

            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalStudents || 0}
            </div>

            <p className="text-xs text-gray-500">Registered Students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Teachers
            </CardTitle>

            <UserCheck className="w-4 h-4 text-green-600" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalTeachers || 0}
            </div>

            <p className="text-xs text-gray-500">Registered Teachers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Appointments
            </CardTitle>

            <Calendar className="w-4 h-4 text-purple-600" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalAppointments || 0}
            </div>

            <p className="text-xs text-gray-500">
              {stats?.completedAppointments || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>

            <span className="text-sm font-semibold text-orange-600">$</span>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalRevenue?.toLocaleString() || 0}
            </div>

            <p className="text-xs text-gray-500">From Completed Appointments</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">Manage Users</CardTitle>
                <CardDescription>
                  View, verify, and manage students and teachers
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push("/admin/users")}
            >
              Go to Users
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-50">
                <CreditCard className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-base">Process Payments</CardTitle>
                <CardDescription>
                  Review transactions and payouts to teachers
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => router.push("/admin/payments")}
            >
              Go to Payments
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Revenue + Appointment status charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>

            <CardDescription>
              Revenue from completed appointments over the past six months
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatRevenueData(monthlyRevenue)}>
                  <CartesianGrid strokeDasharray={"3 3"} />
                  <XAxis dataKey={"month"} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}`, "Revenue"]} />
                  <Line
                    type={"monotone"}
                    dataKey={"revenue"}
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Status</CardTitle>

            <CardDescription>
              Distribution of appointment status
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appointmentStatsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) =>
                      `${props.status}: ${((props.percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {appointmentStatsData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User growth bar chart */}
      <div className="grid grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>

            <CardDescription>
              New students and teachers registered over the past six months
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray={"3 3"} />
                  <XAxis dataKey={"month"} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="students"
                    fill="#2563eb"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="teachers"
                    fill="#16a34a"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default page
