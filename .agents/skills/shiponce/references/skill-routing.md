# Cross-Skill Routing Reference

Use this reference to select supporting skills for shiponce work. `shiponce`
remains the project authority for repository structure, implementation patterns,
and validation. Supporting skills add a focused workflow; they do not override
project rules.

## Routing Contract

1. Classify the current phase by goal, scope, audience, uncertainty, and evidence
   needs.
2. Select one primary supporting skill for the phase and at most two supporting
   skills. Do not load every potentially relevant skill.
3. Announce the selected skills and why they apply. Read each selected
   `SKILL.md` fully before following it.
4. Complete the phase, verify its output, then route the next phase separately.
5. Report unavailable skills, credentials, live data, skipped checks, partial
   failures, and retry exhaustion. Never invent rankings, traffic, or index data.

Common aliases:

- `taste-skill v2` refers to the installed `design-taste-frontend` skill.
- `output-skill` refers to the installed `full-output-enforcement` skill.
- `batch-grill-me` is Matt Pocock's frontier-batch interview (rounds of
  independent questions); prefer it over serial `grill-me` / `grilling` for
  multi-decision plans unless the user asks to go one question at a time.

Use the installed name when invoking a skill.

## First Decision

| Question                                                                | Route when true                                                 | Route when false        |
| ----------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------- |
| Is the request a small/routine ambiguity (few blocking choices)?        | Built-in `how-to-ask-question` (≤5 questions; shiponce default) | Continue                |
| Is this a multi-decision plan/design tree with several tradeoffs?       | `batch-grill-me` (default grill path)                           | Continue                |
| Does the design also need glossary / ADRs / durable domain docs?        | `grill-with-docs` (+ `domain-modeling` as it already does)      | Continue                |
| Are domain terms, states, roles, or rules tangled (without full grill)? | `domain-modeling`                                               | Continue                |
| Is the page public, indexable, and intended for organic acquisition?    | Select one SEO primary skill                                    | Skip SEO                |
| Does the change create or alter user-facing UI?                         | Select one design primary skill                                 | Skip design skills      |
| Is this a bug, regression, or unstable behavior?                        | `diagnosing-bugs`, then `tdd` for the fix                       | Treat as feature work   |
| Is the implementation complete?                                         | `output-skill`, then `code-review`                              | Continue implementation |

## Phase Order

Use only the phases needed by the request:

```text
scope and domain
-> search intent and content structure (public SEO pages only)
-> visual and interaction design (UI work only)
-> implementation and behavioral tests
-> completeness, code, and SEO acceptance
-> deployment regression monitoring (public SEO pages only)
```

### Scope and Domain

Clarify before designing or implementing. Pick **one** grill path; do not stack
serial and batch grills in the same phase.

| Situation                                                                 | Skill                                               |
| ------------------------------------------------------------------------- | --------------------------------------------------- |
| Small request, a few blocking choices only                                | Built-in `how-to-ask-question` (auto; ≤5 at a time) |
| Multi-decision plan/design; several independent tradeoffs                 | `batch-grill-me`                                    |
| Same as above, but also need glossary / ADRs / CONTEXT as you go          | `grill-with-docs`                                   |
| User explicitly wants one question per turn                               | `grill-me` → runs `/grilling`                       |
| Conflicting domain vocabulary, states, permissions, payments, credits, AI | `domain-modeling` (alone or after a grill)          |
| Shared understanding reached; need a durable written spec                 | `to-spec`                                           |
| Multi-module, multi-session, or coordinated delivery                      | `to-tickets`                                        |
| Uncertain interaction or state model                                      | `prototype` before production work                  |

**Grill path notes:**

- `batch-grill-me` maps a **design tree** and asks the whole **frontier** each
  round (every question whose prerequisites are already settled), with a
  recommended answer per question, then waits. Use sub-agents for facts; only
  decisions go to the user. Prefer this for complex ShipOnce features when the
  user has not asked for serial grilling.
- `grill-with-docs` = `/grilling` + `/domain-modeling`. Keep it when durable
  domain docs matter (payments, credits, RBAC, AI task pipelines, multi-context
  products).
