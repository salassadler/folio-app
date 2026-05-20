import type { FastifyInstance } from 'fastify'
import { clearRefreshCookie, REFRESH_COOKIE_NAME, setRefreshCookie } from './auth.cookies.js'
import * as authService from './auth.service.js'

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  app.post('/auth/refresh', async (req, reply) => {
    const refreshToken = req.cookies[REFRESH_COOKIE_NAME]
    if (!refreshToken) {
      return reply.status(401).send({ error: 'Missing refresh token' })
    }

    try {
      const result = await authService.refreshSession(refreshToken)
      setRefreshCookie(reply, result.refreshToken)
      return { user: result.user, accessToken: result.accessToken }
    } catch {
      clearRefreshCookie(reply)
      return reply.status(401).send({ error: 'Invalid or expired refresh token' })
    }
  })
}
