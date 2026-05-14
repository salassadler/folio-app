# ADR 004 — Prisma over Raw SQL / Query Builders

**Date:** 2026-05-14  
**Status:** Accepted

## Context

We need a PostgreSQL data access layer. Options range from raw SQL, to query builders (Knex, Kysely), to full ORMs (Prisma, Drizzle).

## Decision

Use **Prisma v6** as the ORM with raw SQL escape hatches via `prisma.$queryRaw` for performance-critical queries.

## Rationale

- **Schema-first design:** Prisma's schema file is the single source of truth for the database structure. It generates the migration SQL, the TypeScript client types, and the ERD. This enforces thinking about the data model before writing queries — a senior engineering habit.
- **Type safety:** Prisma's generated client provides fully typed query results. A `findUnique` on `User` returns `User | null`, not `any`. This eliminates an entire class of runtime errors.
- **Migration system:** `prisma migrate dev` generates and tracks SQL migrations with version control. This is production-grade database management.
- **Developer experience:** Prisma Studio provides a visual DB browser for development, which speeds up debugging data issues.
- **Escape hatch:** For complex queries (full-text search, pgvector similarity, window functions), `prisma.$queryRaw<T>` allows raw SQL with TypeScript generics for the result type. We are not locked into Prisma's query API.

## Trade-offs

- **Performance overhead:** Prisma's query engine is a Rust binary that proxies queries. For very high-throughput applications, this adds latency. For Folio's expected load, this is not a concern.
- **N+1 risk:** Prisma's `include` for relations can generate N+1 queries if used carelessly. Mitigated by using `select` to shape queries and `$queryRaw` for batch reads.
- **Less flexible than query builders:** Drizzle or Kysely give more direct SQL control. For a learning project where schema clarity matters more than query flexibility, Prisma is the better trade-off.

## Alternatives Considered

- **Drizzle ORM** — strong alternative; rejected because its schema-first ergonomics are less clear for learning purposes (schema defined in TypeScript rather than a dedicated schema file).
- **Kysely** — excellent type-safe query builder; rejected because it requires writing more SQL by hand, which slows initial development.
- **Raw SQL (pg)** — rejected; no type safety and no migration system without additional tooling.
