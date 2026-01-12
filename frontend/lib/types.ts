export interface User {
  id: string
  name: string
  email: string
  type: "teacher" | "student"
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
