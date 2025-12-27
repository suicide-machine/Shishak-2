import { User } from "@/lib/types"
import { create } from "zustand"

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}
