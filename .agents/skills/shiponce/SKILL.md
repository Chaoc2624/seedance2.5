---
name: shiponce
description: shiponce TanStack template engineering, SEO operating-standard, and skill-routing guide for Codex and Claude Code. Use when modifying, refactoring, extending, debugging, or reviewing this repository; when changing init scripts, presets, modules, runtime configuration, database schemas, blog/content storage, landing content, images/media assets, auth/RBAC, payments, AI generation, storage/email/analytics integrations, routes, server functions, models, UI blocks, theme code, pricing/Price pages, public layout (top vs left header), or sidebar/header behavior; and to automatically apply ShipOnce SEO invariants and select supporting design, engineering, and SEO skills for those tasks.
---

# shiponce

## Core Workflow

1. Inspect the current diff before editing: `git status --short`.
2. When `.codegraph/` exists, use CodeGraph before grep/find/manual file walks to locate the relevant symbols, files, callers, and dependency chain:
   - Prefer `codegraph_explore` when the MCP tool is available.
   - Otherwise run `codegraph explore "<symbol names or question>"`.
   - Use `rg` only after CodeGraph has identified the boundary or when CodeGraph has no coverage for the target file type.
3. Identify the feature boundary: route, server function, model, service, extension, config, schema, UI block, or theme.
4. Route supporting skills before proposing or implementing a solution. Read `references/skill-routing.md` when the task involves public/indexable pages, SEO, blog writing or auditing, multilingual content, user-facing UI/design, a complex feature, a bug, an architecture change, or an explicit question about skill combinations. For any ShipOnce SEO, GEO, or indexability task, also read `references/seo-operating-standard.md` before selecting generic SEO skills.
5. Read only the relevant project reference file before making changes:
   - Architecture and file ownership: `references/architecture.md`
   - Presets, env, runtime settings, and init script: `references/configuration.md`
   - DB schemas, models, server functions, blog/content: `references/data-and-content.md`
   - Landing modules, showcases, testimonials, logos, and image replacement: `references/media-and-content-replacement.md`
   - Feature workflows for auth, RBAC, payment, AI, storage, UI, and i18n: `references/feature-workflows.md`
   - Admin request batching, auth bootstrap, and dashboard scaling patterns: `references/admin-request-scales.md`
   - Pricing page SEO and conversion structure: `references/pricing-page-seo.md`
   - SEO, GEO/AI search, multilingual indexability, metadata, canonical/hreflang, sitemap, robots/llms, and JSON-LD: `references/seo-operating-standard.md`
   - Public layout (top vs left header), sidebar transitions, scroll-spy, utility-button stability: `references/layout-and-header.md`
   - Code structure, component size, and function complexity boundaries: `references/code-structure.md`
   - Theme blocks, MagicUI components, utility libraries, init templates, and block catalog: `references/template-customization.md`
6. Apply Ponytail constraints before editing: reuse existing project helpers, prefer platform/stdlib/dependencies already installed, delete or narrow code before adding, and make the smallest root-cause change that covers all callers.
7. Follow existing patterns and keep edits narrow.
8. After making changes, run the required Oxc validation workflow before finishing.
9. Report the commands you ran, skills used or skipped, and any blockers that could not be resolved.

## Default Agent Discipline

- CodeGraph first for project understanding and code edits when `.codegraph/` exists. Start from dependency chains and callers, not broad manual search.
- Ponytail first for implementation shape: no speculative abstractions, no duplicate helpers, no new dependency unless the current stack cannot do it, and no multi-file churn when one shared boundary fixes the problem.
- For bug fixes, inspect callers before editing and fix the shared root cause when possible.
- For feature work, reuse current routes, server functions, models, UI blocks, config services, and locale patterns before creating new structure.
- If the task is documentation-only or a file type CodeGraph does not index, keep the same discipline: locate narrowly, edit narrowly, validate narrowly.

## Built-In Clarification Discipline

Apply the local `how-to-ask-question` discipline automatically for this project. Do not wait for the user to explicitly request that skill.

- Understand first, solve second. Before proposing solutions, code, prompts, designs, plans, or examples, check whether the request has outcome-affecting ambiguity.
- Do not silently assume missing details that can change the final answer, technical route, style, scope, quality bar, risk, cost, or acceptance criteria.
- Before asking or executing, separate the request into confirmed facts, questions to confirm, and details that must not be assumed. Only treat user-provided facts or authoritative local context as confirmed.
- Ask only questions that materially change the output or implementation route. Sort by importance and ask at most 5 questions at a time.
- If no outcome-affecting uncertainty remains, proceed normally and state useful assumptions briefly.
- If uncertainty blocks execution, ask in the user's language using this structure and stop until the user answers or explicitly asks to proceed with uncertainty acknowledged:

