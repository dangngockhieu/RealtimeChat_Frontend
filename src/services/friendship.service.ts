import apiClient from './api.client'
import type {
  ApiResponse,
  Friendship,
  FriendRequestPayload,
} from '@/types'

export const friendshipService = {
  /** Danh sách bạn bè đã kết bạn (ACCEPTED) */
  getFriends: () =>
    apiClient.get<ApiResponse<Friendship[]>>('/friendships'),

  /** Danh sách lời mời kết bạn đang chờ nhận */
  getPendingRequests: () =>
    apiClient.get<ApiResponse<Friendship[]>>('/friendships/pending'),

  /** Danh sách người đã bị chặn */
  getBlockedUsers: () =>
    apiClient.get<ApiResponse<Friendship[]>>('/friendships/blocked'),

  /** Gửi lời mời kết bạn */
  sendRequest: (payload: FriendRequestPayload) =>
    apiClient.post<ApiResponse<Friendship>>('/friendships', payload),

  /** Chấp nhận lời mời kết bạn */
  acceptRequest: (friendshipId: string) =>
    apiClient.patch<ApiResponse<null>>(`/friendships/${friendshipId}/accept`),

  /** Từ chối lời mời kết bạn */
  declineRequest: (friendshipId: string) =>
    apiClient.patch<ApiResponse<null>>(`/friendships/${friendshipId}/decline`),

  /** Thu hồi lời mời đã gửi */
  cancelRequest: (friendshipId: string) =>
    apiClient.delete<ApiResponse<null>>(`/friendships/${friendshipId}/remove_send`),

  /** Hủy kết bạn (Unfriend) */
  unfriend: (friendshipId: string) =>
    apiClient.delete<ApiResponse<null>>(`/friendships/${friendshipId}/remove`),

  /** Chặn người dùng */
  blockUser: (payload: FriendRequestPayload) =>
    apiClient.post<ApiResponse<null>>('/friendships/block', payload),

  /** Bỏ chặn người dùng */
  unblockUser: (friendId: string) =>
    apiClient.delete<ApiResponse<null>>(`/friendships/unblock/${friendId}`),
}
