import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface DividerProps {
  children?: ReactNode
  className?: string
}

export function Divider({ children, className }: DividerProps) {
  if (!children) {
    return <hr className={cn('border-[var(--color-hairline-soft)]', className)} />
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="flex-1 h-px bg-[var(--color-hairline-soft)]" />
      <span className="text-caption text-[var(--color-stone)]">{children}</span>
      <span className="flex-1 h-px bg-[var(--color-hairline-soft)]" />
    </div>
  )
}
