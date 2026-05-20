import { useAuthStore } from '@/store/auth.store'

/** tRPC httpBatchLink fetch: sends cookies + Bearer when we have an access token. */
export const trpcFetch: typeof fetch = (input, init) => {
  const headers = new Headers(init?.headers)
  const token = useAuthStore.getState().accessToken
  if (token) {
    headers.set('authorization', `Bearer ${token}`)
  }
  return fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  })
}
