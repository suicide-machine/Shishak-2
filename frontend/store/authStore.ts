import { User } from "@/lib/types"
import {
  getWithAuth,
  postWithoutAuth,
  putWithAuth,
} from "@/service/httpService"
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
  persist(
    (set, get) => ({
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

      loginTeacher: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const response = await postWithoutAuth("/auth/teacher/login", {
            email,
            password,
          })

          get().setUser(response.data.user, response.data.token)
        } catch (error: any) {
          set({ error: error.message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      loginStudent: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const response = await postWithoutAuth("/auth/student/login", {
            email,
            password,
          })

          get().setUser(response.data.user, response.data.token)
        } catch (error: any) {
          set({ error: error.message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      registerTeacher: async (data) => {
        set({ loading: true, error: null })

        try {
          const response = await postWithoutAuth("/auth/teacher/register", data)

          get().setUser(response.data.user, response.data.token)
        } catch (error: any) {
          set({ error: error.message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      registerStudent: async (data) => {
        set({ loading: true, error: null })
        try {
          const response = await postWithoutAuth("/auth/student/register", data)
          get().setUser(response.data.user, response.data.token)
        } catch (error: any) {
          set({ error: error.message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      fetchProfile: async (): Promise<User | null> => {
        set({ loading: true, error: null })

        try {
          const { user } = get()

          if (!user) throw new Error("No user found")

          const endPoint =
            user.type === "teacher" ? "/teacher/me" : "/student/me"

          const response = await getWithAuth(endPoint)

          set({ user: { ...user, ...response.data } })

          return response.data
        } catch (error: any) {
          set({ error: error.message })
          return null
        } finally {
          set({ loading: false })
        }
      },

      updateProfile: async (data) => {
        set({ loading: true, error: null })

        try {
          const { user } = get()

          if (!user) throw new Error("No user found")

          const endPoint =
            user.type === "teacher"
              ? "/teacher/onboarding/update"
              : "/student/onboarding/update"

          const response = await putWithAuth(endPoint, data)

          set({ user: { ...user, ...response.data } })
        } catch (error: any) {
          set({ error: error.message })
          throw error
        } finally {
          set({ loading: false })
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