- `grill-me` / `grilling` stay available for serial, one-at-a-time interviews.
  Do not default to them for multi-decision trees; they are slower than
  `batch-grill-me` for the same tree.
- `how-to-ask-question` remains the automatic bar for ordinary ambiguity. Do
  not escalate every missing detail into a full grill session.
- `grill-me`, `batch-grill-me`, and `grill-with-docs` set
  `disable-model-invocation: true` — load them when routing (or when the user
  invokes `/batch-grill-me`, `/grill-me`, `/grill-with-docs`). Do not wait for
  the model to “auto-discover” them mid-implementation.
- After any grill path, do not implement until the user confirms shared
  understanding.

Do not create a specification or ticket set for a small, already-defined edit.

### SEO and Content

For every ShipOnce SEO, GEO, metadata, multilingual indexability, sitemap,
crawler-facing file, JSON-LD, blog/detail SEO, or indexation task, first read
`references/seo-operating-standard.md`. It is a mandatory project reference,
not a supporting skill, and does not count toward the skill limit.

When reviewing blog/detail multilingual SEO, treat missing `zh` / `zh-hant`
as a **content priority** decision for outbound SaaS — not as a license to
skip acceptance. Fail the review if hreflang invents Chinese alternates that
point at EN, if a localized URL serves default-language body, or if a
published non-EN locale is a **thin stub** of EN (summary-only length /
dropped FAQ, tables, or how-to sections). Prefer unpublishing thin locales
over shipping them under hreflang.

Use `seo-router` when the correct SEO specialty is unclear. Otherwise route
directly:

| Goal                                                                 | Primary skill           | Add only when needed                                                        |
| -------------------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------- |
| Live production/preview URL acceptance, multi-URL scan, issue ledger | `seo-prodpage` (nested) | `seo-page` for local/single-page analysis; `cf-deploy` if SSR/env is broken |
| Full-site multi-specialty health audit                               | `seo-audit`             | `seo-google` for first-party data; `seo-prodpage` for live HTML ledger      |
| One page or URL review                                               | `seo-page`              | `seo-content`, `seo-schema`, `seo-images`, or `seo-technical`               |
| New article or page brief                                            | `seo-content-brief`     | `seo-dataforseo` for live localized SERP/keyword data                       |
| Existing content quality, E-E-A-T, or AI citation readiness          | `seo-content`           | `seo-geo` when AI search is central                                         |
| Why a page does not rank or page type mismatches intent              | `seo-sxo`               | `seo-dataforseo` for live SERP evidence                                     |
| Crawl, index, canonical, robots, rendering, or CWV                   | `seo-technical`         | `seo-google` for GSC/CrUX/PageSpeed evidence                                |
| Schema or JSON-LD                                                    | `seo-schema`            | `seo-ecommerce` for product pages                                           |
| Topic clusters and content architecture                              | `seo-cluster`           | `seo-content-brief` per target page                                         |
| Multilingual or regional SEO                                         | `seo-hreflang`          | `seo-sitemap`                                                               |
| Programmatic pages                                                   | `seo-programmatic`      | `seo-content` for thin-content risk                                         |
| AI search visibility                                                 | `seo-geo`               | `seo-content`                                                               |
| Images, alt text, formats, dimensions, or CLS                        | `seo-images`            | `seo-image-gen` only for new assets                                         |
| Deployment or on-page regression                                     | `seo-drift`             | `seo-technical` for technical findings; `seo-prodpage` after deploy         |

Data boundaries:

- Use `seo-google` for GSC, URL Inspection, GA4, PageSpeed, and CrUX.
- Use `seo-dataforseo` for live SERPs, keyword volume, rankings, and competitor
  data.
- Use `seo-maps` for map and local-rank evidence.
- State the limitation when credentials or live-data access are unavailable.

### Design and Frontend

| Goal                                              | Primary skill                | Optional support                    |
| ------------------------------------------------- | ---------------------------- | ----------------------------------- |
| New page or interface                             | `taste-skill v2`             | One matching style skill            |
| Existing UI redesign                              | `redesign-existing-projects` | `taste-skill v2` for implementation |
| Screenshot, Figma, or visual reference            | `image-to-code`              | `taste-skill v2`                    |
| Generate a visual direction before implementation | `imagegen-frontend-web`      | `taste-skill v2`                    |
| New brand identity                                | `brandkit`                   | `taste-skill v2`                    |

