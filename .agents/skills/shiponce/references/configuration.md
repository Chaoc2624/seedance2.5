# Configuration Reference

## Presets

Preset selection lives in `src/config/preset.ts`.

- `full`: AI SaaS mode. Enables docs, updates, showcases, AI, payment, credits, activity, admin, RBAC, and DB-backed config table.
- `lite`: landing/content mode. Keeps auth/blog/legal and avoids DB config table reads.

Always-on modules:

- `auth`
- `blog`
- `legal`

Full-only modules:

- `docs`
- `updates`
- `showcases`
- `ai`
- `payment`
- `credits`
- `activity`
- `admin`
- `rbac`
- `configTable`

Gate preset-specific UI/routes/services with `modules` instead of hardcoding mode assumptions.

## Static Env Config

`src/config/index.ts` exports `envConfigs`.

Important keys:

- `VITE_APP_URL`
- `VITE_APP_NAME`
- `VITE_APP_PRESET`
- `VITE_THEME`
- `VITE_APPEARANCE`
- `VITE_DEFAULT_LOCALE`
- `BLOG_STORAGE_MODE`
- `DATABASE_PROVIDER`
- `DATABASE_URL`
- `DB_SCHEMA_FILE`
- `DB_MIGRATIONS_OUT`
- `AUTH_SECRET`
- `GOOGLE_ANALYTICS_ID`
- `GOOGLE_SEARCH_CONSOLE_ID`
- `CLARITY_ID`
- `PLAUSIBLE_SCRIPT_ID`
- `BING_WEBMASTER_VERIFICATION_ID`
- `BING_INDEXNOW_KEY`
- `ADSENSE_CODE`
- `GOOGLE_FUNDING_CHOICES_ID`

Client-visible env vars must use `VITE_*`. Secrets must stay server-side.

## Runtime Config

`src/config/runtime.server.ts` resolves runtime settings.

Priority:

1. defaults from `src/config/runtime.defaults.ts`
2. env vars, supporting uppercase and lowercase setting names
3. DB `config` table, only in full preset when `modules.configTable` is enabled

For local no-database projects, use `/config` while running `bun run dev`
or `bun run dev:lite` to edit public runtime config such as app URL/name,
GA4, Google Search Console, Clarity, Plausible, Bing Webmaster, AdSense, and
Google Funding Choices. If `BING_INDEXNOW_KEY` is configured, build scripts
generate `public/<key>.txt` with the key as file content for IndexNow domain
ownership verification. The page writes `.env.development` (or
`SHIPONCE_DEV_CONFIG_ENV_FILE` when set) and refreshes the local runtime cache.
It is a dev-server route only; Vite excludes it from every production build.
Production Cloudflare values still belong in deploy-time env/secrets, not in an
online no-db admin page.

When adding a setting:

1. add a default to `runtime.defaults.ts`
2. add admin metadata to `src/services/settings.ts` if it should be editable
3. read it through `getRuntimeConfig()` on the server
4. expose it through `getPublicRuntimeConfig()` only if safe for clients
5. invalidate runtime cache after admin writes when needed

For settings that drive layout/render decisions, add a dedicated server
function in `src/server/root.functions.ts` (e.g. `getLandingLayoutDataFn`)
and read it from the matching route loader instead of plumbing through
the global root loader. See `references/layout-and-header.md`.

## Init Script

`scripts/init/init-project.ts` is the interactive setup entrypoint.

It configures:

- preset
- database provider and connection
- blog storage mode
- project name (`VITE_APP_NAME`)
- app URL
- public header layout (`LAYOUT_HEADER_POSITION`: `top` or `left`)
- auth secret
- `.env.development` or `.env.development.new`
- optional schema sync and migrations
- optional RBAC initialization in full preset

Rules for editing init:

- Use `shiponce` as the default visible brand/project name.
- Do not ask for both project name and app name unless the product intentionally needs two separate concepts.
- Validate URLs and database names before writing env files.
- If writing `.env.development.new`, pass that path through `ENV_FILE` to immediate follow-up commands.
- Do not shell-concatenate untrusted user input.

## Dev Config Panel

`src/routes/{-$locale}/config.tsx` is a DEV-only route for visual editing of
public runtime configuration. It is excluded from production builds by Vite.

