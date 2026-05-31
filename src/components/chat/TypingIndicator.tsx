import { useChatStore } from '@/store/chat.store'

interface TypingIndicatorProps {
  conversationId: string
}

/**
 * Hiển thị "Ai đó đang gõ..." khi có người đang nhập
 * Dùng animation 3 chấm nhảy theo kiểu Meta Messenger
 */
export function TypingIndicator({ conversationId }: TypingIndicatorProps) {
  const typingUsers = useChatStore((s) => s.typingUsers[conversationId] ?? [])

  if (typingUsers.length === 0) return null

  return (
    <div className="flex items-center gap-2 px-4 py-1.5">
      {/* Bubble giả */}
      <div
        className="flex items-center gap-1 px-3.5 py-2.5 rounded-[var(--radius-xxxl)]"
        style={{
          backgroundColor: 'var(--color-surface-soft)',
          borderBottomLeftRadius: 'var(--radius-sm)',
        }}
      >
        <BounceDot delay="0ms" />
        <BounceDot delay="150ms" />
        <BounceDot delay="300ms" />
      </div>
      <span className="text-caption" style={{ color: 'var(--color-stone)' }}>
        {typingUsers.length === 1
          ? 'đang gõ...'
          : `${typingUsers.length} người đang gõ...`}
      </span>
    </div>
  )
}

function BounceDot({ delay }: { delay: string }) {
  return (
    <span
      className="block w-1.5 h-1.5 rounded-full"
      style={{
        backgroundColor: 'var(--color-stone)',
        animation: `typingBounce 1.2s ease-in-out ${delay} infinite`,
      }}
    />
  )
}
