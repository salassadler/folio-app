import { MembershipRole } from '@folio/db'
import { CreateWorkshopInputSchema, WorkshopSchema } from '@folio/shared'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { router, protectedProcedure, workshopProcedure } from '../../trpc/trpc.js'
import { toPublicWorkshop } from './workshop.public.js'
import * as workshopService from './workshop.service.js'

function mapWorkshopError(error: unknown): never {
  if (error instanceof Error) {
    if (error.message === 'Workshop not found') {
      throw new TRPCError({ code: 'NOT_FOUND', message: error.message })
    }
    if (error.message === 'Slug already in use') {
      throw new TRPCError({ code: 'CONFLICT', message: error.message })
    }
  }
  throw error
}

export const workshopRouter = router({
  createWorkshop: protectedProcedure
    .input(CreateWorkshopInputSchema)
    .output(WorkshopSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const workshop = await workshopService.createWorkshop(ctx.user.id, input)
        return toPublicWorkshop(workshop)
      } catch (error) {
        mapWorkshopError(error)
      }
    }),

  getWorkshop: workshopProcedure([
    MembershipRole.OWNER,
    MembershipRole.MODERATOR,
    MembershipRole.MEMBER,
  ])
    .output(WorkshopSchema)
    .query(async ({ input }) => {
      try {
        const workshop = await workshopService.getWorkshop(input.workshopId)
        return toPublicWorkshop(workshop)
      } catch (error) {
        mapWorkshopError(error)
      }
    }),

  updateWorkshop: workshopProcedure([MembershipRole.OWNER, MembershipRole.MODERATOR])
    .input(CreateWorkshopInputSchema)
    .output(WorkshopSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const workshop = await workshopService.updateWorkshop(ctx.workshopId, input)
        return toPublicWorkshop(workshop)
      } catch (error) {
        mapWorkshopError(error)
      }
    }),

  deleteWorkshop: workshopProcedure([MembershipRole.OWNER])
    .output(WorkshopSchema)
    .mutation(async ({ ctx }) => {
      try {
        const workshop = await workshopService.deleteWorkshop(ctx.workshopId)
        return toPublicWorkshop(workshop)
      } catch (error) {
        mapWorkshopError(error)
      }
    }),

  listWorkshops: protectedProcedure.output(z.array(WorkshopSchema)).query(async ({ ctx }) => {
    const workshops = await workshopService.listWorkshopsForUser(ctx.user.id)
    return workshops.map(toPublicWorkshop)
  }),
})
