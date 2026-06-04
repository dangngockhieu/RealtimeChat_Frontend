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
  ({ label, error, hint, leftIcon, rightIcon, className, style, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-body-sm-bold text-[var(--color-ink-deep)]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-[var(--color-stone)] pointer-events-none z-10">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            {...props}
            style={{
              paddingLeft: leftIcon ? '42px' : '14px',
              paddingRight: rightIcon ? '42px' : '14px',
              ...style,
            }}
            className={cn(
              'input-field',
              leftIcon && '!pl-11',
              rightIcon && '!pr-11',
              error && 'error',
              className,
            )}
          />

          {rightIcon && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-[var(--color-stone)] z-10">
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
