import { Prisma } from '@folio/db'
import { prisma } from '@folio/db'
import { hashPassword, verifyPassword } from './auth.password.js'
import {
  createRefreshToken,
  revokeAllRefreshTokensForUser,
  revokeRefreshToken,
  validateRefreshToken,
} from './auth.refresh.js'
import { generateAccessToken } from './auth.tokens.js'
import { toPublicUser } from './auth.user.js'
import type { User as PublicUser } from '@folio/shared'

export type AuthTokens = {
  user: PublicUser
  accessToken: string
  refreshToken: string
}

async function issueTokenPair(userId: string): Promise<AuthTokens> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
  return {
    user: toPublicUser(user),
    accessToken: generateAccessToken(userId),
    refreshToken: await createRefreshToken(userId),
  }
}

export async function register(email: string, password: string, name: string): Promise<AuthTokens> {
  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
        name,
      },
    })
    const tokens = await issueTokenPair(user.id)
    return tokens
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('Email already registered')
    }
    throw error
  }
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user?.passwordHash) {
    throw new Error('Invalid credentials')
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash)
  if (!isPasswordValid) {
    throw new Error('Invalid credentials')
  }

  return issueTokenPair(user.id)
}

export async function logout(refreshToken: string | undefined): Promise<void> {
  if (refreshToken) {
    await revokeRefreshToken(refreshToken)
  }
}

export async function refreshSession(refreshToken: string): Promise<AuthTokens> {
  const { userId } = await validateRefreshToken(refreshToken)
  await revokeRefreshToken(refreshToken)
  return issueTokenPair(userId)
}

export async function revokeAllForUser(userId: string): Promise<void> {
  await revokeAllRefreshTokensForUser(userId)
}
