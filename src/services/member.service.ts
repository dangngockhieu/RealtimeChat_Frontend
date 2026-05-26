import apiClient from './api.client'
import type {
  ApiResponse,
  Member,
  AddMembersPayload,
  RemoveMemberPayload,
  LeaveGroupPayload,
  UpdateRolePayload,
  TransferOwnerPayload,
  MarkAsReadPayload,
  ClearHistoryPayload,
} from '@/types'

export const memberService = {
  /** Lấy danh sách thành viên trong cuộc trò chuyện */
  getMembers: (conversationId: string) =>
    apiClient.get<ApiResponse<Member[]>>(`/member/${conversationId}`),

  /** Thêm thành viên vào nhóm (ADMIN/OWNER) */
  addMembers: (payload: AddMembersPayload) =>
    apiClient.post<ApiResponse<null>>('/member/add', payload),

  /** Xóa thành viên khỏi nhóm */
  removeMember: (payload: RemoveMemberPayload) =>
    apiClient.post<ApiResponse<null>>('/member/remove', payload),

  /** Rời khỏi nhóm (OWNER phải chuyển quyền trước) */
  leaveGroup: (payload: LeaveGroupPayload) =>
    apiClient.post<ApiResponse<null>>('/member/leave', payload),

  /** Phân quyền ADMIN / MEMBER (chỉ OWNER) */
  updateRole: (payload: UpdateRolePayload) =>
    apiClient.patch<ApiResponse<null>>('/member/role', payload),

  /** Chuyển giao quyền Trưởng nhóm (chỉ OWNER) */
  transferOwner: (payload: TransferOwnerPayload) =>
    apiClient.patch<ApiResponse<null>>('/member/transfer-owner', payload),

  /** Đánh dấu đã đọc tin nhắn mới nhất */
  markAsRead: (payload: MarkAsReadPayload) =>
    apiClient.patch<ApiResponse<null>>('/member/mark-as-read', payload),

  /** Xóa lịch sử chat phía cá nhân (chỉ ẩn với tài khoản hiện tại) */
  clearHistory: (payload: ClearHistoryPayload) =>
    apiClient.delete<ApiResponse<null>>('/member/clear-history', { data: payload }),
}
