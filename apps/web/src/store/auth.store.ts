import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@folio/shared'

type AuthState = {
  user: User | null
  accessToken: string | null
  setAuth: (user: SerializedUser, accessToken: string) => void
  clearAuth: () => void
}

/** tRPC JSON responses serialize dates as strings. */
type SerializedUser = Omit<User, 'createdAt' | 'updatedAt'> & {
  createdAt: string | Date
  updatedAt: string | Date
}

function toUser(user: User | SerializedUser): User {
  return {
    ...user,
    createdAt: user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt),
    updatedAt: user.updatedAt instanceof Date ? user.updatedAt : new Date(user.updatedAt),
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user: toUser(user), accessToken }),
      clearAuth: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'folio-auth',
      // Only persist the user object, not the access token (short-lived)
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
