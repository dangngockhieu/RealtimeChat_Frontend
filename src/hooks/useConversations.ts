import { useInfiniteQuery } from '@tanstack/react-query'
import { conversationService } from '@/services/conversation.service'
import type { ConversationSummary } from '@/types'

export const CONVERSATIONS_QUERY_KEY = ['conversations', 'my'] as const

/**
 * Infinite query cho danh sách cuộc trò chuyện
 * Dùng cursor-based pagination: mỗi page lấy thêm các cuộc trò chuyện cũ hơn
 */
export function useConversations() {
  return useInfiniteQuery({
    queryKey: CONVERSATIONS_QUERY_KEY,
    queryFn: async ({ pageParam }) => {
      const res = await conversationService.getMyConversations({
        limit: 20,
        cursor: pageParam as string | undefined,
      })
      const result = (res.data?.data as unknown as { result: ConversationSummary[]; meta: { nextCursor: string | null; hasNextPage: boolean } })
      return {
        conversations: result?.result ?? [],
        nextCursor: result?.meta?.nextCursor ?? null,
        hasNextPage: result?.meta?.hasNextPage ?? false,
      }
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? (lastPage.nextCursor ?? undefined) : undefined,
    staleTime: 30_000,
  })
}
