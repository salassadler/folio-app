import { z } from 'zod'

export const CursorPaginationSchema = z.object({
  cursor: z.string().cuid().optional(),
  limit: z.number().int().min(1).max(50).default(20),
})

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().cuid().nullable(),
    hasMore: z.boolean(),
  })

export type CursorPagination = z.infer<typeof CursorPaginationSchema>
