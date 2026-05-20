import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { httpBatchLink } from '@trpc/client'
import { trpc } from './lib/trpc'
import { queryClient } from './lib/queryClient'
import { router } from './router'
import { trpcFetch } from './lib/trpcClient'
import { trpcRefreshLink } from './lib/trpcRefreshLink'
import { AuthProvider } from './providers/AuthProvider'

const trpcClient = trpc.createClient({
  links: [
    trpcRefreshLink,
    httpBatchLink({
      url: '/trpc',
      fetch(url, options) {
        return trpcFetch(url, options as RequestInit | undefined)
      },
    }),
  ],
})

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </trpc.Provider>
  </StrictMode>,
)
