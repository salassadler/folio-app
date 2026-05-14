import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@folio/shared'

type AuthState = {
  user: User | null
  accessToken: string | null
  setAuth: (user: User, accessToken: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      clearAuth: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'folio-auth',
      // Only persist the user object, not the access token (short-lived)
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
