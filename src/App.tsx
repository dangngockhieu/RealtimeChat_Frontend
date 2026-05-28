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

// ─── Main app pages (placeholder — sẽ hoàn thiện từ Giai đoạn 4) ──
const ChatPage = () => (
  <div className="flex items-center justify-center min-h-screen"
    style={{ backgroundColor: 'var(--color-surface-soft)' }}>
    <div className="card-panel p-8 max-w-md w-full mx-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-[var(--radius-xl)] flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-primary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white" />
          </svg>
        </div>
        <h1 className="text-heading-sm" style={{ color: 'var(--color-ink-deep)', fontFeatureSettings: '"ss01","ss02"' }}>
          💬 Chat App
        </h1>
      </div>
      <p className="text-body-sm" style={{ color: 'var(--color-steel)' }}>
        Đăng nhập thành công! Giai đoạn 4 sẽ hoàn thiện layout chat chính với sidebar, danh sách hội thoại và cửa sổ tin nhắn.
      </p>
    </div>
  </div>
)

// ─── Route Guards ──────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: 'var(--color-surface-soft)' }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
        />
        <p className="text-body-sm" style={{ color: 'var(--color-stone)' }}>Đang tải...</p>
      </div>
    </div>
  )
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isInitializing = useAuthStore((s) => s.isInitializing)

  if (isInitializing) return <LoadingScreen />
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isInitializing = useAuthStore((s) => s.isInitializing)

  if (isInitializing) return <LoadingScreen />
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>
}

// ─── App Root ──────────────────────────────────────────────
export default function App() {
  const { login, logout, setIsInitializing } = useAuthStore()

  /**
   * Khi khởi động app:
   * 1. Gọi POST /auth/refresh với HttpOnly cookie (withCredentials: true)
   * 2. Nếu thành công → lấy profile và set authenticated
   * 3. Nếu thất bại → chưa đăng nhập / session hết hạn
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const refreshRes = await authService.refresh()
        const newToken = refreshRes.data?.data?.result?.accessToken

        if (!newToken) throw new Error('No token in refresh response')

        setAccessToken(newToken)

        const profileRes = await userService.getProfile()
        const user = profileRes.data?.data?.result

        if (!user) throw new Error('No user profile')

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
      {/* ── Public routes ── */}
      <Route path="/login"       element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register"    element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/verify-otp"  element={<PublicRoute><VerifyOtpPage /></PublicRoute>} />

      {/* ── Private routes ── */}
      <Route path="/"            element={<PrivateRoute><ChatPage /></PrivateRoute>} />
      <Route path="/contacts"    element={<PrivateRoute><ChatPage /></PrivateRoute>} />
      <Route path="/profile"     element={<PrivateRoute><ChatPage /></PrivateRoute>} />

      {/* ── Fallback ── */}
      <Route path="*"            element={<Navigate to="/" replace />} />
    </Routes>
  )
}
