const BASE_URL = process.env.NEXT_PUBLIC_API_URL

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  meta?: any
}

interface RequestOptions {
  headers?: Record<string, string>
}

class HttpService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }
}
