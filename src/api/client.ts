import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

// ── Request interceptor: attach JWT access token ──────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('pace_access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: handle 401 with refresh ────────────────────────────
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return apiClient(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('pace_refresh_token')
      if (!refreshToken) {
        processQueue(error, null)
        isRefreshing = false
        localStorage.removeItem('pace_access_token')
        localStorage.removeItem('pace_refresh_token')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        })
        const newAccess: string = data.access
        localStorage.setItem('pace_access_token', newAccess)
        processQueue(null, newAccess)
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccess}`
        }
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('pace_access_token')
        localStorage.removeItem('pace_refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ── Error normaliser ───────────────────────────────────────────────────────────
export interface NormalisedError {
  message: string
  fieldErrors?: Record<string, string[]>
  status?: number
}

export function normaliseError(error: unknown): NormalisedError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const data = error.response?.data

    if (!error.response) {
      return { message: 'Network error — please check your connection.', status: 0 }
    }

    if (status === 400) {
      // DRF validation error
      const fieldErrors: Record<string, string[]> = {}
      let mainMessage = 'Please check the form for errors.'

      if (typeof data === 'object' && data !== null) {
        Object.entries(data).forEach(([key, val]) => {
          if (key === 'non_field_errors' || key === 'detail') {
            mainMessage = Array.isArray(val) ? val.join(' ') : String(val)
          } else {
            fieldErrors[key] = Array.isArray(val) ? val : [String(val)]
          }
        })
      }

      return { message: mainMessage, fieldErrors, status }
    }

    if (status === 401) return { message: 'Session expired. Please log in again.', status }
    if (status === 403) return { message: 'You do not have permission to do this.', status }
    if (status === 404) return { message: 'Resource not found.', status }
    if (status === 409) return { message: data?.detail || 'Conflict — this action cannot be completed.', status }
    if (status && status >= 500) return { message: 'Server error — please try again later.', status }

    return { message: data?.detail || 'Something went wrong.', status }
  }

  return { message: 'An unexpected error occurred.' }
}
