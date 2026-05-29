import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
  type ReactNode,
} from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/auth.store'
import { useChatStore } from '@/store/chat.store'
import { usePresenceStore } from '@/store/presence.store'
import { getAccessToken } from '@/services/api.client'
import type {
  Message,
  SocketTypingPayload,
  SocketMarkReadPayload,
  SocketRecallMessagePayload,
  SocketSendMessagePayload,
  SocketCheckOnlinePayload,
  SocketCheckOnlineResponse,
  SocketUserTypingEvent,
  SocketUserOnlineEvent,
} from '@/types'

// ============================================================
//  SOCKET CONTEXT
// ============================================================
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

interface SocketContextValue {
  socket: Socket | null
  isConnected: boolean
  sendMessage: (payload: SocketSendMessagePayload) => void
  emitTyping: (payload: SocketTypingPayload) => void
  markRead: (payload: SocketMarkReadPayload) => void
  recallMessage: (payload: SocketRecallMessagePayload) => void
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
  checkOnline: (payload: SocketCheckOnlinePayload) => Promise<SocketCheckOnlineResponse>
}

const SocketContext = createContext<SocketContextValue | null>(null)

// ─── Singleton instance sống xuyên suốt session ───────────
let socketSingleton: Socket | null = null

interface SocketProviderProps {
  children: ReactNode
  onNewMessage?: (message: Message) => void
}

export function SocketProvider({ children, onNewMessage }: SocketProviderProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const socketRef = useRef<Socket | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const onNewMessageRef = useRef(onNewMessage)
  useEffect(() => {
    onNewMessageRef.current = onNewMessage
  }, [onNewMessage])

  const { setTyping, incrementUnread, activeConversationId, clearUnread } = useChatStore()
  const activeConvRef = useRef(activeConversationId)
  useEffect(() => {
    activeConvRef.current = activeConversationId
  }, [activeConversationId])

  const { setOnline, setOffline, setOnlineUsers } = usePresenceStore()

  // ── Kết nối / ngắt kết nối ────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      if (socketSingleton) {
        socketSingleton.disconnect()
        socketSingleton = null
        socketRef.current = null
      }
      queueMicrotask(() => {
        setSocket(null)
        setIsConnected(false)
      })
      return
    }

    const token = getAccessToken()
    if (!token) return

    // Tái dùng singleton nếu đã kết nối
    if (socketSingleton?.connected) {
      const existingSocket = socketSingleton
      socketRef.current = existingSocket
      queueMicrotask(() => {
        setSocket(existingSocket)
        setIsConnected(true)
      })
      return
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })

    socketSingleton = socket
    socketRef.current = socket
    queueMicrotask(() => {
      setSocket(socket)
      setIsConnected(socket.connected)
    })

    // ── Auth error ─────────────────────────────────────
    socket.on('auth_error', () => {
      socket.disconnect()
      socketSingleton = null
      socketRef.current = null
      setSocket(null)
      setIsConnected(false)
    })

    // ── new_message ────────────────────────────────────
    socket.on('new_message', (message: Message) => {
      const convId = String(message.conversationId)
      if (convId === activeConvRef.current) {
        onNewMessageRef.current?.(message)
      } else {
        incrementUnread(convId)
      }
    })

    // ── user_typing ────────────────────────────────────
    socket.on('user_typing', ({ conversationId, userId, isTyping }: SocketUserTypingEvent) => {
      setTyping({ userId, conversationId, isTyping })
    })

    // ── message_read ───────────────────────────────────
    socket.on('message_read', () => {
      // Phase 5: update read receipt UI
    })

    // ── message_recalled ───────────────────────────────
    socket.on('message_recalled', () => {
      // Phase 5: update recalled flag in message list
    })

    // ── conversation_updated ───────────────────────────
    socket.on('conversation_updated', () => {
      // Phase 4: invalidate conversation list query
    })

    // ── presence ──────────────────────────────────────
    socket.on('user_online', ({ userId }: SocketUserOnlineEvent) => setOnline(userId))
    socket.on('user_offline', ({ userId }: SocketUserOnlineEvent) => setOffline(userId))

    socket.on('connect', () => {
      setIsConnected(true)
      console.log('[Socket] connected:', socket.id)
    })
    socket.on('disconnect', (reason) => {
      setIsConnected(false)
      console.log('[Socket] disconnected:', reason)
    })
    socket.on('connect_error', (e) => console.error('[Socket] error:', e.message))

    return () => {
      // Không disconnect khi unmount component — socket sống theo session
    }
  }, [isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

  // Xóa unread khi chuyển conversation
  useEffect(() => {
    if (activeConversationId) clearUnread(activeConversationId)
  }, [activeConversationId, clearUnread])

  // ── Emit helpers ───────────────────────────────────────
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
    (payload: SocketCheckOnlinePayload): Promise<SocketCheckOnlineResponse> =>
      new Promise((resolve) => {
        socketRef.current?.emit('check_online', payload, (res: SocketCheckOnlineResponse) => {
          setOnlineUsers(res.onlineUserIds)
          resolve(res)
        })
      }),
    [setOnlineUsers]
  )

  const value: SocketContextValue = {
    socket,
    isConnected,
    sendMessage,
    emitTyping,
    markRead,
    recallMessage,
    joinConversation,
    leaveConversation,
    checkOnline,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

// This hook intentionally shares the provider's context from this module.
// eslint-disable-next-line react-refresh/only-export-components
export function useSocketContext() {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocketContext must be used inside <SocketProvider>')
  return ctx
}
