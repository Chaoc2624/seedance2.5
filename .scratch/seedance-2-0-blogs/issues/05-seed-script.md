# 05 — Reproducible DB seed (no categories)

**What to build:** A `scripts/db` seed that upserts the three posts × eight languages into `post` with `status=published`, empty categories, correct `language`, shared slugs.

**Blocked by:** 02, 04

**Status:** done

- [x] Upsert key is `(slug, language)`
- [x] Categories left empty
- [x] Idempotent re-run
- [x] Admin Posts list shows rows; public list filters by locale
