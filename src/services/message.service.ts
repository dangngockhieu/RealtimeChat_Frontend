import apiClient from './api.client'
import type {
  ApiResponse,
  Message,
  CursorMeta,
  SendMessagePayload,
} from '@/types'

export const messageService = {
  /**
   * Lấy lịch sử tin nhắn (Cursor Pagination ngược thời gian)
   * cursor: ISO8601 timestamp — lấy tin nhắn CŨ HƠN mốc này
   */
  getMessages: (
    conversationId: string,
    params?: { limit?: number; cursor?: string }
  ) =>
    apiClient.get<ApiResponse<Message[]> & { data: { meta: CursorMeta } }>(
      `/message/${conversationId}`,
      { params }
    ),

  /** Gửi tin nhắn mới (text, image, file hoặc reply) */
  sendMessage: (payload: SendMessagePayload) =>
    apiClient.post<ApiResponse<Message>>('/message', payload),

  /**
   * Thu hồi tin nhắn
   * - Người gửi: trong vòng 24h
   * - ADMIN/OWNER: bất kỳ lúc nào
   */
  recallMessage: (messageId: string) =>
    apiClient.patch<ApiResponse<null>>(`/message/${messageId}/recall`),

  /**
   * Xóa tin nhắn phía tôi (Delete for me)
   * Chỉ ẩn với tài khoản hiện tại, người khác vẫn thấy
   */
  deleteForMe: (messageId: string) =>
    apiClient.delete<ApiResponse<null>>(`/message/${messageId}`),
}