- Server functions: `src/server/config.functions.ts` — full CRUD for env vars in dev mode, writes to `.env.development` (or `SHIPONCE_DEV_CONFIG_ENV_FILE` when set)
- Field metadata: `src/services/config-settings.ts` — defines tabbed UI with groups/fields for Site, Analytics, Ads, and other settings tabs
- Refreshes the local runtime cache after writes
- Only available when `import.meta.env.DEV` is true
- Production Cloudflare values still belong in deploy-time env/secrets, not in this dev-only panel

## Init Project Templates

`scripts/templates/` contains 6 project templates used by `scripts/init/init-project.ts`:

- `base.ts` — shared configuration (sections, icon maps) inherited by all templates
- `ai-saas.ts` — AI SaaS template
- `content-platform.ts` — content platform template
- `developer-tool.ts` — developer tool template
- `ecommerce.ts` — ecommerce template
- `general.ts` — general-purpose template (default)

Each template defines landing page sections and icon maps. Template selection is driven by `VITE_APP_PRESET` or an explicit `--template` flag in the init script. The selected template is also used by `scripts/init/generate-landing.ts` during project bootstrap.

When editing templates:

- Keep section definitions consistent with available theme blocks
- Match icon names to the configured icon library
- Do not remove `base.ts` — it is the shared foundation

## Package Manager

This repository uses Bun as the package manager and command runner.

- `bun.lock` is the lockfile source of truth.
- Install dependencies with `bun install`.
- Run package scripts with `bun run <script>`.
- Run local CLI binaries with `bunx <binary>`.
- When editing package scripts, prefer `bun run` over `npm run` and `bunx` over `npx`.
- Do not add `pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, or new package-manager-specific config for other package managers.
- If a legacy script still calls `npm` or `npx`, convert it when touching that script or call it out as existing cleanup work.

## Scripts

Use Bun scripts:

- `bun run init`
- `bun run dev`
- `bun run dev:lite`
- `bun run build`
- `bun run build:lite`
- `bun run build:cf:pages`
- `bun run build:cf:worker`
- `bun run preview:cf:pages`
- `bun run preview:cf:worker`
- `./deploy.sh`
- `bun run deploy`
- `bun run sync-schema`
- `bun run db:generate`
- `bun run db:migrate`
- `bun run db:push`
- `bun run rbac:init`
- `bun run rbac:assign`

Do not convert the project away from Bun workflows.
When reaching for helper scripts, prefer the `package.json` scripts that already wrap `scripts/with-env.ts` instead of invoking `tsx`/`drizzle-kit`/`wrangler` manually unless the task specifically needs a lower-level command.

## Cloudflare Targets

`deploy.sh` is the root deployment entrypoint. It reads `deploy.env` first,
then `.env.deploy`, `.env.production`, `.env.development`, and `.env` without
overriding already exported shell variables. Use `CLOUDFLARE_DEPLOY_TARGET` or
`CF_DEPLOY_TARGET` to select `pages` or `worker`; if unset, the script infers
from `NITRO_PRESET` and then `VITE_APP_PRESET`. Keep project-specific Pages
names, Worker names, branch, and production `VITE_APP_URL` in `deploy.env`.
`scripts/init/init-project.ts` should generate `deploy.env` during project
initialization and leave `deploy.sh` executable in the generated project.

Target choice must be deterministic. Pages and Workers are different runtime
products with different env/config sources, CPU limits, routing behavior, and
state assumptions. Before deploying, print or inspect the resolved target and
the concrete Cloudflare project/Worker name. If the user asks for Worker, set
`CLOUDFLARE_DEPLOY_TARGET="worker"` in `deploy.env`; if they ask for Pages,
set `CLOUDFLARE_DEPLOY_TARGET="pages"`. Do not rely on fallback inference or
raw Wrangler commands during handoff, because the same checkout can otherwise
deploy different artifacts on different runs.

Lite mode deploys to Cloudflare Pages. Use:

- build: `bun run build:cf:pages`
- local preview: `bunx wrangler pages dev dist`
- deploy: `./deploy.sh` with `CLOUDFLARE_DEPLOY_TARGET="pages"`
- blog storage: default to `BLOG_STORAGE_MODE=mdx`; Pages lite must not require `DATABASE_URL` for public blog routes.
- runtime secret preflight: if the Pages deployment uses auth, DB-backed
  auth, or AI providers, set `CF_PAGES_REQUIRED_SECRETS` in `deploy.env`
  and make `./deploy.sh` verify those secret names with
  `bunx wrangler pages secret list --project-name <project>` before every
  deploy.

Full mode deploys to Cloudflare Workers. Use:

- build: `bun run build:cf:worker`
- local preview: `bunx wrangler dev --config .output/server/wrangler.json`
- deploy: `./deploy.sh` with `CLOUDFLARE_DEPLOY_TARGET="worker"`
- app URL: set `VITE_APP_URL` to the Worker production URL or custom domain, for example `https://<worker-name>.<subdomain>.workers.dev`; do not leave it pointing at a Lite/Pages `*.pages.dev` host
- runtime env source: the deployed Worker reads vars/bindings from Wrangler config (`wrangler.toml` and the generated `.output/server/wrangler.json`), not from `.env.development`
- full mode data requirements: a real full deployment should provide `DATABASE_URL` or a Cloudflare DB binding such as `D1`/Hyperdrive; without that, public routes may still render but DB-backed full features are degraded
- route/custom domain: if the Worker must serve the production domain, the generated config must include a route such as `example.com/*` or an equivalent custom-domain binding; a successful Worker upload alone may only publish the script and leave the production domain on Pages
- runtime var allowlist: when `deploy.sh` patches `.output/server/wrangler.json`, keep the Worker runtime variable list explicit (for example `CF_WORKER_RUNTIME_VARS`) and keep required values explicit (for example `CF_WORKER_REQUIRED_VARS`). Missing `AUTH_SECRET`, `DATABASE_URL`, provider keys, or `VITE_APP_URL` should fail preflight or be reported before deploy.

