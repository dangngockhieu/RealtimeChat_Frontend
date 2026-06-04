import { useState, useRef, type ChangeEvent } from 'react'
import {
  X,
  Edit2,
  Camera,
  UserPlus,
  LogOut,
  Trash2,
  MoreVertical,
  Shield,
  ShieldAlert,
  Search,
  Image,
  BellOff,
  UserCheck,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Avatar } from '@/components/ui/Avatar'
import { conversationService } from '@/services/conversation.service'
import { memberService } from '@/services/member.service'
import { uploadService } from '@/services/upload.service'
import { CONVERSATIONS_QUERY_KEY } from '@/hooks/useConversations'
import { useAuthStore } from '@/store/auth.store'
import { useChatStore } from '@/store/chat.store'
import { EditGroupNameModal } from './EditGroupNameModal'
import { AddMemberModal } from './AddMemberModal'
import { TransferOwnerModal } from './TransferOwnerModal'
import type { ConversationDetail, ConversationParticipant } from '@/types'

interface ConversationInfoDrawerProps {
  conversationId: string
  onClose: () => void
}

export function ConversationInfoDrawer({
  conversationId,
  onClose,
}: ConversationInfoDrawerProps) {
  const [showEditName, setShowEditName] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [showTransferOwner, setShowTransferOwner] = useState(false)
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const currentUserId = useAuthStore((s) => s.user?.id)
  const { setActiveConversation } = useChatStore()
  const queryClient = useQueryClient()

  const { data: conv } = useQuery({
    queryKey: ['conversation-detail', conversationId],
    queryFn: () => conversationService.getDetail(conversationId),
    select: (res) => res.data?.data?.result as ConversationDetail | undefined,
  })

  const isGroup = conv?.type === 'GROUP'
  const myRole = conv?.myMembership?.role
  const isOwner = myRole === 'OWNER'
  const isAdmin = myRole === 'ADMIN'
  const canManage = isOwner || isAdmin

  // Avatar upload handler
  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingAvatar(true)
    try {
      const uploadRes = await uploadService.uploadImage(file)
      const avatarUrl = uploadRes.data?.data?.result?.url
      if (avatarUrl) {
        await conversationService.updateAvatar(conversationId, { avatarUrl })
        queryClient.invalidateQueries({ queryKey: ['conversation-detail', conversationId] })
        queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
      }
    } catch (err) {
      console.error('Failed to update avatar:', err)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Mutations
  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: 'ADMIN' | 'MEMBER' }) =>
      memberService.updateRole({ conversationId, memberId, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-detail', conversationId] })
      setActiveMenuUserId(null)
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) =>
      memberService.removeMember({ conversationId, memberId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-detail', conversationId] })
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
      setActiveMenuUserId(null)
    },
  })

  const leaveGroupMutation = useMutation({
    mutationFn: () => memberService.leaveGroup({ conversationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
      setActiveConversation(null)
    },
  })

  const disbandMutation = useMutation({
    mutationFn: () => conversationService.disband(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
      setActiveConversation(null)
    },
  })

  const clearHistoryMutation = useMutation({
    mutationFn: () => memberService.clearHistory({ conversationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
      alert('Đã xóa lịch sử trò chuyện phía bạn.')
    },
  })

  const handleLeaveGroup = () => {
    if (isOwner && (conv?.participants?.length ?? 0) > 1) {
      alert('Bạn là Trưởng nhóm. Vui lòng chuyển quyền Trưởng nhóm trước khi rời khỏi nhóm.')
      setShowTransferOwner(true)
      return
    }
    if (confirm('Bạn có chắc chắn muốn rời khỏi nhóm này không?')) {
      leaveGroupMutation.mutate()
    }
  }

  const handleDisband = () => {
    if (confirm('CẢNH BÁO: Bạn có chắc chắn muốn giải tán nhóm này? Toàn bộ thành viên sẽ bị xóa khỏi nhóm.')) {
      disbandMutation.mutate()
    }
  }

  const displayName = conv?.name || 'Chi tiết'
  const fakeUser = {
    firstName: displayName.split(' ')[0] ?? '',
    lastName: displayName.split(' ').slice(1).join(' ') ?? '',
    avatar: null,
    id: conversationId,
  }

  return (
    <div
      className="flex flex-col h-full flex-shrink-0 border-l border-[var(--color-hairline-soft)] bg-[var(--color-canvas)] z-20"
      style={{ width: 340 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-hairline-soft)] min-h-[64px]">
        <h3
          className="text-subtitle-lg"
          style={{ color: 'var(--color-ink-deep)' }}
        >
          Thông tin hội thoại
        </h3>
        <button
          onClick={onClose}
          className="btn-icon-circular"
          style={{ backgroundColor: 'var(--color-surface-soft)' }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        {/* Profile Card */}
        <div className="flex flex-col items-center text-center">
          <div className="relative group mb-3">
            <Avatar user={fakeUser} size="xl" />
            {isGroup && canManage && (
              <>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[var(--color-primary)] text-white shadow-md hover:opacity-90 transition-opacity"
                  title="Đổi ảnh đại diện nhóm"
                >
                  <Camera size={14} />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 justify-center">
            <h4 className="text-body-md-bold text-[var(--color-ink-deep)] truncate max-w-[240px]">
              {displayName}
            </h4>
            {isGroup && canManage && (
              <button
                onClick={() => setShowEditName(true)}
                className="text-[var(--color-stone)] hover:text-[var(--color-primary)] p-1 transition-colors"
                title="Đổi tên nhóm"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>

          <span className="text-caption text-[var(--color-stone)] mt-0.5">
            {isGroup
              ? `Nhóm • ${conv?.memberCount ?? 0} thành viên`
              : 'Trò chuyện trực tiếp'}
          </span>
        </div>

        {/* Quick action buttons */}
        <div className="grid grid-cols-3 gap-2 py-1">
          <QuickActionItem icon={<Search size={16} />} label="Tìm kiếm" />
          <QuickActionItem icon={<Image size={16} />} label="Phương tiện" />
          <QuickActionItem icon={<BellOff size={16} />} label="Tắt thông báo" />
        </div>

        <hr className="border-[var(--color-hairline-soft)]" />

        {/* Members section (for Group) */}
        {isGroup && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-caption-bold text-[var(--color-stone)] uppercase">
                Thành viên ({conv?.participants?.length ?? 0})
              </span>
              {canManage && (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="flex items-center gap-1 text-caption font-bold text-[var(--color-primary)] hover:underline"
                >
                  <UserPlus size={14} />
                  Thêm
                </button>
              )}
            </div>

            <div className="flex flex-col gap-1 mt-1">
              {conv?.participants?.map((participant) => (
                <MemberItemRow
                  key={participant.userId}
                  participant={participant}
                  currentUserId={currentUserId}
                  isOwner={isOwner}
                  isAdmin={isAdmin}
                  isMenuOpen={activeMenuUserId === participant.userId}
                  onToggleMenu={() =>
                    setActiveMenuUserId((prev) =>
                      prev === participant.userId ? null : participant.userId
                    )
                  }
                  onMakeAdmin={() =>
                    updateRoleMutation.mutate({
                      memberId: participant.userId,
                      role: 'ADMIN',
                    })
                  }
                  onRemoveAdmin={() =>
                    updateRoleMutation.mutate({
                      memberId: participant.userId,
                      role: 'MEMBER',
                    })
                  }
                  onTransferOwner={() => {
                    setActiveMenuUserId(null)
                    setShowTransferOwner(true)
                  }}
                  onRemoveMember={() =>
                    removeMemberMutation.mutate(participant.userId)
                  }
                />
              ))}
            </div>
          </div>
        )}

        <hr className="border-[var(--color-hairline-soft)]" />

        {/* Options & Privacy */}
        <div className="flex flex-col gap-1">
          <span className="text-caption-bold text-[var(--color-stone)] uppercase mb-1">
            Quyền riêng tư & Hỗ trợ
          </span>

          <button
            onClick={() => {
              if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử tin nhắn cuộc trò chuyện này phía bạn?')) {
                clearHistoryMutation.mutate()
              }
            }}
            disabled={clearHistoryMutation.isPending}
            className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-xl)] text-left text-body-sm text-[var(--color-ink-deep)] hover:bg-[var(--color-surface-soft)] transition-colors"
          >
            <Trash2 size={16} className="text-[var(--color-stone)]" />
            <span>Xóa lịch sử trò chuyện</span>
          </button>

          {isGroup && (
            <>
              <button
                onClick={handleLeaveGroup}
                disabled={leaveGroupMutation.isPending}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-xl)] text-left text-body-sm text-[var(--color-critical)] hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                <span>Rời khỏi nhóm</span>
              </button>

              {isOwner && (
                <button
                  onClick={handleDisband}
                  disabled={disbandMutation.isPending}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-xl)] text-left text-body-sm text-[var(--color-critical)] font-bold hover:bg-red-50 transition-colors"
                >
                  <ShieldAlert size={16} />
                  <span>Giải tán nhóm</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showEditName && (
        <EditGroupNameModal
          conversationId={conversationId}
          currentName={displayName}
          onClose={() => setShowEditName(false)}
        />
      )}

      {showAddMember && (
        <AddMemberModal
          conversationId={conversationId}
          existingParticipantIds={
            conv?.participants?.map((p) => p.userId) ?? []
          }
          onClose={() => setShowAddMember(false)}
        />
      )}

      {showTransferOwner && (
        <TransferOwnerModal
          conversationId={conversationId}
          participants={conv?.participants ?? []}
          currentOwnerId={currentUserId ?? ''}
          onClose={() => setShowTransferOwner(false)}
        />
      )}
    </div>
  )
}

function QuickActionItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex flex-col items-center justify-center p-2 rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)] hover:bg-gray-200 transition-colors text-center gap-1.5">
      <span className="text-[var(--color-charcoal)]">{icon}</span>
      <span className="text-[11px] font-bold text-[var(--color-charcoal)]">{label}</span>
    </button>
  )
}

