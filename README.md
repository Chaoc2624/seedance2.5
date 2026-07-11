# shiponce Template Two

## Getting Started

read [shiponce Document](https://shiponce.ai/docs/quick-start) to start your AI SaaS project.

## Scaffold a new project from this template

One-time setup (registers the global `shiponce` command):

```bash
cd /path/to/shiponce
bun link
```

After that, from any directory:

```bash
shiponce pdf-singer              # creates ./pdf-singer under the current directory
shiponce ~/code/my-new-app       # absolute or ~-expanded path

```

The scaffold copies the template, cleans build artifacts (`node_modules`, `.output`, `dist`, `.tanstack`, `.source`, `.wrangler`, local env/`.db`/`.sql` files, etc.), runs `git init`, `bun install`, then hands off to `bun run init` for interactive project configuration (name, DB, auth, admin, layout).

Flags: `--no-install`, `--no-init`, `-h`.

Alternative invocation without `bun link`: `bun run create <target>` from the template directory.

## Tooling

- Package manager: `bun`
- Lint: `bun run lint`
- Format check: `bun run format:check`

## Cloudflare Deploy

For normal deployments, configure `deploy.env`, then run:

```bash
./deploy.sh
```

`CLOUDFLARE_DEPLOY_TARGET` controls whether the script deploys to Cloudflare
Pages or Workers. `bun run deploy` uses the same root script.

### Local Wrangler config

`wrangler.toml` is local deployment config and is ignored by git. Start from the example:

```bash
cp wrangler.toml.example wrangler.toml
```

Then update at least:

- `name`
- `VITE_APP_URL`
- `AUTH_SECRET`
- `BLOG_STORAGE_MODE`

For lite Pages deploys, keep `BLOG_STORAGE_MODE="mdx"` unless you intentionally set up database-backed blog storage.

### Lite mode -> Cloudflare Pages

Create a new Pages project:

```bash
bunx wrangler pages project create <project-name> --production-branch main --compatibility-date 2026-04-17 --compatibility-flags nodejs_compat
```

Build and deploy:

```bash
VITE_APP_URL=https://<project-name>.pages.dev bun run build:cf:pages
bunx wrangler pages deploy dist --project-name <project-name> --branch main --commit-dirty=true
```

Verify a real SSR route after deploy, not only `/`:

```bash
curl -sS -D /tmp/shiponce-blog-headers.txt https://<project-name>.pages.dev/de/blog -o /tmp/shiponce-blog.html
rg -a "DATABASE_URL|Something went wrong" /tmp/shiponce-blog.html
```

### Full mode -> Cloudflare Workers

Build and deploy:

```bash
bun run build:cf:worker
bunx wrangler deploy --config .output/server/wrangler.json
```

Preview locally:

```bash
bunx wrangler dev --config .output/server/wrangler.json
```

## Buy Templates

check [shiponce Templates](https://shiponce.ai/templates) to buy Business Templates.

## Feedback

submit your feedbacks on [Github Issues](https://github.com/shiponceai/shiponce-template-two/issues)

## LICENSE

!!! Please do not publicly release shiponce's Code. Illegal use will be prosecuted

[shiponce LICENSE](./LICENSE)
