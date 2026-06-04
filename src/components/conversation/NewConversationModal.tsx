import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Search, UserPlus, Users } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { conversationService } from '@/services/conversation.service'
import { userService } from '@/services/user.service'
import { friendshipService } from '@/services/friendship.service'
import { useChatStore } from '@/store/chat.store'
import { CONVERSATIONS_QUERY_KEY } from '@/hooks/useConversations'
import type { UserAccount } from '@/types'

// ─── Tab ────────────────────────────────────────────────────
type TabType = 'direct' | 'group'

interface NewConversationModalProps {
  onClose: () => void
}

// ─── Group schema ────────────────────────────────────────────
const groupSchema = z.object({
  name: z.string().min(1, 'Nhập tên nhóm').max(60, 'Tên quá dài'),
})
type GroupForm = z.infer<typeof groupSchema>

export function NewConversationModal({ onClose }: NewConversationModalProps) {
  const [tab, setTab] = useState<TabType>('direct')
  const [emailSearch, setEmailSearch] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<UserAccount[]>([])
  const queryClient = useQueryClient()
  const { setActiveConversation } = useChatStore()

  // Load danh sách bạn bè
  const { data: friendsData } = useQuery({
    queryKey: ['friendships'],
    queryFn: () => friendshipService.getFriends(),
    select: (res) => res.data?.data?.result ?? [],
  })

  // Tìm user theo email
  const { data: searchResult, isFetching: isSearching } = useQuery({
    queryKey: ['user-search', emailSearch],
    queryFn: () => userService.getUserByEmail(emailSearch),
    select: (res) => res.data?.data?.result ?? null,
    enabled: emailSearch.includes('@') && emailSearch.length > 4,
    retry: false,
  })

  // Group form
  const { register, handleSubmit, formState: { errors } } = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
  })

  // Mutations
  const createDirectMutation = useMutation({
    mutationFn: (userId: string) =>
      conversationService.createDirect({ targetUserId: userId }),
    onSuccess: (res) => {
      const conv = res.data?.data?.result
      if (conv) {
        queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
        setActiveConversation(conv.id)
        onClose()
      }
    },
  })

  const createGroupMutation = useMutation({
    mutationFn: (data: GroupForm) =>
      conversationService.createGroup({
        name: data.name,
        privacy: 'PRIVATE',
        participantIds: selectedUsers.map((u) => u.id),
      }),
    onSuccess: (res) => {
      const conv = res.data?.data?.result
      if (conv) {
        queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
        setActiveConversation(conv.id)
        onClose()
      }
    },
  })

  const handleSelectUser = (user: UserAccount) => {
    if (tab === 'direct') {
      createDirectMutation.mutate(user.id)
      return
    }
    setSelectedUsers((prev) =>
      prev.find((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    )
  }

  const friends = (friendsData as unknown as { requester: UserAccount; recipient: UserAccount }[] | undefined) ?? []

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-full max-w-md rounded-[var(--radius-xxxl)] overflow-hidden flex flex-col"
          style={{
            backgroundColor: 'var(--color-canvas)',
            boxShadow: 'var(--shadow-panel)',
            maxHeight: '85vh',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h2
              className="text-subtitle-lg"
              style={{ color: 'var(--color-ink-deep)' }}
            >
              Cuộc trò chuyện mới
            </h2>
            <button
              onClick={onClose}
              className="btn-icon-circular"
              style={{ backgroundColor: 'var(--color-surface-soft)' }}
            >
              <X size={16} style={{ color: 'var(--color-ink)' }} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 px-6 pb-4">
            {(['direct', 'group'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setSelectedUsers([]) }}
                className={`btn-pill-tab ${tab === t ? 'active' : ''}`}
              >
                {t === 'direct' ? (
                  <><UserPlus size={13} className="inline mr-1.5" />Chat 1-1</>
                ) : (
                  <><Users size={13} className="inline mr-1.5" />Nhóm</>
                )}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 pb-2 flex flex-col gap-4">
            {/* Search by email */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--color-stone)' }}
              />
              <input
                type="email"
                placeholder="Tìm kiếm theo email..."
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                className="input-search-pill w-full pl-9"
              />
            </div>

            {/* Search result */}
            {isSearching && (
              <div className="flex justify-center py-2">
                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
              </div>
            )}
            {searchResult && !isSearching && (
              <UserRow
                user={searchResult}
                selected={selectedUsers.some((u) => u.id === searchResult.id)}
                onClick={() => handleSelectUser(searchResult)}
                isLoading={createDirectMutation.isPending}
                showCheckbox={tab === 'group'}
              />
            )}

            {/* Friends list */}
            {friends.length > 0 && (
              <div>
                <p className="text-caption-bold mb-2" style={{ color: 'var(--color-stone)' }}>
                  BẠN BÈ
                </p>
                <div className="flex flex-col gap-1">
                  {friends.map((f: { requester: UserAccount; recipient: UserAccount }) => {
                    // Xác định người kia
                    const friend = f.requester
                    return (
                      <UserRow
                        key={friend.id}
                        user={friend}
                        selected={selectedUsers.some((u) => u.id === friend.id)}
                        onClick={() => handleSelectUser(friend)}
                        isLoading={createDirectMutation.isPending && tab === 'direct'}
                        showCheckbox={tab === 'group'}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Group form footer */}
          {tab === 'group' && (
            <form
              onSubmit={handleSubmit((d) => createGroupMutation.mutate(d))}
              className="px-6 pt-4 pb-6 border-t flex flex-col gap-3"
              style={{ borderColor: 'var(--color-hairline-soft)' }}
            >
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedUsers.map((u) => (
                    <span
                      key={u.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption-bold"
                      style={{
                        backgroundColor: 'rgba(0,100,224,0.1)',
                        color: 'var(--color-primary)',
                      }}
                    >
                      {u.firstName} {u.lastName}
                      <button
                        type="button"
                        onClick={() => setSelectedUsers((p) => p.filter((x) => x.id !== u.id))}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input
                placeholder="Tên nhóm..."
                className="input-field"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-caption" style={{ color: 'var(--color-critical)' }}>
                  {errors.name.message}
                </p>
              )}
              <Button
                type="submit"
                variant="buy"
                fullWidth
                loading={createGroupMutation.isPending}
                disabled={selectedUsers.length < 1}
              >
                Tạo nhóm {selectedUsers.length > 0 ? `(${selectedUsers.length} người)` : ''}
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}

// ─── User row ─────────────────────────────────────────────
function UserRow({
  user, selected, onClick, isLoading, showCheckbox,
}: {
  user: UserAccount
  selected: boolean
  onClick: () => void
  isLoading?: boolean
  showCheckbox?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-xl)] w-full text-left transition-all duration-150 hover:bg-[var(--color-surface-soft)] disabled:opacity-60"
    >
      <Avatar
        user={{ ...user, id: user.id }}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <p className="text-body-sm-bold truncate" style={{ color: 'var(--color-ink-deep)' }}>
          {user.firstName} {user.lastName}
        </p>
        <p className="text-caption truncate" style={{ color: 'var(--color-stone)' }}>
          {user.email}
        </p>
      </div>
      {showCheckbox && (
        <span
          className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
          style={{
            borderColor: selected ? 'var(--color-primary)' : 'var(--color-hairline)',
            backgroundColor: selected ? 'var(--color-primary)' : 'transparent',
          }}
        >
          {selected && (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </span>
      )}
    </button>
  )
}
