import { LoginInputSchema, RegisterInputSchema, UserSchema } from '@folio/shared'
import { TRPCError } from '@trpc/server'
import { protectedProcedure, publicProcedure, router } from '../../trpc/trpc.js'
import { clearRefreshCookie, REFRESH_COOKIE_NAME, setRefreshCookie } from './auth.cookies.js'
import * as authService from './auth.service.js'
import { toPublicUser } from './auth.user.js'

function mapAuthError(error: unknown): never {
  if (error instanceof Error) {
    if (error.message === 'Invalid credentials') {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: error.message })
    }
    if (error.message === 'Email already registered') {
      throw new TRPCError({ code: 'CONFLICT', message: error.message })
    }
    if (error.message === 'Unauthorized') {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' })
    }
  }
  throw error
}

export const identityRouter = router({
  register: publicProcedure.input(RegisterInputSchema).mutation(async ({ input, ctx }) => {
    try {
      const result = await authService.register(input.email, input.password, input.name)
      setRefreshCookie(ctx.res, result.refreshToken)
      return { user: result.user, accessToken: result.accessToken }
    } catch (error) {
      mapAuthError(error)
    }
  }),

  login: publicProcedure.input(LoginInputSchema).mutation(async ({ input, ctx }) => {
    try {
      const result = await authService.login(input.email, input.password)
      setRefreshCookie(ctx.res, result.refreshToken)
      return { user: result.user, accessToken: result.accessToken }
    } catch (error) {
      mapAuthError(error)
    }
  }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const refreshToken = ctx.req.cookies[REFRESH_COOKIE_NAME]
    await authService.logout(refreshToken)
    clearRefreshCookie(ctx.res)
    return { success: true as const }
  }),

  me: protectedProcedure.output(UserSchema).query(({ ctx }) => toPublicUser(ctx.user)),
})
