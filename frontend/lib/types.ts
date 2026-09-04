export interface User {
  id: string
  name: string
  email: string
  type: "teacher" | "student" | "admin"
  phone?: string
  profileImage?: string
  isVerified: boolean

  // Student fields
  dob?: string
  gender?: string
  educationLevel?: string
  age?: number
  academicBackground?: {
    previousQualifications?: string
    areasOfDifficulty?: string
    specialRequirements?: string
  }

  guardian?: {
    name?: string
    phone?: string
    relationship?: string
  }

  // Teacher fields
  subject?: string
  about?: string
  category?: string[]
  qualification?: string
  experience?: number
  hourlyRate?: number
  locationInfo?: {
    name?: string
    address?: string
    city?: string
  }

  // ✅ Teacher availability fields
  availabilityRange?: {
    startDate?: string
    endDate?: string
    excludedWeekdays?: number[]
  }
  dailyTimeRanges?: Array<{
    start: string
    end: string
  }>
  slotDurationMinutes?: number

  // admin
  role?: string

  permissions?: {
    userManagement?: boolean
    teacherManagement?: boolean
    paymentManagement?: boolean
    analytics?: boolean
  }
}

export interface TimeRange {
  start: string
  end: string
}

export interface AvailabilityRange {
  startDate: string
  endDate: string
  excludedWeekdays: number[]
}

export interface LocationInfo {
  name: string
  address: string
  city: string
}

export interface TeacherFormData {
  subject: string
  categories: string[] // Explicitly typed as string array
  qualification: string
  experience: string
  about: string
  hourlyRate: string
  locationInfo: LocationInfo
  availabilityRange: AvailabilityRange
  dailyTimeRanges: TimeRange[]
  slotDurationMinutes?: number
}

// interfaces/Doctor.ts
export interface Teacher {
  _id: string
  name: string
  email: string
  subject: string
  category: string[]
  qualification: string
  experience: number
  about: string
  hourlyRate: number
  locationInfo: {
    name: string
    address: string
    city: string
  }
  availabilityRange: {
    startDate: Date
    endDate: Date
    excludedWeekdays: number[]
  }
  dailyTimeRanges: {
    start: string // e.g., "09:00"
    end: string // e.g., "12:00"
  }[]
  slotDurationMinutes: number
  profileImage: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TeacherFilters {
  search?: string
  subject?: string
  category?: string
  city?: string
  minFees?: number
  maxFees?: number
  sortBy?: "fees" | "experience" | "name" | "createdAt"
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

// Using Claude

// ─── Admin core ───────────────────────────────────────────────

export type AdminRole = "admin" | "super_admin"

export interface AdminPermissions {
  userManagement: boolean
  teacherManagement: boolean
  paymentManagement: boolean
  analytics: boolean
}

export interface Admin {
  _id: string
  name: string
  email: string
  role: AdminRole
  isActive: boolean
  lastLogin?: string // ISO date string
  permissions: AdminPermissions
  createdAt: string
  updatedAt: string
}

// ─── Auth ─────────────────────────────────────────────────────

export interface AdminLoginPayload {
  email: string
  password: string
}

export interface AdminLoginUser {
  id: string
  name: string
  email: string
  role: AdminRole
  permissions: AdminPermissions
  type: "admin"
}

export interface AdminLoginResponse {
  token: string
  user: AdminLoginUser
}

// ─── Dashboard ────────────────────────────────────────────────

export interface MonthlyRevenue {
  month: string // e.g. "Mar 2026"
  revenue: number
}

export interface UserGrowthPoint {
  month: string
  students: number
  teachers: number
  total: number
}

// Keys here are appointment status values (e.g. "Completed", "Scheduled")
// mapped to their counts. Adjust the union if your Appointment status
// enum differs from what's assumed in the route.
export type AppointmentStatus =
  | "Scheduled"
  | "In Progress"
  | "Completed"
  | "Cancelled"

export type AppointmentStats = Partial<Record<AppointmentStatus, number>>

export interface AdminDashboardStats {
  totalStudents: number
  totalTeachers: number
  totalAppointments: number
  completedAppointments: number
  pendingAppointments: number
  totalRevenue: number
  monthlyRevenue: MonthlyRevenue[]
  userGrowth: UserGrowthPoint[]
  appointmentStats: AppointmentStats
}
