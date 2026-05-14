# ADR 006 — Zustand over Redux Toolkit

**Date:** 2026-05-14  
**Status:** Accepted

## Context

The SPA needs client-side state management for auth state, UI state (sidebar open/closed, active workshop session), and optimistic annotation state (before server confirmation).

## Decision

Use **Zustand v5** for global client state. React Query handles all server state (caching, invalidation, optimistic updates for server data).

## Rationale

- **Minimal boilerplate.** A Zustand store is a single function call. No actions, reducers, selectors, or provider setup. The entire auth store is ~20 lines of TypeScript.
- **React Query handles server state.** The most common argument for Redux is cache management and server state. React Query does this better than Redux for API data. Zustand is only needed for genuinely client-only state: auth tokens, UI toggles, local session state.
- **Selective subscriptions.** Components subscribe to specific slices of the store via selector functions, avoiding unnecessary re-renders. `useAuthStore(state => state.user)` only re-renders when `user` changes.
- **Persistence middleware.** Zustand's `persist` middleware serializes state to localStorage with a single option. The auth store persists the user object but not the access token (short-lived).
- **DevTools integration.** Zustand integrates with Redux DevTools via middleware for debugging state changes in development.

## Trade-offs

- **Less structure** than Redux Toolkit. Teams unfamiliar with Zustand can create stores that become difficult to reason about. Mitigated by keeping stores small and domain-specific.
- **No built-in time-travel debugging.** Redux's pure reducer model enables time-travel. This is not needed for Folio's state management requirements.

## Alternatives Considered

- **Redux Toolkit** — rejected; even RTK's reduced boilerplate is excessive for the amount of client-only state Folio requires. RTK Query duplicates React Query's functionality.
- **Jotai** — strong alternative; rejected in favor of Zustand's more familiar store pattern for onboarding new contributors.
- **React Context** — rejected for global state; Context re-renders all consumers on every update, which causes performance issues at scale.
