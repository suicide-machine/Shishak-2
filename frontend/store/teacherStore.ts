import { Teacher, TeacherFilters } from "@/lib/types"

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
