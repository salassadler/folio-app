import { z } from 'zod'

export const MembershipRoleSchema = z.enum(['OWNER', 'MODERATOR', 'MEMBER', 'SUBSCRIBER'])

export const OrganizationSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(1000).nullable(),
  rules: z.string().max(2000).nullable(),
  isPublic: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const CreateOrganizationInputSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().max(1000).optional(),
  rules: z.string().max(2000).optional(),
  isPublic: z.boolean().default(false),
})

export const InviteMemberInputSchema = z.object({
  organizationId: z.string().cuid(),
  email: z.string().email(),
  role: MembershipRoleSchema.exclude(['OWNER']),
})

export type MembershipRole = z.infer<typeof MembershipRoleSchema>
export type Organization = z.infer<typeof OrganizationSchema>
export type CreateOrganizationInput = z.infer<typeof CreateOrganizationInputSchema>
export type InviteMemberInput = z.infer<typeof InviteMemberInputSchema>
