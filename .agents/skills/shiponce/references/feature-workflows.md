# Feature Workflow Reference

## Auth and RBAC

Auth is implemented with Better Auth in `src/core/auth`.

- Static auth config: `src/core/auth/config.server.ts`
- Server auth instance/cache: `src/core/auth/index.server.ts`
- Client auth helpers: `src/core/auth/client.ts`
- Runtime auth options: `getRuntimeConfig()`
- Better Auth DB adapter: Drizzle adapter when DB is configured
- Email verification: requires `email_verification_enabled` and Resend config
- New user hooks: may grant credits and roles only when full preset modules are enabled
- Cloudflare Pages auth requires runtime secrets on the Pages project, not
  just local env files. If login or `/api/auth/get-session` returns
  `500`/`HTTPError` after deploy, check `AUTH_SECRET`, `DATABASE_URL`,
  `DATABASE_PROVIDER`, and related DB runtime settings with
  `wrangler pages secret list` before changing auth code.
- If those secrets are present but `/api/auth/sign-in/email` fails with
  Cloudflare `1102` / CPU limit errors, inspect the password verification
  path before changing UI or DB code. Better Auth's default scrypt verifier
  can be too CPU-heavy on Pages Functions; use an edge-friendly WebCrypto
  password hash/verify implementation or deploy to a runtime with enough
  CPU, and migrate existing credential hashes.
- Account initialization or password reset scripts must write hashes with the
  same edge-friendly auth hashing path used by production verification. Do not
  let scripts call Better Auth's default password hasher and silently create
  new scrypt credentials after the runtime has been migrated.

RBAC files:

- `src/core/rbac`
- `src/services/rbac.server.ts`
- `scripts/init/init-rbac.ts`
- `scripts/db/assign-role.ts`

For admin server functions, call `requirePermission()` with `PERMISSIONS`. Client-side route hiding is not enough.
For admin list/dashboard routes, also read `references/admin-request-scales.md`
before adding loaders, page-data functions, or RBAC-heavy table rendering.

## Payments, Credits, and Subscriptions

Boundaries:

- server functions: `src/server/payment.functions.ts`, `src/server/subscription.functions.ts`, `src/server/credit.functions.ts`
- orchestration: `src/services/payment.server.ts`
- providers: `src/extensions/payment/stripe.ts`, `paypal.ts`, `creem.ts`
- persistence: `src/models/order.server.ts`, `src/models/subscription.server.ts`, `src/models/credit.server.ts`
- callbacks/webhooks: `src/routes/api/payment`

Rules:

- Keep provider API calls in `src/extensions/payment`.
- Keep order/subscription/credit state changes in models/services.
- Keep provider secrets server-side.
- Update runtime settings metadata when adding provider config.

## AI Generation

Boundaries:

- service facade: `src/services/ai.server.ts`
- server functions: `src/server/ai.functions.ts`, `src/server/ai-task.functions.ts`
- persistence: `src/models/ai_task.server.ts`
- providers: `src/extensions/ai`
- UI: `src/components/features/ai-generator`

Supported provider extension files include Replicate, Fal, Gemini, and Kie. When adding a provider, keep request/response mapping in the provider extension, not in UI.

The image generator model catalog is runtime-configurable but is also filtered
by active AI providers. On Pages/lite deployments, DB-backed admin settings are
not read from the `config` table, so provider keys must be present directly in
Pages secrets or runtime env. If the selector briefly shows defaults and then
becomes empty after hydration, check for missing `KIE_API_KEY`,
`REPLICATE_API_TOKEN`, `FAL_API_KEY`, or `GEMINI_API_KEY` before changing UI
state logic.

### AI Music and Video Generation

Beyond image generation, the AI pipeline supports music, video, speech, and text generation via `AIMediaType` in `src/extensions/ai/types.ts`.

