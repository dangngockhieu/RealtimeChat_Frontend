import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { messageService } from '@/services/message.service'
import type { Message } from '@/types'

// ============================================================
//  MESSAGE QUERY KEY
// ============================================================
export const messageQueryKey = (convId: string) => ['messages', convId]

// Internal shape returned by each page
interface MessagePage {
  messages: Message[]
  nextCursor: string | null
  hasNextPage: boolean
}

// ============================================================
//  useMessages — Infinite cursor-pagination hook
//
//  API: GET /message/{conversationId}?limit=30&cursor=<ISO8601>
//  - Returns messages OLDER than cursor, newest-first within each page.
//  - pages[0] = newest batch, pages[N] = oldest batch.
//
//  allMessages is flattened into chronological order (oldest → newest)
//  so it can be rendered top-to-bottom in the chat window.
// ============================================================
export function useMessages(conversationId: string) {
  const queryClient = useQueryClient()

  const query = useInfiniteQuery<MessagePage>({
    queryKey: messageQueryKey(conversationId),
    queryFn: async ({ pageParam }) => {
      const res = await messageService.getMessages(conversationId, {
        limit: 30,
        cursor: pageParam as string | undefined,
      })
      // API shape: { statusCode, message, data: { result: Message[], meta: CursorMeta } }
      const result = res.data?.data?.result ?? []
      const meta   = res.data?.data?.meta
      const nextCursor  = meta && 'nextCursor' in meta ? meta.nextCursor : null
      const hasNextPage = meta && 'hasNextPage' in meta ? meta.hasNextPage : false

      return { messages: result, nextCursor, hasNextPage }
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? (lastPage.nextCursor ?? undefined) : undefined,
    staleTime: 30_000,
  })

  // ── Optimistic helpers ────────────────────────────────────

  /**
   * Prepend a new realtime message to the front of pages[0].
   * Called when socket emits `new_message` for this conversation.
   */
  const appendMessage = (message: Message) => {
    queryClient.setQueryData<typeof query.data>(
      messageQueryKey(conversationId),
      (old) => {
        if (!old) return old
        const newPages = [...old.pages] as MessagePage[]
        newPages[0] = {
          ...newPages[0],
          messages: [message, ...newPages[0].messages],
        }
        return { ...old, pages: newPages }
      },
    )
  }

  /**
   * Mark a single message as recalled across all pages.
   * Called when socket emits `message_recalled`.
   */
  const markRecalled = (messageId: string) => {
    queryClient.setQueryData<typeof query.data>(
      messageQueryKey(conversationId),
      (old) => {
        if (!old) return old
        return {
          ...old,
          pages: (old.pages as MessagePage[]).map((page) => ({
            ...page,
            messages: page.messages.map((m) =>
              m._id === messageId ? { ...m, isRecalled: true } : m,
            ),
          })),
        }
      },
    )
  }

  // ── Flatten pages into chronological order ────────────────
  // pages[0] = newest batch (newest-first within each page)
  // We reverse pages so oldest batch is first, then reverse each
  // batch so oldest message in that batch is first.
  // Result: allMessages[0] = oldest, allMessages[last] = newest.
  const allMessages: Message[] = (query.data?.pages ?? [])
    .slice()
    .reverse()
    .flatMap((p) => (p as MessagePage).messages.slice().reverse())

  return { ...query, allMessages, appendMessage, markRecalled }
}
