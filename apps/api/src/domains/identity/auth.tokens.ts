import jwt, { type SignOptions } from 'jsonwebtoken'
import { parseDurationMs } from './auth.duration.js'

type AccessTokenPayload = {
  userId: string
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters')
  }
  return secret
}

export function generateAccessToken(userId: string): string {
  const expiresInSeconds = Math.floor(
    parseDurationMs(process.env.JWT_EXPIRES_IN ?? '15m', 15 * 60_000) / 1_000,
  )
  const options: SignOptions = { expiresIn: expiresInSeconds }
  return jwt.sign({ userId }, getJwtSecret(), options)
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, getJwtSecret()) as AccessTokenPayload
  if (!payload.userId) {
    throw new Error('Invalid access token')
  }
  return payload
}
