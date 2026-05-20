import type { AppRouter } from '@folio/api'
import { TRPCClientError, type TRPCLink } from '@trpc/client'
import type { Unsubscribable } from '@trpc/server/observable'
import { observable } from '@trpc/server/observable'
import { refreshSessionOnce } from './auth.api'
import { useAuthStore } from '@/store/auth.store'

/** Public procedures — UNAUTHORIZED here must not trigger a refresh attempt. */
const PUBLIC_PATHS = new Set(['ping', 'identity.login', 'identity.register'])

function isUnauthorized(error: unknown): boolean {
  return error instanceof TRPCClientError && error.data?.code === 'UNAUTHORIZED'
}

export const trpcRefreshLink: TRPCLink<AppRouter> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      let subscription: Unsubscribable | undefined

      const forward = (isRetry: boolean) => {
        subscription?.unsubscribe()
        subscription = next(op).subscribe({
          next(value) {
            observer.next(value)
          },
          error(error) {
            const canRefresh = !isRetry && !PUBLIC_PATHS.has(op.path) && isUnauthorized(error)

            if (!canRefresh) {
              observer.error(error)
              return
            }

            void refreshSessionOnce()
              .then(({ user, accessToken }) => {
                useAuthStore.getState().setAuth(user, accessToken)
                forward(true)
              })
              .catch(() => {
                useAuthStore.getState().clearAuth()
                observer.error(error)
              })
          },
          complete() {
            observer.complete()
          },
        })
      }

      forward(false)

      return () => {
        subscription?.unsubscribe()
      }
    })
  }
}
