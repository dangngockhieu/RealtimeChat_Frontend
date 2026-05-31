import { MessageSquare } from 'lucide-react'
import { useChatStore } from '@/store/chat.store'
import { ChatWindow } from './ChatWindow'

/**
 * Placeholder displayed when no conversation is active
 */
export function ChatWindowPlaceholder() {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-6 select-none"
      style={{ backgroundColor: 'var(--color-surface-soft)' }}
    >
      <div
        className="w-20 h-20 rounded-[var(--radius-xxxl)] flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,100,224,0.08)' }}
      >
        <MessageSquare size={36} style={{ color: 'var(--color-primary)' }} />
      </div>
      <div className="text-center">
        <p
          className="text-heading-sm mb-2"
          style={{ color: 'var(--color-ink-deep)', fontFeatureSettings: '"ss01","ss02"' }}
        >
          Chọn một cuộc trò chuyện
        </p>
        <p className="text-body-sm" style={{ color: 'var(--color-stone)' }}>
          Chọn từ danh sách bên trái để bắt đầu nhắn tin
        </p>
      </div>
    </div>
  )
}

/**
 * ChatArea: switches between Placeholder and active ChatWindow
 */
export function ChatArea() {
  const activeConversationId = useChatStore((s) => s.activeConversationId)

  if (!activeConversationId) {
    return <ChatWindowPlaceholder />
  }

  return <ChatWindow conversationId={activeConversationId} />
}