```text
在开始之前，我发现以下信息仍不明确：

【已确认事实】

1.
2.
3.

【存在的歧义】

1.
2.
3.

【需要确认的问题（按重要性排序，最多5个）】

1.
2.
3.
4.
5.

【不会假设的内容】

1.
2.
3.

在这些问题确认之前，我不会输出方案或实现内容。
```

## Local Skills

- Apply `references/skill-routing.md` automatically when its trigger conditions match. `shiponce` remains the project authority; routed skills supplement it and do not replace repository boundaries or validation rules. Select one primary supporting skill per phase and at most two supporting skills. Announce the selected skills and reason before using them, then read each selected `SKILL.md` fully.
- Multi-decision plan/design ambiguity: prefer global `$batch-grill-me` (frontier rounds) over serial `$grill-me` / `$grilling`. Use `$grill-with-docs` when the outcome should also leave glossary/ADRs. Keep built-in `how-to-ask-question` for small routine blockers (≤5). See `references/skill-routing.md` § Scope and Domain.
- Apply `references/seo-operating-standard.md` automatically for every ShipOnce SEO, GEO, public metadata, multilingual indexability, sitemap, robots, llms, JSON-LD, blog/detail SEO, or indexation task. This project reference is mandatory and does not count toward the supporting-skill limit.
- Outbound SaaS locale note: public landing/blog may deprioritize creating `zh` / `zh-hant` copy, but **any live public route must still pass full on-page SEO acceptance** (title, description, canonical, hreflang only for real content, no EN body under `/zh` or `/zh-hant`, JSON-LD on article pages). Never emit hreflang for missing Chinese locales pointing at EN. Admin UI changes should still add/update **Simplified Chinese (`zh`)** strings.
- **Non-EN page body must not be thin:** do not publish indexable ja/ko/de/… stubs that are short summaries of EN (known anti-pattern: EN ~full article, other locales ~15–30% length with FAQ/tables cut). Prefer fewer full locales; omit thin locales from content, hreflang, and sitemap. See `references/seo-operating-standard.md` § Non-EN body must not be thin.
- Production/preview public URL SEO acceptance, multi-URL live HTML scan, issue ledger under `tmp/seo-issues/`, 线上 SEO 验收, 生产 URL 审查, or post-deploy public SEO check: use nested `$seo-prodpage` from `.agents/skills/shiponce/skills/seo-prodpage` automatically. Read that `SKILL.md` fully before auditing. Authority stays `references/seo-operating-standard.md`; do not invent a parallel checklist. Prefer `seo-prodpage` over generic `seo-page` when the target is a live production/preview origin.
- Cloudflare deploy/debug (`deploy.sh`, `deploy.env`, Pages vs Worker, wrangler preview, post-deploy env): use nested `$cf-deploy` from `.agents/skills/shiponce/skills/cf-deploy` automatically. Read that `SKILL.md` fully before deep deploy changes.
- Auth/session/OAuth/password/RBAC (`/api/auth/*`, Better Auth, init-admin, AUTH_SECRET, edge hash CPU limits): use nested `$auth` from `.agents/skills/shiponce/skills/auth` automatically. Read that `SKILL.md` fully before deep auth changes.
- When the user asks to commit code, 提交代码, 提交全部, commit, push, 提交并推送, or 提交到 GitHub, use the project-local `$commit-code` skill from `.agents/skills/commit-code` automatically. Do not wait for the user to explicitly remind you to invoke it. This skill owns diff inspection, scope selection, required validation, detailed Chinese Conventional Commit messages, and push behavior when push is explicitly requested.

## Non-Negotiables

