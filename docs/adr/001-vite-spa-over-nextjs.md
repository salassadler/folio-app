# ADR 001 — Vite SPA over Next.js

**Date:** 2026-05-14  
**Status:** Accepted

## Context

Folio is a highly interactive application. The core user surfaces are a rich text editor (Lexical), a real-time collaborative annotation session (Socket.io), and a presence-aware workshop room. These surfaces require `useState`, `useEffect`, WebSocket hooks, and direct DOM access — they cannot meaningfully be server-rendered.

The question was whether to use Next.js App Router (RSC + SSR) or a plain Vite SPA with a dedicated Fastify backend.

## Decision

Use **Vite + React** as a pure client-side SPA. All API calls go to the Fastify server over tRPC.

## Rationale

- Roughly 70% of the application's complexity lives in interactive client components (editor, workshop sessions, annotation viewer, auth flows). Next.js would add RSC/client component boundary management without proportional benefit for these surfaces.
- A dedicated Fastify server already handles WebSockets (Socket.io) and SSE streaming for AI responses. Next.js Route Handlers do not support persistent connections, so a second server would be required regardless.
- Running two servers (Next.js + Fastify) with two different "where does this run?" mental models slows development. A single Fastify backend with a single SPA frontend is one clear mental model.
- The clean client/server separation makes the architecture easier to reason about, test, and explain in system design interviews.

## Trade-offs

- **No SSR/SEO** for public reading pages and writer profiles. This is an acceptable trade-off for a learning project; SEO would be addressed with a CDN-level or static pre-rendering strategy in production.
- **No RSC experience** from this project. This is mitigated by the fact that RSC is a concept that can be learned in isolation (it does not require building a full app to understand).

## Alternatives Considered

- **Next.js 15 App Router** — rejected because the interactive nature of Folio means most pages would be client components regardless.
- **Next.js + thin Fastify real-time server** — rejected because it still requires managing two servers and two deployment configurations.
