import { getAvatarUrl, getInitials, getAvatarColor } from '@/utils/helpers'
import { cn } from '@/utils/cn'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  user?: {
    firstName: string
    lastName: string
    avatar?: string | null
    id?: string
  } | null
  src?: string | null
  fallbackName?: string
  size?: AvatarSize
  showOnline?: boolean
  isOnline?: boolean
  className?: string
}

const sizeMap: Record<AvatarSize, { wrapper: string; text: string; dot: string }> = {
  xs:  { wrapper: 'w-7 h-7',   text: 'text-[11px]', dot: 'w-2 h-2 border' },
  sm:  { wrapper: 'w-8 h-8',   text: 'text-[12px]', dot: 'w-2.5 h-2.5 border' },
  md:  { wrapper: 'w-10 h-10', text: 'text-[14px]', dot: 'w-3 h-3 border-2' },
  lg:  { wrapper: 'w-12 h-12', text: 'text-[16px]', dot: 'w-3.5 h-3.5 border-2' },
  xl:  { wrapper: 'w-16 h-16', text: 'text-[20px]', dot: 'w-4 h-4 border-2' },
}

export function Avatar({
  user,
  src,
  fallbackName,
  size = 'md',
  showOnline = false,
  isOnline = false,
  className,
}: AvatarProps) {
  const { wrapper, text, dot } = sizeMap[size]

  // Ưu tiên: src prop > user.avatar > initials fallback
  const avatarSrc = src ?? (user?.avatar ? getAvatarUrl(user.avatar) : null)
  const initials   = user
    ? getInitials(user)
    : fallbackName
    ? fallbackName.slice(0, 2).toUpperCase()
    : '?'
  const bgColor = user?.id
    ? getAvatarColor(user.id)
    : '#8595a4'

  return (
    <div className={cn('relative flex-shrink-0', className)}>
      <div
        className={cn(
          wrapper,
          'rounded-full overflow-hidden flex items-center justify-center font-bold select-none',
        )}
        style={{ backgroundColor: avatarSrc ? undefined : bgColor }}
      >
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={initials}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback nếu ảnh load lỗi
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <span className={cn(text, 'font-bold')} style={{ color: 'white' }}>
            {initials}
          </span>
        )}
      </div>

      {/* Online indicator dot */}
      {showOnline && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-white',
            dot,
            isOnline ? 'bg-[var(--color-success)]' : 'bg-[var(--color-stone)]',
          )}
        />
      )}
    </div>
  )
}
