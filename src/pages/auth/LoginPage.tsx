import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { authService } from '@/services/auth.service'
import { userService } from '@/services/user.service'
import { setAccessToken } from '@/services/api.client'
import { useAuthStore } from '@/store/auth.store'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Địa chỉ email không hợp lệ'),
  password: z
    .string()
    .min(1, 'Mật khẩu không được để trống')
    .min(6, 'Mật khẩu tối thiểu 6 ký tự'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)
    try {
      const res = await authService.login(data)
      const result = res.data?.data?.result
      const accessToken = result?.accessToken

      if (accessToken) {
        setAccessToken(accessToken)
        const profileRes = await userService.getProfile()
        const user = profileRes.data?.data?.result
        if (user) {
          login(user, accessToken)
          navigate('/', { replace: true })
        }
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      const msg = axiosErr?.response?.data?.message
      setServerError(msg || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.')
    }
  }

  return (
    <AuthLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-heading-sm mb-1.5" style={{ color: 'var(--color-ink-deep)' }}>
          Đăng nhập
        </h1>
        <p className="text-body-sm" style={{ color: 'var(--color-steel)' }}>
          Chào mừng trở lại! Vui lòng nhập thông tin của bạn.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
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
          placeholder="Nhập mật khẩu"
          autoComplete="current-password"
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
          variant="ink"
          fullWidth
          loading={isSubmitting}
        >
          Đăng nhập
        </Button>
      </form>

      {/* Footer links */}
      <div className="flex flex-col items-center gap-4 mt-6">
        <p className="text-body-sm" style={{ color: 'var(--color-steel)' }}>
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-[var(--color-primary)] hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
