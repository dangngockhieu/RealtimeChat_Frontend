import axios, { type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'

// ============================================================
//  Axios Instance — base URL: http://localhost:3000/api/v1
//  withCredentials: true để cookie Refresh Token hoạt động
// ============================================================
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Gửi HttpOnly cookie refreshToken trong mọi request
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// ============================================================
//  ACCESS TOKEN MANAGEMENT (lưu trong memory, không localStorage)
//  Bảo mật hơn localStorage: không bị XSS đọc từ JS
// ============================================================
let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

// ============================================================
//  REQUEST INTERCEPTOR
//  Tự động đính kèm Bearer token vào mọi request được bảo vệ
// ============================================================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ============================================================
//  RESPONSE INTERCEPTOR — Tự động Refresh Token khi nhận 401
//  - Nếu nhận 401, gọi POST /auth/refresh (dùng HttpOnly cookie)
//  - Lấy accessToken mới, cập nhật memory, retry request gốc
//  - Nếu refresh cũng fail (cookie hết hạn), redirect login
//  - Request Queue: tránh race condition khi nhiều request 401 cùng lúc
// ============================================================
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token!)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // Chỉ xử lý 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu chính request /auth/refresh bị 401 -> session hết hạn hoàn toàn
      if (originalRequest.url?.includes('/auth/refresh')) {
        setAccessToken(null)
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Có request đang refresh rồi -> xếp vào queue chờ
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return apiClient(originalRequest)
        }).catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Gọi refresh với HttpOnly cookie (withCredentials: true đã set)
        const { data } = await apiClient.post('/auth/refresh')
        const newToken = data?.data?.result?.accessToken

        if (!newToken) throw new Error('No access token in refresh response')

        setAccessToken(newToken)
        processQueue(null, newToken)

        // Retry request gốc với token mới
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        setAccessToken(null)
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
