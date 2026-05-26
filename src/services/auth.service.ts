import apiClient from './api.client'
import type {
  ApiResponse,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  VerifyOtpPayload,
  ResendOtpPayload,
} from '@/types'

export const authService = {
  /**
   * Đăng ký tài khoản mới — hệ thống tự gửi OTP email
   */
  register: (payload: RegisterPayload) =>
    apiClient.post<ApiResponse<null>>('/auth/register', payload),

  /**
   * Xác thực OTP kích hoạt tài khoản
   */
  verifyOtp: (payload: VerifyOtpPayload) =>
    apiClient.post<ApiResponse<null>>('/auth/verify-otp', payload),

  /**
   * Gửi lại mã OTP mới
   */
  resendOtp: (payload: ResendOtpPayload) =>
    apiClient.post<ApiResponse<null>>('/auth/resend-otp', payload),

  /**
   * Đăng nhập — trả về accessToken, set refreshToken vào HttpOnly cookie
   */
  login: (payload: LoginPayload) =>
    apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload),

  /**
   * Đăng xuất — xóa refreshToken cookie phía server
   */
  logout: () =>
    apiClient.post<ApiResponse<null>>('/auth/logout'),

  /**
   * Làm mới Access Token bằng refreshToken cookie
   * Được gọi tự động bởi interceptor — không cần gọi thủ công
   */
  refresh: () =>
    apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh'),
}
