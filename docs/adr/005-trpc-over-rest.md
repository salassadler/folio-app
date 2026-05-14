# ADR 005 — tRPC over Plain REST

**Date:** 2026-05-14  
**Status:** Accepted

## Context

We need an API contract between the Vite SPA and the Fastify server. Options include plain REST with OpenAPI, GraphQL, or tRPC.

## Decision

Use **tRPC v11** with the Fastify adapter on the server and the React Query integration on the client.

## Rationale

- **End-to-end type safety without code generation.** tRPC shares TypeScript types directly between the server router and the client. When a procedure's input or output type changes in the API, TypeScript errors appear immediately in the frontend — no build step, no schema sync, no OpenAPI spec to maintain.
- **Zero API contract drift.** With REST + OpenAPI or GraphQL, the spec can fall out of sync with the implementation. With tRPC, the spec _is_ the implementation — they are the same TypeScript types.
- **React Query integration.** `@trpc/react-query` wraps every tRPC procedure as a React Query query or mutation automatically. `trpc.works.list.useQuery()` is a fully typed React Query hook with loading, error, and data states.
- **Zod input validation.** tRPC procedures validate inputs with Zod schemas shared from `@folio/shared`. The same schema validates on the server and can be reused for client-side form validation.
- **Interview value.** "Explain how tRPC achieves end-to-end type safety" is a genuine senior interview question. The answer — shared TypeScript inference over a typed router, no code generation — demonstrates deep understanding of TypeScript's structural type system.

## Trade-offs

- **Not a standard protocol.** tRPC is not REST or GraphQL; external clients (mobile apps, third-party integrations) cannot consume it without a TypeScript client. For a future public API, a REST layer would be added alongside tRPC.
- **Learning curve.** Developers unfamiliar with tRPC need to understand the router/procedure model before contributing.
- **WebSocket and SSE bypass tRPC.** Socket.io connections and AI SSE streams connect directly to Fastify endpoints, not through tRPC. This is expected and documented — tRPC handles request/response operations; real-time connections use their native protocols.

## Alternatives Considered

- **REST + OpenAPI** — rejected; requires maintaining a spec file and running code generation to get type safety.
- **GraphQL** — considered; provides flexible querying but adds resolver complexity, schema stitching, and N+1 problems for a relatively simple domain. tRPC delivers the type safety benefit without the GraphQL overhead.
