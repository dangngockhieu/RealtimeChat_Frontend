import { useMemo } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { usePresenceStore } from '@/store/presence.store'
import { useChatStore } from '@/store/chat.store'
import { formatConversationTime } from '@/utils/formatTime'
import { cn } from '@/utils/cn'
import type { ConversationSummary, Message, UserAccount } from '@/types'

interface ConversationItemProps {
  conversation: ConversationSummary
  currentUserId: string
}

export function ConversationItem({ conversation, currentUserId }: ConversationItemProps) {
  const { activeConversationId, setActiveConversation, unreadCounts } = useChatStore()
  const isOnline = usePresenceStore((s) => s.isOnline)

  const isActive = activeConversationId === conversation._id
  const unread   = unreadCounts[conversation._id] ?? 0

  // Lấy thông tin người đối diện (cho DIRECT chat)
  const isDirect  = conversation.type === 'DIRECT'

  // Tên hiển thị
  const displayName = conversation.name ?? 'Cuộc trò chuyện'

  // Avatar source
  const avatarSrc = conversation.avatar ?? null

  // Fake user object để Avatar component xử lý initials + màu
  const fakeUser = useMemo(() => ({
    firstName: displayName.split(' ')[0] ?? '',
    lastName:  displayName.split(' ').slice(1).join(' ') ?? '',
    avatar:    avatarSrc,
    id:        conversation._id,
  }), [displayName, avatarSrc, conversation._id])

  // Online status: chỉ hiện cho DIRECT
  const otherOnline = isDirect && isOnline(conversation._id) // simplified

  // Nội dung preview tin nhắn cuối
  const lastMsg    = conversation.lastMessage as Message | null
  const previewText = useMemo(() => {
    if (!lastMsg) return 'Chưa có tin nhắn'
    if (lastMsg.isRecalled) return 'Tin nhắn đã được thu hồi'
    if (lastMsg.type === 'IMAGE') return '📷 Hình ảnh'
    if (lastMsg.type === 'FILE') return '📎 Tệp đính kèm'
    const isMine = (lastMsg.senderId as UserAccount)?.id === currentUserId
      || lastMsg.senderId === currentUserId
    const prefix = isMine ? 'Bạn: ' : ''
    return prefix + (lastMsg.content?.slice(0, 60) || '')
  }, [lastMsg, currentUserId])

  return (
    <button
      onClick={() => setActiveConversation(conversation._id)}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-3 rounded-[var(--radius-xl)] transition-all duration-150 text-left cursor-pointer',
        isActive
          ? 'bg-[rgba(0,100,224,0.1)]'
          : 'hover:bg-[var(--color-surface-soft)]',
      )}
    >
      {/* Avatar */}
      <Avatar
        user={fakeUser}
        size="md"
        showOnline={isDirect}
        isOnline={otherOnline}
      />

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-1">
          <span
            className={cn(
              'truncate',
              unread > 0 ? 'text-body-sm-bold' : 'text-body-sm',
            )}
            style={{ color: 'var(--color-ink-deep)' }}
          >
            {displayName}
          </span>
          <span className="text-caption flex-shrink-0" style={{ color: 'var(--color-stone)' }}>
            {formatConversationTime(conversation.lastMessageAt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-1">
          <span
            className="text-caption truncate"
            style={{ color: unread > 0 ? 'var(--color-ink)' : 'var(--color-stone)' }}
          >
            {previewText}
          </span>

          {unread > 0 && (
            <span
              className="badge badge-success flex-shrink-0 min-w-[20px] text-center text-[11px] px-1.5 py-0.5"
            >
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
