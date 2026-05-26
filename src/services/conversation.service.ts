import apiClient from './api.client'
import type {
  ApiResponse,
  CursorMeta,
  ConversationSummary,
  ConversationDetail,
  CreateDirectChatPayload,
  CreateGroupChatPayload,
  UpdateGroupNamePayload,
  UpdateGroupAvatarPayload,
} from '@/types'

export const conversationService = {
  /** Tạo hoặc lấy lại cuộc trò chuyện 1-1 */
  createDirect: (payload: CreateDirectChatPayload) =>
    apiClient.post<ApiResponse<ConversationDetail>>('/conversation/create-direct', payload),

  /** Tạo nhóm chat mới */
  createGroup: (payload: CreateGroupChatPayload) =>
    apiClient.post<ApiResponse<ConversationDetail>>('/conversation/create-group', payload),

  /**
   * Lấy danh sách cuộc trò chuyện của tôi (Cursor Pagination)
   * Sắp xếp theo lastMessageAt giảm dần (tin mới nhất lên đầu)
   */
  getMyConversations: (params?: { limit?: number; cursor?: string }) =>
    apiClient.get<ApiResponse<ConversationSummary[]> & { data: { meta: CursorMeta } }>(
      '/conversation/my-conversations',
      { params }
    ),

  /** Lấy chi tiết 1 cuộc trò chuyện kèm thông tin thành viên và quyền cá nhân */
  getDetail: (conversationId: string) =>
    apiClient.get<ApiResponse<ConversationDetail>>(`/conversation/${conversationId}`),

  /** Đổi tên nhóm (yêu cầu ADMIN/OWNER) */
  updateName: (conversationId: string, payload: UpdateGroupNamePayload) =>
    apiClient.patch<ApiResponse<null>>(`/conversation/${conversationId}/name`, payload),

  /** Đổi avatar nhóm (yêu cầu ADMIN/OWNER) */
  updateAvatar: (conversationId: string, payload: UpdateGroupAvatarPayload) =>
    apiClient.patch<ApiResponse<null>>(`/conversation/${conversationId}/avatar`, payload),

  /** Giải tán nhóm (chỉ OWNER) */
  disband: (conversationId: string) =>
    apiClient.delete<ApiResponse<null>>(`/conversation/${conversationId}`),
}
