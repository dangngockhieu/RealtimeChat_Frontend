import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { ConversationList } from '@/components/conversation/ConversationList'
import { ChatArea } from '@/components/chat/ChatArea'
import { NewConversationModal } from '@/components/conversation/NewConversationModal'
import { SocketProvider } from '@/contexts/SocketContext'

/**
 * Layout chính — 3 cột:
 *  Col 1 (72px)   : Sidebar nav
 *  Col 2 (320px)  : Danh sách hội thoại
 *  Col 3 (flex-1) : Cửa sổ chat
 */
export function MainLayout() {
  const [showNewModal, setShowNewModal] = useState(false)

  return (
    <SocketProvider>
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-canvas)' }}>
        {/* ── Col 1: Sidebar ── */}
        <Sidebar />

        {/* ── Col 2: Conversation list ── */}
        <ConversationList onNewConversation={() => setShowNewModal(true)} />

        {/* ── Col 3: Chat area ── */}
        <ChatArea />

        {/* ── Modal: new conversation ── */}
        {showNewModal && (
          <NewConversationModal onClose={() => setShowNewModal(false)} />
        )}
      </div>
    </SocketProvider>
  )
}
