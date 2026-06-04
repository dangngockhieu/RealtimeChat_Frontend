import { useEffect, useRef, useState, useCallback } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/auth.service'

const OTP_LENGTH = 6
const RESEND_COOLDOWN = 60 // giây

// ───────────────────────────────────────────────────────────
export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // Email được truyền từ RegisterPage qua navigate state
  const emailFromState = (location.state as { email?: string } | null)?.email || ''
  const [email, setEmail] = useState(emailFromState)
  const [showEmailInput, setShowEmailInput] = useState(!emailFromState)

  // OTP digits state
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // UI state
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Countdown cooldown cho nút Gửi lại
  const [countdown, setCountdown] = useState(emailFromState ? RESEND_COOLDOWN : 0)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startCountdown = useCallback(() => {
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    // Focus ô đầu tiên khi mount
    inputRefs.current[0]?.focus()
    // Bắt đầu cooldown ban đầu (vừa gửi OTP lúc đăng ký)
    if (emailFromState) startCountdown()

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [emailFromState, startCountdown])

  // ── OTP input handlers ─────────────────────────────────
  const handleDigitChange = (index: number, value: string) => {
    // Chấp nhận 1 ký tự số duy nhất
    const digit = value.replace(/\D/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[index] = digit
    setDigits(newDigits)
    setServerError(null)

    // Auto-focus ô tiếp theo nếu vừa nhập
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit khi đủ 6 số
    if (digit && index === OTP_LENGTH - 1) {
      const otp = [...newDigits.slice(0, OTP_LENGTH - 1), digit].join('')
      if (otp.length === OTP_LENGTH) submitOtp(otp)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const newDigits = [...digits]
        newDigits[index] = ''
        setDigits(newDigits)
      } else if (index > 0) {
        // Quay lại ô trước
        inputRefs.current[index - 1]?.focus()
        const newDigits = [...digits]
        newDigits[index - 1] = ''
        setDigits(newDigits)
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const newDigits = Array(OTP_LENGTH).fill('')
    pasted.split('').forEach((d, i) => { newDigits[i] = d })
    setDigits(newDigits)
    // Focus ô cuối có giá trị
    const lastIdx = Math.min(pasted.length, OTP_LENGTH - 1)
    inputRefs.current[lastIdx]?.focus()
    if (pasted.length === OTP_LENGTH) submitOtp(pasted)
  }

  // ── Submit OTP ─────────────────────────────────────────
  const submitOtp = async (otp: string) => {
    if (!email || otp.length !== OTP_LENGTH) return
    setIsVerifying(true)
    setServerError(null)
    try {
      await authService.verifyOtp({ email, otp })
      setSuccessMsg('Xác thực thành công! Đang chuyển đến trang đăng nhập...')
      setTimeout(() => navigate('/login', { replace: true }), 1500)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      const msg = axiosErr?.response?.data?.message
      setServerError(msg || 'Mã OTP không chính xác hoặc đã hết hạn.')
      setDigits(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    } finally {
      setIsVerifying(false)
    }
  }

  const handleManualSubmit = () => {
    const otp = digits.join('')
    if (otp.length === OTP_LENGTH) submitOtp(otp)
  }

  // ── Resend OTP ────────────────────────────────────────
  const handleResend = async () => {
    if (!email || countdown > 0 || isResending) return
    setIsResending(true)
    setServerError(null)
    setSuccessMsg(null)
    try {
      await authService.resendOtp({ email })
      setSuccessMsg('Mã OTP mới đã được gửi vào email của bạn.')
      setDigits(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
      startCountdown()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setServerError(axiosErr?.response?.data?.message || 'Không thể gửi lại OTP. Thử lại sau.')
    } finally {
      setIsResending(false)
    }
  }

  const currentOtp = digits.join('')
  const isOtpFull = currentOtp.length === OTP_LENGTH

  return (
    <AuthLayout>
      {/* Back to register */}
      <Link
        to="/register"
        className="inline-flex items-center gap-1.5 text-body-sm mb-6"
        style={{ color: 'var(--color-steel)' }}
      >
        <ArrowLeft size={14} />
        Quay lại đăng ký
      </Link>

      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div
          className="w-14 h-14 rounded-[var(--radius-xxl)] flex items-center justify-center mb-4"
          style={{ backgroundColor: 'rgba(0, 100, 224, 0.08)' }}
        >
          <Mail size={24} style={{ color: 'var(--color-primary)' }} />
        </div>
        <h1
          className="text-heading-sm mb-1.5"
          style={{ color: 'var(--color-ink-deep)' }}
        >
          Xác thực email
        </h1>
        <p className="text-body-sm" style={{ color: 'var(--color-steel)' }}>
          Chúng tôi đã gửi mã {OTP_LENGTH} chữ số đến
        </p>
        {email && (
          <p className="text-body-sm-bold mt-0.5" style={{ color: 'var(--color-ink)' }}>
            {email}
          </p>
        )}
      </div>

      {/* Email input nếu không có email từ state */}
      {showEmailInput && (
        <div className="mb-5 flex flex-col gap-2">
          <label className="text-body-sm-bold" style={{ color: 'var(--color-ink-deep)' }}>
            Email của bạn
          </label>
          <input
            type="email"
            className="input-field"
            placeholder="ten@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      )}

      {/* ── OTP Input Grid ── */}
      <div className="flex gap-2.5 justify-center mb-6" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            aria-label={`Chữ số OTP thứ ${index + 1}`}
            className="w-12 h-14 text-center text-heading-sm font-bold rounded-[var(--radius-xl)] border outline-none transition-all duration-150"
            style={{
              backgroundColor: 'var(--color-canvas)',
              color: 'var(--color-ink-deep)',
              borderColor: digit
                ? 'var(--color-primary)'
                : serverError
                ? 'var(--color-critical-strong)'
                : 'var(--color-hairline)',
              boxShadow: digit ? `0 0 0 3px rgba(0, 100, 224, 0.12)` : 'none',
            }}
          />
        ))}
      </div>

      {/* Success message */}
      {successMsg && (
        <div
          className="rounded-[var(--radius-lg)] px-4 py-3 text-body-sm mb-4 text-center"
          style={{
            backgroundColor: 'rgba(49, 162, 76, 0.08)',
            color: 'var(--color-success)',
            border: '1px solid rgba(49, 162, 76, 0.2)',
          }}
        >
          {successMsg}
        </div>
      )}

      {/* Error message */}
      {serverError && (
        <div
          className="rounded-[var(--radius-lg)] px-4 py-3 text-body-sm mb-4 text-center"
          style={{
            backgroundColor: 'rgba(228, 30, 63, 0.06)',
            color: 'var(--color-critical)',
            border: '1px solid rgba(228, 30, 63, 0.2)',
          }}
        >
          {serverError}
        </div>
      )}

      {/* Submit button */}
      <Button
        type="button"
        variant="primary"
        fullWidth
        loading={isVerifying}
        disabled={!isOtpFull || !email}
        onClick={handleManualSubmit}
      >
        Xác thực
      </Button>

      {/* Resend section */}
      <div className="flex flex-col items-center gap-2 mt-6">
        <p className="text-body-sm" style={{ color: 'var(--color-steel)' }}>
          Không nhận được mã?
        </p>
        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0 || isResending || !email}
          className="inline-flex items-center gap-1.5 text-body-sm-bold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          style={{ color: countdown > 0 ? 'var(--color-steel)' : 'var(--color-primary)' }}
        >
          <RefreshCw size={14} className={isResending ? 'animate-spin' : ''} />
          {countdown > 0
            ? `Gửi lại sau ${countdown}s`
            : isResending
            ? 'Đang gửi...'
            : 'Gửi lại mã OTP'}
        </button>

        {email && (
          <button
            type="button"
            onClick={() => setShowEmailInput((v) => !v)}
            className="text-caption"
            style={{ color: 'var(--color-stone)' }}
          >
            Dùng email khác?
          </button>
        )}
      </div>
    </AuthLayout>
  )
}
