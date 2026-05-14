import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: (failureCount, error) => {
        // Do not retry on 4xx errors
        if (error && typeof error === 'object' && 'data' in error) {
          const status = (error as { data?: { httpStatus?: number } }).data?.httpStatus
          if (status && status >= 400 && status < 500) return false
        }
        return failureCount < 2
      },
    },
  },
})
