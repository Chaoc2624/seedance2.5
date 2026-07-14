#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

log() {
  printf '\n%s\n' "$1"
}

load_env_file() {
  local file="$1"
  [[ -f "$file" ]] || return 0

  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ "$line" =~ ^[[:space:]]*$ ]] && continue
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" =~ ^[[:space:]]*([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*=[[:space:]]*(.*)$ ]] || continue

    local key="${BASH_REMATCH[1]}"
    local value="${BASH_REMATCH[2]}"
    value="$(printf '%s' "$value" | sed -e 's/[[:space:]]*$//')"

    if [[ "$value" == \"*\" && "$value" == *\" ]]; then
      value="${value:1:${#value}-2}"
    elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
      value="${value:1:${#value}-2}"
    fi

    if [[ -z "${!key+x}" ]]; then
      export "$key=$value"
    fi
  done < "$file"
}

has_package_script() {
  local script_name="$1"
  node -e "const fs=require('node:fs'); const pkg=JSON.parse(fs.readFileSync('package.json','utf8')); process.exit(pkg.scripts && pkg.scripts[process.argv[1]] ? 0 : 1)" "$script_name"
}

should_run_seo_maps() {
  local seo_mode="${DEPLOY_RUN_SEO_MAPS:-auto}"

  case "$seo_mode" in
    true|1|yes)
      if ! has_package_script "seo:maps"; then
        echo "DEPLOY_RUN_SEO_MAPS=true but package script seo:maps is missing." >&2
        exit 1
      fi
      return 0
      ;;
    false|0|no)
      return 1
      ;;
    auto|"")
      if has_package_script "seo:maps"; then
        return 0
      fi
      return 1
      ;;
    *)
      echo "Unknown DEPLOY_RUN_SEO_MAPS=$seo_mode. Use auto, true, or false." >&2
      exit 1
      ;;
  esac
}

require_public_url() {
  local value="${VITE_APP_URL:-${SITE_URL:-}}"

  if [[ -z "$value" ]]; then
    echo "Missing VITE_APP_URL or SITE_URL for deployment." >&2
    exit 1
  fi

  if [[ "$value" == http://localhost* || "$value" == http://127.0.0.1* ]] && [[ "${DEPLOY_ALLOW_LOCAL_APP_URL:-false}" != "true" ]]; then
    echo "Refusing to deploy with local VITE_APP_URL=$value." >&2
    echo "Set a production URL in deploy.env, or set DEPLOY_ALLOW_LOCAL_APP_URL=true." >&2
    exit 1
  fi

  export VITE_APP_URL="$value"
}

patch_worker_name() {
  local worker_name="${CF_WORKER_NAME:-${CLOUDFLARE_WORKER_NAME:-}}"
  [[ -n "$worker_name" ]] || return 0

  CF_WORKER_NAME="$worker_name" node --input-type=module -e "
import { readFileSync, writeFileSync } from 'node:fs';
const path = '.output/server/wrangler.json';
const config = JSON.parse(readFileSync(path, 'utf8'));
config.name = process.env.CF_WORKER_NAME;
writeFileSync(path, JSON.stringify(config, null, 2) + '\n');
console.log('Cloudflare Worker name:', config.name);
"
}

patch_worker_route() {
  local route_pattern="${CF_WORKER_ROUTE_PATTERN:-}"
  local route_zone_name="${CF_WORKER_ROUTE_ZONE_NAME:-}"
  [[ -n "$route_pattern" ]] || return 0

  CF_WORKER_ROUTE_PATTERN="$route_pattern" \
    CF_WORKER_ROUTE_ZONE_NAME="$route_zone_name" \
    node --input-type=module -e "
import { readFileSync, writeFileSync } from 'node:fs';
const path = '.output/server/wrangler.json';
const config = JSON.parse(readFileSync(path, 'utf8'));
config.routes = [{
  pattern: process.env.CF_WORKER_ROUTE_PATTERN,
  ...(process.env.CF_WORKER_ROUTE_ZONE_NAME
    ? { zone_name: process.env.CF_WORKER_ROUTE_ZONE_NAME }
    : {}),
}];
writeFileSync(path, JSON.stringify(config, null, 2) + '\n');
console.log('Cloudflare Worker route:', process.env.CF_WORKER_ROUTE_PATTERN);
"
}

parse_bool_flag() {
  local raw
  raw="$(printf '%s' "${1:-}" | tr '[:upper:]' '[:lower:]')"
  case "$raw" in
    1 | true | yes | on) printf 'true' ;;
    0 | false | no | off | '') printf 'false' ;;
    *)
      echo "Invalid boolean flag: $1 (use true/false)." >&2
      exit 1
      ;;
  esac
}

