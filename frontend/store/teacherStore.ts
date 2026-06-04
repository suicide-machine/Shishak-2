import { Teacher, TeacherFilters } from "@/lib/types"
import { getWithAuth } from "@/service/httpService"
import { create } from "zustand"

interface TeacherState {
  teachers: Teacher[]
  currentTeacher: Teacher | null
  dashboard: any
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
  }

  //Action
  clearError: () => void
  setCurrentTeacher: (teacher: Teacher) => void

  //Api Action
  fetchTeachers: (filters: TeacherFilters) => Promise<void>
  fetchTeacherById: (id: string) => Promise<void>
  fetchDashboard: (period?: string) => Promise<void>
}

export const useTeacherStore = create<TeacherState>((set, get) => ({
  teachers: [],
  currentTeacher: null,
  dashboard: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },

  clearError: () => set({ error: null }),

  setCurrentTeacher: (teacher) => set({ currentTeacher: teacher }),

  fetchTeachers: async (filters = {}) => {
    set({ loading: true, error: null })

    try {
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString())
        }
      })

      const response = await getWithAuth(
        `/teacher/list?${queryParams.toString()}`,
      )

      set({
        teachers: response.data,
        pagination: {
          page: response.meta?.page || 1,
          limit: response.meta?.limit || 20,
          total: response.meta?.total || 0,
        },
      })
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false, error: null })
    }
  },

  fetchTeacherById: async (id) => {
    set({ loading: true, error: null })

    try {
      const response = await getWithAuth(`/teacher/${id}`)

      set({ currentTeacher: response.data })
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false, error: null })
    }
  },

  fetchDashboard: async () => {
    set({ loading: true, error: null })
    try {
      const response = await getWithAuth("/teacher/dashboard")
      set({ dashboard: response.data })
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false, error: null })
    }
  },
}))
