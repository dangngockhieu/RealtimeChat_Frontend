import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { UserAccount } from '@/types'
import { setAccessToken } from '@/services/api.client'

// ============================================================
//  AUTH STORE — Quản lý trạng thái đăng nhập
//  Access Token lưu trong memory (qua setAccessToken ở api.client)
//  User info lưu trong sessionStorage để khôi phục khi reload trang
// ============================================================

interface AuthState {
  user: UserAccount | null
  isAuthenticated: boolean
  isInitializing: boolean // true khi đang kiểm tra phiên đăng nhập ban đầu

  // Actions
  setUser: (user: UserAccount | null) => void
  setIsAuthenticated: (value: boolean) => void
  setIsInitializing: (value: boolean) => void
  login: (user: UserAccount, token: string) => void
  logout: () => void
  updateUser: (updates: Partial<UserAccount>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isInitializing: true,

      setUser: (user) => set({ user }),

      setIsAuthenticated: (value) => set({ isAuthenticated: value }),

      setIsInitializing: (value) => set({ isInitializing: value }),

      login: (user, token) => {
        setAccessToken(token)
        set({ user, isAuthenticated: true, isInitializing: false })
      },

      logout: () => {
        setAccessToken(null)
        set({ user: null, isAuthenticated: false, isInitializing: false })
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'auth-user',
      storage: createJSONStorage(() => sessionStorage),
      // Chỉ persist thông tin user, KHÔNG persist accessToken
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
