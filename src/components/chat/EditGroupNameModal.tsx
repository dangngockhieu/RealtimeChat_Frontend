import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { conversationService } from '@/services/conversation.service'
import { CONVERSATIONS_QUERY_KEY } from '@/hooks/useConversations'

const editNameSchema = z.object({
  name: z.string().min(1, 'Tên nhóm không được để trống').max(60, 'Tên nhóm tối đa 60 ký tự'),
})

type EditNameForm = z.infer<typeof editNameSchema>

interface EditGroupNameModalProps {
  conversationId: string
  currentName: string
  onClose: () => void
}

export function EditGroupNameModal({
  conversationId,
  currentName,
  onClose,
}: EditGroupNameModalProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditNameForm>({
    resolver: zodResolver(editNameSchema),
    defaultValues: { name: currentName },
  })

  const mutation = useMutation({
    mutationFn: (data: EditNameForm) =>
      conversationService.updateName(conversationId, { name: data.name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-detail', conversationId] })
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
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
          className="w-full max-w-sm rounded-[var(--radius-xxxl)] overflow-hidden flex flex-col p-6"
          style={{
            backgroundColor: 'var(--color-canvas)',
            boxShadow: 'var(--shadow-panel)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-subtitle-lg"
              style={{ color: 'var(--color-ink-deep)', fontFeatureSettings: '"ss01","ss02"' }}
            >
              Đổi tên nhóm
            </h3>
            <button
              onClick={onClose}
              className="btn-icon-circular"
              style={{ backgroundColor: 'var(--color-surface-soft)' }}
            >
              <X size={16} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <input
                autoFocus
                placeholder="Nhập tên nhóm mới..."
                className="input-field"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-caption text-[var(--color-critical)]">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end mt-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Hủy
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting || mutation.isPending}
              >
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
