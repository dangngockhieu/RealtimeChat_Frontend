import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

type ButtonVariant = 'primary' | 'buy' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  buy: 'btn-buy',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: '!py-[8px] !px-[20px] !text-[13px]',
  md: '',  // default from btn-* class
  lg: '!py-[16px] !px-[36px] !text-[16px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : leftIcon}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  )
}
