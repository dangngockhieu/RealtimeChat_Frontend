import apiClient from './api.client'
import type { ApiResponse, UploadedFile } from '@/types'

export const uploadService = {
  /**
   * Upload 1 ảnh (avatar nhóm, ảnh tin nhắn)
   * Trả về URL để dùng tiếp
   */
  uploadImage: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<ApiResponse<UploadedFile>>('/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  /**
   * Upload avatar riêng (lưu vào thư mục /public/uploads/avatars)
   */
  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<ApiResponse<UploadedFile>>('/upload/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  /**
   * Upload nhiều file đính kèm cho tin nhắn (tối đa 5 files, 10MB/file)
   */
  uploadFiles: (files: File[]) => {
    const form = new FormData()
    files.forEach((file) => form.append('files', file))
    return apiClient.post<ApiResponse<UploadedFile[]>>('/upload/files', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