Cloudflare rules:

- Keep `wrangler.toml.example` aligned with the TanStack/Nitro output.
- Keep `deploy.sh`, `deploy.env`, the package `deploy` script, and `scripts/init/init-project.ts` aligned; do not duplicate raw Wrangler deploy commands in package scripts.
- Use `NITRO_PRESET=cloudflare_pages` for Pages builds and `NITRO_PRESET=cloudflare_module` for Worker builds.
- Always run `node scripts/deploy/patch-cf-runtime.mjs` after Cloudflare builds; package scripts already do this.
- Use `src/plugins/cloudflare-env.ts` plus `getEnv()`/`envConfigs` for runtime vars that are injected per request on Cloudflare.
- Keep lite/Pages public blog routes database-free unless a project explicitly configures a database-backed deployment. `mdx-db` must not crash when `DATABASE_URL` is absent; fall back to local MDX.
- Before a full Worker deploy, inspect the generated config, not only the local source file:
  - `grep -n "VITE_APP_URL\\|BLOG_STORAGE_MODE\\|DATABASE_URL\\|AUTH_SECRET" wrangler.toml .output/server/wrangler.json`
- For Worker deploys, inspect route and binding shape as well as env values:
  - `node -e "const c=require('fs').readFileSync('.output/server/wrangler.json','utf8'); const j=JSON.parse(c); console.log(j.name, j.routes || j.route, Object.keys(j.vars||{}))"`
- Treat `AUTH_SECRET` and `DATABASE_URL` as deploy-time secrets/config, not as values that magically flow from `.env.development` into Cloudflare runtime.
- Client-visible values must still use `VITE_*`; secrets such as `DATABASE_URL` and `AUTH_SECRET` stay server-side.
- Use project-native rendering primitives: `src/components/blocks/common/media/app-image.tsx`, `src/components/blocks/common/media/lazy-image.tsx`, and `@/core/i18n/navigation`.
- Do not add framework-specific image/link wrappers or browser-only lazy image libraries to shared SSR blocks.

## Cloudflare Deployment Pitfalls

Distilled failure modes:

- Target drift is the highest-risk deployment bug. Pages and Workers may both
  build successfully from the same repo, but they do not share runtime secrets,
  config table access, CPU behavior, routes, or canonical/auth URLs. Lock
  `CLOUDFLARE_DEPLOY_TARGET` in `deploy.env`, show the chosen target in logs,
  and deploy through `./deploy.sh` so every agent run follows the same path.
