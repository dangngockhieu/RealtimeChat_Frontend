/**
 * Lấy full name từ user object
 */
export function getFullName(
  user: { firstName: string; lastName: string } | null | undefined
): string {
  if (!user) return 'Người dùng'
  return `${user.firstName} ${user.lastName}`.trim()
}

/**
 * Lấy URL đầy đủ cho avatar hoặc file từ backend
 * Backend serve static files tại: http://localhost:3000/public/...
 */
const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000'

export function getAvatarUrl(avatarPath: string | null | undefined): string | null {
  if (!avatarPath) return null
  if (avatarPath.startsWith('http')) return avatarPath
  return `${BACKEND_BASE_URL}/${avatarPath.replace(/^\//, '')}`
}

/**
 * Lấy chữ cái đầu từ tên người dùng để dùng làm avatar placeholder
 */
export function getInitials(
  user: { firstName: string; lastName: string } | null | undefined
): string {
  if (!user) return '?'
  const first = user.firstName?.[0] || ''
  const last = user.lastName?.[0] || ''
  return (first + last).toUpperCase() || '?'
}

/**
 * Kiểm tra định dạng file
 */
export function isImageFile(filename: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(filename)
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toUpperCase() || 'FILE'
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Màu nền avatar ngẫu nhiên dựa trên userId (nhất quán)
 */
const AVATAR_COLORS = [
  '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3',
  '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a',
  '#cddc39', '#ff9800', '#ff5722', '#795548', '#607d8b',
]

export function getAvatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
