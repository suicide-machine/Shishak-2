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

  private getHeaders(auth: boolean = true): Record<string, string> {
    if (auth) {
      return this.getAuthHeaders()
    }

    return { "Content-Type": "application/json" }
  }

  private async makeRequest<T = any>(
    endPoint: string,
    method: string,
    body?: any,
    auth: boolean = true,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${BASE_URL}${endPoint}`

      const headers = {
        ...this.getHeaders(auth),
        ...options?.headers,
      }

      const config: RequestInit = {
        method,
        headers,
        ...(body && { body: JSON.stringify(body) }),
      }

      const response = await fetch(url, config)

      const data: ApiResponse<T> = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP ${response.status}: ${response.statusText}`
        )
      }

      return data
    } catch (error: any) {
      console.error(`Api Error [${method} ${endPoint} ]:`, error)
      console.log(error)
      throw error
    }
  }
}
