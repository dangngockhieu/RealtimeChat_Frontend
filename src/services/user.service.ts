import apiClient from './api.client'
import type {
  ApiResponse,
  UserAccount,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from '@/types'

export const userService = {
  /** Lấy profile tài khoản đang đăng nhập (từ JWT) */
  getProfile: () =>
    apiClient.get<ApiResponse<UserAccount>>('/users/profile'),

  /** Cập nhật họ tên */
  updateProfile: (payload: UpdateProfilePayload) =>
    apiClient.patch<ApiResponse<UserAccount>>('/users', payload),

  /** Đổi mật khẩu */
  changePassword: (payload: ChangePasswordPayload) =>
    apiClient.patch<ApiResponse<null>>('/users/change-password', payload),

  /** Upload và đổi avatar (Multipart form) */
  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<ApiResponse<UserAccount>>('/users/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  /** Đổi avatar bằng URL */
  updateAvatarByUrl: (avatarUrl: string) =>
    apiClient.patch<ApiResponse<UserAccount>>('/users/avatar', { avatarUrl }),

  /** Xóa avatar */
  removeAvatar: () =>
    apiClient.delete<ApiResponse<UserAccount>>('/users/avatar'),

  /** Tìm người dùng theo email */
  getUserByEmail: (email: string) =>
    apiClient.get<ApiResponse<UserAccount>>('/users', { params: { email } }),

  /** Lấy thông tin người dùng theo ID */
  getUserById: (id: string) =>
    apiClient.get<ApiResponse<UserAccount>>(`/users/${id}`),

  /** Danh sách người dùng có phân trang và tìm kiếm */
  getAllUsers: (page = 1, limit = 10, search?: string) =>
    apiClient.get<ApiResponse<UserAccount[]>>('/users/paginate', {
      params: { page, limit, ...(search ? { search } : {}) },
    }),
}
