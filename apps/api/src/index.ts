import { config } from 'dotenv'
import { dirname, resolve } from 'path'

// Load monorepo root .env (pnpm dev runs with cwd apps/api)
config({ path: resolve(dirname(__dirname), '../../../.env') })
export type { AppRouter } from './trpc/router.js'
import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { registerAuthRoutes } from './domains/identity/auth.routes.js'
import { createContext } from './trpc/context.js'
import { appRouter } from './trpc/router.js'

const server = Fastify({
  logger:
    process.env.NODE_ENV === 'development'
      ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
      : true,
})

async function bootstrap() {
  await server.register(fastifyHelmet)

  await server.register(fastifyCors, {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  })

  await server.register(fastifyCookie)

  await registerAuthRoutes(server)

  await server.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ path, error }: { path: string | undefined; error: Error }) {
        server.log.error({ path, error }, 'tRPC error')
      },
    },
  })

  server.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  const port = Number(process.env.API_PORT ?? 3001)
  const host = process.env.API_HOST ?? '0.0.0.0'

  await server.listen({ port, host })
}

bootstrap().catch((err) => {
  server.log.error(err)
  process.exit(1)
})
