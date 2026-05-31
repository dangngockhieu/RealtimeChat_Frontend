import { useEffect, useCallback } from 'react'
import { ChatHeader } from './ChatHeader'
import { MessageList } from './MessageList'
import { TypingIndicator } from './TypingIndicator'
import { MessageInput } from './MessageInput'
import { useAuthStore } from '@/store/auth.store'
import { useChatStore } from '@/store/chat.store'
import { useSocketContext } from '@/contexts/SocketContext'
import { useMessages } from '@/hooks/useMessages'
import { messageService } from '@/services/message.service'
import type { Message, MessageType } from '@/types'

interface ChatWindowProps {
  conversationId: string
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const user = useAuthStore((s) => s.user)
  const replyingToMessage = useChatStore((s) => s.replyingToMessage)
  const setReplyingTo = useChatStore((s) => s.setReplyingTo)
  const { joinConversation, leaveConversation, recallMessage: socketRecall } = useSocketContext()
  const { appendMessage, markRecalled } = useMessages(conversationId)

  // Join conversation socket room
  useEffect(() => {
    joinConversation(conversationId)
    return () => {
      leaveConversation(conversationId)
    }
  }, [conversationId, joinConversation, leaveConversation])

  const handleSendMessage = useCallback(
    async (content: string, type: MessageType, attachments?: string[]) => {
      try {
        const res = await messageService.sendMessage({
          conversationId,
          content,
          type,
          attachments,
          replyTo: replyingToMessage?._id,
        })

        const createdMessage = res.data?.data?.result
        if (createdMessage) {
          appendMessage(createdMessage)
        }
      } catch (err) {
        console.error('Error sending message:', err)
        throw err
      }
    },
    [conversationId, replyingToMessage, appendMessage]
  )

  const handleRecallMessage = useCallback(
    async (messageId: string) => {
      try {
        await messageService.recallMessage(messageId)
        markRecalled(messageId)
        socketRecall?.({ conversationId, messageId })
      } catch (err) {
        console.error('Failed to recall message:', err)
      }
    },
    [conversationId, markRecalled, socketRecall]
  )

  const handleDeleteForMe = useCallback(
    async (messageId: string) => {
      try {
        await messageService.deleteForMe(messageId)
        // Mark locally recalled or refresh list
        markRecalled(messageId)
      } catch (err) {
        console.error('Failed to delete message for me:', err)
      }
    },
    [markRecalled]
  )

  const handleReply = useCallback(
    (msg: Message) => {
      setReplyingTo(msg)
    },
    [setReplyingTo]
  )

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--color-canvas)] overflow-hidden">
      {/* Chat Header */}
      <ChatHeader conversationId={conversationId} />

      {/* Message List */}
      <MessageList
        conversationId={conversationId}
        currentUserId={user?.id ?? ''}
        onReply={handleReply}
        onRecall={handleRecallMessage}
        onDeleteForMe={handleDeleteForMe}
      />

      {/* Typing indicator */}
      <TypingIndicator conversationId={conversationId} />

      {/* Message Input Bar */}
      <MessageInput
        conversationId={conversationId}
        onSend={handleSendMessage}
      />
    </div>
  )
}
