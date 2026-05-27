import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-body-sm-bold text-[var(--color-ink-deep)]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 flex items-center text-[var(--color-stone)] pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            {...props}
            className={cn(
              'input-field',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'error',
              className,
            )}
          />

          {rightIcon && (
            <span className="absolute right-3 flex items-center text-[var(--color-stone)]">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p className="text-caption text-[var(--color-critical-strong)]">{error}</p>
        )}
        {hint && !error && (
          <p className="text-caption text-[var(--color-stone)]">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
