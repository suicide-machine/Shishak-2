import { create } from "zustand"

export interface Appointment {
  _id: string
  teacherId: any
  studentId: any
  date: string
  slotStartIso: string
  slotEndIso: string
  appointmentType: "Video Appointment" | "Voice Call"
  status: "Scheduled" | "Completed" | "Cancelled" | "In Progress"
  subject: string
  zegoRoomId: string
  fees: number
  feedback?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface AppointmentFilters {
  status?: string | string[]
  from?: string
  to?: string
  date?: string
  sortBy?: "date" | "createdAt" | "status"
  sortOrder?: "asc" | "desc"
}

interface BookingData {
  teacherId: string
  slotStartIso: string
  slotEndIso: string
  appointmentType?: string
  subject: string
  date: string
  appointmentFees: number
  platformFees: number
  totalAmount: number
}

interface AppointmentState {
  appointments: Appointment[]
  bookedSlots: string[]
  currentAppointment: Appointment | null
  loading: boolean
  error: string | null

  //Actions
  clearError: () => void
  setCurrentAppointment: (appointment: Appointment) => void

  //Api Actions
  fetchAppointments: (
    role: "teacher" | "student",
    tab?: string,
    filters?: AppointmentFilters,
  ) => Promise<void>

  fetchBookedSlots: (teacherId: string, date: string) => Promise<void>

  fetchAppointmentById: (appointmentId: string) => Promise<Appointment | null>

  bookAppointment: (data: BookingData) => Promise<any>

  joinAppointment: (appointmentId: string) => Promise<any>

  endAppointment: (
    appointmentId: string,
    feedback?: string,
    notes?: string,
  ) => Promise<void>

  updateAppointmentStatus: (
    appointmentId: string,
    status: string,
  ) => Promise<void>
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  bookedSlots: [],
  currentAppointment: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  setCurrentAppointment: (appointment) =>
    set({ currentAppointment: appointment }),

  fetchAppointments: async (role, tab = "", filters = {}) => {},

  fetchAppointmentById: async (appointmentId) => {},
}))
