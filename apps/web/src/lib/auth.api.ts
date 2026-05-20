import type { User } from '@folio/shared'

export type RefreshSessionResponse = {
  user: User
  accessToken: string
}

let inflightRefresh: Promise<RefreshSessionResponse> | null = null

/** Deduplicates concurrent refresh calls (e.g. several queries 401 at once). */
export function refreshSessionOnce(): Promise<RefreshSessionResponse> {
  if (!inflightRefresh) {
    inflightRefresh = refreshSession().finally(() => {
      inflightRefresh = null
    })
  }
  return inflightRefresh
}

export async function refreshSession(): Promise<RefreshSessionResponse> {
  const res = await fetch('/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('Failed to refresh session')
  }
  return res.json() as Promise<RefreshSessionResponse>
}
