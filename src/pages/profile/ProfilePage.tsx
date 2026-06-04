import { useQuery } from '@tanstack/react-query'
import { Sidebar } from '@/components/layout/Sidebar'
import { ProfileInfoCard } from '@/components/profile/ProfileInfoCard'
import { ChangePasswordCard } from '@/components/profile/ChangePasswordCard'
import { PreferencesCard } from '@/components/profile/PreferencesCard'
import { SocketProvider } from '@/contexts/SocketContext'
import { userService } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import type { UserAccount } from '@/types'

export default function ProfilePage() {
  const storeUser = useAuthStore((s) => s.user)

  // Fetch latest user profile
  const { data: profileUser, isLoading } = useQuery<UserAccount>({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await userService.getProfile()
      const user = res.data?.data?.result

      if (!user) {
        throw new Error('Unable to load user profile')
      }

      return user
    },
    initialData: storeUser ?? undefined,
  })

  const currentUser = profileUser || storeUser

  return (
    <SocketProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--color-canvas)]">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Profile Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--color-surface-soft)]">
          {/* Header */}
          <div className="px-8 pt-8 pb-4 bg-[var(--color-canvas)] border-b border-[var(--color-hairline-soft)]">
            <h1
              className="text-heading-sm"
              style={{ color: 'var(--color-ink-deep)' }}
            >
              Hồ sơ & Cài đặt
            </h1>
            <p className="text-body-sm text-[var(--color-stone)] mt-1">
              Quản lý thông tin tài khoản, mật khẩu và tùy chọn ứng dụng
            </p>
          </div>

          {/* Cards container */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-8">
              {isLoading && !currentUser ? (
                <div className="flex justify-center py-16">
                  <div className="w-8 h-8 border-2 border-t-transparent border-[var(--color-primary)] rounded-full animate-spin" />
                </div>
              ) : currentUser ? (
                <>
                  <ProfileInfoCard user={currentUser} />
                  <ChangePasswordCard />
                  <PreferencesCard />
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </SocketProvider>
  )
}