- Routes: `_landing/ai/music-generator.tsx`, `_landing/ai/video-generator.tsx`
- UI: `src/components/features/ai-generator/music.tsx`, `video.tsx`
- Types: `AIMediaType.MUSIC`, `AIMediaType.VIDEO`, `AIMediaType.SPEECH`, `AIMediaType.TEXT`
- Controlled by `modules.ai` preset flag
- Uses the same AI task pipeline as image generation (`src/server/ai-task.functions.ts`, `src/models/ai_task.server.ts`)
- Locale namespaces: `ai.music`, `ai.video` in all configured locales

### AI Development Mock System

Local development can mock AI generation without real provider keys via `src/services/ai-dev-mock.server.ts`. Uses a local JSON fixture store at `content/dev-mocks/image-generation.json`. Only active when no real provider keys are configured and `NODE_ENV` is development.

## Showcase / Prompt Showcase Module

- Routes: `_landing/showcase.tsx` (single prompt detail), `_landing/showcases.tsx` (redirects to landing)
- Server: `src/server/showcase.functions.ts` — `getPublicShowcasePromptsFn`, `getPublicShowcasePromptsPageFn`
- Model: `src/models/showcase_prompt.server.ts`
- DB schema: `showcase_prompt` table with fields: id, prompt, useCase, style, subject, image, imageKey, storageProvider, status, sort, soft-delete
- Static seed data: `src/config/showcase-data.ts`
- Theme blocks: `src/themes/default/blocks/prompt-showcase.tsx`, `showcases.tsx`, `showcases-flow.tsx`
- Controlled by `modules.showcases` preset flag (full-only)

## Activity Module

- Route: `_landing/activity/` with sub-routes: `index.tsx` (activity dashboard), `ai-tasks.tsx` (user AI history), `feedbacks.tsx` (user feedback list)
- Locale: `activity/` namespace in all configured locales, including `chats.json` sidebar metadata
- Controlled by `modules.activity` preset flag (full-only)
- Admin counterpart: admin AI tasks page at `admin/ai-tasks.tsx` with `src/server/ai-task.functions.ts` (filter by type, status, user, provider, model, scene, date range)

## Feedback Feature

