import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@folio/api'

export const trpc = createTRPCReact<AppRouter>()
