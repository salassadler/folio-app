# ADR 002 — Fastify over Express

**Date:** 2026-05-14  
**Status:** Accepted

## Context

We need a Node.js HTTP server framework for the API. The two dominant options are Express (the industry default for years) and Fastify (the modern alternative).

## Decision

Use **Fastify v5**.

## Rationale

- **Performance:** Fastify is consistently 2–3× faster than Express in benchmarks due to its schema-based JSON serialization (ajv) and reduced middleware overhead. For a platform serving text content with frequent annotation reads and writes, this matters.
- **TypeScript-first:** Fastify has native TypeScript types and a typed plugin system. Express was designed for JavaScript and its types are community-maintained bolt-ons.
- **Plugin system:** Fastify's `fastify.register()` model with encapsulation scopes is safer than Express middleware chains — plugins cannot accidentally leak state into other parts of the app.
- **Schema validation:** Fastify supports JSON Schema for request/response validation out of the box. We use Zod + tRPC instead, but the framework's validation pipeline aligns with our approach.
- **Built-in logging:** Fastify uses Pino by default, which is the fastest Node.js logger and integrates natively with Datadog log correlation.

## Trade-offs

- **Smaller ecosystem** than Express. Some middleware libraries only target Express. This has not been a practical issue since all third-party integrations in this project (Stripe, Resend, Cloudinary) are SDK-based, not middleware-based.
- **Learning curve** for developers coming from Express — the plugin and decorator pattern is unfamiliar at first.

## Alternatives Considered

- **Express v5** — rejected due to TypeScript friction, slower performance, and no native Pino integration.
- **Hono** — considered but rejected; while excellent for edge runtimes, its Node.js adapter adds unnecessary complexity for a server-only deployment.
