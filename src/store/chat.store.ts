import { create } from 'zustand'
import type { Message } from '@/types'

// ============================================================
//  CHAT STORE — Quản lý trạng thái cửa sổ chat
// ============================================================

interface TypingUser {
  userId: string
  conversationId: string
}

interface ChatState {
  /** ID cuộc trò chuyện đang mở */
  activeConversationId: string | null

  /** Tin nhắn đang được trả lời (reply-to feature) */
  replyingToMessage: Message | null

  /** Danh sách user đang gõ phím: key = conversationId, value = userId[] */
  typingUsers: Record<string, string[]>

  /** Unread count per conversation: key = conversationId, value = count */
  unreadCounts: Record<string, number>

  // Actions
  setActiveConversation: (id: string | null) => void
  setReplyingTo: (message: Message | null) => void
  setTyping: (payload: TypingUser & { isTyping: boolean }) => void
  incrementUnread: (conversationId: string) => void
  clearUnread: (conversationId: string) => void
  resetAllUnread: () => void
}

export const useChatStore = create<ChatState>()((set) => ({
  activeConversationId: null,
  replyingToMessage: null,
  typingUsers: {},
  unreadCounts: {},

  setActiveConversation: (id) =>
    set({ activeConversationId: id, replyingToMessage: null }),

  setReplyingTo: (message) =>
    set({ replyingToMessage: message }),

  setTyping: ({ userId, conversationId, isTyping }) =>
    set((state) => {
      const current = state.typingUsers[conversationId] || []
      const updated = isTyping
        ? Array.from(new Set([...current, userId]))
        : current.filter((id) => id !== userId)
      return {
        typingUsers: { ...state.typingUsers, [conversationId]: updated },
      }
    }),

  incrementUnread: (conversationId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: (state.unreadCounts[conversationId] || 0) + 1,
      },
    })),

  clearUnread: (conversationId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [conversationId]: 0 },
    })),

  resetAllUnread: () => set({ unreadCounts: {} }),
}))
