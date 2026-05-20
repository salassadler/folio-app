import { initTRPC, TRPCError } from '@trpc/server'
import type { Context } from './context.js'
import type { MembershipRole } from '@folio/db'
import { z } from 'zod'
import { getMembership } from '../domains/identity/membership.service.js'

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in.' })
  }
  return next({ ctx: { ...ctx, user: ctx.user } })
})

export const workshopProcedure = (allowedRoles: MembershipRole[]) => {
  return protectedProcedure
    .input(z.object({ workshopId: z.string().cuid() }))
    .use(async ({ ctx, input, next }) => {
      const membership = await getMembership(ctx.user.id, input.workshopId)
      if (!membership || !allowedRoles.includes(membership.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not authorized to access this workshop.',
        })
      }
      return next({ ctx: { ...ctx, workshopId: input.workshopId, membership } })
    })
}
