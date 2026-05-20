import { refreshSessionOnce } from '@/lib/auth.api'
import { trpc } from '@/lib/trpc'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@folio/shared'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuthSession(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthSession must be used within AuthProvider')
  }
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const [isLoading, setIsLoading] = useState(true)
  const utils = trpc.useUtils()

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const { accessToken: token, setAuth, clearAuth } = useAuthStore.getState()

      try {
        if (token) {
          const me = await utils.identity.me.fetch()
          if (!cancelled) setAuth(me, token)
          return
        }

        const session = await refreshSessionOnce()
        if (!cancelled) setAuth(session.user, session.accessToken)
      } catch {
        if (!cancelled) clearAuth()
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    const run = () => {
      void bootstrap()
    }

    if (useAuthStore.persist.hasHydrated()) {
      run()
    } else {
      return useAuthStore.persist.onFinishHydration(run)
    }

    return () => {
      cancelled = true
    }
  }, [utils])

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
  }

  if (isLoading) {
    return null
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
