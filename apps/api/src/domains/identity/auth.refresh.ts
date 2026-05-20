import { createHash, randomBytes } from 'node:crypto'
import { prisma } from '@folio/db'
import { getRefreshExpiresMs } from './auth.duration.js'

function hashRefreshToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}

/** Creates a DB-backed refresh token; returns the raw value for the httpOnly cookie. */
export async function createRefreshToken(userId: string): Promise<string> {
  const rawToken = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + getRefreshExpiresMs())

  await prisma.refreshToken.create({
    data: {
      userId,
      token: hashRefreshToken(rawToken),
      expiresAt,
    },
  })

  return rawToken
}

export async function validateRefreshToken(
  rawToken: string,
): Promise<{ userId: string; id: string }> {
  const record = await prisma.refreshToken.findUnique({
    where: { token: hashRefreshToken(rawToken) },
  })

  if (!record || record.revokedAt || record.expiresAt < new Date()) {
    throw new Error('Unauthorized')
  }

  return { userId: record.userId, id: record.id }
}

export async function revokeRefreshToken(rawToken: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token: hashRefreshToken(rawToken), revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

export async function revokeAllRefreshTokensForUser(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}
