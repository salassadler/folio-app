import { router, publicProcedure } from './trpc.js'

// Domain routers are imported and merged here as they are built phase by phase.
import { identityRouter } from '../domains/identity/identity.router.js'
import { workshopRouter } from '../domains/workshop/workshop.router.js'
// import { publishingRouter } from '../domains/publishing/publishing.router.js'
// import { aiRouter } from '../domains/ai/ai.router.js'

export const appRouter = router({
  ping: publicProcedure.query(() => ({ status: 'ok' as const })),

  identity: identityRouter,
  workshop: workshopRouter,
  // publishing: publishingRouter,
  // ai: aiRouter,
})

export type AppRouter = typeof appRouter
