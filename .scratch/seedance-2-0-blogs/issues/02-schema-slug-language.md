# 02 — Composite unique (slug, language) on posts

**What to build:** Database posts can share one public slug across languages. After this ticket, inserting `seedance-2-0-overview` for `en` and `de` both succeeds, and lookups always include language.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] Postgres, MySQL, and SQLite blog schemas drop global `slug` unique
- [x] Composite unique index `idx_post_slug_language` on `(slug, language)`
- [x] `bun run sync-schema` and `bun run db:generate` produce a migration
- [x] ADR documents the decision
