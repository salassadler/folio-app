import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'
import { prisma } from '@folio/db'
import type { User } from '@folio/db'
import { verifyAccessToken } from '../domains/identity/auth.tokens.js'

export type Context = {
  req: CreateFastifyContextOptions['req']
  res: CreateFastifyContextOptions['res']
  user: User | null
}

export async function createContext({ req, res }: CreateFastifyContextOptions): Promise<Context> {
  let user: User | null = null

  // ── Development bypass ───────────────────────────────────────────────────
  // Set X-Dev-User-Id header to skip JWT verification during development.
  // Never active in production — guarded by NODE_ENV check.
  if (process.env.NODE_ENV !== 'production') {
    const devUserId = req.headers['x-dev-user-id']
    if (typeof devUserId === 'string' && devUserId) {
      user = await prisma.user.findUnique({ where: { id: devUserId } })
    }
  }

  if (!user) {
    const authHeader = req.headers.authorization
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      try {
        const { userId } = verifyAccessToken(authHeader.slice(7))
        user = await prisma.user.findUnique({ where: { id: userId } })
      } catch {
        // Invalid or expired access token — leave user null
      }
    }
  }

  return { req, res, user }
}
