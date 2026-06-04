import { useState } from 'react'
import { Search, UserPlus, Check, AlertCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { userService } from '@/services/user.service'
import { friendshipService } from '@/services/friendship.service'
import { useAuthStore } from '@/store/auth.store'
import type { UserAccount } from '@/types'

export function AddFriendTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const currentUserId = useAuthStore((s) => s.user?.id)
  const queryClient = useQueryClient()

  // Search user by email
  const { data: foundUser, isFetching } = useQuery({
    queryKey: ['user-by-email', submittedEmail],
    queryFn: () => userService.getUserByEmail(submittedEmail),
    select: (res) => res.data?.data?.result as UserAccount | null,
    enabled: Boolean(submittedEmail && submittedEmail.includes('@')),
    retry: false,
  })

  // Send friend request
  const sendMutation = useMutation({
    mutationFn: (friendId: string) => friendshipService.sendRequest({ friendId }),
    onSuccess: () => {
      setFeedback({ type: 'success', message: 'Đã gửi lời mời kết bạn thành công!' })
      queryClient.invalidateQueries({ queryKey: ['friendships'] })
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setFeedback({
        type: 'error',
        message: axiosErr?.response?.data?.message || 'Không thể gửi lời mời kết bạn.',
      })
    },
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    const trimmed = searchTerm.trim().toLowerCase()
    if (trimmed && trimmed.includes('@')) {
      setSubmittedEmail(trimmed)
    }
  }

  const isSelf = foundUser?.id === currentUserId

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {/* Search Input Box Card */}
      <div className="bg-[var(--color-canvas)] p-6 rounded-[var(--radius-xxl)] border border-[var(--color-hairline-soft)] shadow-sm">
        <h3 className="text-body-md-bold text-[var(--color-ink-deep)] mb-1">
          Tìm kiếm bạn bè qua email
        </h3>
        <p className="text-body-sm text-[var(--color-stone)] mb-4">
          Nhập địa chỉ email của người dùng để tìm kiếm và gửi lời mời kết bạn.
        </p>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          <div className="relative flex-1 min-w-0">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-stone)] pointer-events-none"
            />
            <input
              type="email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập địa chỉ email (ví dụ: mai.le@example.com)..."
              className="w-full h-11 pl-10 pr-4 rounded-full bg-[var(--color-surface-soft)] text-body-sm text-[var(--color-ink-deep)] placeholder-[var(--color-stone)] border border-[var(--color-hairline)] focus:border-[var(--color-primary)] focus:bg-white outline-none transition-all"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            loading={isFetching}
            className="flex-shrink-0 !h-11 !px-6"
          >
            Tìm kiếm
          </Button>
        </form>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`flex items-center gap-2 p-3.5 rounded-[var(--radius-xl)] text-body-sm ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Loading state */}
      {isFetching && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-t-transparent border-[var(--color-primary)] rounded-full animate-spin" />
        </div>
      )}

      {/* Not found state */}
      {submittedEmail && !isFetching && !foundUser && (
        <div className="text-center py-8 bg-[var(--color-canvas)] rounded-[var(--radius-xxl)] border border-[var(--color-hairline-soft)] text-[var(--color-stone)]">
          <p className="text-body-md font-bold text-[var(--color-ink-deep)]">
            Không tìm thấy người dùng với email: "{submittedEmail}"
          </p>
          <p className="text-caption mt-1">
            Gợi ý email thử nghiệm: mai.le@example.com, tuan.tran@example.com, ha.pham@example.com
          </p>
        </div>
      )}

      {/* User Found Card */}
      {foundUser && !isFetching && (
        <div className="flex items-center justify-between p-5 rounded-[var(--radius-xxl)] bg-[var(--color-canvas)] border border-[var(--color-hairline-soft)] shadow-sm">
          <div className="flex items-center gap-4">
            <Avatar user={{ ...foundUser, id: foundUser.id }} size="lg" />
            <div>
              <p className="text-body-md-bold text-[var(--color-ink-deep)]">
                {foundUser.firstName} {foundUser.lastName} {isSelf && '(Bạn)'}
              </p>
              <p className="text-caption text-[var(--color-stone)]">
                {foundUser.email}
              </p>
            </div>
          </div>

          {!isSelf ? (
            <Button
              variant="buy"
              size="sm"
              leftIcon={<UserPlus size={14} />}
              loading={sendMutation.isPending}
              onClick={() => sendMutation.mutate(foundUser.id)}
            >
              Kết bạn
            </Button>
          ) : (
            <span className="badge badge-attention">Tài khoản của bạn</span>
          )}
        </div>
      )}
    </div>
  )
}
