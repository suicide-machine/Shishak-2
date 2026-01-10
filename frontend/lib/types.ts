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
