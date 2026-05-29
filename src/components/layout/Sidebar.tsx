import { NavLink, useNavigate } from 'react-router-dom'
import { MessageSquare, Users, Settings, LogOut } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import { cn } from '@/utils/cn'

const NAV_ITEMS = [
  { to: '/',         icon: MessageSquare, label: 'Tin nhắn',  exact: true },
  { to: '/contacts', icon: Users,         label: 'Danh bạ',   exact: false },
]

export function Sidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try { await authService.logout() } catch { /* ignore */ }
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className="flex flex-col items-center py-4 gap-2 flex-shrink-0"
      style={{
        width: 72,
        backgroundColor: 'var(--color-ink-deep)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div
        className="w-10 h-10 rounded-[var(--radius-xl)] flex items-center justify-center mb-3"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            fill="white"
          />
        </svg>
      </div>

      {/* Nav icons */}
      <nav className="flex flex-col items-center gap-1 flex-1 w-full px-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              cn(
                'w-12 h-12 rounded-[var(--radius-xl)] flex flex-col items-center justify-center gap-0.5 transition-all duration-150 cursor-pointer group',
                isActive
                  ? 'bg-[var(--color-primary)]'
                  : 'hover:bg-white/10',
              )
            }
            title={label}
          >
            {({ isActive }) => (
              <>
                <Icon size={20} color={isActive ? 'white' : '#8595a4'} />
                <span
                  className="text-[9px] font-bold"
                  style={{ color: isActive ? 'white' : '#8595a4' }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: settings + avatar */}
      <div className="flex flex-col items-center gap-2">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              'w-12 h-12 rounded-[var(--radius-xl)] flex flex-col items-center justify-center gap-0.5 transition-all duration-150',
              isActive ? 'bg-[var(--color-primary)]' : 'hover:bg-white/10',
            )
          }
          title="Cài đặt"
        >
          {({ isActive }) => (
            <>
              <Settings size={20} color={isActive ? 'white' : '#8595a4'} />
              <span
                className="text-[9px] font-bold"
                style={{ color: isActive ? 'white' : '#8595a4' }}
              >
                Cài đặt
              </span>
            </>
          )}
        </NavLink>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-12 h-12 rounded-[var(--radius-xl)] flex flex-col items-center justify-center gap-0.5 hover:bg-white/10 transition-all duration-150 cursor-pointer"
          title="Đăng xuất"
        >
          <LogOut size={20} color="#8595a4" />
          <span className="text-[9px] font-bold" style={{ color: '#8595a4' }}>
            Thoát
          </span>
        </button>

        {/* User avatar */}
        <div className="mt-1">
          <Avatar
            user={user ? { ...user, id: user.id } : null}
            size="sm"
            showOnline
            isOnline
          />
        </div>
      </div>
    </aside>
  )
}
