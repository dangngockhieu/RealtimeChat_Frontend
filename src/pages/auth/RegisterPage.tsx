import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock} from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { authService } from '@/services/auth.service'

// ─── Zod schema ────────────────────────────────────────────
const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'Vui lòng nhập họ')
      .max(50, 'Họ không được quá 50 ký tự'),
    lastName: z
      .string()
      .min(1, 'Vui lòng nhập tên')
      .max(50, 'Tên không được quá 50 ký tự'),
    email: z
      .string()
      .min(1, 'Vui lòng nhập email')
      .email('Email không hợp lệ'),
    password: z
      .string()
      .min(6, 'Mật khẩu tối thiểu 6 ký tự')
      .max(100, 'Mật khẩu quá dài'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

// ───────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null)
    try {
      await authService.register({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
      })

      // Chuyển sang trang verify OTP, truyền email qua state
      navigate('/verify-otp', {
        state: { email: data.email.trim().toLowerCase() },
        replace: true,
      })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      const msg = axiosErr?.response?.data?.message
      setServerError(msg || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.')
    }
  }

  return (
    <AuthLayout>
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-heading-sm mb-1.5"
          style={{ color: 'var(--color-ink-deep)' }}
        >
          Tạo tài khoản
        </h1>
        <p className="text-body-sm" style={{ color: 'var(--color-steel)' }}>
          Bắt đầu trò chuyện ngay hôm nay. Miễn phí!
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {/* Họ & Tên — 2 cột */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Họ"
            type="text"
            placeholder="Nguyễn"
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Tên"
            type="text"
            placeholder="Văn A"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="ten@example.com"
          autoComplete="email"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Mật khẩu"
          type={showPassword ? 'text' : 'password'}
          placeholder="Tối thiểu 6 ký tự"
          autoComplete="new-password"
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-[var(--color-stone)] cursor-pointer"
              tabIndex={-1}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Xác nhận mật khẩu"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Nhập lại mật khẩu"
          autoComplete="new-password"
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="text-[var(--color-stone)] cursor-pointer"
              tabIndex={-1}
              aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {/* Password strength hint */}
        <PasswordStrength password={getValues('password')} />

        {/* Server error */}
        {serverError && (
          <div
            className="rounded-[var(--radius-lg)] px-4 py-3 text-body-sm"
            style={{
              backgroundColor: 'rgba(228, 30, 63, 0.06)',
              color: 'var(--color-critical)',
              border: '1px solid rgba(228, 30, 63, 0.2)',
            }}
          >
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isSubmitting}
          className="mt-1"
        >
          Đăng ký
        </Button>
      </form>

      {/* Footer */}
      <p className="text-body-sm text-center mt-6" style={{ color: 'var(--color-steel)' }}>
        Đã có tài khoản?{' '}
        <Link
          to="/login"
          className="font-bold"
          style={{ color: 'var(--color-primary)' }}
        >
          Đăng nhập
        </Link>
      </p>
    </AuthLayout>
  )
}

// ─── Password strength indicator ───────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null

  const checks = [
    { label: 'Tối thiểu 6 ký tự', pass: password.length >= 6 },
    { label: 'Có chữ hoa', pass: /[A-Z]/.test(password) },
    { label: 'Có số', pass: /[0-9]/.test(password) },
  ]

  const passed = checks.filter((c) => c.pass).length
  const strength = passed === 0 ? 0 : passed === 1 ? 1 : passed === 2 ? 2 : 3

  const colors = ['var(--color-critical)', 'var(--color-warning)', 'var(--color-attention)', 'var(--color-success)']
  const labels = ['', 'Yếu', 'Trung bình', 'Mạnh']

  return (
    <div className="flex flex-col gap-1.5 -mt-1">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i <= strength ? colors[strength] : 'var(--color-hairline)',
            }}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className="text-caption" style={{ color: colors[strength] }}>
          Độ mạnh: {labels[strength]}
        </p>
      )}
    </div>
  )
}
