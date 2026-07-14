---
name: cf-deploy
description: >
  ShipOnce Cloudflare deploy and debug workflow for Pages (lite) and Workers (full).
  Use when deploying to Cloudflare, debugging Pages/Worker env drift, wrangler preview
  failures, deploy.sh / deploy.env targets, missing AUTH_SECRET or DATABASE_URL after
  deploy, stale pages.dev/workers.dev metadata, blog SSR 500s, or when the user runs
  /cf-deploy.
---

# Cloudflare Deploy (cf-deploy)

Focused ShipOnce skill for Cloudflare target lock, build, preview, deploy, and
post-deploy probes. Parent `shiponce` remains the project authority for Bun/Oxc
and architecture rules.

## Before anything else

1. Read parent references (paths relative to this skill):
   - `../../references/configuration.md` (deploy.sh, deploy.env, CF target vars)
   - `../../references/feature-workflows.md` (Cloudflare section)
2. Inspect current tree: `git status --short`
3. **Lock the target from `deploy.env` first** and report it. Do not let inferred
   defaults choose Pages vs Workers.

| Preset / target | `CLOUDFLARE_DEPLOY_TARGET` | Build                     | Local preview                                             |
| --------------- | -------------------------- | ------------------------- | --------------------------------------------------------- |
| Lite / Pages    | `pages`                    | `bun run build:cf:pages`  | `bunx wrangler pages dev dist`                            |
| Full / Worker   | `worker`                   | `bun run build:cf:worker` | `bunx wrangler dev --config .output/server/wrangler.json` |

## Workflow

1. **Read deploy config**
   - `deploy.env`: `CLOUDFLARE_DEPLOY_TARGET`, `CF_PAGES_PROJECT`, `CF_WORKER_NAME`,
     branch, production `VITE_APP_URL`, required secrets/vars allowlists
   - Prefer root `./deploy.sh` over raw Wrangler deploy commands

2. **Preflight (blockers)**
   - Full/Worker: `VITE_APP_URL`, `DATABASE_URL`, `AUTH_SECRET`, `BLOG_STORAGE_MODE`,
     provider keys present in generated Worker config path (not only `.env.development`)
   - Lite/Pages: blog should use MDX mode where required; DB-backed full features
     are not assumed on Pages
   - Client-visible values stay `VITE_*`; secrets stay server-side

3. **Build the matching target only**
   - Never build Pages artifacts then deploy as Worker (or the reverse)

4. **Local Wrangler preview + real route probes** (not only `/`)
   - Lite/Pages public content:

     ```bash
     curl -sS -D /tmp/shiponce-blog-headers.txt <url>/de/blog -o /tmp/shiponce-blog.html
     ```

     Expect `200`. HTML must not contain `DATABASE_URL` or `Something went wrong`.

   - Full/Worker auth/runtime:

     ```bash
     curl -sS -D /tmp/shiponce-auth-headers.txt <url>/api/auth/get-session -o /tmp/shiponce-auth.json
     curl -sS <url>/sign-in | grep -n "workers.dev\\|pages.dev" || true
     ```

5. **Deploy** only after preview probes pass: `./deploy.sh`

6. **Production alias probes** with the same route checks as preview

## Failure triage order

1. Wrong target (Pages vs Worker) or mixed artifacts
2. Missing runtime secrets/vars (`AUTH_SECRET`, `DATABASE_URL`, provider keys)
3. Stale `VITE_APP_URL` / `pages.dev` / `workers.dev` in HTML metadata or auth URLs
4. Auth CPU limits on Pages (`1102`) → hand off to `auth` skill (password hash path)
5. Blog empty → locale/content coverage before assuming deploy breakage
6. Only then change application code

## Non-goals

- Do not redesign architecture or add parallel deploy tooling
- Do not invent project/Worker names; read `deploy.env`
- Do not claim deploy success without probing a real SSR route

## Report back

- Resolved target (`pages` | `worker`) and project/Worker name
- Commands run (build, preview, deploy, curls)
- Probe status codes and any HTML/runtime red flags
- Blockers that need secrets or human Cloudflare dashboard action
