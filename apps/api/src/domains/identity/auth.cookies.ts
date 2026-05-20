import type { FastifyReply } from 'fastify'
import { getRefreshMaxAgeSeconds } from './auth.duration.js'

export const REFRESH_COOKIE_NAME = 'folio_refresh'

export function setRefreshCookie(res: FastifyReply, rawToken: string): void {
  res.setCookie(REFRESH_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: getRefreshMaxAgeSeconds(),
  })
}

export function clearRefreshCookie(res: FastifyReply): void {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/' })
}
