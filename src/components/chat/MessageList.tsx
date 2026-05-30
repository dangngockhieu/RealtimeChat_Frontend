import { useEffect, useRef, useLayoutEffect, useCallback } from 'react'
import { isSameDay, format, isToday, isYesterday } from 'date-fns'
import { vi } from 'date-fns/locale'
import { MessageBubble } from './MessageBubble'
import { useMessages } from '@/hooks/useMessages'
import type { Message, UserAccount } from '@/types'

interface MessageListProps {
  conversationId: string
  currentUserId: string
  onReply?: (msg: Message) => void
  onRecall?: (msgId: string) => void
  onDeleteForMe?: (msgId: string) => void
}

export function MessageList({
  conversationId,
  currentUserId,
  onReply,
  onRecall,
  onDeleteForMe,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const topSentinelRef = useRef<HTMLDivElement>(null)
  const previousScrollHeightRef = useRef<number>(0)
  const isInitialLoadRef = useRef<boolean>(true)

  const {
    allMessages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useMessages(conversationId)

  // Auto-scroll to bottom on initial load or when new messages arrive at the end
  const scrollToBottom = useCallback((smooth = false) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      })
    }
  }, [])

  // Keep scroll position when older messages are loaded at top
  useLayoutEffect(() => {
    if (containerRef.current && previousScrollHeightRef.current > 0) {
      const newScrollHeight = containerRef.current.scrollHeight
      const diff = newScrollHeight - previousScrollHeightRef.current
      if (diff > 0) {
        containerRef.current.scrollTop += diff
      }
      previousScrollHeightRef.current = 0
    }
  }, [allMessages.length])

  // Scroll to bottom when conversation changes or first loaded
  useEffect(() => {
    isInitialLoadRef.current = true
  }, [conversationId])

  useEffect(() => {
    if (allMessages.length > 0 && isInitialLoadRef.current) {
      scrollToBottom(false)
      isInitialLoadRef.current = false
    }
  }, [allMessages.length, scrollToBottom])

  // Infinite scroll trigger via IntersectionObserver
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && containerRef.current) {
      previousScrollHeightRef.current = containerRef.current.scrollHeight
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    const sentinel = topSentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [handleLoadMore])

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col justify-end p-4 gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => {
          const isOwn = i % 2 !== 0
          return (
            <div
              key={i}
              className={`flex items-end gap-2 animate-pulse ${
                isOwn ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isOwn && (
                <div className="w-8 h-8 rounded-full bg-[var(--color-hairline-soft)]" />
              )}
              <div
                className={`h-10 rounded-[20px] bg-[var(--color-hairline-soft)] ${
                  isOwn ? 'w-48' : 'w-64'
                }`}
              />
            </div>
          )
        })}
      </div>
    )
  }

  if (allMessages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[var(--color-stone)]">
        <p className="text-body-md font-bold text-[var(--color-ink-deep)] mb-1">
          Chưa có tin nhắn nào
        </p>
        <p className="text-body-sm">Hãy gửi lời chào để bắt đầu cuộc trò chuyện!</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-1"
    >
      {/* Top sentinel for infinite scroll upward */}
      <div ref={topSentinelRef} className="h-4 flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="w-5 h-5 border-2 border-t-transparent border-[var(--color-primary)] rounded-full animate-spin" />
        )}
      </div>

      {allMessages.map((message, index) => {
        const senderId =
          typeof message.senderId === 'object'
            ? (message.senderId as UserAccount).id
            : message.senderId
        const isOwn = senderId === currentUserId

        // Date separator logic
        const prevMessage = allMessages[index - 1]
        const showDateSeparator =
          !prevMessage ||
          !isSameDay(new Date(message.createdAt), new Date(prevMessage.createdAt))

        // Avatar logic: show avatar only if next message is from different sender or date changes
        const nextMessage = allMessages[index + 1]
        const nextSenderId =
          nextMessage && typeof nextMessage.senderId === 'object'
            ? (nextMessage.senderId as UserAccount).id
            : nextMessage?.senderId

        const isLastInSequence =
          !nextMessage ||
          nextSenderId !== senderId ||
          !isSameDay(new Date(message.createdAt), new Date(nextMessage.createdAt))

        return (
          <div key={message._id} className="flex flex-col">
            {showDateSeparator && (
              <DateSeparator date={new Date(message.createdAt)} />
            )}
            <MessageBubble
              message={message}
              isOwn={isOwn}
              showAvatar={!isOwn && isLastInSequence}
              onReply={onReply}
              onRecall={onRecall}
              onDeleteForMe={onDeleteForMe}
            />
          </div>
        )
      })}
    </div>
  )
}

function DateSeparator({ date }: { date: Date }) {
  let label = format(date, 'd MMMM, yyyy', { locale: vi })
  if (isToday(date)) label = 'Hôm nay'
  else if (isYesterday(date)) label = 'Hôm qua'

  return (
    <div className="flex items-center justify-center my-3">
      <span className="text-caption font-bold bg-[var(--color-surface-soft)] text-[var(--color-stone)] px-3 py-1 rounded-full border border-[var(--color-hairline-soft)] select-none">
        {label}
      </span>
    </div>
  )
}