Use at most one style skill:

- `minimalist-ui` for restrained SaaS, tools, and content-heavy SEO pages.
- `soft-skill` for softer AI, productivity, and B2B experiences.

Skip design skills for server-only changes unless visible behavior also changes.
Preserve the SEO content hierarchy when redesigning a public page.

### Engineering and Verification

- New or changed business behavior: `tdd` when behavior can regress.
- Hard-to-reproduce bug: `diagnosing-bugs`, then `tdd`.
- Module, service, provider, or task-pipeline redesign: `codebase-design`, with
  `improve-codebase-architecture` only for a broader architecture audit.
- Completed UI or multi-section deliverable: `output-skill`.
- Completed implementation: `code-review`.

`output-skill` and `code-review` do not replace behavioral tests or the Oxc
validation required by `shiponce`.

### ShipOnce Domain Skills

These live under `.agents/skills/shiponce/skills/` and count as supporting
skills. They do not override parent `shiponce` Non-Negotiables.

| Goal                                                                                                | Primary skill  | Add only when needed                                                        |
| --------------------------------------------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------- |
| Cloudflare Pages/Worker deploy, `deploy.sh` / `deploy.env`, wrangler preview, post-deploy env drift | `cf-deploy`    | `auth` when login/session fails only after CF secrets/CPU issues surface    |
| Better Auth sign-in/up, get-session, OAuth, AUTH_SECRET, credential hashes, init-admin, RBAC gates  | `auth`         | `cf-deploy` when the failure is deploy target or missing CF runtime secrets |
| Live production/preview public URL SEO acceptance, multi-URL HTML scan, `tmp/seo-issues` ledger     | `seo-prodpage` | `cf-deploy` if HTML is 500/env-broken; generic `seo-*` for depth/data only  |
| Supabase/Postgres → D1 data move                                                                    | `db-migration` | —                                                                           |
| New project first-pass customization                                                                | `quick-start`  | design/SEO skills only if the brief asks for them                           |
| Dynamic page from a short spec                                                                      | `page-builder` | SEO skills for public indexable pages                                       |

Announce `cf-deploy`, `auth`, or `seo-prodpage` before deep work when the user
request is clearly in that domain, even if they did not type the slash command.

**`seo-prodpage` auto-route triggers** (nested:
`.agents/skills/shiponce/skills/seo-prodpage/SKILL.md`):

- 线上/预览 SEO 验收、生产 URL 审查、扫 indexable pages、部署后 SEO 检查、`/seo-prodpage`
- Need an issue-type ledger under `tmp/seo-issues/`
- Live HTML acceptance after public SEO code changes (title/canonical/hreflang/JSON-LD/sitemap)
- Prefer over generic `seo-page` when the target is production/preview (not local-only analysis)
- Prefer over generic `seo-audit` when the user wants ShipOnce-standard
  acceptance + fix mapping, not a multi-specialty external audit

## Project Scenarios

### New Public Landing or AI Tool Page

```text
seo-sxo or seo-content-brief
-> taste-skill v2
-> implementation and tdd when behavior changes
-> output-skill
-> seo-page
-> seo-prodpage (smoke or matrix on preview/production when a public URL exists)
-> code-review
```

Skip SEO only when the page is private or explicitly not intended for indexing.

### Existing Public Page Redesign

```text
seo-page + seo-drift baseline
-> redesign-existing-projects
-> taste-skill v2
-> implementation
-> output-skill + code-review
-> seo-page + seo-drift compare
-> seo-prodpage smoke on the live URL when accepting the release
```

Capture the drift baseline before modifying an existing page.

### Private Dashboard, Settings, or Authenticated Tool

```text
taste-skill v2
-> tdd when behavior changes
-> output-skill
-> code-review
```

Skip SEO and `seo-drift` unless a public, indexable surface is also changed.

### Complex AI, Payment, Credit, or Provider Feature

