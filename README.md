# Folio

A literary workshop and publishing platform. Writers submit poems, essays, and stories to critique groups, receive anonymous inline annotations from peers, and publish polished work publicly.

## Tech Stack

| Layer    | Technology                                    |
| -------- | --------------------------------------------- |
| Frontend | Vite + React 19 + TypeScript + React Router 7 |
| API      | Fastify 5 + tRPC 11 + TypeScript              |
| Database | PostgreSQL 16                                 |
| ORM      | Prisma 6                                      |

**Planned additions** (later phases): Redis + BullMQ, Socket.io real-time, Stripe subscriptions, Cloudinary, OpenAI, Datadog APM.

## Project Structure

```
folio/
├── apps/
│   ├── api/          # Fastify server — tRPC, domain logic
│   └── web/          # Vite SPA — React, React Query, Zustand, Lexical editor
├── packages/
│   ├── db/           # Prisma schema, migrations, seed
│   └── shared/       # Zod schemas and domain types shared between apps
├── docs/
│   └── adr/          # Architecture Decision Records
├── docker-compose.yml
└── .env.example
```

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 9 — `npm install -g pnpm`
- [Docker](https://www.docker.com/) (for PostgreSQL)

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/salassadler/folio-app.git
cd folio
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

For local development the database value is pre-filled to match Docker Compose. The only key you need to add is:

```env
JWT_SECRET="any-string-at-least-32-chars-long"
```

### 3. Start the database

```bash
docker compose up -d
```

### 4. Run migrations and seed

```bash
pnpm db:migrate    # applies Prisma migrations
pnpm db:seed       # creates two test users and a sample workshop
```

The seed output prints the user IDs you need for local development:

```
Seeded:
  - Users: alice@folio.dev, bob@folio.dev (password: password123)
  - Workshop: "Midnight Ink" (slug: midnight-ink)

Use X-Dev-User-Id header in dev:
  alice: clxxxxxxxxxxxxxx
  bob:   clxxxxxxxxxxxxxx
```

### 5. Start the development servers

```bash
pnpm dev
```

| Service          | URL                                                          |
| ---------------- | ------------------------------------------------------------ |
| Web app          | [http://localhost:5173](http://localhost:5173)               |
| API              | [http://localhost:3001](http://localhost:3001)               |
| API health check | [http://localhost:3001/health](http://localhost:3001/health) |

## Development Workflow

### Authentication bypass

Auth is not built yet (Phase 2). In development, skip JWT by passing the `X-Dev-User-Id` header with any seeded user's ID:

```bash
curl http://localhost:3001/trpc/ping   -H "X-Dev-User-Id: <alice-id-from-seed-output>"
```

In REST clients (Bruno, Insomnia, Postman), set `X-Dev-User-Id` as a default header on the dev environment and forget about it.

### Available commands

```bash
# Development
pnpm dev              # start API + web concurrently
pnpm typecheck        # TypeScript checks across all packages

# Code quality
pnpm lint             # ESLint
pnpm lint:fix         # ESLint with auto-fix
pnpm format           # Prettier
pnpm format:check     # check formatting without writing

# Testing
pnpm test             # run all tests

# Database
pnpm db:migrate       # run pending migrations
pnpm db:seed          # seed test data
pnpm db:generate      # regenerate Prisma client after schema changes
pnpm db:studio        # open Prisma Studio at http://localhost:5555

# Build
pnpm build            # build all packages and apps
```

### Changing the schema

1. Edit `packages/db/prisma/schema.prisma`
2. Run `pnpm db:migrate` — Prisma will prompt for a migration name
3. Run `pnpm db:generate` — regenerates the TypeScript client
4. Restart the API dev server

## Architecture

The app is a **Vite SPA + Fastify monolith** in a pnpm monorepo. The frontend calls the API exclusively via tRPC. See [docs/adr/](./docs/adr/) for the reasoning behind every technology choice.

### Domain structure (API)

```
apps/api/src/
├── domains/
│   ├── identity/       # users, auth, memberships
│   ├── workshop/       # works, versions, critique rounds, annotations
│   ├── publishing/     # publications
│   └── notifications/
├── infrastructure/
│   ├── email/          # Resend (Phase 6)
│   └── storage/        # Cloudinary (Phase 3)
├── interfaces/
│   ├── http/           # tRPC route handlers
│   ├── websocket/      # Socket.io handlers (Phase 5)
│   └── jobs/           # background jobs (Phase 4)
└── trpc/
    ├── context.ts      # request context (user, req, res)
    ├── router.ts       # root router
    └── trpc.ts         # publicProcedure and protectedProcedure
```

## Environment Variables

| Variable                   | Required | Description                                     |
| -------------------------- | -------- | ----------------------------------------------- |
| `DATABASE_URL`             | Yes      | PostgreSQL connection string                    |
| `JWT_SECRET`               | Phase 2  | Min 32 chars, signs access tokens               |
| `JWT_EXPIRES_IN`           | No       | Access token TTL, default `15m`                 |
| `REFRESH_TOKEN_EXPIRES_IN` | No       | Refresh token TTL, default `7d`                 |
| `CORS_ORIGIN`              | No       | Allowed origin, default `http://localhost:5173` |
| `CLOUDINARY_*`             | Phase 3  | Image storage                                   |
| `RESEND_API_KEY`           | Phase 6  | Transactional email                             |
| `STRIPE_*`                 | Phase 6  | Payments                                        |
| `OPENAI_API_KEY`           | Phase 7  | AI features                                     |
| `DD_*`                     | Phase 9  | Datadog monitoring                              |

## Stopping services

```bash
docker compose down        # stop containers, keep data
docker compose down -v     # stop containers and delete all data
```
