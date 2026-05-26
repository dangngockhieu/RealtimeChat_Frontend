import { format, formatDistanceToNow, isToday, isYesterday, isThisYear } from 'date-fns'
import { vi } from 'date-fns/locale'

/**
 * Format timestamp hiển thị trong danh sách conversation
 * - Hôm nay: "14:30"
 * - Hôm qua: "Hôm qua"
 * - Trong năm nay: "15 Th9"
 * - Năm khác: "15/09/2025"
 */
export function formatConversationTime(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  if (isToday(d)) {
    return format(d, 'HH:mm')
  }
  if (isYesterday(d)) {
    return 'Hôm qua'
  }
  if (isThisYear(d)) {
    return format(d, 'd MMM', { locale: vi })
  }
  return format(d, 'dd/MM/yyyy')
}

/**
 * Format timestamp hiển thị trong cửa sổ chat
 * Ví dụ: "14:30" hoặc "15/09/2025 14:30"
 */
export function formatMessageTime(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  if (isToday(d)) {
    return format(d, 'HH:mm')
  }
  return format(d, 'dd/MM/yyyy HH:mm')
}

/**
 * Relative time - "5 phút trước"
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return formatDistanceToNow(d, { addSuffix: true, locale: vi })
}

/**
 * Format full datetime - "Thứ 6, 15 tháng 9, 2025 lúc 14:30"
 */
export function formatFullDateTime(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return format(d, "EEEE, d MMMM, yyyy 'lúc' HH:mm", { locale: vi })
}