patch_worker_observability() {
  # Full observability block (dashboard-compatible). Defaults match current CF UI.
  local obs_enabled logs_enabled logs_persist logs_invocation traces_enabled traces_persist
  local head_rate logs_head_rate traces_head_rate

  obs_enabled="$(parse_bool_flag "${CF_WORKER_OBSERVABILITY_ENABLED:-false}")"
  logs_enabled="$(parse_bool_flag "${CF_WORKER_OBSERVABILITY_LOGS_ENABLED:-true}")"
  logs_persist="$(parse_bool_flag "${CF_WORKER_OBSERVABILITY_LOGS_PERSIST:-true}")"
  logs_invocation="$(parse_bool_flag "${CF_WORKER_OBSERVABILITY_LOGS_INVOCATION:-true}")"
  traces_enabled="$(parse_bool_flag "${CF_WORKER_OBSERVABILITY_TRACES_ENABLED:-true}")"
  traces_persist="$(parse_bool_flag "${CF_WORKER_OBSERVABILITY_TRACES_PERSIST:-true}")"
  head_rate="${CF_WORKER_OBSERVABILITY_HEAD_SAMPLING_RATE:-1}"
  logs_head_rate="${CF_WORKER_OBSERVABILITY_LOGS_HEAD_SAMPLING_RATE:-$head_rate}"
  traces_head_rate="${CF_WORKER_OBSERVABILITY_TRACES_HEAD_SAMPLING_RATE:-$head_rate}"

  CF_WORKER_OBSERVABILITY_ENABLED="$obs_enabled" \
    CF_WORKER_OBSERVABILITY_HEAD_SAMPLING_RATE="$head_rate" \
    CF_WORKER_OBSERVABILITY_LOGS_ENABLED="$logs_enabled" \
    CF_WORKER_OBSERVABILITY_LOGS_HEAD_SAMPLING_RATE="$logs_head_rate" \
    CF_WORKER_OBSERVABILITY_LOGS_PERSIST="$logs_persist" \
    CF_WORKER_OBSERVABILITY_LOGS_INVOCATION="$logs_invocation" \
    CF_WORKER_OBSERVABILITY_TRACES_ENABLED="$traces_enabled" \
    CF_WORKER_OBSERVABILITY_TRACES_PERSIST="$traces_persist" \
    CF_WORKER_OBSERVABILITY_TRACES_HEAD_SAMPLING_RATE="$traces_head_rate" \
    node --input-type=module -e "
import { readFileSync, writeFileSync } from 'node:fs';

const path = '.output/server/wrangler.json';
const config = JSON.parse(readFileSync(path, 'utf8'));
const flag = (key, fallback = false) =>
  String(process.env[key] ?? fallback).toLowerCase() === 'true';
const rate = (key, fallback = 1) => {
  const value = Number(process.env[key] ?? fallback);
  return Number.isFinite(value) ? value : fallback;
};

config.observability = {
  enabled: flag('CF_WORKER_OBSERVABILITY_ENABLED', false),
  head_sampling_rate: rate('CF_WORKER_OBSERVABILITY_HEAD_SAMPLING_RATE', 1),
  logs: {
    enabled: flag('CF_WORKER_OBSERVABILITY_LOGS_ENABLED', true),
    head_sampling_rate: rate('CF_WORKER_OBSERVABILITY_LOGS_HEAD_SAMPLING_RATE', 1),
    persist: flag('CF_WORKER_OBSERVABILITY_LOGS_PERSIST', true),
    invocation_logs: flag('CF_WORKER_OBSERVABILITY_LOGS_INVOCATION', true),
  },
  traces: {
    enabled: flag('CF_WORKER_OBSERVABILITY_TRACES_ENABLED', true),
    persist: flag('CF_WORKER_OBSERVABILITY_TRACES_PERSIST', true),
    head_sampling_rate: rate(
      'CF_WORKER_OBSERVABILITY_TRACES_HEAD_SAMPLING_RATE',
      1
    ),
  },
};

writeFileSync(path, JSON.stringify(config, null, 2) + '\n');
console.log(
  'Cloudflare Worker observability:',
  JSON.stringify(config.observability)
);
"
}

