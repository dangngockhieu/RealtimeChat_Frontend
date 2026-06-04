import { useState, useMemo } from 'react'
import { Search, Users, UserCheck, UserPlus, ShieldAlert } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Sidebar } from '@/components/layout/Sidebar'
import { FriendCard } from '@/components/contacts/FriendCard'
import { FriendRequestCard } from '@/components/contacts/FriendRequestCard'
import { BlockedUserCard } from '@/components/contacts/BlockedUserCard'
import { AddFriendTab } from '@/components/contacts/AddFriendTab'
import { SocketProvider } from '@/contexts/SocketContext'
import { friendshipService } from '@/services/friendship.service'
import { useAuthStore } from '@/store/auth.store'
import type { Friendship, UserAccount } from '@/types'

type ContactTab = 'friends' | 'pending' | 'add' | 'blocked'

export default function ContactsPage() {
  const [activeTab, setActiveTab] = useState<ContactTab>('friends')
  const [filterSearch, setFilterSearch] = useState('')
  const currentUserId = useAuthStore((s) => s.user?.id)

  // 1. Friends query
  const { data: friendsList, isLoading: loadingFriends } = useQuery({
    queryKey: ['friendships'],
    queryFn: () => friendshipService.getFriends(),
    select: (res) => res.data?.data?.result ?? [],
  })

  // 2. Pending requests query
  const { data: pendingRequests, isLoading: loadingPending } = useQuery({
    queryKey: ['friendships', 'pending'],
    queryFn: () => friendshipService.getPendingRequests(),
    select: (res) => res.data?.data?.result ?? [],
  })

  // 3. Blocked users query
  const { data: blockedList, isLoading: loadingBlocked } = useQuery({
    queryKey: ['friendships', 'blocked'],
    queryFn: () => friendshipService.getBlockedUsers(),
    select: (res) => res.data?.data?.result ?? [],
  })

  // Filter friends by search
  const filteredFriends = useMemo(() => {
    if (!friendsList) return []
    const q = filterSearch.trim().toLowerCase()

    return (friendsList as Friendship[]).filter((f) => {
      const friend: UserAccount =
        f.requester.id === currentUserId ? f.recipient : f.requester
      if (!friend) return false
      if (!q) return true
      return (
        `${friend.firstName} ${friend.lastName}`.toLowerCase().includes(q) ||
        friend.email.toLowerCase().includes(q)
      )
    })
  }, [friendsList, currentUserId, filterSearch])

  const pendingCount = pendingRequests?.length ?? 0

  return (
    <SocketProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--color-canvas)]">
        {/* Sidebar */}
        <Sidebar />

        {/* Contacts Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--color-surface-soft)]">
          {/* Header */}
          <div className="px-8 pt-8 pb-4 bg-[var(--color-canvas)] border-b border-[var(--color-hairline-soft)]">
            <h1
              className="text-heading-sm mb-4"
              style={{ color: 'var(--color-ink-deep)' }}
            >
              Danh bạ
            </h1>

            {/* Pill Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab('friends')}
                className={`btn-pill-tab flex items-center gap-2 ${
                  activeTab === 'friends' ? 'active' : ''
                }`}
              >
                <Users size={15} />
                <span>Bạn bè</span>
                <span className="badge badge-attention text-[11px] py-0 px-1.5 ml-1">
                  {friendsList?.length ?? 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('pending')}
                className={`btn-pill-tab flex items-center gap-2 ${
                  activeTab === 'pending' ? 'active' : ''
                }`}
              >
                <UserCheck size={15} />
                <span>Lời mời kết bạn</span>
                {pendingCount > 0 && (
                  <span className="badge badge-critical text-[11px] py-0 px-1.5 ml-1">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('add')}
                className={`btn-pill-tab flex items-center gap-2 ${
                  activeTab === 'add' ? 'active' : ''
                }`}
              >
                <UserPlus size={15} />
                <span>Tìm bạn mới</span>
              </button>

              <button
                onClick={() => setActiveTab('blocked')}
                className={`btn-pill-tab flex items-center gap-2 ${
                  activeTab === 'blocked' ? 'active' : ''
                }`}
              >
                <ShieldAlert size={15} />
                <span>Đã chặn</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {/* TAB 1: ALL FRIENDS */}
            {activeTab === 'friends' && (
              <div className="flex flex-col gap-4 max-w-4xl mx-auto">
                <div className="relative max-w-md">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-stone)]"
                  />
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder="Tìm trong danh sách bạn bè..."
                    className="input-search-pill pl-10 bg-[var(--color-canvas)] border border-[var(--color-hairline-soft)]"
                  />
                </div>

                {loadingFriends ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-t-transparent border-[var(--color-primary)] rounded-full animate-spin" />
                  </div>
                ) : filteredFriends.length === 0 ? (
                  <div className="text-center py-16 bg-[var(--color-canvas)] rounded-[var(--radius-xxxl)] border border-[var(--color-hairline-soft)]">
                    <Users size={32} className="mx-auto text-[var(--color-stone)] mb-2 opacity-50" />
                    <p className="text-body-md font-bold text-[var(--color-ink-deep)]">
                      {filterSearch ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có bạn bè nào'}
                    </p>
                    <p className="text-body-sm text-[var(--color-stone)] mt-1">
                      Hãy sang tab "Tìm bạn mới" để kết nối với những người quen!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredFriends.map((f) => {
                      const friend: UserAccount =
                        f.requester.id === currentUserId ? f.recipient : f.requester
                      return (
                        <FriendCard
                          key={f._id}
                          friendshipId={f._id}
                          friend={friend}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PENDING REQUESTS */}
            {activeTab === 'pending' && (
              <div className="flex flex-col gap-3 max-w-2xl mx-auto">
                {loadingPending ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-t-transparent border-[var(--color-primary)] rounded-full animate-spin" />
                  </div>
                ) : (pendingRequests?.length ?? 0) === 0 ? (
                  <div className="text-center py-16 bg-[var(--color-canvas)] rounded-[var(--radius-xxxl)] border border-[var(--color-hairline-soft)]">
                    <UserCheck size={32} className="mx-auto text-[var(--color-stone)] mb-2 opacity-50" />
                    <p className="text-body-md font-bold text-[var(--color-ink-deep)]">
                      Không có lời mời kết bạn nào
                    </p>
                    <p className="text-body-sm text-[var(--color-stone)] mt-1">
                      Khi có người gửi lời mời, danh sách sẽ xuất hiện tại đây.
                    </p>
                  </div>
                ) : (
                  pendingRequests?.map((req) => (
                    <FriendRequestCard key={req._id} request={req} />
                  ))
                )}
              </div>
            )}

            {/* TAB 3: ADD FRIEND */}
            {activeTab === 'add' && <AddFriendTab />}

            {/* TAB 4: BLOCKED USERS */}
            {activeTab === 'blocked' && (
              <div className="flex flex-col gap-3 max-w-2xl mx-auto">
                {loadingBlocked ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-t-transparent border-[var(--color-primary)] rounded-full animate-spin" />
                  </div>
                ) : (blockedList?.length ?? 0) === 0 ? (
                  <div className="text-center py-16 bg-[var(--color-canvas)] rounded-[var(--radius-xxxl)] border border-[var(--color-hairline-soft)]">
                    <ShieldAlert size={32} className="mx-auto text-[var(--color-stone)] mb-2 opacity-50" />
                    <p className="text-body-md font-bold text-[var(--color-ink-deep)]">
                      Danh sách chặn trống
                    </p>
                    <p className="text-body-sm text-[var(--color-stone)] mt-1">
                      Những người bạn đã chặn sẽ được hiển thị ở đây.
                    </p>
                  </div>
                ) : (
                  blockedList?.map((item) => (
                    <BlockedUserCard
                      key={item._id}
                      friendship={item}
                      currentUserId={currentUserId}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </SocketProvider>
  )
}
