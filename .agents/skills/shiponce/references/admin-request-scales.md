# Admin Request Scales

Use this reference when changing admin routes, admin server functions, auth
bootstrap around `/admin`, or any data-heavy dashboard page.

## Goal

Admin pages should scale by default:

- one auth/bootstrap request for the admin shell
- one deferred page-data request per admin page
- zero client-driven count/data split requests for the same view
- zero per-row N+1 permission, role, category, or user lookups

## Route Pattern

For list-like admin pages, keep the file route thin and normalize search params
through `loaderDeps`.

Recommended shape:

1. `validateSearch` with sane defaults
2. `loaderDeps` that maps URL state to a stable server input
3. `loader` that calls one `getAdmin*PageDataFn`
4. `defer(...)` the promise so the shell can render immediately
5. set a short `staleTime` (the current admin baseline is `30 * 1000`)

Example responsibilities:

- route owns URL/search state and skeleton rendering
- server function owns permissions, aggregation, and batching
- models own the actual persistence queries

## Server Function Pattern

For admin list pages, prefer a dedicated `getAdmin*PageDataFn` instead of
calling separate `getAdmin*Fn` and `getAdmin*CountFn` from the route.

The page-data function should:

1. validate the full page input once
2. perform permission checks once
3. build the filter object once
4. fetch count, rows, and supporting options through `Promise.all(...)`
5. return every dataset the page needs for first render

Typical return shapes:

- `{ total, users, roles }`
- `{ total, posts, categoriesOptions }`
- `{ total, payments }`
- `{ roles, permissions }`
- `{ configs, settingGroups, settings }`

Keep legacy single-purpose functions only when other routes still need them.

## Aggregation Rules

Never do per-row enrichment from the route or React component.

Move enrichment into the server/model layer:

- batch user roles with `getUserRolesByUserIds(...)`
- batch role permissions with `getRolePermissionsByRoleIds(...)`
- batch category titles once, then map locally
- dedupe IDs before querying
- build `Map` lookups instead of repeated `.find(...)`

If a table cell needs derived data, return it in the page-data payload.

## Admin Shell Rules

The `/admin` layout should avoid session/request storms.

Current baseline:

- gate access in the route loader with `getAdminBootstrapFn`
- pass `initialUser` into `AppContextProvider`
- do not call `useSession()` again from the admin sidebar/layout shell
- keep `router` `defaultPreload: false` unless a change proves otherwise
- throttle client `get-session` fetches in `src/core/auth/client.ts`
- keep server-side `get-session` rate limiting in `src/routes/api/auth/$.ts`

When adding a new admin-only UI surface, prefer consuming the bootstrapped user
from loader/context rather than re-checking auth in multiple child components.

## Cache Rules

Short-lived caches are part of the scaling strategy, not an optional extra.

Current baselines:

- config cache in `src/models/config.server.ts`
- RBAC cache in `src/services/rbac.server.ts`

Rules:

- keep TTLs short
- invalidate on every write path
- cache the batched result shape that the page-data function needs
- do not cache around missing invalidation logic

## Settings Page Special Case

Admin settings are not a plain table, but they follow the same idea:

- render tabs/skeleton from local static metadata
- fetch only the active tab payload from the server
- return only the current tab's `configs`, `settingGroups`, and `settings`
- avoid fetching every tab's config on each navigation

Prefer helper utilities such as `getSettingGroupsByTab(...)` and
`getSettingsByTab(...)` so the route, server function, and future modules all
share the same tab-scoped contract.

## Permission Checks

Use the narrowest helper that matches the page contract:

- `requirePermission(...)` for a single capability
- `requirePermissions(...)` when one payload depends on multiple capabilities

Do not rely on client-side tab hiding or menu hiding for admin protection.

## Anti-Patterns

Avoid these when extending admin:

- calling count and list server functions separately from the route
- fetching supplemental modal/form options in a second request when they can
  ride with the first page-data payload
- using per-row async lookups in React render paths
- re-fetching `get-session` from the admin shell on every mount
- loading all settings tabs when only one tab is active
- adding caches without matching invalidation on writes

## Checklist For New Admin Modules

When adding a new admin page, copy this checklist:

1. add one `getAdmin*PageDataFn`
2. batch all first-render dependencies in that function
3. use `loaderDeps` + `defer(...)` in the route
4. return pre-joined/pre-labeled table data from the server
5. add or reuse short-lived cache helpers if the page hits shared RBAC/config
   lookups
6. invalidate caches on write actions
7. keep follow-up modal submissions on targeted write server functions
8. rerun `bun run format:check` and `bun run lint`
