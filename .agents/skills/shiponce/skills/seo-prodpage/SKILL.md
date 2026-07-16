---
name: seo-prodpage
description: >
  ShipOnce production/preview SEO page acceptance for live public URLs: fetch
  real HTML, AI-judge against seo-operating-standard, write issue-type ledgers,
  and map fixes to routes/locale/head helpers. Use when auditing production or
  preview URLs, post-deploy SEO checks, multi-URL live scans, issue ledgers under
  tmp/seo-issues, or when the user runs /seo-prodpage, 线上 SEO 验收, 生产 URL 审查,
  or 扫一遍 indexable pages. Prefer over generic seo-page when the target is a
  live production/preview origin.
---

# SEO Prod Page Acceptance (seo-prodpage)

Focused ShipOnce skill for **production/preview public URL acceptance** and a
durable **issue ledger**. Parent `shiponce` remains project authority. The
mandatory standard is `../../references/seo-operating-standard.md` — never invent
a parallel rulebook.

**Naming vs `seo-page`:**

| Skill          | Intent                                                        |
| -------------- | ------------------------------------------------------------- |
| `seo-page`     | Generic single-page SEO analysis (any URL, incl. local)       |
| `seo-prodpage` | ShipOnce **live production/preview** HTML acceptance + ledger |

This skill is **not** a replacement for generic SEO specialties (`seo-page`,
`seo-audit`, `seo-hreflang`, `seo-content`, `seo-drift`, …). Use those for
strategy, SERP/GSC data, content quality depth, or single-page deep analysis.
Use **this** skill when the goal is: **probe live indexable URLs → group findings
by issue type → fix code → re-check**.

## Before anything else

1. Read (paths relative to this skill):
   - `../../references/seo-operating-standard.md` (authority)
   - `../../references/skill-routing.md` (when to hand off to generic SEO skills)
   - `references/acceptance-checklist.md` (executable gates)
   - `references/issue-format.md` (ledger shape)
2. Inspect tree: `git status --short`
3. Confirm the **base origin**. Prefer **production** or **post-deploy preview**.
   Localhost only when the user explicitly asks to accept a local preview build
   that mirrors production HTML.

If the user did not give a base URL, ask once. Do not invent domains.

## Ownership map (fix targets)

| Concern                       | Typical location                                        |
| ----------------------------- | ------------------------------------------------------- |
| App URL / production domain   | runtime config, `VITE_APP_URL`, `deploy.env`            |
| Head / metadata / JSON-LD     | root route, SEO/head helpers, page loaders              |
| Locales / messages            | `src/config/locale/**`, content / blog storage          |
| Sitemap / robots / llms       | public routes or generators under `src/` + `public/`    |
| Blog detail availableLocales  | blog models / server functions / content matrix         |
| Canonical + hreflang emission | shared head/SEO abstraction (fix once, not per page UI) |

Rules:

- Prefer fixing the **shared head/SEO boundary** over one-off page hacks
- Do not hand-edit `src/routeTree.gen.ts`
- Do not put Drizzle in React components
- Client-visible env stays `VITE_*`

## When to auto-select this skill

Select **`seo-prodpage`** as primary supporting skill when **any** of these match:

- User asks for 线上 SEO 验收 / 生产 URL 审查 / 部署后 SEO 检查 / indexable 扫描 / `/seo-prodpage`
- Post-deploy or preview URL acceptance for public pages (after `cf-deploy` probes)
- Whole-site or multi-URL checklist against **production/preview HTML**
- Need an **issue ledger** (`tmp/seo-issues/`) that can merge across runs
- Public SEO work is “done in code” and needs **live HTML acceptance**, not another brief

Do **not** select this skill when:

- Only writing a content brief, cluster plan, or keyword research → `seo-content-brief` / `seo-cluster` / `seo-dataforseo`
- Only GSC/CrUX/rank data → `seo-google` / `seo-dataforseo`
- Local-only single-page analysis or no live origin → `seo-page` is enough
- Deploy/env/SSR 500 / wrong target → `cf-deploy` first
- Authenticated/admin surfaces only → skip SEO skills

Announce: `seo-prodpage` (reason), then read this `SKILL.md` fully before auditing.

## Workflow

### 1. Scope

- **Base URL**: e.g. `https://example.com` (no trailing path required)
- **Mode**:
  - `smoke` — homepage + 1–3 key public routes + robots/sitemap/llms (default for post-deploy)
  - `matrix` — homepage, pricing, blog index, 2–3 blog details, one locale sample each
  - `full` — sitemap-driven crawl of indexable URLs (cap volume; say the cap)
- Never audit admin/account/API as indexable targets unless the user explicitly asks

### 2. Discover URLs (scripts OK; judgment not)

Allowed helpers:

