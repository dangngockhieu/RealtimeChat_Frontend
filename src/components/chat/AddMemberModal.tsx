import { useState, useMemo } from 'react'
import { X, Search, Check } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { friendshipService } from '@/services/friendship.service'
import { memberService } from '@/services/member.service'
import { CONVERSATIONS_QUERY_KEY } from '@/hooks/useConversations'
import { useAuthStore } from '@/store/auth.store'
import type { UserAccount } from '@/types'

interface AddMemberModalProps {
  conversationId: string
  existingParticipantIds: string[]
  onClose: () => void
}

export function AddMemberModal({
  conversationId,
  existingParticipantIds,
  onClose,
}: AddMemberModalProps) {
  const [search, setSearch] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const currentUserId = useAuthStore((s) => s.user?.id)
  const queryClient = useQueryClient()

  // Get friends list
  const { data: friendsData, isLoading } = useQuery({
    queryKey: ['friendships'],
    queryFn: () => friendshipService.getFriends(),
    select: (res) => res.data?.data?.result ?? [],
  })

  // Extract friend user accounts and filter out existing members
  const availableFriends = useMemo(() => {
    if (!friendsData) return []
    const friends: UserAccount[] = []

    friendsData.forEach((f) => {
      const friendUser =
        f.requester.id === currentUserId ? f.recipient : f.requester
      if (friendUser && !existingParticipantIds.includes(friendUser.id)) {
        friends.push(friendUser)
      }
    })
    return friends
  }, [friendsData, currentUserId, existingParticipantIds])

  // Filter by search query
  const filteredFriends = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return availableFriends
    return availableFriends.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    )
  }, [availableFriends, search])

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const addMembersMutation = useMutation({
    mutationFn: () =>
      memberService.addMembers({
        conversationId,
        memberIds: selectedUserIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-detail', conversationId] })
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
      onClose()
    },
  })

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-full max-w-md rounded-[var(--radius-xxxl)] overflow-hidden flex flex-col p-6 max-h-[85vh]"
          style={{
            backgroundColor: 'var(--color-canvas)',
            boxShadow: 'var(--shadow-panel)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-subtitle-lg"
              style={{ color: 'var(--color-ink-deep)' }}
            >
              Thêm thành viên
            </h3>
            <button
              onClick={onClose}
              className="btn-icon-circular"
              style={{ backgroundColor: 'var(--color-surface-soft)' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-4">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-stone)]"
            />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-search-pill pl-9"
            />
          </div>

          {/* Friends list */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1 my-2">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-t-transparent border-[var(--color-primary)] rounded-full animate-spin" />
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-[var(--color-stone)]">
                <p className="text-body-sm font-medium">
                  {search ? 'Không tìm thấy bạn bè phù hợp' : 'Không có bạn bè nào để thêm'}
                </p>
              </div>
            ) : (
              filteredFriends.map((friend) => {
                const isSelected = selectedUserIds.includes(friend.id)
                return (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => toggleSelectUser(friend.id)}
                    className="flex items-center justify-between p-2 rounded-[var(--radius-xl)] hover:bg-[var(--color-surface-soft)] transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar user={{ ...friend, id: friend.id }} size="sm" />
                      <div>
                        <p className="text-body-sm-bold text-[var(--color-ink-deep)]">
                          {friend.firstName} {friend.lastName}
                        </p>
                        <p className="text-caption text-[var(--color-stone)] truncate max-w-[200px]">
                          {friend.email}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                          : 'border-[var(--color-hairline)] bg-transparent'
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Footer action buttons */}
          <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-[var(--color-hairline-soft)]">
            <Button type="button" variant="ghost" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="button"
              variant="buy"
              disabled={selectedUserIds.length === 0}
              loading={addMembersMutation.isPending}
              onClick={() => addMembersMutation.mutate()}
            >
              Thêm {selectedUserIds.length > 0 ? `(${selectedUserIds.length})` : ''}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