- Environment parity is target-specific. Pages reads project secrets and
  Pages-generated runtime config. Workers reads bindings and vars from
  `.output/server/wrangler.json` at deploy time. Copying values into
  `.env.development` is not enough for either target.
- A successful Cloudflare upload is not a healthy deploy. The app can return
  `200` on `/` while auth, DB-backed settings, model catalog hydration, or
  metadata still point at the wrong runtime.
- `VITE_APP_URL` is part of runtime correctness, not only SEO. A stale
  `pages.dev` or `workers.dev` value can leak into canonical tags, OG URLs,
  Better Auth callbacks, and client-side route data.
- Generated config is the final truth. Inspect `dist/_worker.js/wrangler.json`
  for Pages and `.output/server/wrangler.json` for Workers after the build and
  before deploy.
- Validate with real `GET` requests and HTML/body inspection. `HEAD` and
  homepage-only checks miss SSR errors, hydrate payload issues, auth failures,
  and stale metadata.

Lessons from the lite Pages deployment:

- Do not verify only the homepage. `/` can render while nested SSR routes fail. Always check at least `/de/blog` for lite Pages blog deployments.
- Do not run a raw `wrangler pages deploy dist` without `--project-name`; generated Nitro config can expose a Worker-oriented `name` and make Wrangler prompt to create the wrong Pages project. Prefer `./deploy.sh`, which uses `CF_PAGES_PROJECT` from `deploy.env`.
- `wrangler.toml` is ignored by git, but Wrangler still reads it locally and can copy its `[vars]` into generated deployment config. A stale local `BLOG_STORAGE_MODE = "mdx-db"` can make a lite Pages deployment hit the database even when package scripts set `BLOG_STORAGE_MODE=mdx`.
- Cloudflare Pages project secrets do not come from local `deploy.env` or
  `.env.development`. Before every Pages deploy that relies on auth or AI,
  run or rely on the `./deploy.sh` preflight for
  `CF_PAGES_REQUIRED_SECRETS`, and confirm production lists the expected
  secret names.
- Missing `AUTH_SECRET` or `DATABASE_URL` can leave public pages rendering
  while Better Auth endpoints fail with `500`/`HTTPError`. Probe
  `/api/auth/get-session`; logged-out production should return `200` with
  `null`, not a 500.
- After secrets are present, a Pages login POST can still fail with
  Cloudflare `1102` / `Worker exceeded CPU time limit` if email/password
  auth uses a CPU-heavy password verifier such as Better Auth's default
  scrypt fallback. Tail the latest deployment while reproducing the POST,
  and use an edge-friendly WebCrypto password hash/verify path or deploy a
  runtime with sufficient CPU. Existing credential hashes must be migrated
  to the new format before production login can be considered healthy.
- Lite Pages disables the DB config table even if `DATABASE_URL` exists.
  If an AI provider key is stored only in the `config` table, the deployed
  model catalog cannot see it. Put the active provider key directly in
  Pages secrets, such as `KIE_API_KEY`, or deploy full Worker mode when the
  admin-configured DB settings must be authoritative.
- The image model catalog endpoint filters enabled models by active
  providers. If `KIE_API_KEY`, `REPLICATE_API_TOKEN`, `FAL_API_KEY`, or
  `GEMINI_API_KEY` is missing in the runtime environment, the client can
  first show default SSR model data and then clear the selector after the
  hydrated model-catalog fetch.
- Before previewing or deploying Pages, inspect generated config when debugging env issues:
  - `grep -n "BLOG_STORAGE_MODE" wrangler.toml dist/_worker.js/wrangler.json .wrangler/deploy/config.json`
- Lite Pages should use `BLOG_STORAGE_MODE=mdx` by default. `DATABASE_URL` is optional for lite public blog routes.
- If a route throws `DATABASE_URL is not set`, first check whether a public route is accidentally using DB-backed blog/config code. Fix the mode or add a runtime fallback instead of adding dummy secrets.
- Validate with `GET`, not just `HEAD`; SSR errors are visible in the returned HTML/error stream.
- After deployment, verify the production alias URL, for example:
  - `curl -sS -D /tmp/shiponce-blog-headers.txt https://main.example.pages.dev/de/blog -o /tmp/shiponce-blog.html`
  - `grep -a "DATABASE_URL\\|Something went wrong" /tmp/shiponce-blog.html`
