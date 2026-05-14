import { z } from 'zod'

export const AnnotationSchema = z.object({
  id: z.string().cuid(),
  workVersionId: z.string().cuid(),
  critiqueRoundId: z.string().cuid().nullable(),
  authorId: z.string().cuid(),
  pseudonym: z.string().nullable(),
  startOffset: z.number().int().min(0),
  endOffset: z.number().int().min(0),
  quote: z.string().max(500),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const CreateAnnotationInputSchema = z.object({
  workVersionId: z.string().cuid(),
  critiqueRoundId: z.string().cuid().optional(),
  startOffset: z.number().int().min(0),
  endOffset: z.number().int().min(0),
  quote: z.string().min(1).max(500),
  initialComment: z.string().min(1).max(2000).optional(),
})

export const CreateThreadReplyInputSchema = z.object({
  annotationId: z.string().cuid(),
  content: z.string().min(1).max(2000),
})

export type Annotation = z.infer<typeof AnnotationSchema>
export type CreateAnnotationInput = z.infer<typeof CreateAnnotationInputSchema>
export type CreateThreadReplyInput = z.infer<typeof CreateThreadReplyInputSchema>
