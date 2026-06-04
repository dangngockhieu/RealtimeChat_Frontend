import { useState } from 'react'
import { X, ShieldAlert } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { memberService } from '@/services/member.service'
import { CONVERSATIONS_QUERY_KEY } from '@/hooks/useConversations'
import type { ConversationParticipant } from '@/types'

interface TransferOwnerModalProps {
  conversationId: string
  participants: ConversationParticipant[]
  currentOwnerId: string
  onClose: () => void
  onSuccess?: () => void
}

export function TransferOwnerModal({
  conversationId,
  participants,
  currentOwnerId,
  onClose,
  onSuccess,
}: TransferOwnerModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Eligible members: anyone except current owner
  const eligibleCandidates = participants.filter((p) => p.userId !== currentOwnerId)

  const mutation = useMutation({
    mutationFn: (newOwnerId: string) =>
      memberService.transferOwner({ conversationId, newOwnerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-detail', conversationId] })
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
      onSuccess?.()
      onClose()
    },
  })

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-full max-w-sm rounded-[var(--radius-xxxl)] overflow-hidden flex flex-col p-6 max-h-[80vh]"
          style={{
            backgroundColor: 'var(--color-canvas)',
            boxShadow: 'var(--shadow-panel)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3
              className="text-subtitle-lg"
              style={{ color: 'var(--color-ink-deep)' }}
            >
              Chuyển quyền Trưởng nhóm
            </h3>
            <button
              onClick={onClose}
              className="btn-icon-circular"
              style={{ backgroundColor: 'var(--color-surface-soft)' }}
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-[var(--radius-xl)] bg-amber-50 border border-amber-200 text-amber-800 text-caption mb-3">
            <ShieldAlert size={16} className="flex-shrink-0 mt-0.5 text-amber-600" />
            <p>
              Sau khi chuyển giao, bạn sẽ trở thành Thành viên và người được chọn sẽ có toàn quyền quản trị nhóm.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1 my-2">
            {eligibleCandidates.map((p) => {
              const isSelected = selectedUserId === p.userId
              const fakeUser = {
                firstName: p.firstName,
                lastName: p.lastName,
                avatar: p.avatar,
                id: p.userId,
              }

              return (
                <button
                  key={p.userId}
                  type="button"
                  onClick={() => setSelectedUserId(p.userId)}
                  className={`flex items-center justify-between p-2.5 rounded-[var(--radius-xl)] transition-colors text-left ${
                    isSelected
                      ? 'bg-[rgba(0,100,224,0.08)] border border-[var(--color-primary)]'
                      : 'hover:bg-[var(--color-surface-soft)] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar user={fakeUser} size="sm" />
                    <div>
                      <p className="text-body-sm-bold text-[var(--color-ink-deep)]">
                        {p.firstName} {p.lastName}
                      </p>
                      <span className="text-[11px] text-[var(--color-stone)]">
                        {p.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
                        : 'border-[var(--color-hairline)]'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-[var(--color-hairline-soft)]">
            <Button type="button" variant="ghost" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="button"
              variant="buy"
              disabled={!selectedUserId}
              loading={mutation.isPending}
              onClick={() => {
                if (selectedUserId) {
                  mutation.mutate(selectedUserId)
                }
              }}
            >
              Chuyển giao
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
