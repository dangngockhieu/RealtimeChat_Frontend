import { MessageSquare } from 'lucide-react'
import { useChatStore } from '@/store/chat.store'

/**
 * Placeholder hiển thị khi chưa chọn cuộc trò chuyện nào
 * Phase 5 sẽ thay thế bằng ChatWindow thực sự
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
 * Wrapper chọn giữa Placeholder và ChatWindow thực
 */
export function ChatArea() {
  const activeConversationId = useChatStore((s) => s.activeConversationId)

  if (!activeConversationId) {
    return <ChatWindowPlaceholder />
  }

  // Phase 5: return <ChatWindow conversationId={activeConversationId} />
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-4 select-none"
      style={{ backgroundColor: 'var(--color-surface-soft)' }}
    >
      <div
        className="w-16 h-16 rounded-[var(--radius-xxl)] flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,100,224,0.08)' }}
      >
        <MessageSquare size={28} style={{ color: 'var(--color-primary)' }} />
      </div>
      <div className="text-center">
        <p className="text-body-sm-bold" style={{ color: 'var(--color-ink-deep)' }}>
          Conversation: {activeConversationId}
        </p>
        <p className="text-caption mt-1" style={{ color: 'var(--color-stone)' }}>
          Chat window sẽ được hoàn thiện ở Giai đoạn 5
        </p>
      </div>
    </div>
  )
}