```bash
# Same-origin internal links from one HTML page (discovery only)
bun .agents/skills/shiponce/skills/seo-prodpage/scripts/extract-internal-links.ts <url>

# Site maps and crawler files
curl -sS -D - '<origin>/robots.txt' -o /tmp/shiponce-robots.txt
curl -sS -D - '<origin>/sitemap.xml' -o /tmp/shiponce-sitemap.xml
curl -sS -D - '<origin>/llms.txt' -o /tmp/shiponce-llms.txt
```

Also use sitemap `<loc>` entries and locale-aware public routes known from the
repo. Deduplicate, normalize trailing-slash style, drop fragments and tracking
params for the audit set.

**Hard rule:** scripts may **fetch HTML and list URLs only**. Do **not** batch
“pass/fail” SEO via regex-only scripts and skip reading the page. Soft judgments
(title relevance, thin locale body, hreflang equivalence, content/meta mismatch)
require the agent to **read** HTML (and body text) against the standard.

### 3. Fetch each page

For every URL in scope:

```bash
curl -sS -D /tmp/shiponce-seo-headers.txt '<url>' -o /tmp/shiponce-seo-page.html
```

Record HTTP status, final URL after redirects, and whether HTML is full document
SSR (title/meta present in raw HTML) vs empty shell.

### 4. Judge against the checklist

Walk `references/acceptance-checklist.md` and
`../../references/seo-operating-standard.md`.

Severity:

| Level    | Meaning                              | Ship gate       |
| -------- | ------------------------------------ | --------------- |
| **错误** | Indexability/crawl foundation broken | Must fix (P0)   |
| **警告** | Weakens signals, CTR, or ops risk    | Should fix (P1) |
| **提示** | Enhancement only                     | Optional (P2)   |

ShipOnce-specific **fail conditions** (always 错误 when true):

- Indexable non-default locale URL serves default-language body
- `hreflang` invents missing locales or points missing `zh` / `zh-hant` at EN
- Published non-EN locale is a **thin stub** of EN (summary-only / dropped sections)
- SEO-critical metadata only appears after client JS (not in SSR HTML)
- Template residue: ShipAny, PhotoAI, localhost, example.com, TODO in public HTML
- `noindex` pages listed in sitemap, or robots/sitemap/meta robots conflict

### 5. Write the issue ledger

Output directory (default):

```text
tmp/seo-issues/<YYYY-MM-DD>/
```

Use `references/issue-format.md`. One **issue type** per file; merge URLs on
re-runs. Do not commit `tmp/seo-issues/` unless the user asks.

Each issue must include:

- Title + severity
- Rule citation (`seo-operating-standard` section and/or checklist id)
- Affected URLs
- Evidence (short HTML/header snippet or observation)
- Fix suggestion with **code boundary** (route, locale JSON, head helper, sitemap generator, …)

### 6. Fix loop (when the user wants fixes)

1. Group P0 issues by shared root cause
2. Prefer CodeGraph / existing SEO helpers before new abstractions
3. Change the smallest shared boundary
4. Re-fetch affected URLs
5. Update issue files (remove fixed URLs or mark resolved)
6. Oxc gate: `bun run format:check`, `bun run lint`, plus
   `bunx oxfmt --check <edited files>` when outside default format scope

After a clean acceptance pass on an existing public page, suggest
`seo-drift` baseline when a durable regression baseline is useful.

## Hand-off map

| Finding class                        | Next skill / action                      |
| ------------------------------------ | ---------------------------------------- |
| Deploy/env/SSR 500 / wrong CF target | `cf-deploy`                              |
| Auth only after deploy               | `auth` (+ `cf-deploy` if secrets)        |
| Single-page content/E-E-A-T depth    | `seo-content`                            |
| Schema-only deep validation          | `seo-schema`                             |
| Hreflang matrix design               | `seo-hreflang` + operating standard      |
| Full multi-specialty site health     | `seo-audit` (explicit full-site request) |
| Rank/SERP/GSC evidence               | `seo-google` / `seo-dataforseo`          |
| Pre/post change regression snapshot  | `seo-drift`                              |

## Non-goals

- Do not override `seo-operating-standard.md` with generic checklist folklore
  (e.g. force hreflang for missing locales, hard 50–60 title length as P0)
- Do not score vanity 1–10 numbers without transparent criteria
- Do not audit private dashboards by default
- Do not replace content writing skills with this acceptance pass
- Do not commit issue ledgers or `/tmp` HTML dumps unless asked

## Report back

- Base origin, mode (`smoke` | `matrix` | `full`), URL count
- Counts by severity (错误 / 警告 / 提示)
- Ledger path and new/updated issue files
- P0 root causes and whether code was fixed
- Validation commands if code changed
- Skills used or skipped (especially generic `seo-*`)
