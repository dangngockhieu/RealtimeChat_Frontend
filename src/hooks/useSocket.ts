import { useEffect, useRef, useCallback } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/auth.store'
import { useChatStore } from '@/store/chat.store'
import { usePresenceStore } from '@/store/presence.store'
import { getAccessToken } from '@/services/api.client'
import type {
  SocketTypingPayload,
  SocketMarkReadPayload,
  SocketRecallMessagePayload,
  SocketSendMessagePayload,
  SocketCheckOnlinePayload,
  SocketCheckOnlineResponse,
  SocketUserTypingEvent,
  SocketMessageReadEvent,
  SocketMessageRecalledEvent,
  SocketUserOnlineEvent,
  Message,
} from '@/types'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

// ============================================================
//  useSocket — quản lý vòng đời Socket.IO
//  - Kết nối khi đăng nhập, ngắt khi đăng xuất
//  - Xác thực JWT qua auth.token
//  - Lắng nghe và dispatch tất cả socket events
//  - onNewMessage callback cho ChatWindow để append tin nhắn mới
// ============================================================

interface UseSocketOptions {
  onNewMessage?: (message: Message) => void
}

let socketInstance: Socket | null = null

export function useSocket({ onNewMessage }: UseSocketOptions = {}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const socketRef = useRef<Socket | null>(null)

  const { setTyping, incrementUnread, activeConversationId, clearUnread } = useChatStore()
  const { setOnline, setOffline, setOnlineUsers } = usePresenceStore()

  // ─── Kết nối Socket.IO ────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      // Chưa đăng nhập → ngắt kết nối nếu đang có
      if (socketInstance) {
        socketInstance.disconnect()
        socketInstance = null
        socketRef.current = null
      }
      return
    }

    const token = getAccessToken()
    if (!token) return

    // Tái sử dụng instance nếu đã kết nối
    if (socketInstance?.connected) {
      socketRef.current = socketInstance
      return
    }

    const socket = io(SOCKET_URL, {
      auth: { token },                    // JWT xác thực handshake
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketInstance = socket
    socketRef.current = socket

    // ─── Event: Xác thực thất bại ──────────────────────────
    socket.on('auth_error', (data: { message: string }) => {
      console.error('[Socket] Auth error:', data.message)
      socket.disconnect()
      socketInstance = null
    })

    // ─── Event: Tin nhắn mới ───────────────────────────────
    socket.on('new_message', (message: Message) => {
      const convId = typeof message.conversationId === 'string'
        ? message.conversationId
        : (message.conversationId as unknown as { toString: () => string }).toString()

      if (convId === activeConversationId) {
        // Đang mở conversation này → append vào view
        onNewMessage?.(message)
      } else {
        // Đang ở conversation khác → tăng unread badge
        incrementUnread(convId)
      }
    })

    // ─── Event: Trạng thái gõ phím ─────────────────────────
    socket.on('user_typing', ({ conversationId, userId, isTyping }: SocketUserTypingEvent) => {
      setTyping({ userId, conversationId, isTyping })
    })

    // ─── Event: Đã đọc tin nhắn ────────────────────────────
    socket.on('message_read', (_data: SocketMessageReadEvent) => {
      // TODO Phase 5: cập nhật trạng thái read receipt trên tin nhắn
    })

    // ─── Event: Thu hồi tin nhắn ───────────────────────────
    socket.on('message_recalled', (_data: SocketMessageRecalledEvent) => {
      // TODO Phase 5: cập nhật isRecalled=true trên tin nhắn tương ứng
    })

    // ─── Event: Thay đổi thông tin cuộc trò chuyện ─────────
    socket.on('conversation_updated', (_data: unknown) => {
      // TODO Phase 4: invalidate conversation query
    })

    // ─── Event: User online ────────────────────────────────
    socket.on('user_online', ({ userId }: SocketUserOnlineEvent) => {
      setOnline(userId)
    })

    // ─── Event: User offline ───────────────────────────────
    socket.on('user_offline', ({ userId }: SocketUserOnlineEvent) => {
      setOffline(userId)
    })

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
    })

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message)
    })

    return () => {
      // Không disconnect khi unmount component đơn lẻ
      // Socket được giữ sống xuyên suốt session
    }
  }, [isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Cập nhật activeConversationId ref ──────────────────
  useEffect(() => {
    if (activeConversationId) {
      clearUnread(activeConversationId)
    }
  }, [activeConversationId, clearUnread])

  // ─── EMIT ACTIONS ───────────────────────────────────────

  const sendMessage = useCallback((payload: SocketSendMessagePayload) => {
    socketRef.current?.emit('send_message', payload)
  }, [])

  const emitTyping = useCallback((payload: SocketTypingPayload) => {
    socketRef.current?.emit('typing', payload)
  }, [])

  const markRead = useCallback((payload: SocketMarkReadPayload) => {
    socketRef.current?.emit('mark_read', payload)
  }, [])

  const recallMessage = useCallback((payload: SocketRecallMessagePayload) => {
    socketRef.current?.emit('recall_message', payload)
  }, [])

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('join_conversation', { conversationId })
  }, [])

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('leave_conversation', { conversationId })
  }, [])

  const checkOnline = useCallback(
    (payload: SocketCheckOnlinePayload): Promise<SocketCheckOnlineResponse> => {
      return new Promise((resolve) => {
        socketRef.current?.emit(
          'check_online',
          payload,
          (response: SocketCheckOnlineResponse) => {
            setOnlineUsers(response.onlineUserIds)
            resolve(response)
          }
        )
      })
    },
    [setOnlineUsers]
  )

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
    // Emit actions
    sendMessage,
    emitTyping,
    markRead,
    recallMessage,
    joinConversation,
    leaveConversation,
    checkOnline,
  }
}
