import { create } from 'zustand'

// ============================================================
//  PRESENCE STORE — Quản lý trạng thái Online/Offline
//  Được cập nhật real-time bởi socket events: user_online/user_offline
// ============================================================

interface PresenceState {
  /** Set các userId đang online */
  onlineUserIds: Set<string>

  // Actions
  setOnline: (userId: string) => void
  setOffline: (userId: string) => void
  setOnlineUsers: (userIds: string[]) => void
  isOnline: (userId: string) => boolean
}

export const usePresenceStore = create<PresenceState>()((set, get) => ({
  onlineUserIds: new Set<string>(),

  setOnline: (userId) =>
    set((state) => ({
      onlineUserIds: new Set([...state.onlineUserIds, userId]),
    })),

  setOffline: (userId) =>
    set((state) => {
      const next = new Set(state.onlineUserIds)
      next.delete(userId)
      return { onlineUserIds: next }
    }),

  setOnlineUsers: (userIds) =>
    set({ onlineUserIds: new Set(userIds) }),

  isOnline: (userId) => get().onlineUserIds.has(userId),
}))
