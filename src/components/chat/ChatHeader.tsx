import { useQuery } from '@tanstack/react-query'
import { Phone, Video, Info, Users } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { conversationService } from '@/services/conversation.service'
import { usePresenceStore } from '@/store/presence.store'
import type { ConversationDetail } from '@/types'

interface ChatHeaderProps {
  conversationId: string
  onToggleInfo?: () => void
}

export function ChatHeader({ conversationId, onToggleInfo }: ChatHeaderProps) {
  const isOnline = usePresenceStore((s) => s.isOnline)

  const { data } = useQuery({
    queryKey: ['conversation-detail', conversationId],
    queryFn: () => conversationService.getDetail(conversationId),
    select: (res) => res.data?.data?.result as ConversationDetail | undefined,
    staleTime: 60_000,
  })

  const conv = data
  const isDirect = conv?.type === 'DIRECT'
  const displayName = conv?.name ?? 'Đang tải...'
  const memberCount = conv?.memberCount ?? 0

  // Người đối diện (DIRECT): lấy participant đầu tiên không phải mình
  const otherParticipant = isDirect
    ? conv?.participants?.find((p) => p.role !== conv.myMembership?.role)
    : null

  const online = isDirect && otherParticipant
    ? isOnline(otherParticipant.userId)
    : false

  const fakeUser = {
    firstName: displayName.split(' ')[0] ?? '',
    lastName: displayName.split(' ').slice(1).join(' ') ?? '',
    avatar: null,
    id: conversationId,
  }

  return (
    <header
      className="flex items-center justify-between px-4 py-3 flex-shrink-0"
      style={{
        borderBottom: '1px solid var(--color-hairline-soft)',
        backgroundColor: 'var(--color-canvas)',
        minHeight: 64,
      }}
    >
      {/* Left: avatar + info */}
      <div className="flex items-center gap-3 min-w-0">
        <Avatar
          user={fakeUser}
          size="md"
          showOnline={isDirect}
          isOnline={online}
        />
        <div className="min-w-0">
          <p
            className="text-body-md-bold truncate"
            style={{ color: 'var(--color-ink-deep)' }}
          >
            {displayName}
          </p>
          <p className="text-caption" style={{ color: 'var(--color-stone)' }}>
            {isDirect
              ? online
                ? 'Đang hoạt động'
                : 'Ngoại tuyến'
              : `${memberCount} thành viên`}
          </p>
        </div>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <ActionBtn icon={<Phone size={18} />} label="Gọi thoại" />
        <ActionBtn icon={<Video size={18} />} label="Gọi video" />
        {!isDirect && (
          <ActionBtn icon={<Users size={18} />} label="Thành viên" />
        )}
        <ActionBtn
          icon={<Info size={18} />}
          label="Thông tin"
          onClick={onToggleInfo}
        />
      </div>
    </header>
  )
}

function ActionBtn({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="btn-icon-circular"
      title={label}
      aria-label={label}
      style={{ color: 'var(--color-charcoal)' }}
    >
      {icon}
    </button>
  )
}
