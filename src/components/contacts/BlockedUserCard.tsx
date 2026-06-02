import { ShieldOff } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { friendshipService } from '@/services/friendship.service'
import type { Friendship, UserAccount } from '@/types'

interface BlockedUserCardProps {
  friendship: Friendship
  currentUserId?: string
}

export function BlockedUserCard({ friendship, currentUserId }: BlockedUserCardProps) {
  const queryClient = useQueryClient()

  // The blocked user is the other person
  const blockedUser: UserAccount =
    friendship.requester.id === currentUserId
      ? friendship.recipient
      : friendship.requester

  const unblockMutation = useMutation({
    mutationFn: () => friendshipService.unblockUser(blockedUser.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships', 'blocked'] })
      queryClient.invalidateQueries({ queryKey: ['friendships'] })
    },
  })

  return (
    <div className="flex items-center justify-between p-4 rounded-[var(--radius-xxl)] bg-[var(--color-canvas)] border border-[var(--color-hairline-soft)] hover:shadow-sm transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar user={{ ...blockedUser, id: blockedUser.id }} size="lg" />
        <div className="min-w-0">
          <p className="text-body-md-bold text-[var(--color-ink-deep)] truncate">
            {blockedUser.firstName} {blockedUser.lastName}
          </p>
          <p className="text-caption text-[var(--color-stone)] truncate">
            {blockedUser.email}
          </p>
          <span className="text-[11px] text-[var(--color-critical)] font-medium">
            Đã chặn
          </span>
        </div>
      </div>

      <Button
        variant="secondary"
        size="sm"
        leftIcon={<ShieldOff size={14} />}
        loading={unblockMutation.isPending}
        onClick={() => {
          if (confirm(`Bạn có chắc muốn bỏ chặn ${blockedUser.firstName} ${blockedUser.lastName}?`)) {
            unblockMutation.mutate()
          }
        }}
      >
        Bỏ chặn
      </Button>
    </div>
  )
}
