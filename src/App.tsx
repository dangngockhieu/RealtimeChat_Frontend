import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { userService } from '@/services/user.service'
import { setAccessToken } from '@/services/api.client'
import { authService } from '@/services/auth.service'

// ─── Auth pages ────────────────────────────────────────────
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import VerifyOtpPage from '@/pages/auth/VerifyOtpPage'

// ─── Main app page ─────────────────────────────────────────
import ChatPage from '@/pages/chat/ChatPage'
import ContactsPage from '@/pages/contacts/ContactsPage'

// ─── Route Guards ──────────────────────────────────────────
function LoadingScreen() {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: 'var(--color-surface-soft)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
        />
        <p className="text-body-sm" style={{ color: 'var(--color-stone)' }}>
          Đang tải...
        </p>
      </div>
    </div>
  )
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isInitializing  = useAuthStore((s) => s.isInitializing)
  if (isInitializing) return <LoadingScreen />
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isInitializing  = useAuthStore((s) => s.isInitializing)
  if (isInitializing) return <LoadingScreen />
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>
}

// ─── App Root ──────────────────────────────────────────────
export default function App() {
  const { login, logout, setIsInitializing } = useAuthStore()

  /**
   * Khôi phục phiên đăng nhập khi khởi động:
   * 1. POST /auth/refresh (dùng HttpOnly cookie tự động)
   * 2. Lấy profile nếu nhận được token
   * 3. Nếu thất bại → đã đăng xuất hoặc hết hạn
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const refreshRes = await authService.refresh()
        const newToken   = refreshRes.data?.data?.result?.accessToken
        if (!newToken) throw new Error('no token')

        setAccessToken(newToken)

        const profileRes = await userService.getProfile()
        const user       = profileRes.data?.data?.result
        if (!user) throw new Error('no profile')

        login(user, newToken)
      } catch {
        logout()
      } finally {
        setIsInitializing(false)
      }
    }
    initializeAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Routes>
      {/* Public */}
      <Route path="/login"      element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register"   element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/verify-otp" element={<PublicRoute><VerifyOtpPage /></PublicRoute>} />

      {/* Private — tất cả render qua MainLayout */}
      <Route path="/contacts" element={<PrivateRoute><ContactsPage /></PrivateRoute>} />
      <Route path="/*" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
    </Routes>
  )
}