patch_worker_runtime_vars() {
  node --input-type=module - <<'NODE'
import { readFileSync, writeFileSync } from 'node:fs';

const path = '.output/server/wrangler.json';
const config = JSON.parse(readFileSync(path, 'utf8'));
const defaultKeys = [
  'VITE_APP_URL',
  'VITE_APP_NAME',
  'VITE_APP_PRESET',
  'VITE_THEME',
  'VITE_APPEARANCE',
  'VITE_DEFAULT_LOCALE',
  'VITE_APP_LOGO',
  'VITE_APP_FAVICON',
  'VITE_APP_PREVIEW_IMAGE',
  'VITE_LOCALE_DETECT_ENABLED',
  'VITE_AUTH_GET_SESSION_MIN_INTERVAL_MS',
  'BLOG_STORAGE_MODE',
  'VITE_BLOG_STORAGE_MODE',
  'DATABASE_PROVIDER',
  'DATABASE_URL',
  'DATABASE_AUTH_TOKEN',
  'DB_SCHEMA_FILE',
  'DB_SCHEMA',
  'DB_MIGRATIONS_TABLE',
  'DB_MIGRATIONS_SCHEMA',
  'DB_MIGRATIONS_OUT',
  'DB_SINGLETON_ENABLED',
  'DB_MAX_CONNECTIONS',
  'AUTH_URL',
  'AUTH_SECRET',
  'EMAIL_AUTH_ENABLED',
  'EMAIL_VERIFICATION_ENABLED',
  'GOOGLE_AUTH_ENABLED',
  'GOOGLE_ONE_TAP_ENABLED',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_AUTH_ENABLED',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'GOOGLE_ANALYTICS_ID',
  'GOOGLE_SEARCH_CONSOLE_ID',
  'CLARITY_ID',
  'PLAUSIBLE_SCRIPT_ID',
  'BING_WEBMASTER_VERIFICATION_ID',
  'BING_INDEXNOW_KEY',
  'ADSENSE_CODE',
  'GOOGLE_FUNDING_CHOICES_ID',
  'RESEND_API_KEY',
  'RESEND_SENDER_EMAIL',
  'R2_ACCESS_KEY',
  'R2_SECRET_KEY',
  'R2_BUCKET_NAME',
  'R2_UPLOAD_PATH',
  'R2_ENDPOINT',
  'R2_DOMAIN',
  'OPENROUTER_API_KEY',
  'OPENROUTER_BASE_URL',
  'REPLICATE_API_TOKEN',
  'REPLICATE_CUSTOM_STORAGE',
  'FAL_API_KEY',
  'FAL_CUSTOM_STORAGE',
  'GEMINI_API_KEY',
  'KIE_API_KEY',
  'KIE_CUSTOM_STORAGE',
  'SELECT_PAYMENT_ENABLED',
  'DEFAULT_PAYMENT_PROVIDER',
  'STRIPE_ENABLED',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_SIGNING_SECRET',
  'STRIPE_PAYMENT_METHODS',
  'STRIPE_PROMOTION_CODES',
  'STRIPE_ALLOW_PROMOTION_CODES',
  'CREEM_ENABLED',
  'CREEM_ENVIRONMENT',
  'CREEM_API_KEY',
  'CREEM_SIGNING_SECRET',
  'CREEM_PRODUCT_IDS',
  'PAYPAL_ENABLED',
  'PAYPAL_ENVIRONMENT',
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
  'PAYPAL_WEBHOOK_ID',
];

const keys = (process.env.CF_WORKER_RUNTIME_VARS || defaultKeys.join(','))
  .split(',')
  .map((key) => key.trim())
  .filter(Boolean);

const requiredKeys = (process.env.CF_WORKER_REQUIRED_VARS || '')
  .split(',')
  .map((key) => key.trim())
  .filter(Boolean);

const vars = { ...(config.vars || {}) };
const applied = [];
const missing = [];

for (const key of keys) {
  const value = process.env[key];
  if (value === undefined || value === '') continue;
  vars[key] = value;
  applied.push(key);
}

for (const key of requiredKeys) {
  if (!vars[key]) missing.push(key);
}

if (missing.length > 0) {
  console.error(`Missing required Worker runtime vars: ${missing.join(', ')}`);
  process.exit(1);
}

config.vars = vars;
writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`);
console.log(
  `Cloudflare Worker runtime vars: ${applied.length ? applied.join(', ') : 'none'}`
);
NODE
}

run_pages_deploy() {
  require_public_url

  local project="${CF_PAGES_PROJECT:-${CLOUDFLARE_PAGES_PROJECT:-}}"
  if [[ -z "$project" ]]; then
    echo "Missing CF_PAGES_PROJECT for Cloudflare Pages deployment." >&2
    echo "Set CF_PAGES_PROJECT in deploy.env." >&2
    exit 1
  fi

  export CF_PAGES_PROJECT="$project"
  export CF_PAGES_BRANCH="${CF_PAGES_BRANCH:-main}"

  log "Deploy target: Cloudflare Pages"
  echo "Pages project: $CF_PAGES_PROJECT"
  echo "Branch: $CF_PAGES_BRANCH"
  echo "Site URL: $VITE_APP_URL"

  bun run build:cf:pages

  if should_run_seo_maps; then
    log "Generating SEO maps before final Pages build"
    bun run seo:maps
    bun run build:cf:pages
  fi

  log "Deploying Pages project"
  bunx wrangler pages deploy dist \
    --project-name "$CF_PAGES_PROJECT" \
    --branch "$CF_PAGES_BRANCH" \
    --commit-dirty=true
}

run_worker_deploy() {
  require_public_url

  log "Deploy target: Cloudflare Workers"
  echo "Site URL: $VITE_APP_URL"
  bun run build:cf:worker
  patch_worker_name
  patch_worker_route
  patch_worker_observability
  patch_worker_runtime_vars
  bunx wrangler deploy --config .output/server/wrangler.json
}

for env_file in "${DEPLOY_ENV_FILE:-deploy.env}" .env.deploy .env.production .env.development .env; do
  load_env_file "$env_file"
done

target="${CLOUDFLARE_DEPLOY_TARGET:-${CF_DEPLOY_TARGET:-}}"
if [[ -z "$target" ]]; then
  case "${NITRO_PRESET:-}" in
    cloudflare_pages) target="pages" ;;
    cloudflare_module) target="worker" ;;
  esac
fi
if [[ -z "$target" ]]; then
  case "${VITE_APP_PRESET:-}" in
    lite) target="pages" ;;
    full) target="worker" ;;
    *) target="pages" ;;
  esac
fi

case "$target" in
  pages|page|cf-pages|cloudflare-pages)
    run_pages_deploy
    ;;
  worker|workers|cf-worker|cloudflare-worker|cloudflare-workers)
    run_worker_deploy
    ;;
  *)
    echo "Unknown CLOUDFLARE_DEPLOY_TARGET=$target. Use pages or worker." >&2
    exit 1
    ;;
esac
