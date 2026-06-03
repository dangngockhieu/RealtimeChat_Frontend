import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, Check, AlertCircle } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { userService } from '@/services/user.service'

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: z.string().min(6, 'Mật khẩu mới tối thiểu 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

export function ChangePasswordCard() {
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  })

  const mutation = useMutation({
    mutationFn: (data: ChangePasswordForm) =>
      userService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }),
    onSuccess: () => {
      setFeedback({ type: 'success', message: 'Đổi mật khẩu thành công!' })
      reset()
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setFeedback({
        type: 'error',
        message: axiosErr?.response?.data?.message || 'Mật khẩu hiện tại không chính xác.',
      })
    },
  })

  return (
    <div className="card-product flex flex-col gap-6">
      <div className="border-b border-[var(--color-hairline-soft)] pb-4">
        <h2
          className="text-subtitle-lg"
          style={{ color: 'var(--color-ink-deep)', fontFeatureSettings: '"ss01","ss02"' }}
        >
          Đổi mật khẩu
        </h2>
        <p className="text-body-sm text-[var(--color-stone)] mt-0.5">
          Để bảo vệ tài khoản, hãy sử dụng mật khẩu mạnh gồm chữ và số
        </p>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 p-3 rounded-[var(--radius-xl)] text-body-sm ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="flex flex-col gap-4"
      >
        <Input
          label="Mật khẩu hiện tại"
          type={showOld ? 'text' : 'password'}
          placeholder="Nhập mật khẩu hiện tại..."
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowOld((prev) => !prev)}
              className="text-[var(--color-stone)] hover:text-[var(--color-ink-deep)]"
            >
              {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.oldPassword?.message}
          {...register('oldPassword')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Mật khẩu mới"
            type={showNew ? 'text' : 'password'}
            placeholder="Tối thiểu 6 ký tự..."
            leftIcon={<Lock size={16} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowNew((prev) => !prev)}
                className="text-[var(--color-stone)] hover:text-[var(--color-ink-deep)]"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />

          <Input
            label="Xác nhận mật khẩu mới"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Nhập lại mật khẩu mới..."
            leftIcon={<Lock size={16} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="text-[var(--color-stone)] hover:text-[var(--color-ink-deep)]"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting || mutation.isPending}
          >
            Đổi mật khẩu
          </Button>
        </div>
      </form>
    </div>
  )
}
