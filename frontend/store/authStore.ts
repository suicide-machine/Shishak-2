import { User } from "@/lib/types"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean

  //Actions
  setUser: (user: User, token: string) => void
  clearError: () => void
  logout: () => void

  //Api Actions
  loginTeacher: (email: string, password: string) => Promise<void>
  loginStudent: (email: string, password: string) => Promise<void>
  registerTeacher: (data: any) => Promise<void>
  registerStudent: (data: any) => Promise<void>
  fetchProfile: () => Promise<User | null>
  updateProfile: (data: any) => Promise<void>
}

export const userAuthStore = create<AuthState>()(
  persist((set, get) => ({
    user: null,
    token: null,
    loading: false,
    error: null,
    isAuthenticated: false,

    setUser: (user, token) => {
      set({
        user,
        token,
        isAuthenticated: true,
        error: null,
      })
      localStorage.setItem("token", token)
    },

    clearError: () => set({ error: null }),

    logout: () => {
      localStorage.removeItem("token")
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      })
    },
  }))
)