function MemberItemRow({
  participant,
  currentUserId,
  isOwner,
  isAdmin,
  isMenuOpen,
  onToggleMenu,
  onMakeAdmin,
  onRemoveAdmin,
  onTransferOwner,
  onRemoveMember,
}: {
  participant: ConversationParticipant
  currentUserId?: string
  isOwner: boolean
  isAdmin: boolean
  isMenuOpen: boolean
  onToggleMenu: () => void
  onMakeAdmin: () => void
  onRemoveAdmin: () => void
  onTransferOwner: () => void
  onRemoveMember: () => void
}) {
  const isMe = participant.userId === currentUserId
  const isTargetOwner = participant.role === 'OWNER'
  const isTargetAdmin = participant.role === 'ADMIN'

  // Permission to manage this specific user
  const canManageThis =
    !isMe &&
    ((isOwner && !isTargetOwner) || (isAdmin && !isTargetOwner && !isTargetAdmin))

  const fakeUser = {
    firstName: participant.firstName,
    lastName: participant.lastName,
    avatar: participant.avatar,
    id: participant.userId,
  }

  return (
    <div className="relative flex items-center justify-between p-2 rounded-[var(--radius-xl)] hover:bg-[var(--color-surface-soft)] group transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar user={fakeUser} size="sm" />
        <div className="min-w-0">
          <p className="text-body-sm-bold text-[var(--color-ink-deep)] truncate">
            {participant.firstName} {participant.lastName} {isMe && '(Bạn)'}
          </p>
          <span className="text-[11px] text-[var(--color-stone)] flex items-center gap-1">
            {isTargetOwner ? (
              <span className="text-amber-600 font-bold flex items-center gap-0.5">
                <Shield size={11} /> Trưởng nhóm
              </span>
            ) : isTargetAdmin ? (
              <span className="text-blue-600 font-bold flex items-center gap-0.5">
                <Shield size={11} /> Quản trị viên
              </span>
            ) : (
              'Thành viên'
            )}
          </span>
        </div>
      </div>

      {canManageThis && (
        <div className="relative">
          <button
            onClick={onToggleMenu}
            className="p-1 text-[var(--color-stone)] hover:text-[var(--color-ink-deep)] rounded-full hover:bg-black/5"
          >
            <MoreVertical size={16} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-8 w-44 rounded-[var(--radius-xl)] bg-[var(--color-canvas)] shadow-lg border border-[var(--color-hairline-soft)] py-1.5 z-30 flex flex-col text-caption">
              {isOwner && (
                <>
                  {isTargetAdmin ? (
                    <button
                      onClick={onRemoveAdmin}
                      className="px-3 py-2 text-left hover:bg-[var(--color-surface-soft)] text-[var(--color-ink-deep)]"
                    >
                      Hạ xuống Thành viên
                    </button>
                  ) : (
                    <button
                      onClick={onMakeAdmin}
                      className="px-3 py-2 text-left hover:bg-[var(--color-surface-soft)] text-[var(--color-ink-deep)] flex items-center gap-1.5"
                    >
                      <UserCheck size={14} /> Bổ nhiệm Quản trị viên
                    </button>
                  )}
                  <button
                    onClick={onTransferOwner}
                    className="px-3 py-2 text-left hover:bg-[var(--color-surface-soft)] text-amber-700 flex items-center gap-1.5"
                  >
                    <Shield size={14} /> Chuyển quyền Trưởng nhóm
                  </button>
                </>
              )}
              <button
                onClick={onRemoveMember}
                className="px-3 py-2 text-left hover:bg-red-50 text-[var(--color-critical)] flex items-center gap-1.5 border-t border-[var(--color-hairline-soft)]"
              >
                <Trash2 size={14} /> Xóa khỏi nhóm
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
