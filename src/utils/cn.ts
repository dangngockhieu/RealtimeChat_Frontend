import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility để merge Tailwind classes an toàn, tránh conflict
 * Sử dụng: cn('text-body-md', isActive && 'text-body-md-bold')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