- Use Bun as the package manager and script runner. Prefer `bun install`, `bun run <script>`, and `bunx <binary>`; do not use `pnpm`, `npm`, or `yarn` unless Bun cannot run the command or the user explicitly asks.
- Use the Oxc toolchain as the default post-change gate. After any code/config change, run `bun run format:check` and `bun run lint`, fix issues caused by your changes, and rerun before you stop.
- Treat `bun run format:check` as a required repo baseline, not as proof that all edited source files were checked. In this repository it primarily covers focused config/docs paths; for changed `src/*`, `scripts/*`, `content/*`, or other edited files outside that set, also run `bunx oxfmt --check <edited files>` or `bun run format:repo:check` when you intentionally want a wider pass.
- Treat Tailwind CSS as the default implementation path for changed or newly added UI. Use utility classes, variants, and existing Tailwind-friendly component patterns first; only introduce plain CSS when the UI is genuinely too complex or Tailwind would make the result harder to maintain.
- Prefer mobile-friendly behavior first for public UI changes. If a layout diverges between desktop and mobile, make the mobile behavior explicit and stable instead of assuming desktop-only spacing or chrome will collapse correctly.
- Hover panels, popovers, dropdowns, and modal-like overlays must isolate wheel/trackpad scroll while the pointer is inside them so background content does not scroll accidentally.
- Dialogs, previews, drawers, and any modal-like UI that locks body scrolling must preserve the removed scrollbar width with equivalent right padding (for example `--removed-body-scroll-bar-size`) so opening or closing the overlay does not shift page width.
- Keep code compact and readable. TSX component files must stay at or below 400 lines; split larger components into domain subcomponents, hooks, module helpers, or services. Keep functions and class methods small enough to scan in one screen, and split them before they mix rendering, data shaping, side effects, and validation.
- Do not hand-edit `src/routeTree.gen.ts`; it is generated by TanStack Router tooling.
- Do not put Drizzle queries in React components. Use `src/models`, then expose route-safe behavior through `src/server`.
- Follow the project's TanStack Start boundary: file routes use `createFileRoute`, route loaders/actions stay thin, and request work should usually flow through `createServerFn` handlers in `src/server/*`.
- Do not expose secrets to client code. Client-visible env vars must be `VITE_*`.
- Do not rewrite architecture, add a parallel framework, or move modules without a direct reason.
- Preserve user changes in a dirty working tree.
- Commit messages must follow Conventional Commits (`feat:`, `fix:`, `build:`, `chore:`, `docs:`, `refactor:`, `style:`, `test:`, `perf:`, `ci:`, `revert:`). Choose the prefix according to the staged change type. All commit messages must be written in Chinese.
- Before `git commit`, validation for the staged change set must pass: run `bun run format:check` and `bun run lint`, fix failures caused by this work, and rerun; for staged files outside the default `format:check` scope, also run targeted `bunx oxfmt --check` and/or `bunx oxlint` on those paths. Do not commit changes you know still fail checks.

## Common Entry Points

- Init/setup work: read `references/configuration.md`, then edit `scripts/init/init-project.ts`.
- Runtime setting work: read `references/configuration.md`, then update `src/config/runtime.defaults.ts`, `src/services/settings.ts`, and runtime consumers.
- DB/model work: read `references/data-and-content.md`, then update provider schemas, model helpers, and server functions.
- Blog/content work: read `references/data-and-content.md`, especially `BLOG_STORAGE_MODE`. Also read `references/skill-routing.md` and `references/seo-operating-standard.md` when writing, localizing, auditing, or optimizing public content.
- Route/root-loader work: read `references/feature-workflows.md`, then check the matching file route plus shared entrypoints such as `src/routes/__root.tsx` and `src/server/root.functions.ts` when metadata, analytics, or app-wide loaders are involved.
- Landing copy/media replacement: read `references/media-and-content-replacement.md`, then update locale JSON and public assets.
- Pricing/Price page SEO or conversion work: read `references/pricing-page-seo.md`, `references/seo-operating-standard.md`, and `references/skill-routing.md`, then update the pricing route, locale copy, package data, FAQ/schema, and CTA behavior as needed.
- General SEO, GEO, indexability, metadata, canonical/hreflang, sitemap, robots/llms, JSON-LD, or GSC indexing work: read `references/seo-operating-standard.md` and `references/skill-routing.md`.
- Production/preview public URL SEO acceptance, multi-URL live HTML audit, or SEO issue ledger: prefer nested skill `seo-prodpage` (`.agents/skills/shiponce/skills/seo-prodpage/SKILL.md`), then `references/seo-operating-standard.md`. Use generic `seo-page` for single-page analysis without a live prod acceptance goal; use `seo-audit` only when routing says so.
- Admin/auth/payment/AI/storage work: read `references/feature-workflows.md`. For auth/session/OAuth/password/RBAC, prefer nested skill `auth` (`.agents/skills/shiponce/skills/auth/SKILL.md`).
- Admin route performance, dashboard batching, RBAC/config caching, or request-storm reduction work: read `references/admin-request-scales.md` before editing routes or server functions.
- Cloudflare deploy/debug work: prefer nested skill `cf-deploy` (`.agents/skills/shiponce/skills/cf-deploy/SKILL.md`), then `references/configuration.md` and `references/feature-workflows.md` (Cloudflare section).
- UI/theme work: read `references/architecture.md`, `references/feature-workflows.md`, and `references/skill-routing.md`.
- Large component, route, or logic changes: read `references/code-structure.md` and `references/skill-routing.md`, then split UI and logic along existing feature boundaries before adding more behavior.
- Public layout, header position, sidebar UI, or any sidebar utility (theme/locale/sign-in) work: read `references/layout-and-header.md`. Treat mobile friendliness as the default requirement; for `left` header mode, desktop may use the sidebar but mobile must still fall back to a top header/menu.
- AI music/video generator work: read `references/feature-workflows.md` (AI section), then update the music/video routes, AI task pipeline, or locale JSON in `src/config/locale/*/ai/`.
- Showcase/prompt showcase work: read `references/feature-workflows.md` and `references/data-and-content.md`, then update showcase routes, server functions, DB schema, or static seed data in `src/config/showcase-data.ts`.
- Activity module work: read `references/feature-workflows.md`, then update activity routes, locale files, or preset gating.
- Feedback feature work: read `references/feature-workflows.md` and `references/data-and-content.md`, then update feedback routes, server functions, or DB schema.
- User settings panel work: read `references/feature-workflows.md`, then update settings routes, server functions, or locale namespaces.
- Docs module work: read `references/feature-workflows.md`, then update docs routes, `src/core/docs/`, or preset gating.
- Theme block work: read `references/template-customization.md` and `references/architecture.md`, then update blocks in `src/themes/default/blocks/`.
- MagicUI/visual effects work: read `references/template-customization.md`, then update `src/components/magicui/`.
- Utility library work: read `references/template-customization.md`, then update the relevant file in `src/lib/`.
- Init template work: read `references/template-customization.md` and `references/configuration.md`, then update `scripts/templates/` and `scripts/init/init-project.ts`.
- Dev config panel work: read `references/configuration.md` (Dev Config Panel section), then update `src/routes/{-$locale}/config.tsx` and `src/services/config-settings`.
- OAuth/callback work: use nested skill `auth`, then update `_oauth/` routes and Better Auth config.
- Image upload/file proxy work: read `references/feature-workflows.md`, then update `api/proxy/file.ts` and storage services.

