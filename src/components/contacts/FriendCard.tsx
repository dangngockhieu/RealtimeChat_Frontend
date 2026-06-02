import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, MoreVertical, UserMinus, ShieldAlert } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { friendshipService } from '@/services/friendship.service'
import { conversationService } from '@/services/conversation.service'
import { usePresenceStore } from '@/store/presence.store'
import { useChatStore } from '@/store/chat.store'
import { CONVERSATIONS_QUERY_KEY } from '@/hooks/useConversations'
import type { UserAccount } from '@/types'

interface FriendCardProps {
  friendshipId: string
  friend: UserAccount
}

export function FriendCard({ friendshipId, friend }: FriendCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const isOnline = usePresenceStore((s) => s.isOnline(friend.id))
  const { setActiveConversation } = useChatStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Open direct chat
  const chatMutation = useMutation({
    mutationFn: () => conversationService.createDirect({ targetUserId: friend.id }),
    onSuccess: (res) => {
      const conv = res.data?.data?.result
      if (conv) {
        queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
        setActiveConversation(conv.id)
        navigate('/')
      }
    },
  })

  // Unfriend
  const unfriendMutation = useMutation({
    mutationFn: () => friendshipService.unfriend(friendshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] })
      setShowMenu(false)
    },
  })

  // Block
  const blockMutation = useMutation({
    mutationFn: () => friendshipService.blockUser({ friendId: friend.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] })
      queryClient.invalidateQueries({ queryKey: ['friendships', 'blocked'] })
      setShowMenu(false)
    },
  })

  return (
    <div className="flex items-center justify-between p-4 rounded-[var(--radius-xxl)] bg-[var(--color-canvas)] border border-[var(--color-hairline-soft)] hover:shadow-sm transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar
          user={{ ...friend, id: friend.id }}
          size="lg"
          showOnline
          isOnline={isOnline}
        />
        <div className="min-w-0">
          <p className="text-body-md-bold text-[var(--color-ink-deep)] truncate">
            {friend.firstName} {friend.lastName}
          </p>
          <p className="text-caption text-[var(--color-stone)] truncate">
            {friend.email}
          </p>
          <span className="text-[11px] font-medium" style={{ color: isOnline ? 'var(--color-success)' : 'var(--color-stone)' }}>
            {isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<MessageSquare size={14} />}
          loading={chatMutation.isPending}
          onClick={() => chatMutation.mutate()}
        >
          Nhắn tin
        </Button>

        <div className="relative">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="btn-icon-circular text-[var(--color-stone)] hover:text-[var(--color-ink-deep)]"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-10 w-44 rounded-[var(--radius-xl)] bg-[var(--color-canvas)] shadow-lg border border-[var(--color-hairline-soft)] py-1.5 z-40 flex flex-col text-caption">
                <button
                  onClick={() => {
                    if (confirm(`Bạn có chắc muốn hủy kết bạn với ${friend.firstName} ${friend.lastName}?`)) {
                      unfriendMutation.mutate()
                    }
                  }}
                  className="px-3 py-2 text-left hover:bg-[var(--color-surface-soft)] text-[var(--color-ink-deep)] flex items-center gap-2"
                >
                  <UserMinus size={14} /> Hủy kết bạn
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Bạn có chắc muốn chặn ${friend.firstName} ${friend.lastName}?`)) {
                      blockMutation.mutate()
                    }
                  }}
                  className="px-3 py-2 text-left hover:bg-red-50 text-[var(--color-critical)] flex items-center gap-2 border-t border-[var(--color-hairline-soft)]"
                >
                  <ShieldAlert size={14} /> Chặn người này
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
