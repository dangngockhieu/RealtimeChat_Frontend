import { Check, X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { friendshipService } from '@/services/friendship.service'
import { formatRelativeTime } from '@/utils/formatTime'
import type { Friendship } from '@/types'

interface FriendRequestCardProps {
  request: Friendship
}

export function FriendRequestCard({ request }: FriendRequestCardProps) {
  const queryClient = useQueryClient()
  const sender = request.requester

  const acceptMutation = useMutation({
    mutationFn: () => friendshipService.acceptRequest(request._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] })
      queryClient.invalidateQueries({ queryKey: ['friendships', 'pending'] })
    },
  })

  const declineMutation = useMutation({
    mutationFn: () => friendshipService.declineRequest(request._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships', 'pending'] })
    },
  })

  return (
    <div className="flex items-center justify-between p-4 rounded-[var(--radius-xxl)] bg-[var(--color-canvas)] border border-[var(--color-hairline-soft)] hover:shadow-sm transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar user={{ ...sender, id: sender.id }} size="lg" />
        <div className="min-w-0">
          <p className="text-body-md-bold text-[var(--color-ink-deep)] truncate">
            {sender.firstName} {sender.lastName}
          </p>
          <p className="text-caption text-[var(--color-stone)] truncate">
            {sender.email}
          </p>
          <span className="text-[11px] text-[var(--color-stone)]">
            Đã gửi {formatRelativeTime(request.createdAt)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<X size={14} />}
          loading={declineMutation.isPending}
          disabled={acceptMutation.isPending}
          onClick={() => declineMutation.mutate()}
        >
          Từ chối
        </Button>

        <Button
          variant="buy"
          size="sm"
          leftIcon={<Check size={14} />}
          loading={acceptMutation.isPending}
          disabled={declineMutation.isPending}
          onClick={() => acceptMutation.mutate()}
        >
          Đồng ý
        </Button>
      </div>
    </div>
  )
}