```text
batch-grill-me
  (or grill-with-docs when glossary/ADRs are part of the outcome)
-> domain-modeling only if concepts remain tangled after the grill
-> to-spec
-> to-tickets when delivery spans modules or sessions
-> prototype when interaction is uncertain
-> tdd
-> code-review
```

Prefer `batch-grill-me` for decision throughput. Prefer `grill-with-docs` when
the feature will leave durable domain language (CONTEXT/glossary/ADRs) in the
repo. Run the implementation and verification loop once per independently
deliverable ticket.

### Bug Fix

```text
diagnosing-bugs
-> tdd
-> root-cause fix
-> code-review
```

For an SEO regression, start with `seo-drift compare` when a baseline exists,
then route the finding to `seo-technical`, `seo-page`, or `seo-schema`.

### Existing Blog On-Page Review

Read `references/data-and-content.md` and
`references/seo-operating-standard.md` first.

```text
seo-page per URL
-> seo-content when content quality is in scope
-> seo-schema when Article or Breadcrumb JSON-LD is in scope
-> fix
-> output-skill + code-review
-> seo-page acceptance
```

For a multi-post or whole-site **live HTML** pass (issue ledger, severity
counts, shared root-cause fixes), use nested `seo-prodpage` instead of repeating
ad-hoc curls. Use generic `seo-audit` only for an explicitly requested
multi-specialty full-site audit. For existing posts, capture `seo-drift
baseline` before editing. For a brand-new post, create the first baseline after
its initial accepted release.

### Production or Preview URL Acceptance (`seo-prodpage`)

Read `references/seo-operating-standard.md`, then nested
`skills/seo-prodpage/SKILL.md`.

```text
seo-prodpage (smoke | matrix | full)
-> fix shared head/locale/sitemap boundaries for P0
-> re-run seo-prodpage on affected URLs
-> seo-drift baseline when locking a release
-> cf-deploy only if probes show env/SSR/deploy target failures
```

Default mode after deploy: `smoke`. Escalate to `matrix`/`full` when the user
asks for a full scan or when P0 issues look systemic.

### New Multilingual Blog Content

Read `references/data-and-content.md`, `references/feature-workflows.md`
(Internationalization), and `references/seo-operating-standard.md` first.

```text
seo-content-brief per locale
+ seo-dataforseo when localized live data is available
-> localized writing; do not translate the default version word for word
-> seo-hreflang + seo-sitemap
-> implementation
-> seo-page + seo-content per locale URL
-> output-skill + code-review
-> establish seo-drift baseline after first accepted release
```

Define locale and market explicitly, such as `en-US`, `de-DE`, or `fr-FR`.
Give each locale its own search intent, keyword, title, description, H1, slug,
examples, and internal links. Preserve this repository's localized filename,
fallback, route, canonical, and sitemap conventions.

### Programmatic SEO

Read `references/seo-operating-standard.md` first.

```text
seo-programmatic + seo-plan
-> to-spec
-> to-tickets
-> tdd
-> seo-technical + code-review
```

Enforce thin-content and index-bloat safeguards before generating pages at
scale.

## Overuse Guards

- Do not run `seo-audit` when a targeted page or technical skill answers the
  request.
- Do not run `seo-prodpage` for private dashboards, or when the user only wants
  a content brief / keyword research / GSC metrics with no live HTML acceptance.
- Do not treat `seo-prodpage` as a second operating standard; it only executes
  `references/seo-operating-standard.md` against real URLs.
- Do not use SEO skills for authenticated product surfaces by default.
- Do not use design skills for server-only work.
- Do not combine `minimalist-ui` and `soft-skill` by default.
- Do not run `to-spec` while material requirements remain unresolved.
- Do not build `seo-drift` baselines after editing an existing page and claim
  they cover the change just made.
- Do not let a supporting skill expand the user's requested scope or override
  shiponce architecture and validation rules.
- Do not let a generic SEO skill override
  `references/seo-operating-standard.md`; surface any conflict and follow the
  project standard.
- Do not open `batch-grill-me` / `grill-me` / `grill-with-docs` for a small,
  already-scoped edit; use built-in `how-to-ask-question` or proceed.
- Do not run serial `grilling` and `batch-grill-me` in the same phase.
- Do not implement from a grill session before the user confirms shared
  understanding.