- For auth and AI Pages deployments, also verify the exact production
  surface that broke:
  - `curl -sS -D /tmp/shiponce-auth-headers.txt https://example.com/api/auth/get-session -o /tmp/shiponce-auth.json`
  - `curl -sS -D /tmp/shiponce-login-headers.txt https://example.com/api/auth/sign-in/email -H 'content-type: application/json' --data-raw '{"email":"...","password":"...","callbackURL":"/"}' -o /tmp/shiponce-login.json`
  - check the hydrated generator UI or SSR route data for non-empty
    `initialImageModels`.
- Stop local Wrangler/workerd processes after previews so later checks do not hit stale bundles.

Lessons from the full Worker deployment:

- `bun run build:cf:worker` and `wrangler deploy` can both succeed while runtime config is still wrong. A successful publish is not enough to call the full deployment healthy.
- The generated `.output/server/wrangler.json` inherits local Wrangler vars. If local `wrangler.toml` still has `VITE_APP_URL = "https://<old-pages-project>.pages.dev"`, the deployed Worker will publish correct HTML at `*.workers.dev` but still emit wrong canonical/OG/auth URLs that point back to Pages.
- Verify the Worker hostname and the rendered metadata together:
  - `curl -sS https://<worker-url>/ | grep -n "workers.dev\\|pages.dev"`
  - `curl -sS https://<worker-url>/sign-in | grep -n "workers.dev\\|pages.dev"`
- For full mode, verify at least one auth endpoint in addition to public pages:
  - `curl -sS -D /tmp/shiponce-auth-headers.txt https://<worker-url>/api/auth/get-session -o /tmp/shiponce-auth.json`
  - Expect `200` with a valid JSON body such as `null` when logged out; this catches Worker runtime/auth bootstrap failures that `/` would miss.
- If `DATABASE_PROVIDER=postgresql` but `DATABASE_URL` is empty, public SSR routes such as `/` or `/de/blog` may still work because config-table reads are skipped when no DB is available. That does not mean full mode is production-ready.
- In that no-DB state, infer the deployment as degraded rather than healthy-full: config-table overrides are skipped, auth falls back to a non-DB path, and admin/payment/content persistence cannot be trusted across Worker instances.

## Lint and Format

The project uses VoidZero/Rust tooling for the primary lint and format path.

- Lint with Oxlint: `bun run lint`
- Apply safe lint fixes: `bun run lint:fix`
- Escalate correctness warnings to errors: `bun run lint:strict`
- Format focused migration/config files with Oxfmt: `bun run format`
- Check focused migration/config files with Oxfmt: `bun run format:check`
- Format the whole repository with Oxfmt when intentionally re-baselining formatting: `bun run format:repo`
- Check the whole repository with Oxfmt when intentionally re-baselining formatting: `bun run format:repo:check`
- In this repository, `bun run format:check` is intentionally narrow and does not automatically prove that edited source files under `src/*` were checked. For touched source/content files outside that scope, add `bunx oxfmt --check <edited files>`.

Do not add a new ESLint config unless a specific rule cannot be represented in Oxlint. Do not reintroduce Prettier as a parallel formatter. Do not replace Oxfmt with Biome/dprint without checking Tailwind class sorting and import sorting behavior against this template.

## AI Validation Policy

For Codex, Claude Code, and similar agents, Oxc validation is mandatory after code or config changes.

Required workflow:

1. Run `bun run format:check`
2. Run `bun run lint`
3. If edited files fall outside the narrow `format:check` scope, also run `bunx oxfmt --check <edited files>`
4. If a check fails because of the agent's changes, fix the issues and rerun
5. Only finish after reporting the commands run and the final result

If the repository has unrelated existing warnings:

- still run the full commands once
- then run narrow checks on touched files with `bunx oxfmt --check <files>` and `bunx oxlint <files>`
- clearly separate remaining pre-existing issues from issues introduced by the agent
