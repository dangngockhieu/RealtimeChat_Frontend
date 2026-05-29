import { useRef, useCallback, useState } from 'react'
import { Search, Plus, MessageSquarePlus } from 'lucide-react'
import { ConversationItem } from './ConversationItem'
import { useConversations } from '@/hooks/useConversations'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/utils/cn'

interface ConversationListProps {
  onNewConversation?: () => void
}

export function ConversationList({ onNewConversation }: ConversationListProps) {
  const user = useAuthStore((s) => s.user)
  const [search, setSearch] = useState('')

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useConversations()

  // Flatten các trang thành 1 mảng
  const allConversations = data?.pages.flatMap((p) => p.conversations) ?? []

  // Lọc theo search (client-side filter tên)
  const filtered = search.trim()
    ? allConversations.filter((c) =>
        (c.name ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : allConversations

  // Infinite scroll: dùng IntersectionObserver
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return
      if (observerRef.current) observerRef.current.disconnect()
      if (!node) return
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      })
      observerRef.current.observe(node)
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  )

  return (
    <div
      className="flex flex-col h-full"
      style={{
        width: 320,
        flexShrink: 0,
        borderRight: '1px solid var(--color-hairline-soft)',
        backgroundColor: 'var(--color-canvas)',
      }}
    >
      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-subtitle-lg"
            style={{ color: 'var(--color-ink-deep)', fontFeatureSettings: '"ss01","ss02"' }}
          >
            Tin nhắn
          </h2>
          <button
            onClick={onNewConversation}
            className="btn-icon-circular"
            style={{ backgroundColor: 'var(--color-surface-soft)' }}
            title="Cuộc trò chuyện mới"
          >
            <Plus size={18} style={{ color: 'var(--color-ink)' }} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-stone)' }}
          />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-search-pill w-full pl-9"
          />
        </div>
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {isLoading && <ConversationListSkeleton />}

        {isError && (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <p className="text-body-sm" style={{ color: 'var(--color-critical)' }}>
              Không thể tải danh sách
            </p>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <EmptyConversations search={search} onNew={onNewConversation} />
        )}

        {filtered.map((conv) => (
          <ConversationItem
            key={conv._id}
            conversation={conv}
            currentUserId={user?.id ?? ''}
          />
        ))}

        {/* Load more trigger */}
        <div ref={loadMoreRef} className="h-4" />

        {isFetchingNextPage && (
          <div className="flex justify-center py-3">
            <div
              className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────
function EmptyConversations({
  search,
  onNew,
}: {
  search: string
  onNew?: () => void
}) {
  if (search) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2 px-4 text-center">
        <Search size={28} style={{ color: 'var(--color-stone)' }} />
        <p className="text-body-sm" style={{ color: 'var(--color-stone)' }}>
          Không tìm thấy cuộc trò chuyện nào
        </p>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-4 text-center py-16">
      <div
        className="w-16 h-16 rounded-[var(--radius-xxl)] flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,100,224,0.08)' }}
      >
        <MessageSquarePlus size={28} style={{ color: 'var(--color-primary)' }} />
      </div>
      <div>
        <p className="text-body-md-bold" style={{ color: 'var(--color-ink-deep)' }}>
          Chưa có cuộc trò chuyện
        </p>
        <p className="text-body-sm mt-1" style={{ color: 'var(--color-stone)' }}>
          Bắt đầu nhắn tin với bạn bè ngay!
        </p>
      </div>
      <button onClick={onNew} className="btn-buy text-sm px-5 py-2.5">
        Cuộc trò chuyện mới
      </button>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────
function ConversationListSkeleton() {
  return (
    <div className="flex flex-col gap-1 px-1">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className={cn('flex items-center gap-3 px-3 py-3 rounded-[var(--radius-xl)]', 'animate-pulse')}
        >
          <div className="w-10 h-10 rounded-full flex-shrink-0"
            style={{ backgroundColor: 'var(--color-hairline-soft)' }} />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-3.5 rounded-full w-2/3"
              style={{ backgroundColor: 'var(--color-hairline-soft)' }} />
            <div className="h-3 rounded-full w-4/5"
              style={{ backgroundColor: 'var(--color-hairline-soft)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
