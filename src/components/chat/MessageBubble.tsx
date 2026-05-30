import { useState, useMemo } from 'react'
import { Reply, RotateCcw, Trash2, FileText, Download } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { formatMessageTime } from '@/utils/formatTime'
import { getAvatarUrl, isImageFile, getFullName } from '@/utils/helpers'
import { cn } from '@/utils/cn'
import type { Message, UserAccount } from '@/types'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
  onReply?: (msg: Message) => void
  onRecall?: (msgId: string) => void
  onDeleteForMe?: (msgId: string) => void
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  onReply,
  onRecall,
  onDeleteForMe,
}: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Sender info
  const sender = typeof message.senderId === 'object' ? (message.senderId as UserAccount) : null
  const senderName = sender ? getFullName(sender) : 'Người dùng'

  // Reply message info if any
  const replyMessage = typeof message.replyTo === 'object' ? (message.replyTo as Message | null) : null
  const replySenderName = replyMessage
    ? typeof replyMessage.senderId === 'object'
      ? getFullName(replyMessage.senderId as UserAccount)
      : 'Tin nhắn'
    : null

  const attachments = useMemo(() => {
    return Array.isArray(message.attachments) ? message.attachments : []
  }, [message.attachments])

  return (
    <div
      className={cn('flex items-end gap-2 group relative my-1', isOwn ? 'justify-end' : 'justify-start')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar for other users */}
      {!isOwn && (
        <div className="w-8 flex-shrink-0">
          {showAvatar ? (
            <Avatar user={sender ? { ...sender, id: sender.id } : null} size="sm" />
          ) : (
            <div className="w-8" />
          )}
        </div>
      )}

      {/* Hover action menu for own messages (left of bubble) */}
      {isOwn && isHovered && (
        <div className="flex items-center gap-1 bg-[var(--color-canvas)] rounded-full px-2 py-1 shadow-sm border border-[var(--color-hairline-soft)] animate-fade-in">
          {onReply && (
            <button
              onClick={() => onReply(message)}
              className="p-1 text-[var(--color-steel)] hover:text-[var(--color-ink-deep)] transition-colors"
              title="Trả lời"
            >
              <Reply size={14} />
            </button>
          )}
          {!message.isRecalled && onRecall && (
            <button
              onClick={() => onRecall(message._id)}
              className="p-1 text-[var(--color-steel)] hover:text-[var(--color-ink-deep)] transition-colors"
              title="Thu hồi tin nhắn"
            >
              <RotateCcw size={14} />
            </button>
          )}
          {onDeleteForMe && (
            <button
              onClick={() => onDeleteForMe(message._id)}
              className="p-1 text-[var(--color-steel)] hover:text-[var(--color-critical)] transition-colors"
              title="Xóa phía tôi"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}

      {/* Bubble Container */}
      <div className={cn('flex flex-col max-w-[70%]', isOwn ? 'items-end' : 'items-start')}>
        {/* Sender name for group chats if not own and first in sequence */}
        {!isOwn && showAvatar && sender && (
          <span className="text-[11px] font-bold text-[var(--color-stone)] ml-1 mb-1">
            {senderName}
          </span>
        )}

        {/* Replied snippet box */}
        {replyMessage && (
          <div
            className={cn(
              'text-caption px-3 py-1.5 rounded-t-xl border-l-2 mb-0.5 max-w-full truncate',
              isOwn
                ? 'bg-blue-800/40 text-blue-100 border-white/60'
                : 'bg-[var(--color-canvas)] text-[var(--color-steel)] border-[var(--color-primary)] shadow-sm'
            )}
          >
            <span className="font-bold block truncate">{replySenderName}</span>
            <span className="truncate block opacity-85">
              {replyMessage.isRecalled ? 'Tin nhắn đã được thu hồi' : replyMessage.content || 'Đính kèm'}
            </span>
          </div>
        )}

        {/* Bubble itself */}
        <div
          className={cn(
            'px-4 py-2.5 transition-all text-body-sm shadow-sm break-words',
            isOwn
              ? 'bg-[var(--color-primary)] text-white rounded-[20px] rounded-br-[4px]'
              : 'bg-[var(--color-surface-soft)] text-[var(--color-ink-deep)] rounded-[20px] rounded-bl-[4px]',
            message.isRecalled && 'italic opacity-70 bg-opacity-50'
          )}
        >
          {message.isRecalled ? (
            <span>Tin nhắn đã được thu hồi</span>
          ) : (
            <>
              {/* Image Attachments */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {attachments.map((fileUrl, index) => {
                    const fullUrl = getAvatarUrl(fileUrl) || fileUrl
                    const isImg = isImageFile(fileUrl) || message.type === 'IMAGE'

                    if (isImg) {
                      return (
                        <a
                          key={index}
                          href={fullUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block overflow-hidden rounded-xl border border-black/10 hover:opacity-95 transition-opacity"
                        >
                          <img
                            src={fullUrl}
                            alt="Attachment"
                            className="max-h-60 max-w-xs object-cover rounded-xl"
                            loading="lazy"
                          />
                        </a>
                      )
                    }

                    return (
                      <a
                        key={index}
                        href={fullUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-xl text-caption transition-colors',
                          isOwn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white hover:bg-gray-100 text-[var(--color-ink)] border border-[var(--color-hairline-soft)]'
                        )}
                      >
                        <FileText size={18} />
                        <span className="truncate max-w-[160px] underline">{fileUrl.split('/').pop()}</span>
                        <Download size={14} className="ml-1 opacity-70" />
                      </a>
                    )
                  })}
                </div>
              )}

              {/* Text content */}
              {message.content && (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[11px] text-[var(--color-stone)] mt-1 px-1">
          {formatMessageTime(message.createdAt)}
        </span>
      </div>

      {/* Hover action menu for other's messages (right of bubble) */}
      {!isOwn && isHovered && (
        <div className="flex items-center gap-1 bg-[var(--color-canvas)] rounded-full px-2 py-1 shadow-sm border border-[var(--color-hairline-soft)] animate-fade-in">
          {onReply && (
            <button
              onClick={() => onReply(message)}
              className="p-1 text-[var(--color-steel)] hover:text-[var(--color-ink-deep)] transition-colors"
              title="Trả lời"
            >
              <Reply size={14} />
            </button>
          )}
          {onDeleteForMe && (
            <button
              onClick={() => onDeleteForMe(message._id)}
              className="p-1 text-[var(--color-steel)] hover:text-[var(--color-critical)] transition-colors"
              title="Xóa phía tôi"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
