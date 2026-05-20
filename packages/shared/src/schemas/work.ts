import { z } from 'zod'

export const WorkStateSchema = z.enum([
  'DRAFT',
  'SUBMITTED',
  'CRITIQUE_OPEN',
  'IN_SESSION',
  'REVEAL',
  'REVISED',
  'PUBLISHED',
  'WITHDRAWN',
  'REJECTED',
])

export const WorkSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(200),
  genre: z.string().max(50).nullable(),
  tags: z.array(z.string().max(30)),
  state: WorkStateSchema,
  authorId: z.string().cuid(),
  workshopId: z.string().cuid().nullable(),
  coverImageUrl: z.string().url().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const CreateWorkInputSchema = z.object({
  title: z.string().min(1).max(200),
  genre: z.string().max(50).optional(),
  tags: z.array(z.string().max(30)).max(10).default([]),
  workshopId: z.string().cuid().optional(),
  content: z.record(z.unknown()), // Lexical editor JSON state
})

export const UpdateWorkInputSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(200).optional(),
  genre: z.string().max(50).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  content: z.record(z.unknown()).optional(),
})

export const WorkListQuerySchema = z.object({
  cursor: z.string().cuid().optional(),
  limit: z.number().int().min(1).max(50).default(20),
  workshopId: z.string().cuid().optional(),
  state: WorkStateSchema.optional(),
  genre: z.string().optional(),
  search: z.string().max(100).optional(),
})

export type WorkState = z.infer<typeof WorkStateSchema>
export type Work = z.infer<typeof WorkSchema>
export type CreateWorkInput = z.infer<typeof CreateWorkInputSchema>
export type UpdateWorkInput = z.infer<typeof UpdateWorkInputSchema>
export type WorkListQuery = z.infer<typeof WorkListQuerySchema>
