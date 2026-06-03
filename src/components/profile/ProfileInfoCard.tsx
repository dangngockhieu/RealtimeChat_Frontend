import { useState, useRef, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, Trash2, Check, AlertCircle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { userService } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import type { UserAccount } from '@/types'

const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'Họ không được để trống').max(50, 'Họ tối đa 50 ký tự'),
  lastName: z.string().min(1, 'Tên không được để trống').max(50, 'Tên tối đa 50 ký tự'),
})

type UpdateProfileForm = z.infer<typeof updateProfileSchema>

interface ProfileInfoCardProps {
  user: UserAccount
}

export function ProfileInfoCard({ user }: ProfileInfoCardProps) {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { updateUser } = useAuthStore()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
  })

  // Mutation: update profile info
  const updateInfoMutation = useMutation({
    mutationFn: (data: UpdateProfileForm) => userService.updateProfile(data),
    onSuccess: (res) => {
      const updated = res.data?.data?.result
      if (updated) {
        updateUser(updated)
        reset({ firstName: updated.firstName, lastName: updated.lastName })
        queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      }
      setFeedback({ type: 'success', message: 'Cập nhật thông tin thành công!' })
    },
    onError: () => {
      setFeedback({ type: 'error', message: 'Không thể cập nhật thông tin. Vui lòng thử lại.' })
    },
  })

  // Avatar upload
  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setFeedback(null)
    try {
      const res = await userService.uploadAvatar(file)
      const updated = res.data?.data?.result
      if (updated) {
        updateUser(updated)
        queryClient.invalidateQueries({ queryKey: ['user-profile'] })
        setFeedback({ type: 'success', message: 'Cập nhật ảnh đại diện thành công!' })
      }
    } catch {
      setFeedback({ type: 'error', message: 'Tải ảnh lên thất bại. Vui lòng thử file ảnh khác.' })
    } finally {
      setIsUploading(false)
    }
  }

  // Remove avatar
  const handleRemoveAvatar = async () => {
    if (!confirm('Bạn có chắc muốn xóa ảnh đại diện hiện tại?')) return

    setIsUploading(true)
    setFeedback(null)
    try {
      const res = await userService.removeAvatar()
      const updated = res.data?.data?.result
      if (updated) {
        updateUser(updated)
        queryClient.invalidateQueries({ queryKey: ['user-profile'] })
        setFeedback({ type: 'success', message: 'Đã xóa ảnh đại diện.' })
      }
    } catch {
      setFeedback({ type: 'error', message: 'Không thể xóa ảnh đại diện.' })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="card-product flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-[var(--color-hairline-soft)] pb-4">
        <div>
          <h2
            className="text-subtitle-lg"
            style={{ color: 'var(--color-ink-deep)', fontFeatureSettings: '"ss01","ss02"' }}
          >
            Thông tin cá nhân
          </h2>
          <p className="text-body-sm text-[var(--color-stone)] mt-0.5">
            Quản lý tên hiển thị và ảnh đại diện tài khoản
          </p>
        </div>
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

      {/* Avatar Section */}
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Avatar user={{ ...user, id: user.id }} size="xl" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute bottom-0 right-0 p-2 rounded-full bg-[var(--color-primary)] text-white shadow-md hover:opacity-90 transition-opacity"
            title="Đổi ảnh đại diện"
          >
            <Camera size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-body-sm-bold text-[var(--color-ink-deep)]">Ảnh đại diện</p>
          <p className="text-caption text-[var(--color-stone)]">
            Hỗ trợ PNG, JPG, WEBP. Dung lượng tối đa 5MB.
          </p>
          <div className="flex gap-2 mt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              Tải ảnh mới
            </Button>
            {user.avatar && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={<Trash2 size={13} />}
                onClick={handleRemoveAvatar}
              >
                Xóa
              </Button>
            )}
          </div>
        </div>
      </div>

      <hr className="border-[var(--color-hairline-soft)]" />

      {/* Name and email form */}
      <form
        onSubmit={handleSubmit((data) => updateInfoMutation.mutate(data))}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Họ"
            placeholder="Nhập họ..."
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Tên"
            placeholder="Nhập tên..."
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <div>
          <label className="text-body-sm-bold text-[var(--color-ink-deep)] block mb-1.5">
            Địa chỉ email
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="input-field bg-[var(--color-surface-soft)] text-[var(--color-stone)] cursor-not-allowed"
          />
          <p className="text-caption text-[var(--color-stone)] mt-1">
            Địa chỉ email được sử dụng để đăng nhập và xác thực danh tính.
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={!isDirty}
            loading={isSubmitting || updateInfoMutation.isPending}
          >
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </div>
  )
}
