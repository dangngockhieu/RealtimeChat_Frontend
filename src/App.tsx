import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { userService } from '@/services/user.service'
import { setAccessToken } from '@/services/api.client'
import { authService } from '@/services/auth.service'

// ─── Pages (sẽ tạo ở Giai đoạn 2 trở đi) ─────────────────
// Tạm thời dùng placeholder để app build được
const LoginPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-[var(--color-surface-soft)]">
    <div className="card-panel p-8 max-w-md w-full mx-4">
      <h1 className="text-heading-sm text-[var(--color-ink-deep)] mb-2">Đăng nhập</h1>
      <p className="text-body-sm text-[var(--color-steel)]">Chat Message App — Giai đoạn 2 sẽ hoàn thiện trang này.</p>
    </div>
  </div>
)

const ChatPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-[var(--color-surface-soft)]">
    <div className="card-panel p-8 max-w-md w-full mx-4">
      <h1 className="text-heading-sm text-[var(--color-ink-deep)] mb-2">💬 Chat</h1>
      <p className="text-body-sm text-[var(--color-steel)]">Giai đoạn 4-5 sẽ hoàn thiện layout chat chính.</p>
    </div>
  </div>
)

// ─── Route Guards ──────────────────────────────────────────
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isInitializing = useAuthStore((s) => s.isInitializing)

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isInitializing = useAuthStore((s) => s.isInitializing)

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>
}

// ─── App Root ──────────────────────────────────────────────
export default function App() {
  const { login, logout, setIsInitializing } = useAuthStore()

  /**
   * Khi khởi động app:
   * 1. Gọi /auth/refresh để lấy accessToken mới bằng HttpOnly cookie
   * 2. Nếu thành công → lấy profile và set authenticated
   * 3. Nếu thất bại (cookie hết hạn) → clear auth state
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Thử refresh token (dùng HttpOnly cookie tự động)
        const refreshRes = await authService.refresh()
        const newToken = refreshRes.data?.data?.result?.accessToken

        if (!newToken) throw new Error('No token')

        setAccessToken(newToken)

        // Lấy thông tin user
        const profileRes = await userService.getProfile()
        const user = profileRes.data?.data?.result

        if (!user) throw new Error('No user profile')

        login(user, newToken)
      } catch {
        // Refresh thất bại → chưa đăng nhập hoặc session hết hạn
        logout()
      } finally {
        setIsInitializing(false)
      }
    }

    initializeAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Routes>
      {/* Public routes — chỉ truy cập khi chưa đăng nhập */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/verify-otp" element={<PublicRoute><LoginPage /></PublicRoute>} />

      {/* Private routes — yêu cầu đăng nhập */}
      <Route path="/" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
      <Route path="/contacts" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ChatPage /></PrivateRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