- Public route: `_landing/feedback.tsx` (public submission form, no auth required)
- Activity sub-route: `_landing/activity/feedbacks.tsx` (user's own feedback list)
- Server: `src/server/feedback.functions.ts` — `submitFeedbackFn`, `getFeedbackListFn` (admin), `updateFeedbackStatusFn` (admin)
- DB: `feedback` table with status tracking (`pending`, `reviewed`, `resolved`)
- Block: `src/themes/default/blocks/creator-feedback-wall.tsx`

## User Settings Panel

- Route: `_landing/settings/` with 11 route files:
  - `index.tsx` (settings dashboard), `route.tsx` (layout)
  - `profile.tsx` (user profile editing), `security.tsx` (password/2FA)
  - `credits.tsx` (credit balance/history), `payments.tsx` (payment history)
  - `billing.tsx` (subscription management), `billing_.cancel.tsx`, `billing_.retrieve.tsx`
  - `invoices_.retrieve.tsx`
- Locale: 6 namespaces under `settings/` — billing, credits, payments, profile, security, sidebar

## Docs Module

- Core: `src/core/docs/source.ts` (MDX content resolution and frontmatter parsing), `src/core/docs/toc.ts` (table of contents generation)
- Route: `_docs/docs/$.tsx` (catch-all for doc pages), `_docs.tsx` (docs layout wrapper)
- Content: `content/docs/` directory
- Controlled by `modules.docs` preset flag

## Image Upload and File Proxy

- Route: `api/proxy/file.ts` — server-side proxy for cross-origin file fetching
- Server function: `src/server/storage.functions.ts` — `uploadImageFn`
- Service: `src/services/image-upload.server.ts` — validates image types, computes MD5, delegates upload to storage service
- Storage providers: `src/services/storage.server.ts` with R2/S3 extensions
- UI components: `src/components/blocks/common/media/app-image.tsx`, `lazy-image.tsx`

## OAuth Routes

- Routes: `_oauth/auth-callback.tsx`, `_oauth/auth-popup.tsx`, `route.tsx`
- Used by Better Auth social providers (Google, GitHub) for in-window OAuth popup flow
- Avoids full-page redirect during social login

## Storage, Email, Analytics, Ads, Affiliate

Provider boundaries:

- storage: `src/services/storage.server.ts`, `src/extensions/storage/r2.ts`, `src/extensions/storage/s3.ts`
- email: `src/services/email.server.ts`, `src/extensions/email/resend.ts`
- analytics: `src/services/analytics.ts`, `src/extensions/analytics/*`
- ads: `src/services/ads.server.ts`, `src/extensions/ads/*`
- affiliate: `src/services/affiliate.server.ts`, `src/extensions/affiliate/*`

Use a service facade first. Put provider-specific code in `extensions`.

## Internationalization

i18n lives in `src/config/locale`.

- Locale options: `src/config/locale/index.ts`
- Translation JSON: `src/config/locale/{locale}`
- Namespace list: `localeMessagesPaths`
- Routes use optional locale segment `{-$locale}`
- Locale aliases normalize through `normalizeLocale()`; for example public content uses `zh-hant` while some admin/runtime flows may still accept `zh`
- Admin-only routable locales are narrower than the public locale list; check `adminLocales`/`routableLocales` before adding admin locale files or routes

When adding user-facing strings in translated areas, update the relevant JSON files or call out missing translations.

## Routes and Root Loaders

This repository uses TanStack Start file routes with thin loaders.

- Use `createFileRoute(...)` in `src/routes/*`
- Keep route loaders/actions thin and import server handlers from `src/server/*`
- Use `createServerFn(...)` for request validation, auth/permission checks, and orchestration
- Gate preset-specific behavior with `modules.*` checks close to the route or server boundary instead of scattering preset assumptions through UI
- When the change affects app-wide metadata, analytics, verification tags, or shared bootstrapping, inspect `src/routes/__root.tsx` and `src/server/root.functions.ts` in addition to the local route
- Keep locale-aware links/navigation on `@/core/i18n/navigation` primitives instead of raw path concatenation

For admin pages specifically:

- prefer one deferred `getAdmin*PageDataFn` per page over separate count/data requests
- batch modal options, labels, and related lookup data into the same page-data payload
- move per-row enrichment to the server/model layer so React tables render pre-joined data

## UI and Theme

- Low-level primitives: `src/components/ui`
- Product blocks: `src/components/blocks`
- Feature UI: `src/components/features`
- Layouts: `src/components/layouts`
- Theme pages/blocks: `src/themes/default`

Prefer composing existing UI primitives before adding new primitives. Keep server logic out of UI components.

Floating UI such as hover panels, popovers, dropdowns, and modal-like overlays
must isolate wheel and trackpad scrolling while the pointer is inside the
surface. Internal scroll regions may scroll, but wheel events must not chain to
the page when the internal region reaches its edge or when the pointer is over a
non-scrollable part of the overlay.

For public landing layout, header position (top/left), sidebar, scroll-spy,
and sidebar utility (theme/locale/sign-in) work, read
`references/layout-and-header.md` first. It documents non-obvious traps:
inline closures break CSS transitions, `border-r` on the sidebar causes
sub-pixel jitter, `justify-content`/`padding` toggles teleport icons at
frame 0, and `left` header mode must remain mobile-friendly by falling back
to a top header without leftover sidebar padding on narrow screens.

## Cloudflare

Relevant files:

- `wrangler.toml`
- `wrangler.toml.example`
- `scripts/deploy/patch-cf-runtime.mjs`
- `src/plugins/cloudflare-env.ts`
- `src/config/index.ts`
- `src/components/blocks/common/media/app-image.tsx`
- `src/components/blocks/common/media/lazy-image.tsx`
- `src/core/i18n/navigation.tsx`
- DB provider support for `d1`
- conditional SQLite mock through `#db/sqlite`

Deployment split:

- Lite preset uses Cloudflare Pages: `bun run build:cf:pages`, then `bunx wrangler pages dev dist`.
- Full preset uses Cloudflare Workers: `bun run build:cf:worker`, then `bunx wrangler dev --config .output/server/wrangler.json`.
- Full preset must use a Worker/custom-domain `VITE_APP_URL`; do not reuse a Lite `*.pages.dev` host when switching the same project to Workers.

Keep Node/server behavior and Worker behavior separate. Check `src/lib/env.ts` and `src/core/db/*` before changing runtime assumptions. Lite Pages blog routes should use local MDX and must not require `DATABASE_URL`. Keep image and link rendering on native project primitives; avoid framework-specific image/link wrappers and CJS-only lazy image libraries in SSR paths.

Cloudflare deploy/debug checklist:

- Confirm and lock the intended target first: lite goes to Pages; full goes to Worker. Set `CLOUDFLARE_DEPLOY_TARGET` in `deploy.env` and report the resolved project/Worker before building.
- Prefer the root `./deploy.sh` entrypoint for deployments. Check `deploy.env` for `CLOUDFLARE_DEPLOY_TARGET`, `CF_PAGES_PROJECT`, `CF_WORKER_NAME`, branch, and production `VITE_APP_URL` before falling back to raw Wrangler commands.
- Do not mix target artifacts. A Pages deploy uses `dist` plus Pages project secrets; a Worker deploy uses `.output/server/wrangler.json` plus Worker vars/bindings/routes. Building one target and deploying the other creates env drift.
- For lite Pages, confirm `BLOG_STORAGE_MODE=mdx` in package scripts, local `wrangler.toml`, generated `dist/_worker.js/wrangler.json`, and `.wrangler/deploy/config.json` when env bugs appear.
- For full Workers, confirm `VITE_APP_URL`, `DATABASE_URL`, `AUTH_SECRET`, `BLOG_STORAGE_MODE`, route/custom-domain config, and required provider keys in generated `.output/server/wrangler.json`; `.env.development` does not populate Worker runtime by itself.
- If a full Worker relies on DB-backed runtime settings, treat missing `DATABASE_URL` or missing route binding as a deploy blocker even if `/` renders `200`.
- Preview with Wrangler and probe a real SSR route: `/de/blog` should return `200` and must not include `DATABASE_URL` or `Something went wrong`.
- For full Workers, also probe `/api/auth/get-session` and inspect `/` or `/sign-in` HTML for stale `pages.dev` or `workers.dev` metadata/canonical/auth URLs before deploy.
- Deploy only after local preview passes; then probe the production alias URL with the same route checks.
- Treat a Worker deploy with empty `DATABASE_URL` as degraded full mode: public pages may render, but DB-backed full features are not reliably configured.
- For auth failures after Cloudflare deploy, check target/env first. Pages secrets, Worker vars, and DB hash compatibility are separate failure surfaces; do not start by changing UI.
- For AI model picker/catalog issues after deploy, check whether the target can read active provider keys. Pages lite cannot read DB config-table provider keys, while Worker full mode needs `DATABASE_URL` and provider settings/vars available at runtime.
- For hydration or serialization failures, inspect route loader data for non-serializable values such as React elements or Symbols and verify with a real browser or at least HTML plus console-capable preview when possible.
- If `/de/blog` renders no posts, check content locale coverage before assuming a deployment problem.
- Kill stale local Wrangler/workerd processes after preview so future validation uses the current bundle.

## Safe Change Checklist

Before finishing:

- inspect `git status --short`
- confirm no unrelated user changes were overwritten
- run the narrowest useful verification
- mention tests/checks that could not run
- avoid staging, committing, or pushing unless explicitly asked
