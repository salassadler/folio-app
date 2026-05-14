# ADR 003 — Lexical over Tiptap/Slate

**Date:** 2026-05-14  
**Status:** Accepted

## Context

The core of Folio is a rich text editor where writers compose and submit their work. Readers annotate that work inline at character-level ranges. We need an editor framework that supports custom annotation nodes, is MIT licensed, and is actively maintained.

## Decision

Use **Lexical** (Meta, MIT license).

## Rationale

- **Fully MIT licensed.** Tiptap's core is MIT, but its collaboration and comments extensions — which are closest to what we're building — are paid. Lexical has no paid tier; the entire project is open source.
- **Maintained by Meta.** Lexical powers Facebook, Instagram, and WhatsApp's text editing surfaces. It receives consistent maintenance and is not at risk of abandonment.
- **Plugin architecture via Nodes.** Lexical's `DecoratorNode` model is a natural fit for annotation marks — each annotation is a node in the editor state that stores its annotation ID, range, and rendering metadata.
- **Immutable state model.** Lexical's state is immutable and updated via `editor.update()` transactions. This makes it easier to implement auto-save (diff the state hash, only save if changed) and conflict detection.
- **TypeScript-first.** Lexical's type definitions are part of the core package.

## Trade-offs

- **Steeper learning curve** than Tiptap. Lexical is more low-level — you compose behavior from primitives rather than configuring pre-built extensions. This requires more upfront work but produces a more tailored result.
- **Less documentation** than Tiptap for non-Meta use cases. The Meta-specific usage patterns dominate the docs.

## Alternatives Considered

- **Tiptap v2** — rejected because the annotation/comments extension we need most is behind the Pro paywall.
- **Slate.js** — rejected; development has been slow and the API has breaking changes frequently.
- **ProseMirror directly** — considered; Lexical is built on similar principles and provides a higher-level API without the ProseMirror-specific schema complexity.
