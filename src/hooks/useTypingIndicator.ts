import { useRef, useCallback } from 'react'
import { useSocketContext } from '@/contexts/SocketContext'

export function useTypingIndicator(conversationId: string) {
  const { emitTyping } = useSocketContext()
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  const onTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true
      emitTyping({ conversationId, isTyping: true })
    }
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
    stopTimerRef.current = setTimeout(() => {
      isTypingRef.current = false
      emitTyping({ conversationId, isTyping: false })
    }, 1500)
  }, [conversationId, emitTyping])

  const stopTyping = useCallback(() => {
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
    if (isTypingRef.current) {
      isTypingRef.current = false
      emitTyping({ conversationId, isTyping: false })
    }
  }, [conversationId, emitTyping])

  return { onTyping, stopTyping }
}