## Verification Defaults

- Final desktop and mobile browser acceptance is opt-in. For implementation or modification requests, do not proactively run browser-based visual or interaction checks unless the user explicitly requests browser validation, screenshots, responsive verification, or end-to-end UI acceptance. Mobile-friendly implementation requirements remain in force; they do not by themselves authorize browser acceptance. Higher-priority system or developer instructions still take precedence.
- Single script check: `bunx tsc --noEmit --target ES2022 --module esnext --moduleResolution bundler --esModuleInterop --types node <script.ts>`
- Required default validation after code/config edits:
  - `bun run format:check`
  - `bun run lint`
- For edited files outside the narrow `bun run format:check` scope, also run `bunx oxfmt --check <edited files>` even when the repo command passes.
- If `bun run format:check` or `bunx oxfmt --check <edited files>` fails because of your edits, run `bun run format`, `bunx oxfmt <edited files>`, or a similarly narrow fix, then rerun the checks.
- If `bun run lint` reports issues caused by your edits, fix them and rerun `bun run lint`.
- If full-repo checks are noisy because of unrelated existing warnings, still run the full commands once, then run narrow checks on the edited files:
  - `bunx oxfmt --check <edited files>`
  - `bunx oxlint <edited files>`
- Do not claim completion after code changes unless you ran at least one validation pass and reported the outcome.
- Formatting check for edited docs/files when you do not need the full repo command: `bunx oxfmt --check <files>`
- DB schema changes: `bun run sync-schema`, then `bun run db:generate` when migration files are expected
- Cloudflare compatibility changes: run the relevant target build and local Wrangler preview:
  - Lite/Pages: `bun run build:cf:pages`, then `bunx wrangler pages dev dist`
  - Full/Worker: `bun run build:cf:worker`, then `bunx wrangler dev --config .output/server/wrangler.json`
- Before any Cloudflare deploy, lock and report the intended target from `deploy.env`; do not let inferred defaults choose between Pages and Workers.
- Cloudflare deploy fixes must probe real routes, not only `/`:
  - Lite/Pages public content: `curl -sS -D /tmp/shiponce-blog-headers.txt <url>/de/blog -o /tmp/shiponce-blog.html`
  - Confirm the response is `200` and the HTML does not contain `DATABASE_URL` or `Something went wrong`.
  - Full/Worker auth/runtime: `curl -sS -D /tmp/shiponce-auth-headers.txt <url>/api/auth/get-session -o /tmp/shiponce-auth.json`
  - Full/Worker metadata sanity: `curl -sS <url>/sign-in | grep -n "workers.dev\\|pages.dev"`
- Full app checks may be blocked by existing route generation or unrelated type errors; mention that clearly instead of hiding it.
