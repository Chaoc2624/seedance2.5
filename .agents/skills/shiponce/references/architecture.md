# Architecture Reference

## Stack

- TanStack Start with file-based routing in `src/routes`.
- React 19, Vite, Tailwind CSS v4, Radix UI, and local shadcn-style primitives.
- Drizzle ORM with provider-specific schemas.
- Better Auth with Drizzle adapter.
- Runtime config from env/defaults and optional DB config table in full preset.
- Cloudflare compatibility via `wrangler.toml`, conditional DB adapters, and Worker-aware runtime checks.

## Directory Ownership

- `src/routes`: route definitions, loader wiring, metadata, route components, API routes.
- `src/server`: TanStack server functions. Put request-level validation, permission checks, and orchestration here.
- `src/models`: persistence helpers and Drizzle queries.
- `src/services`: higher-level service facades for auth-adjacent logic, AI, payment, email, storage, RBAC, analytics, ads, and affiliate.
- `src/extensions`: provider-specific implementations. Keep vendor API calls here when a provider boundary exists.
- `src/config`: app env config, presets, runtime defaults, locale config, styles, and DB schemas.
- `src/core`: platform systems: auth, db, docs, i18n, rbac, theme.
- `src/components/ui`: low-level UI primitives (45+ components: accordion, avatar, badge, button, card, carousel, chart, checkbox, dialog, drawer, dropdown-menu, form, input, navigation-menu, pagination, progress, scroll-area, select, separator, sheet, sidebar, skeleton, sonner, switch, table, tabs, textarea, toggle, tooltip, plus animated-grid-pattern, animated-group, hover-card, infinite-slider, marquee).
- `src/components/magicui`: animated visual effects (8 components: animated-theme-toggler, avatar-circles, border-beam, meteors, particles, retro-grid, ripple, text-shimmer). Used in hero/feature sections.
- `src/components/blocks`: reusable product blocks organized by domain: common/ (branding, content, media, navigation), form/, panel/, payment/, sign/, table/, email/. See `references/template-customization.md` for full block catalog.
- `src/components/features`: feature-specific UI (AI generators, showcases, feedback).
- `src/components/layouts`: app/admin layout systems.
- `src/themes/default/blocks`: 25+ theme block components (blog-detail, blog, creator-feedback-wall, cta, faq, features-_, footer, gallery-grid, gpt-image-benefits, header, hero, logos, page-detail, pricing, prompt-showcase, showcases-_, social-avatars, stats, subscribe, testimonials, updates).
- `src/themes/default/pages`: dynamic-page, static-page.
- `src/themes/default/layouts`: landing layout.
- `src/types/blocks`: shared block contracts.
- `src/core/docs`: docs module source resolution (`source.ts`) and table-of-contents generation (`toc.ts`).
- `src/routes/api/proxy`: file proxy route for cross-origin asset fetching.
- `src/routes/{-$locale}/_oauth`: OAuth callback and popup routes for social login (Better Auth Google/GitHub).
- `content`: local MDX content for posts, pages, docs, and logs.
- `scripts`: setup, schema sync, RBAC, role assignment, generation, and maintenance scripts.
- `scripts/templates`: 6 init project templates (ai-saas, content-platform, developer-tool, ecommerce, general, plus base shared config). Used by `scripts/init/init-project.ts`.
- `scripts/lib`: shared init utilities (ai-generate.ts, config-writer.ts, prompt-builder.ts).

## Layering Rule

Route components should not directly query the database. Use this path:

1. route calls server function
2. server function validates input and permissions
3. server function delegates persistence to model helpers
4. model helper uses `db()` and `@/config/db/schema`
5. provider-specific external calls stay in `src/extensions`

Examples:

- Public blog route -> `src/server/blog.functions.ts`
- Admin post route -> `src/server/post.functions.ts` -> `src/models/post.server.tsx`
- Payment route/server function -> `src/services/payment.server.ts` -> `src/extensions/payment/*`

## Generated Files

- Do not hand-edit `src/routeTree.gen.ts`.
- Avoid migration snapshot churn unless DB schema work explicitly requires it.
- Avoid unrelated formatting changes across generated or locale-heavy files.

## Imports

- Prefer `@/` aliases for source imports.
- Import DB tables from `@/config/db/schema` in app code.
- Use server-only modules from `*.server.ts`, `src/server/*`, `src/models/*`, or `src/core/*/*.server.ts`.
