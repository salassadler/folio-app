# ADR 007 — Row-Level Multi-tenancy over Schema-per-Tenant

**Date:** 2026-05-14  
**Status:** Accepted

## Context

Folio is multi-tenant: each Workshop (Organization) is an isolated environment with its own members, works, and critique rounds. We must decide how to isolate tenant data in PostgreSQL.

The two main strategies are:

1. **Row-level tenancy:** All tenants share the same tables. Every row has an `organization_id` foreign key. Queries filter by `organization_id`.
2. **Schema-per-tenant:** Each tenant gets its own PostgreSQL schema (namespace). Tables are duplicated per schema.

## Decision

Use **row-level tenancy** with `organization_id` on all relevant tables.

## Rationale

- **Operational simplicity.** Row-level tenancy means one schema, one migration, one connection pool. Schema-per-tenant requires running migrations across N schemas when the data model changes.
- **Connection pooling.** PgBouncer pools connections across all tenants to a single database. Schema-per-tenant requires either a connection pool per tenant or complex `SET search_path` logic.
- **Prisma compatibility.** Prisma does not natively support schema-per-tenant. Implementing it requires raw SQL and manual schema management outside Prisma's migration system.
- **Scale characteristics.** Schema-per-tenant is worth the complexity when tenants need physical data isolation (regulated industries, contractual data residency requirements). Folio has no such requirements at this stage.
- **Query enforcement.** The application layer enforces tenant isolation: every service function receives the `organizationId` from the authenticated user's context and passes it to every query. This is verified in integration tests.

## Trade-offs

- **Accidental data leakage risk.** If a service function forgets to filter by `organization_id`, it could return rows from other organizations. Mitigated by: (1) keeping `organizationId` in the tRPC context and passing it explicitly, (2) integration tests that assert cross-tenant isolation, (3) PostgreSQL Row Level Security (RLS) as a future hardening step.
- **Noisy neighbor risk.** A single large tenant running heavy queries could degrade performance for others. Mitigated by query timeouts and index strategy.

## Alternatives Considered

- **Schema-per-tenant** — rejected for the reasons above. Would be reconsidered if Folio needed to offer dedicated database instances to enterprise customers.
- **Database-per-tenant** — rejected; operationally untenable for a small team and not required by Folio's isolation requirements.
