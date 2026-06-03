import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Volume2, Globe, Shield, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'

export function PreferencesCard() {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [notifyEnabled, setNotifyEnabled] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (!confirm('Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?')) return

    setIsLoggingOut(true)
    try {
      await authService.logout()
    } catch {
      // ignore
    } finally {
      logout()
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="card-product flex flex-col gap-6">
      <div className="border-b border-[var(--color-hairline-soft)] pb-4">
        <h2
          className="text-subtitle-lg"
          style={{ color: 'var(--color-ink-deep)', fontFeatureSettings: '"ss01","ss02"' }}
        >
          Cài đặt & Tùy chọn
        </h2>
        <p className="text-body-sm text-[var(--color-stone)] mt-0.5">
          Tùy chỉnh thông báo âm thanh và phiên đăng nhập
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Sound toggle */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)] text-[var(--color-charcoal)]">
              <Volume2 size={18} />
            </div>
            <div>
              <p className="text-body-sm-bold text-[var(--color-ink-deep)]">Âm thanh thông báo</p>
              <p className="text-caption text-[var(--color-stone)]">
                Phát âm thanh khi có tin nhắn mới gửi đến
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]" />
          </label>
        </div>

        {/* Notifications toggle */}
        <div className="flex items-center justify-between py-2 border-t border-[var(--color-hairline-soft)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)] text-[var(--color-charcoal)]">
              <Bell size={18} />
            </div>
            <div>
              <p className="text-body-sm-bold text-[var(--color-ink-deep)]">Thông báo màn hình</p>
              <p className="text-caption text-[var(--color-stone)]">
                Hiển thị pop-up thông báo khi ứng dụng chạy nền
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifyEnabled}
              onChange={(e) => setNotifyEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]" />
          </label>
        </div>

        {/* Language info */}
        <div className="flex items-center justify-between py-2 border-t border-[var(--color-hairline-soft)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)] text-[var(--color-charcoal)]">
              <Globe size={18} />
            </div>
            <div>
              <p className="text-body-sm-bold text-[var(--color-ink-deep)]">Ngôn ngữ</p>
              <p className="text-caption text-[var(--color-stone)]">Giao diện ngôn ngữ hiện tại</p>
            </div>
          </div>
          <span className="text-body-sm font-bold text-[var(--color-charcoal)]">Tiếng Việt</span>
        </div>

        {/* System security status */}
        <div className="flex items-center justify-between py-2 border-t border-[var(--color-hairline-soft)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)] text-[var(--color-charcoal)]">
              <Shield size={18} />
            </div>
            <div>
              <p className="text-body-sm-bold text-[var(--color-ink-deep)]">Trạng thái bảo mật</p>
              <p className="text-caption text-[var(--color-stone)]">
                Phiên đăng nhập được bảo vệ bởi JWT & HttpOnly Cookie
              </p>
            </div>
          </div>
          <span className="badge badge-success">An toàn</span>
        </div>
      </div>

      <div className="border-t border-[var(--color-hairline-soft)] pt-4 flex justify-between items-center">
        <div>
          <p className="text-caption font-bold text-[var(--color-ink-deep)]">Phiên đăng nhập hiện tại</p>
          <p className="text-[11px] text-[var(--color-stone)]">
            Đăng xuất sẽ xóa phiên làm việc trên trình duyệt này
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          leftIcon={<LogOut size={14} className="text-[var(--color-critical)]" />}
          loading={isLoggingOut}
          onClick={handleLogout}
          className="text-[var(--color-critical)] hover:bg-red-50 border-red-200"
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  )
}
