---
name: auth
description: >
  ShipOnce Better Auth and RBAC workflow: email/password login, OAuth, sessions,
  email verification, admin init passwords, Cloudflare auth secrets, and edge
  password-hash compatibility. Use when debugging sign-in/sign-up, get-session,
  OAuth callbacks, AUTH_SECRET, credential hashes, init-admin, RBAC permissions,
  or when the user runs /auth.
---

# Auth (Better Auth + RBAC)

Focused ShipOnce skill for authentication and authorization boundaries. Parent
`shiponce` remains the project authority for Bun/Oxc and architecture rules.

## Before anything else

1. Read parent references (paths relative to this skill):
   - `../../references/feature-workflows.md` (Auth and RBAC section first)
   - `../../references/configuration.md` when env/secrets/deploy targets matter
   - `../../references/admin-request-scales.md` when admin bootstrap/RBAC lists storm
2. Inspect current tree: `git status --short`
3. Reproduce with a minimal HTTP probe before changing UI

## Ownership map

| Concern                    | Location                                                      |
| -------------------------- | ------------------------------------------------------------- |
| Static auth options        | `src/core/auth/config.server.ts`                              |
| Server auth instance/cache | `src/core/auth/index.server.ts`                               |
| Client helpers             | `src/core/auth/client.ts`                                     |
| Catch-all API route        | `src/routes/api/auth/$.ts` → `auth.handler`                   |
| OAuth popup/callback       | `src/routes/{-$locale}/_oauth/`                               |
| Sign-in/up UI              | `src/routes/{-$locale}/_auth/`, `src/components/blocks/sign/` |
| RBAC core                  | `src/core/rbac`, `src/services/rbac.server.ts`                |
| Admin bootstrap            | `scripts/init/init-admin.ts`, `scripts/init/init-rbac.ts`     |

Rules:

- Do not put Drizzle queries in React components
- Server work stays in models + `createServerFn` / auth handler path
- Client-visible env must be `VITE_*`; `AUTH_SECRET` and DB URLs stay server-side
- Admin APIs must `requirePermission()`; client route hiding is not enough

## Diagnose loop (login / session)

1. **Is the request reaching auth?**
   - `GET /api/auth/ok` or `GET /api/auth/get-session` should respond quickly
2. **Does the path need the database?**
   - Email/password sign-in/up queries user + credential account
   - Hang/timeout/500 with empty body often means **DB connectivity**, not form UI
3. **Local DB connectivity**
   - Confirm `DATABASE_PROVIDER` / `DATABASE_URL` from the active env file
   - Proxy/fake-ip can break Neon Postgres (`CONNECT_TIMEOUT`); fix network or use a reachable URL before rewriting auth
4. **Credentials**
   - Wrong password → `401` `INVALID_EMAIL_OR_PASSWORD` (healthy path)
   - Reset/init: `scripts/init/init-admin.ts` with `ADMIN_PASSWORD` or `--password`
   - Default project init password is often `qwerqwer` unless customized
5. **Cloudflare / edge after deploy**
   - Check Pages secrets or Worker vars: `AUTH_SECRET`, `DATABASE_URL`, `DATABASE_PROVIDER`
   - `500` on get-session with secrets missing → env first, not UI
   - Pages `1102` / CPU limit on `/api/auth/sign-in/email` → scrypt may be too heavy;
     use edge-friendly WebCrypto hash/verify and **migrate hashes**; init scripts must
     use the **same** hasher as production verify

## Safe change checklist

- Prefer fixing shared root cause in `src/core/auth/*` over one-off UI workarounds
- Keep Better Auth catch-all thin; rate limits belong at the route boundary
- OAuth: verify Google/GitHub client id/secret in runtime config and callback URLs
- Email verification: requires `email_verification_enabled` + Resend; do not double-send
- After code changes: `bun run format:check`, `bun run lint`, plus
  `bunx oxfmt --check <edited files>` when outside default format scope

## Probes

```bash
# Session (logged out → null is OK)
curl -sS -m 10 -D - 'http://localhost:4000/api/auth/get-session' -o /tmp/shiponce-auth.json

# Email password sign-in
curl -sS -m 20 -D - 'http://localhost:4000/api/auth/sign-in/email' \
  -H 'content-type: application/json' \
  --data-raw '{"email":"...","password":"...","callbackURL":"/"}' \
  -o /tmp/shiponce-login.json
```

Production/Worker: use the same paths on the deployed origin; for CF target
locking and deploy secrets, route to `cf-deploy`.

## Non-goals

- Do not redesign auth into a parallel framework
- Do not store secrets in client bundles
- Do not “fix” login by skipping verification requirements without explicit product ask

## Report back

- Symptom (status, body, hang vs 401 vs 500)
- Whether DB/env/proxy was the root cause
- Files touched and validation commands
- If password was reset, state that explicitly (never print secrets)
