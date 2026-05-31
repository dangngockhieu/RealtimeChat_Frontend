import { useState, useRef, useEffect, type ChangeEvent, type KeyboardEvent } from 'react'
import { Paperclip, Send, X, Smile, Loader2 } from 'lucide-react'
import { useChatStore } from '@/store/chat.store'
import { useTypingIndicator } from '@/hooks/useTypingIndicator'
import { uploadService } from '@/services/upload.service'
import { getFullName, isImageFile } from '@/utils/helpers'
import type { MessageType, UserAccount } from '@/types'

interface MessageInputProps {
  conversationId: string
  onSend: (content: string, type: MessageType, attachments?: string[]) => Promise<void> | void
}

export function MessageInput({ conversationId, onSend }: MessageInputProps) {
  const [content, setContent] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { replyingToMessage, setReplyingTo } = useChatStore()
  const { onTyping, stopTyping } = useTypingIndicator(conversationId)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [content])

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    onTyping()
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSend = async () => {
    const trimmed = content.trim()
    if (!trimmed && selectedFiles.length === 0) return

    stopTyping()
    let attachments: string[] = []
    let type: MessageType = 'TEXT'

    if (selectedFiles.length > 0) {
      setIsUploading(true)
      try {
        const uploadRes = await uploadService.uploadFiles(selectedFiles)
        const uploadedData = uploadRes.data?.data?.result ?? []
        attachments = uploadedData.map((f) => f.url)
        // If all uploaded files are images, message type is IMAGE
        const allImages = selectedFiles.every((f) => isImageFile(f.name))
        type = allImages ? 'IMAGE' : 'FILE'
      } catch (err) {
        console.error('Failed to upload files:', err)
        setIsUploading(false)
        return
      } finally {
        setIsUploading(false)
      }
    }

    try {
      await onSend(trimmed, type, attachments)
      setContent('')
      setSelectedFiles([])
      setReplyingTo(null)
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const replySenderName = replyingToMessage
    ? typeof replyingToMessage.senderId === 'object'
      ? getFullName(replyingToMessage.senderId as UserAccount)
      : 'Tin nhắn'
    : ''

  return (
    <div
      className="flex flex-col flex-shrink-0"
      style={{
        backgroundColor: 'var(--color-canvas)',
        borderTop: '1px solid var(--color-hairline-soft)',
      }}
    >
      {/* Reply bar preview */}
      {replyingToMessage && (
        <div className="flex items-center justify-between px-4 py-2 bg-[var(--color-surface-soft)] border-b border-[var(--color-hairline-soft)] text-caption">
          <div className="flex items-center gap-2 overflow-hidden mr-2">
            <span className="font-bold text-[var(--color-primary)]">
              Trả lời {replySenderName}:
            </span>
            <span className="text-[var(--color-steel)] truncate">
              {replyingToMessage.content || 'Đính kèm'}
            </span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-[var(--color-stone)] hover:text-[var(--color-ink-deep)] transition-colors p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Selected file preview */}
      {selectedFiles.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--color-hairline-soft)] overflow-x-auto">
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-caption bg-[var(--color-surface-soft)] text-[var(--color-ink-deep)] border border-[var(--color-hairline-soft)]"
            >
              <span className="truncate max-w-[120px]">{file.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveFile(idx)}
                className="text-[var(--color-stone)] hover:text-[var(--color-critical)]"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main input bar */}
      <div className="flex items-end gap-2 px-4 py-3">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 text-[var(--color-steel)] hover:text-[var(--color-primary)] rounded-full hover:bg-[var(--color-surface-soft)] transition-colors disabled:opacity-50"
          title="Đính kèm tệp"
        >
          <Paperclip size={20} />
        </button>

        {/* Emoji trigger placeholder */}
        <button
          type="button"
          className="p-2 text-[var(--color-steel)] hover:text-[var(--color-primary)] rounded-full hover:bg-[var(--color-surface-soft)] transition-colors"
          title="Biểu tượng cảm xúc"
          onClick={() => setContent((prev) => prev + ' 😊')}
        >
          <Smile size={20} />
        </button>

        {/* Text input area */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter xuống dòng)"
          rows={1}
          disabled={isUploading}
          className="flex-1 max-h-32 resize-none bg-[var(--color-surface-soft)] rounded-[20px] px-4 py-2.5 text-body-sm text-[var(--color-ink-deep)] placeholder-[var(--color-stone)] border-none outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={isUploading || (!content.trim() && selectedFiles.length === 0)}
          className="btn-primary !p-2.5 !rounded-full flex items-center justify-center disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          title="Gửi"
        >
          {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  )
}
