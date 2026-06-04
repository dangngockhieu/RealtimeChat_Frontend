import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  children: ReactNode
}

/**
 * Layout dùng chung cho Login, Register, Verify OTP
 * Thiết kế split: bên trái là brand panel, bên phải là form card
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left panel: Brand / Illustration ── */}
      <div
        className="hidden lg:flex lg:w-[520px] xl:w-[600px] flex-shrink-0 flex-col justify-between p-12"
        style={{ backgroundColor: 'var(--color-ink-deep)' }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                fill="white"
              />
            </svg>
          </div>
          <span
            className="text-subtitle-lg"
            style={{ color: 'var(--color-canvas)' }}
          >
            Message
          </span>
        </Link>

        {/* Tagline */}
        <div className="flex flex-col gap-6">
          <h1
            className="text-display-lg"
            style={{ color: 'var(--color-canvas)' }}
          >
            Kết nối mọi lúc,<br />
            mọi nơi.
          </h1>
          <p className="text-body-md" style={{ color: 'var(--color-stone)' }}>
            Nhắn tin thời gian thực, gửi file, tạo nhóm — tất cả trong một nơi.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              '💬 Chat 1-1',
              '👥 Nhóm chat',
              '📎 Gửi file',
              '⚡ Realtime',
              '🔔 Thông báo',
            ].map((feat) => (
              <span
                key={feat}
                className="text-body-sm px-3 py-1.5 rounded-full border"
                style={{
                  color: 'var(--color-stone)',
                  borderColor: 'rgba(255,255,255,0.12)',
                }}
              >
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-caption" style={{ color: 'var(--color-steel)' }}>
          © {new Date().getFullYear()} Message App. All rights reserved.
        </p>
      </div>

      {/* ── Right panel: Form ── */}
      <div
        className="flex-1 flex items-center justify-center p-6 sm:p-10"
        style={{ backgroundColor: 'var(--color-surface-soft)' }}
      >
        {/* Logo mobile */}
        <div className="w-full max-w-[440px] flex flex-col gap-0">
          <Link
            to="/"
            className="flex lg:hidden items-center gap-2 mb-8 self-start"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  fill="white"
                />
              </svg>
            </div>
            <span
              className="text-subtitle-lg"
              style={{ color: 'var(--color-ink-deep)' }}
            >
              Message
            </span>
          </Link>

          {/* Form card */}
          <div
            className="rounded-[var(--radius-xxxl)] p-8 sm:p-10"
            style={{
              backgroundColor: 'var(--color-canvas)',
              boxShadow: 'var(--shadow-panel)',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
