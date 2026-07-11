#!/usr/bin/env tsx
import {
  exec,
  execFile,
  execFileSync,
  type ExecFileOptionsWithStringEncoding,
  type ExecOptionsWithStringEncoding,
} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import * as p from '@clack/prompts';
import pc from 'picocolors';

p.intro(pc.bgCyan(pc.black(' shiponce — Project Setup ')));

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);
const DEFAULT_LOCAL_APP_URL = 'http://localhost:3000';
const DEFAULT_LOCAL_POSTGRES_DB_NAME = 'shiponce_dev';
const DEFAULT_ADMIN_PASSWORD = 'qwerqwer';
const DEFAULT_PROJECT_NAME =
  process.env.SHIPONCE_DEFAULT_PROJECT_NAME?.trim() || 'shiponce';
const SETUP_COMMAND_TIMEOUT_MS = 120_000;
const DB_MIGRATE_TIMEOUT_MS = 300_000;
const SUPABASE_SESSION_POOLER_PLACEHOLDER =
  'postgresql://postgres.xxx:xxx@aws-0-xxx.pooler.supabase.com:5432/postgres';

type CleanupEntry =
  | {
      kind: 'file';
      path: string;
      existed: false;
    }
  | {
      kind: 'file';
      path: string;
      existed: true;
      content: Buffer;
      mode: number;
    }
  | {
      kind: 'dir';
      path: string;
      existed: false;
    }
  | {
      kind: 'dir';
      path: string;
      existed: true;
      snapshotPath: string;
      snapshotRoot: string;
    };

const cleanupEntries: CleanupEntry[] = [];
const cleanupEntryPaths = new Set<string>();
let setupCompleted = false;
let cleanupStarted = false;

function resolveCleanupPath(targetPath: string): string {
  return path.resolve(process.cwd(), targetPath);
}

function trackCleanupTarget(targetPath: string, kind: 'file' | 'dir'): void {
  const resolvedPath = resolveCleanupPath(targetPath);
  if (cleanupEntryPaths.has(resolvedPath)) return;
  cleanupEntryPaths.add(resolvedPath);

  if (!fs.existsSync(resolvedPath)) {
    cleanupEntries.push({ kind, path: resolvedPath, existed: false });
    return;
  }

  const stat = fs.statSync(resolvedPath);
  if (kind === 'dir' || stat.isDirectory()) {
    const snapshotRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'shiponce-init-')
    );
    const snapshotPath = path.join(snapshotRoot, 'snapshot');
    fs.cpSync(resolvedPath, snapshotPath, { recursive: true });
    cleanupEntries.push({
      kind: 'dir',
      path: resolvedPath,
      existed: true,
      snapshotPath,
      snapshotRoot,
    });
    return;
  }

  cleanupEntries.push({
    kind: 'file',
    path: resolvedPath,
    existed: true,
    content: fs.readFileSync(resolvedPath),
    mode: stat.mode,
  });
}

function writeTrackedFileSync(
  filePath: string,
  data: string | NodeJS.ArrayBufferView
): void {
  trackCleanupTarget(filePath, 'file');
  fs.writeFileSync(filePath, data);
}

function appendTrackedFileSync(filePath: string, data: string): void {
  trackCleanupTarget(filePath, 'file');
  fs.appendFileSync(filePath, data);
}

function mkdirTrackedSync(dirPath: string): void {
  trackCleanupTarget(dirPath, 'dir');
  fs.mkdirSync(dirPath, { recursive: true });
}

function chmodTrackedSync(filePath: string, mode: fs.Mode): void {
  trackCleanupTarget(filePath, 'file');
  fs.chmodSync(filePath, mode);
}

function cleanupTrackedChanges(): void {
  if (cleanupStarted || setupCompleted) return;
  cleanupStarted = true;

  const restored: string[] = [];
  for (const entry of [...cleanupEntries].reverse()) {
    try {
      if (!entry.existed) {
        fs.rmSync(entry.path, { recursive: true, force: true });
      } else if (entry.kind === 'file') {
        fs.writeFileSync(entry.path, entry.content);
        fs.chmodSync(entry.path, entry.mode);
      } else {
        fs.rmSync(entry.path, { recursive: true, force: true });
        fs.cpSync(entry.snapshotPath, entry.path, { recursive: true });
        fs.rmSync(entry.snapshotRoot, { recursive: true, force: true });
      }
      restored.push(path.relative(process.cwd(), entry.path) || entry.path);
    } catch (err) {
      process.stderr.write(
        pc.red(
          `Cleanup failed for ${entry.path}: ${err instanceof Error ? err.message : String(err)}\n`
        )
      );
    }
  }

  if (restored.length > 0) {
    process.stderr.write(
      pc.yellow(
        `\nSetup did not complete — cleaned up ${restored.length} touched path(s).\n`
      )
    );
  }
}

function discardCleanupSnapshots(): void {
  for (const entry of cleanupEntries) {
    if (entry.kind !== 'dir' || !entry.existed) continue;
    fs.rmSync(entry.snapshotRoot, { recursive: true, force: true });
  }
}

process.once('SIGINT', () => {
  p.cancel('Setup cancelled.');
  cleanupTrackedChanges();
  process.exit(130);
});
process.once('SIGTERM', () => {
  cleanupTrackedChanges();
  process.exit(143);
});
process.once('SIGHUP', () => {
  cleanupTrackedChanges();
  process.exit(129);
});
process.on('exit', (code) => {
  if (code !== 0) cleanupTrackedChanges();
});

type SupabaseConnectionKind =
  | 'direct'
  | 'session-pooler'
  | 'transaction-pooler';
type HeaderPosition = 'top' | 'left';
type DatabaseSetup = 'none' | 'local-pg' | 'neon' | 'supabase' | 'sqlite';
type BlogStorageMode = 'mdx' | 'mdx-db';
type CloudflareDeployTarget = 'pages' | 'worker';

function isValidPostgresDbName(value: string | undefined): boolean {
  return /^[a-zA-Z0-9_][a-zA-Z0-9_-]*$/.test(value ?? '');
}

function resolveTextPromptValue(
  value: string | undefined,
  fallback: string
): string {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : fallback;
}

function validateUrl(value: string | undefined): string | undefined {
  if (!value?.trim()) return 'URL is required';

  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return 'URL must start with http:// or https://';
    }
  } catch {
    return 'Enter a valid URL, e.g. http://localhost:3000';
  }
}

function toCloudflareName(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-') || DEFAULT_PROJECT_NAME
  );
}

function getDefaultCloudflareTarget(preset: string): CloudflareDeployTarget {
  return preset === 'lite' ? 'pages' : 'worker';
}

function getDefaultDeployUrl(
  target: CloudflareDeployTarget,
  cloudflareName: string
): string {
  return target === 'pages'
    ? `https://${cloudflareName}.pages.dev`
    : `https://${cloudflareName}.workers.dev`;
}

function buildDeployEnvContent(options: {
  appName: string;
  cloudflareName: string;
  siteUrl: string;
  target: CloudflareDeployTarget;
}): string {
  const workerLine =
    options.target === 'worker'
      ? `CF_WORKER_NAME = "${options.cloudflareName}"\n`
      : `# CF_WORKER_NAME = "${options.cloudflareName}"\n`;

  return `# Generated by: bun run init
# Deployment config for ./deploy.sh.
# pages: Cloudflare Pages, worker: Cloudflare Workers
CLOUDFLARE_DEPLOY_TARGET = "${options.target}"
CF_PAGES_PROJECT = "${options.cloudflareName}"
CF_PAGES_BRANCH = "main"
${workerLine}VITE_APP_URL = "${options.siteUrl}"
VITE_APP_NAME = "${options.appName}"
DEPLOY_RUN_SEO_MAPS = "auto"
`;
}

function writeDeployEnvFile(content: string): string {
  const deployEnvPath = 'deploy.env';

  if (!fs.existsSync(deployEnvPath)) {
    writeTrackedFileSync(deployEnvPath, content);
    return deployEnvPath;
  }

  const current = fs.readFileSync(deployEnvPath, 'utf8');
  const looksLikeTemplateDefault =
    current.includes('scripts/init-project.ts rewrites this file') ||
    current.includes('CF_PAGES_PROJECT = "shiponce"');

  if (looksLikeTemplateDefault) {
    writeTrackedFileSync(deployEnvPath, content);
    return deployEnvPath;
  }

  const altPath = 'deploy.env.new';
  writeTrackedFileSync(altPath, content);
  return altPath;
}

function validateEmail(value: string | undefined): string | undefined {
  const trimmedValue = value?.trim();

  if (!trimmedValue) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
    return 'Enter a valid email address';
  }
}

function validatePassword(value: string | undefined): string | undefined {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
}

function validateCloudPostgresUrl(
  value: string | undefined,
  provider: 'neon' | 'supabase'
): string | undefined {
  const trimmedValue = value?.trim();

  if (!trimmedValue) return 'DATABASE_URL is required';
  if (
    !trimmedValue.startsWith('postgresql://') &&
    !trimmedValue.startsWith('postgres://')
  ) {
    return 'URL must start with postgresql:// or postgres://';
  }
  if (/\[(?:YOUR-)?PASSWORD\]|<password>|your-password/i.test(trimmedValue)) {
    return 'Replace the password placeholder with your real database password';
  }

  try {
    const url = new URL(trimmedValue);

    if (!url.hostname) return 'DATABASE_URL must include a database host';
    if (!url.username || !url.password) {
      return `${provider === 'neon' ? 'Neon' : 'Supabase'} DATABASE_URL must include username and password`;
    }
  } catch {
    return 'Enter a valid PostgreSQL connection URL';
  }
}

function getSupabaseConnectionKind(
  databaseUrl: string
): SupabaseConnectionKind | undefined {
  try {
    const url = new URL(databaseUrl);
    const hostname = url.hostname.toLowerCase();

    if (hostname.endsWith('.pooler.supabase.com')) {
      return url.port === '6543' ? 'transaction-pooler' : 'session-pooler';
    }

    if (
      hostname.startsWith('db.') &&
      hostname.endsWith('.supabase.co') &&
      url.port === '5432'
    ) {
      return 'direct';
    }
  } catch {
    return undefined;
  }
}

async function promptCloudPostgresUrl(
  provider: 'neon' | 'supabase',
  serviceName: string,
  placeholder: string
): Promise<string> {
  while (true) {
    const url = await p.text({
      message: `${serviceName} DATABASE_URL`,
      placeholder,
      validate: (val: string | undefined) =>
        validateCloudPostgresUrl(val, provider),
    });

    if (p.isCancel(url)) {
      p.cancel('Setup cancelled.');
      process.exit(130);
    }

    const databaseUrl = url.trim();
    if (provider !== 'supabase') {
      return databaseUrl;
    }

    const connectionKind = getSupabaseConnectionKind(databaseUrl);

    if (connectionKind === 'session-pooler') {
      p.log.success('Supabase Session Pooler selected.');
      return databaseUrl;
    }

    if (connectionKind === 'direct') {
      p.log.warn(
        'Supabase Direct Connection requires IPv6. If your local network does not support IPv6, migrations can hang or time out.'
      );
      const continueWithDirect = await p.confirm({
        message:
          'Continue with Direct Connection anyway? Choose No to paste the Session Pooler URL.',
        initialValue: false,
      });

      if (p.isCancel(continueWithDirect)) {
        p.cancel('Setup cancelled.');
        process.exit(130);
      }
      if (continueWithDirect) {
        return databaseUrl;
      }
      continue;
    }

    if (connectionKind === 'transaction-pooler') {
      p.log.warn(
        'Supabase Transaction Pooler (:6543) is for short-lived app traffic and can break migration tools that use prepared statements.'
      );
      const continueWithTransactionPooler = await p.confirm({
        message:
          'Continue with Transaction Pooler anyway? Choose No to paste the Session Pooler URL.',
        initialValue: false,
      });

      if (p.isCancel(continueWithTransactionPooler)) {
        p.cancel('Setup cancelled.');
        process.exit(130);
      }
      if (continueWithTransactionPooler) {
        return databaseUrl;
      }
      continue;
    }

    return databaseUrl;
  }
}

function toOutputString(value: unknown): string {
  if (!value) return '';
  if (Buffer.isBuffer(value)) return value.toString('utf8');
  return String(value);
}

function tailString(value: string, maxLen: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `...[truncated ${trimmed.length - maxLen} chars]...\n${trimmed.slice(-maxLen)}`;
}

function formatCommandError(error: unknown, timeoutMs: number): string {
  if (!error || typeof error !== 'object') {
    return error instanceof Error ? error.message : String(error);
  }

  const commandError = error as {
    message?: string;
    stderr?: unknown;
    stdout?: unknown;
    killed?: boolean;
    signal?: NodeJS.Signals | string | null;
  };
  const stderrRaw = toOutputString(commandError.stderr).trim();
  const stdoutRaw = toOutputString(commandError.stdout).trim();
  const msgRaw = (commandError.message ?? '').trim();

  const stderrPart = stderrRaw
    ? `STDERR:\n${tailString(stderrRaw, 6_000)}`
    : '';
  const stdoutPart = stdoutRaw
    ? `STDOUT:\n${tailString(stdoutRaw, 2_000)}`
    : '';

  const timeoutMessage =
    commandError.signal === 'SIGTERM' || commandError.killed
      ? `Command timed out after ${Math.round(timeoutMs / 1000)}s.`
      : '';

  const parts = [timeoutMessage, stderrPart, stdoutPart, msgRaw].filter(
    Boolean
  );
  return parts.length > 0 ? parts.join('\n\n') : 'Command failed.';
}

type PostgresFactory = (
  url: string,
  options?: Record<string, unknown>
) => {
  unsafe: (sql: string) => Promise<unknown>;
  end: (options?: { timeout?: number }) => Promise<void>;
  <T = unknown>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T>;
};

async function loadPostgresClient(): Promise<PostgresFactory> {
  const mod = (await import('postgres')) as unknown as
    | PostgresFactory
    | { default: PostgresFactory };
  return typeof mod === 'function'
    ? mod
    : (mod as { default: PostgresFactory }).default;
}

async function checkPostgresExistingTables(
  databaseUrl: string
): Promise<{ ok: true; tables: string[] } | { ok: false; error: string }> {
  let sql: ReturnType<PostgresFactory> | undefined;
  try {
    const postgres = await loadPostgresClient();
    sql = postgres(databaseUrl, {
      max: 1,
      idle_timeout: 3,
      connect_timeout: 10,
    });
    const rows = await sql<{ schemaname: string; tablename: string }[]>`
      SELECT schemaname, tablename
      FROM pg_tables
      WHERE schemaname IN ('public', 'drizzle')
      ORDER BY schemaname, tablename
    `;
    const tables = rows.map((r) =>
      r.schemaname === 'public' ? r.tablename : `${r.schemaname}.${r.tablename}`
    );
    return { ok: true, tables };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    if (sql) await sql.end({ timeout: 3 }).catch(() => {});
  }
}

type NavItem = {
  title?: string;
  url?: string;
  icon?: string;
  children?: NavItem[];
  [key: string]: unknown;
};

type LocaleCommonData = {
  metadata?: {
    title?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

type LocaleAdminSidebarData = {
  header?: {
    brand?: {
      title?: string;
      logo?: {
        alt?: string;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

type LocaleLandingData = {
  header?: {
    brand?: {
      logo?: {
        alt?: string;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  footer?: {
    brand?: {
      logo?: {
        alt?: string;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

function urlBelongsToDisabledModule(
  url: string | undefined,
  disabled: Set<string>
): boolean {
  if (!url) return false;
  if (disabled.has('showcases') && url.startsWith('/showcases')) return true;
  if (
    disabled.has('ai') &&
    (url.startsWith('/ai-image-generator') ||
      url.startsWith('/ai-music-generator') ||
      url.startsWith('/ai-video-generator'))
  )
    return true;
  if (disabled.has('blog') && url.startsWith('/blog')) return true;
  if (disabled.has('updates') && url.startsWith('/updates')) return true;
  if (disabled.has('docs') && url.startsWith('/docs')) return true;
  return false;
}

function filterNavItems(
  items: NavItem[] | undefined,
  disabled: Set<string>
): NavItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (Array.isArray(item.children)) {
        return {
          ...item,
          children: filterNavItems(item.children, disabled),
        };
      }
      return item;
    })
    .filter((item) => {
      if (urlBelongsToDisabledModule(item.url, disabled)) return false;
      // Drop parent whose children all got removed
      if (item.children !== undefined && item.children.length === 0)
        return false;
      return true;
    });
}

function pruneLandingNav(
  localeDir: string,
  disabled: Set<string>
): { touched: number } {
  if (disabled.size === 0) return { touched: 0 };
  const entries = fs.readdirSync(localeDir, { withFileTypes: true });
  let touched = 0;
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const landingPath = `${localeDir}/${entry.name}/landing.json`;
    if (!fs.existsSync(landingPath)) continue;

    try {
      const raw = fs.readFileSync(landingPath, 'utf8');
      const data = JSON.parse(raw) as {
        header?: { nav?: { items?: NavItem[] } };
        footer?: { nav?: { items?: NavItem[] } };
      };
      if (data.header?.nav?.items) {
        data.header.nav.items = filterNavItems(data.header.nav.items, disabled);
      }
      if (data.footer?.nav?.items) {
        data.footer.nav.items = filterNavItems(data.footer.nav.items, disabled);
      }
      const serialized = `${JSON.stringify(data, null, 2)}\n`;
      if (serialized !== raw) {
        writeTrackedFileSync(landingPath, serialized);
        touched += 1;
      }
    } catch (err) {
      // Don't block init on a locale parse error; just warn.
      p.log.warn(
        `Skipped ${landingPath}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
  return { touched };
}

function updateJsonFile<T extends Record<string, unknown>>(
  filePath: string,
  update: (data: T) => boolean
): boolean {
  if (!fs.existsSync(filePath)) return false;

  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw) as T;
  const changed = update(data);

  if (!changed) return false;

  writeTrackedFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
  return true;
}

function syncLocalizedProjectName(
  localeDir: string,
  projectName: string
): { touched: number } {
  const entries = fs.readdirSync(localeDir, { withFileTypes: true });
  let touched = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const baseDir = `${localeDir}/${entry.name}`;

    if (
      updateJsonFile<LocaleCommonData>(`${baseDir}/common.json`, (data) => {
        if (!data.metadata || data.metadata.title === projectName) return false;
        data.metadata.title = projectName;
        return true;
      })
    ) {
      touched += 1;
    }

    if (
      updateJsonFile<LocaleAdminSidebarData>(
        `${baseDir}/admin/sidebar.json`,
        (data) => {
          const brand = data.header?.brand;
          if (!brand) return false;

          let changed = false;

          if (brand.title !== projectName) {
            brand.title = projectName;
            changed = true;
          }

          if (brand.logo && brand.logo.alt !== projectName) {
            brand.logo.alt = projectName;
            changed = true;
          }

          return changed;
        }
      )
    ) {
      touched += 1;
    }

    if (
      updateJsonFile<LocaleLandingData>(`${baseDir}/landing.json`, (data) => {
        let changed = false;

        if (
          data.header?.brand?.logo &&
          data.header.brand.logo.alt !== projectName
        ) {
          data.header.brand.logo.alt = projectName;
          changed = true;
        }

        if (
          data.footer?.brand?.logo &&
          data.footer.brand.logo.alt !== projectName
        ) {
          data.footer.brand.logo.alt = projectName;
          changed = true;
        }

        return changed;
      })
    ) {
      touched += 1;
    }
  }

  return { touched };
}

async function dropPostgresSchemas(databaseUrl: string): Promise<void> {
  const postgres = await loadPostgresClient();
  const sql = postgres(databaseUrl, {
    max: 1,
    idle_timeout: 3,
    connect_timeout: 10,
  });
  try {
    await sql.unsafe('DROP SCHEMA IF EXISTS public CASCADE');
    await sql.unsafe('CREATE SCHEMA public');
    await sql.unsafe('DROP SCHEMA IF EXISTS drizzle CASCADE');
  } finally {
    await sql.end({ timeout: 3 }).catch(() => {});
  }
}

async function runSetupCommand(
  command: string,
  env: NodeJS.ProcessEnv,
  timeoutMs: number = SETUP_COMMAND_TIMEOUT_MS
): Promise<{ ok: true } | { ok: false; error: string }> {
  const options: ExecOptionsWithStringEncoding = {
    env,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
    timeout: timeoutMs,
  };

  try {
    await execAsync(command, options);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: formatCommandError(error, timeoutMs),
    };
  }
}

async function runSetupFileCommand(
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv,
  timeoutMs: number = SETUP_COMMAND_TIMEOUT_MS
): Promise<{ ok: true } | { ok: false; error: string }> {
  const options: ExecFileOptionsWithStringEncoding = {
    env,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
    timeout: timeoutMs,
  };

  try {
    await execFileAsync(command, args, options);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: formatCommandError(error, timeoutMs),
    };
  }
}

async function main() {
  // ─── Step 1: Preset ────────────────────────────────────────────
  const preset = await p.select({
    message: 'Select project preset',
    options: [
      {
        value: 'full',
        label: 'Full — AI SaaS',
        hint: 'Admin, payment, AI generators, docs, RBAC',
      },
      {
        value: 'lite',
        label: 'Lite — Landing page',
        hint: 'Blog, feedback, analytics via env (no admin)',
      },
    ],
  });

  if (p.isCancel(preset)) {
    p.cancel('Setup cancelled.');
    process.exit(130);
  }

  // ─── Step 1.5: Optional modules ────────────────────────────────
  const fullDefaults = ['ai', 'showcases', 'blog', 'docs', 'updates'];
  const liteDefaults = ['blog'];
  const moduleSelection = await p.multiselect({
    message:
      'Select optional modules to include (space to toggle, enter to confirm)',
    options: [
      {
        value: 'ai',
        label: 'AI generators',
        hint: 'image/music/video pages + header submenu',
      },
      {
        value: 'showcases',
        label: 'Showcases',
        hint: '/showcases page + nav entry',
      },
      { value: 'blog', label: 'Blog', hint: '/blog listing + posts + nav' },
      { value: 'docs', label: 'Docs', hint: '/docs site + nav entry' },
      {
        value: 'updates',
        label: 'Updates',
        hint: '/updates changelog + nav entry',
      },
    ],
    initialValues: preset === 'full' ? fullDefaults : liteDefaults,
    required: false,
  });

  if (p.isCancel(moduleSelection)) {
    p.cancel('Setup cancelled.');
    process.exit(130);
  }
  const enabledModules = new Set(moduleSelection as string[]);

  // ─── Step 2: Database ──────────────────────────────────────────
  const dbProvider = await p.select({
    message: 'Select database setup',
    options: [
      ...(preset === 'lite'
        ? [
            {
              value: 'none',
              label: 'No database',
              hint: 'Best for a static landing page or MDX-only content site',
            },
          ]
        : []),
      {
        value: 'local-pg',
        label: 'Local PostgreSQL',
        hint: 'Fastest for development, requires local install',
      },
      {
        value: 'neon',
        label: 'Neon (cloud PostgreSQL)',
        hint: 'Free tier, serverless, neon.tech',
      },
      {
        value: 'supabase',
        label: 'Supabase (cloud PostgreSQL)',
        hint: 'Free tier, BaaS platform, supabase.com',
      },
      {
        value: 'sqlite',
        label: 'SQLite (local file)',
        hint: 'Zero setup, file-based, great for prototyping',
      },
    ],
    initialValue: preset === 'lite' ? 'none' : 'local-pg',
  });

  if (p.isCancel(dbProvider)) {
    p.cancel('Setup cancelled.');
    process.exit(130);
  }
  const databaseSetup = dbProvider as DatabaseSetup;
  const hasDatabase = databaseSetup !== 'none';

  // ─── Step 3: Database URL ──────────────────────────────────────
  let databaseUrl = '';
  let databaseProvider = '';
  let dbSchemaFile = '';
  let dbMigrationsOut = '';

  if (databaseSetup === 'none') {
    databaseProvider = 'none';
    dbSchemaFile = './src/config/db/schema.postgres.ts';
    dbMigrationsOut = './src/config/db/migrations';
    p.log.info(
      'No database selected. DB-backed features such as persisted feedback, auth sessions, admin, payments, and database blog posts stay disabled until you configure a database.'
    );
  } else if (databaseSetup === 'sqlite') {
    databaseProvider = 'sqlite';
    databaseUrl = 'file:data/local.db';
    dbSchemaFile = './src/config/db/schema.sqlite.ts';
    dbMigrationsOut = './src/config/db/migrations_sqlite';

    // Ensure data directory exists
    if (!fs.existsSync('data')) {
      mkdirTrackedSync('data');
    }

    p.log.success('SQLite — no extra setup needed.');
  } else if (databaseSetup === 'local-pg') {
    databaseProvider = 'postgresql';
    dbSchemaFile = './src/config/db/schema.postgres.ts';
    dbMigrationsOut = './src/config/db/migrations';

    const username = os.userInfo().username;

    const dbName = await p.text({
      message: 'Local PostgreSQL database name',
      placeholder: DEFAULT_LOCAL_POSTGRES_DB_NAME,
      defaultValue: DEFAULT_LOCAL_POSTGRES_DB_NAME,
      validate: (val: string | undefined) => {
        if (
          !isValidPostgresDbName(
            resolveTextPromptValue(val, DEFAULT_LOCAL_POSTGRES_DB_NAME)
          )
        ) {
          return 'Use letters, numbers, underscores, or dashes; do not start with a dash';
        }
      },
    });

    if (p.isCancel(dbName)) {
      p.cancel('Setup cancelled.');
      process.exit(130);
    }

    const dbNameValue = resolveTextPromptValue(
      dbName,
      DEFAULT_LOCAL_POSTGRES_DB_NAME
    );
    databaseUrl = `postgresql://${username}@localhost:5432/${dbNameValue}`;

    // Try to create the database
    const shouldCreate = await p.confirm({
      message: `Create database "${dbNameValue}" now? (requires local PostgreSQL running)`,
      initialValue: true,
    });

    if (p.isCancel(shouldCreate)) {
      p.cancel('Setup cancelled.');
      process.exit(130);
    }

    if (shouldCreate) {
      try {
        execFileSync('createdb', [dbNameValue], { stdio: 'pipe' });
        p.log.success(`Database "${dbNameValue}" ready.`);
      } catch {
        p.log.warn(
          `Could not create database. It may already exist, or PostgreSQL is not running. Try: createdb ${dbNameValue}`
        );
      }
    }
  } else if (databaseSetup === 'neon' || databaseSetup === 'supabase') {
    databaseProvider = 'postgresql';
    dbSchemaFile = './src/config/db/schema.postgres.ts';
    dbMigrationsOut = './src/config/db/migrations';

    const serviceName = databaseSetup === 'neon' ? 'Neon' : 'Supabase';
    const placeholder =
      databaseSetup === 'neon'
        ? 'postgresql://neondb_owner:xxx@ep-xxx.neon.tech/neondb?sslmode=require'
        : SUPABASE_SESSION_POOLER_PLACEHOLDER;

    p.log.info(
      databaseSetup === 'neon'
        ? `Get your connection string from ${pc.cyan('https://neon.tech')} → Project → Connection Details`
        : `Get your Session Pooler string from ${pc.cyan('https://supabase.com')} → Project → Connect → Session pooler. Direct Connection requires IPv6.`
    );

    databaseUrl = await promptCloudPostgresUrl(
      databaseSetup,
      serviceName,
      placeholder
    );
  }

  // ─── Step 4: Blog storage ──────────────────────────────────────
  let blogStorageMode: BlogStorageMode = 'mdx';
  if (hasDatabase) {
    const selectedBlogStorageMode = await p.select({
      message: 'Select blog article storage mode',
      options: [
        {
          value: 'mdx',
          label: 'Local MDX files',
          hint: 'Read blog posts from content/posts only',
        },
        {
          value: 'mdx-db',
          label: 'Local MDX files + database',
          hint: 'Merge content/posts with published DB posts; DB wins on duplicate slugs',
        },
      ],
      initialValue: preset === 'lite' ? 'mdx' : 'mdx-db',
    });

    if (p.isCancel(selectedBlogStorageMode)) {
      p.cancel('Setup cancelled.');
      process.exit(130);
    }
    blogStorageMode = selectedBlogStorageMode as BlogStorageMode;
  } else {
    p.log.info(
      'Blog storage set to local MDX files because no database was selected.'
    );
  }

  // ─── Step 5: Project info ──────────────────────────────────────
  const projectName = await p.text({
    message: 'Project name',
    placeholder: DEFAULT_PROJECT_NAME,
    defaultValue: DEFAULT_PROJECT_NAME,
    initialValue: DEFAULT_PROJECT_NAME,
    validate: (val: string | undefined) => {
      if (!resolveTextPromptValue(val, DEFAULT_PROJECT_NAME)) {
        return 'Project name is required';
      }
    },
  });

  if (p.isCancel(projectName)) {
    p.cancel('Setup cancelled.');
    process.exit(130);
  }
  const projectNameValue = resolveTextPromptValue(
    projectName,
    DEFAULT_PROJECT_NAME
  );

  const appUrl = await p.text({
    message: 'App URL (local dev)',
    placeholder: DEFAULT_LOCAL_APP_URL,
    defaultValue: DEFAULT_LOCAL_APP_URL,
    validate: (val: string | undefined) =>
      validateUrl(resolveTextPromptValue(val, DEFAULT_LOCAL_APP_URL)),
  });

  if (p.isCancel(appUrl)) {
    p.cancel('Setup cancelled.');
    process.exit(130);
  }
  const appUrlValue = resolveTextPromptValue(appUrl, DEFAULT_LOCAL_APP_URL);

  // ─── Step 6: Page layout ───────────────────────────────────────
  const headerPosition = await p.select({
    message: 'Select public header layout',
    options: [
      {
        value: 'top',
        label: 'Top header',
        hint: 'Classic horizontal header at the top of public pages',
      },
      {
        value: 'left',
        label: 'Left sidebar header',
        hint: 'Desktop uses a vertical left header; mobile keeps top menu',
      },
    ],
  });

  if (p.isCancel(headerPosition)) {
    p.cancel('Setup cancelled.');
    process.exit(130);
  }
  const headerPositionValue = headerPosition as HeaderPosition;

  // ─── Step 7: Generate AUTH_SECRET ──────────────────────────────
  const authSecret = crypto.randomBytes(32).toString('base64');

  // ─── Step 8: Write .env.development ────────────────────────────
  const envContent = `# Generated by: bun run init
# Preset: ${preset}

# app
VITE_APP_URL = "${appUrlValue}"
VITE_APP_NAME = "${projectNameValue}"
VITE_APP_PRESET = "${preset}"

# optional modules (see src/config/preset.ts)
VITE_APP_MODULE_AI = "${enabledModules.has('ai')}"
VITE_APP_MODULE_SHOWCASES = "${enabledModules.has('showcases')}"
VITE_APP_MODULE_BLOG = "${enabledModules.has('blog')}"
VITE_APP_MODULE_DOCS = "${enabledModules.has('docs')}"
VITE_APP_MODULE_UPDATES = "${enabledModules.has('updates')}"

# theme
VITE_THEME = "default"

# appearance
VITE_APPEARANCE = "system"

# layout
# top: horizontal header at the top
# left: vertical sidebar header on desktop; top menu on mobile
LAYOUT_HEADER_POSITION = "${headerPositionValue}"

# blog
# mdx: read blog articles from content/posts only
# mdx-db: read content/posts and persisted database posts
BLOG_STORAGE_MODE = "${blogStorageMode}"

# database
DATABASE_PROVIDER = "${databaseProvider}"
DATABASE_URL = "${databaseUrl}"
DB_SCHEMA_FILE = "${dbSchemaFile}"
DB_MIGRATIONS_OUT = "${dbMigrationsOut}"
DB_SINGLETON_ENABLED = "${hasDatabase}"
DB_MAX_CONNECTIONS = "${hasDatabase ? '1' : '0'}"

# auth secret
AUTH_SECRET = "${authSecret}"

# analytics / webmaster verification
GOOGLE_ANALYTICS_ID = ""
GOOGLE_SEARCH_CONSOLE_ID = ""
CLARITY_ID = ""
PLAUSIBLE_SCRIPT_ID = ""
BING_WEBMASTER_VERIFICATION_ID = ""
BING_INDEXNOW_KEY = ""

# ads / consent
ADSENSE_CODE = ""
GOOGLE_FUNDING_CHOICES_ID = ""
`;

  const envPath = '.env.development';
  let activeEnvPath = envPath;
  const envExists = fs.existsSync(envPath);

  if (envExists) {
    const overwrite = await p.confirm({
      message: `${envPath} already exists. Overwrite?`,
      initialValue: false,
    });

    if (p.isCancel(overwrite)) {
      p.cancel('Setup cancelled.');
      process.exit(130);
    }

    if (!overwrite) {
      // Write to a temp file instead
      const altPath = '.env.development.new';
      writeTrackedFileSync(altPath, envContent);
      activeEnvPath = altPath;
      p.log.info(`Saved to ${pc.cyan(altPath)} — merge manually.`);
    } else {
      writeTrackedFileSync(envPath, envContent);
      p.log.success(`${pc.cyan(envPath)} written.`);
    }
  } else {
    writeTrackedFileSync(envPath, envContent);
    p.log.success(`${pc.cyan(envPath)} written.`);
  }

  // ─── Step 8.1: Write deploy.env ───────────────────────────────
  const cloudflareName = toCloudflareName(projectNameValue);
  const cloudflareDeployTarget = getDefaultCloudflareTarget(preset);
  const deployEnvPath = writeDeployEnvFile(
    buildDeployEnvContent({
      appName: projectNameValue,
      cloudflareName,
      siteUrl: getDefaultDeployUrl(cloudflareDeployTarget, cloudflareName),
      target: cloudflareDeployTarget,
    })
  );
  p.log.success(`${pc.cyan(deployEnvPath)} written.`);

  if (fs.existsSync('deploy.sh')) {
    chmodTrackedSync('deploy.sh', 0o755);
    p.log.info(`${pc.cyan('deploy.sh')} is ready for Cloudflare deploys.`);
  }

  const localizedProjectNameSync = syncLocalizedProjectName(
    'src/config/locale',
    projectNameValue
  );
  if (localizedProjectNameSync.touched > 0) {
    p.log.info(
      `Updated localized app title/brand fields in ${localizedProjectNameSync.touched} locale file(s).`
    );
  }

  // ─── Step 8.25: Prune nav items for disabled modules ───────────
  const disabledModules = new Set(
    ['ai', 'showcases', 'blog', 'docs', 'updates'].filter(
      (m) => !enabledModules.has(m)
    )
  );
  if (disabledModules.size > 0) {
    const { touched } = pruneLandingNav('src/config/locale', disabledModules);
    if (touched > 0) {
      p.log.info(
        `Pruned nav entries for ${Array.from(disabledModules).join(', ')} across ${touched} locale file(s).`
      );
    }
  }

  // ─── Step 8.5: DB precheck (postgres only) ─────────────────────
  let skipMigrationDueToPrecheck = false;
  if (databaseProvider === 'postgresql') {
    const precheckSpin = p.spinner();
    precheckSpin.start('Checking if database is empty...');
    const check = await checkPostgresExistingTables(databaseUrl);

    if ('error' in check) {
      precheckSpin.stop(
        pc.yellow(
          'Could not connect — skipping precheck, migration will fail loudly if unreachable.'
        )
      );
      p.log.warn(check.error);
    } else if (check.tables.length === 0) {
      precheckSpin.stop('Database is empty — good to migrate.');
    } else {
      precheckSpin.stop(
        `Database already has ${check.tables.length} table(s).`
      );
      const preview = check.tables.slice(0, 8).join(', ');
      const suffix = check.tables.length > 8 ? ', ...' : '';
      p.log.info(`${preview}${suffix}`);

      const action = await p.select({
        message: 'This DB is not empty. How to proceed?',
        options: [
          {
            value: 'drop',
            label: 'Drop public + drizzle schemas, then migrate fresh',
            hint: 'DESTRUCTIVE — all existing data in this DB is lost',
          },
          {
            value: 'skip',
            label: 'Skip migration, reuse existing schema',
            hint: 'Assumes the DB already has the correct schema',
          },
          {
            value: 'abort',
            label: 'Abort — I will use a different DATABASE_URL',
            hint: 'Re-run init with a fresh DB URL',
          },
        ],
        initialValue: 'drop',
      });

      if (p.isCancel(action) || action === 'abort') {
        p.cancel('Setup cancelled. Re-run init with a fresh DATABASE_URL.');
        process.exit(130);
      }

      if (action === 'drop') {
        const dropSpin = p.spinner();
        dropSpin.start('Dropping public + drizzle schemas...');
        try {
          await dropPostgresSchemas(databaseUrl);
          dropSpin.stop('Schemas reset — DB is now empty.');
        } catch (err) {
          dropSpin.stop('Schema drop failed — aborting.');
          p.log.error(err instanceof Error ? err.message : String(err));
          process.exit(1);
        }
      } else if (action === 'skip') {
        skipMigrationDueToPrecheck = true;
        p.log.info(
          `Reusing existing schema. Run ${pc.cyan('bun run db:push')} manually later if your schema drifts.`
        );
      }
    }
  }

  // ─── Step 9: Run database setup ────────────────────────────────
  const runMigrate =
    !hasDatabase || skipMigrationDueToPrecheck
      ? false
      : await p.confirm({
          message: 'Run database migration now? (db:generate + db:migrate)',
          initialValue: true,
        });
  let databaseReadyForSeed = hasDatabase && skipMigrationDueToPrecheck;

  if (p.isCancel(runMigrate)) {
    p.cancel('Setup cancelled.');
    process.exit(130);
  }

  if (runMigrate) {
    const s = p.spinner();
    const commandEnv = { ...process.env, ENV_FILE: activeEnvPath };

    trackCleanupTarget('src/config/db/migrations', 'dir');

    s.start('Syncing schema...');
    const syncResult = await runSetupCommand('bun run sync-schema', commandEnv);
    if ('error' in syncResult) {
      s.stop('Schema sync failed.');
      p.log.error(syncResult.error);
      process.exit(1);
    } else {
      s.stop('Schema synced.');
    }

    s.start('Generating migrations...');
    const generateResult = await runSetupCommand(
      'bun run db:generate',
      commandEnv
    );
    if ('error' in generateResult) {
      s.stop('Migration generation failed.');
      p.log.error(generateResult.error);
      p.log.error('Run manually: bun run db:generate');
      process.exit(1);
    } else {
      s.stop('Migrations generated.');

      s.start('Running migrations...');
      const migrateResult = await runSetupFileCommand(
        'bun',
        ['run', 'db:migrate'],
        commandEnv,
        DB_MIGRATE_TIMEOUT_MS
      );
      if ('error' in migrateResult) {
        s.stop('Migration failed.');
        p.log.error(migrateResult.error);
        p.log.error('Run manually: bun run db:migrate');
        process.exit(1);
      } else {
        databaseReadyForSeed = true;
        s.stop('Migrations applied.');
      }
    }
  } else if (hasDatabase && !skipMigrationDueToPrecheck) {
    p.log.info(
      `Skipping database seed steps because migrations were not applied. Run ${pc.cyan('bun run db:migrate')} before initializing RBAC or admin users.`
    );
  }

  // ─── Step 10: RBAC init (full mode only) ───────────────────────
  if (preset === 'full' && databaseReadyForSeed) {
    const runRbac = await p.confirm({
      message: 'Initialize RBAC roles & permissions?',
      initialValue: true,
    });

    if (p.isCancel(runRbac)) {
      p.cancel('Setup cancelled.');
      process.exit(130);
    }

    if (runRbac) {
      const s = p.spinner();
      s.start('Initializing RBAC...');
      const rbacResult = await runSetupCommand('bun run rbac:init', {
        ...process.env,
        ENV_FILE: activeEnvPath,
      });

      if ('error' in rbacResult) {
        s.stop('RBAC init failed.');
        p.log.error(rbacResult.error);
        p.log.error('Run manually: bun run rbac:init');
        process.exit(1);
      } else {
        s.stop('RBAC initialized.');
      }
    }

    const initAdmin = await p.confirm({
      message: 'Create or promote a super_admin account now?',
      initialValue: false,
    });

    if (p.isCancel(initAdmin)) {
      p.cancel('Setup cancelled.');
      process.exit(130);
    }

    if (initAdmin) {
      const adminEmail = await p.text({
        message: 'Admin email',
        placeholder: 'admin@example.com',
        validate: validateEmail,
      });

      if (p.isCancel(adminEmail)) {
        p.cancel('Setup cancelled.');
        process.exit(130);
      }

      const adminName = await p.text({
        message: 'Admin name',
        placeholder: 'Admin',
        defaultValue: 'Admin',
        validate: (val: string | undefined) => {
          if (!resolveTextPromptValue(val, 'Admin')) {
            return 'Admin name is required';
          }
        },
      });

      if (p.isCancel(adminName)) {
        p.cancel('Setup cancelled.');
        process.exit(130);
      }

      const adminPassword = await p.text({
        message: 'Admin password (visible)',
        placeholder: DEFAULT_ADMIN_PASSWORD,
        defaultValue: DEFAULT_ADMIN_PASSWORD,
        validate: (val: string | undefined) =>
          validatePassword(resolveTextPromptValue(val, DEFAULT_ADMIN_PASSWORD)),
      });

      if (p.isCancel(adminPassword)) {
        p.cancel('Setup cancelled.');
        process.exit(130);
      }

      const s = p.spinner();
      s.start('Initializing super_admin account...');
      const assignResult = await runSetupFileCommand(
        'bun',
        [
          'run',
          'admin:init',
          '--',
          `--email=${adminEmail.trim()}`,
          `--name=${resolveTextPromptValue(adminName, 'Admin')}`,
          '--role=super_admin',
        ],
        {
          ...process.env,
          ADMIN_PASSWORD: resolveTextPromptValue(
            adminPassword,
            DEFAULT_ADMIN_PASSWORD
          ),
          ENV_FILE: activeEnvPath,
        }
      );

      if ('error' in assignResult) {
        s.stop('Admin account setup failed.');
        p.log.error(assignResult.error);
        p.log.error(
          `Run manually: ADMIN_PASSWORD="${DEFAULT_ADMIN_PASSWORD}" bun run admin:init -- --email=${adminEmail.trim()} --role=super_admin`
        );
        process.exit(1);
      } else {
        s.stop('Admin account ready.');
      }
    }
  }

  // ─── Step 11: Landing page generation (optional) ───────────────
  const runLandingGen = await p.confirm({
    message: 'Generate landing page content with AI now?',
    initialValue: false,
  });

  if (p.isCancel(runLandingGen)) {
    p.cancel('Setup cancelled.');
    process.exit(130);
  }

  if (runLandingGen) {
    const PROVIDER_PRESETS: Record<
      string,
      { baseUrl: string; model: string; keyHint: string }
    > = {
      deepseek: {
        baseUrl: 'https://api.deepseek.com/v1',
        model: 'deepseek-chat',
        keyHint: 'sk-... (from platform.deepseek.com/api_keys)',
      },
      openrouter: {
        baseUrl: 'https://openrouter.ai/api/v1',
        model: 'deepseek/deepseek-chat',
        keyHint: 'sk-or-... (from openrouter.ai/keys)',
      },
      openai: {
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini',
        keyHint: 'sk-... (from platform.openai.com/api-keys)',
      },
      moonshot: {
        baseUrl: 'https://api.moonshot.cn/v1',
        model: 'moonshot-v1-8k',
        keyHint: 'sk-... (from platform.moonshot.cn/console/api-keys)',
      },
    };

    const existingKey =
      process.env.LANDING_AI_API_KEY ||
      process.env.OPENROUTER_API_KEY ||
      process.env.OPENAI_API_KEY;
    const existingBaseUrl =
      process.env.LANDING_AI_BASE_URL ||
      process.env.OPENROUTER_BASE_URL ||
      process.env.OPENAI_BASE_URL;
    const existingModel = process.env.LANDING_AI_MODEL;

    let apiKey: string | undefined = existingKey;
    let baseUrl: string | undefined = existingBaseUrl;
    let model: string | undefined = existingModel;
    let configIsNew = false;

    if (!apiKey) {
      const provider = await p.select({
        message: 'Select AI provider',
        initialValue: 'deepseek',
        options: [
          {
            value: 'deepseek',
            label: 'Deepseek',
            hint: 'cheap & fast — recommended',
          },
          {
            value: 'openrouter',
            label: 'OpenRouter',
            hint: 'gateway to many models',
          },
          { value: 'openai', label: 'OpenAI', hint: 'gpt-4o-mini' },
          { value: 'moonshot', label: 'Moonshot / Kimi' },
          { value: 'custom', label: 'Custom (OpenAI-compatible endpoint)' },
        ],
      });
      if (p.isCancel(provider)) {
        p.cancel('Setup cancelled.');
        process.exit(130);
      }

      let keyHint: string;
      if (provider === 'custom') {
        const customBase = await p.text({
          message: 'API base URL',
          placeholder: 'https://api.example.com/v1',
          validate: (val: string | undefined) => {
            if (!val?.trim()) return 'Base URL is required';
          },
        });
        if (p.isCancel(customBase)) {
          p.cancel('Setup cancelled.');
          process.exit(130);
        }
        const customModel = await p.text({
          message: 'Model name',
          placeholder: 'e.g. gpt-4o-mini',
          validate: (val: string | undefined) => {
            if (!val?.trim()) return 'Model is required';
          },
        });
        if (p.isCancel(customModel)) {
          p.cancel('Setup cancelled.');
          process.exit(130);
        }
        baseUrl = customBase.trim();
        model = customModel.trim();
        keyHint = 'API key';
      } else {
        const preset = PROVIDER_PRESETS[provider as string];
        baseUrl = preset.baseUrl;
        model = preset.model;
        keyHint = preset.keyHint;
      }

      const keyInput = await p.text({
        message: `API key for ${provider as string}`,
        placeholder: keyHint,
        validate: (val: string | undefined) => {
          if (!val?.trim()) return 'API key is required';
        },
      });
      if (p.isCancel(keyInput)) {
        p.cancel('Setup cancelled.');
        process.exit(130);
      }
      apiKey = keyInput.trim();
      configIsNew = true;
    }

    if (!apiKey || !baseUrl || !model) {
      p.log.info(
        `Skipping landing generation. Configure ${pc.cyan('LANDING_AI_API_KEY')} + ${pc.cyan('LANDING_AI_BASE_URL')} + ${pc.cyan('LANDING_AI_MODEL')} in ${pc.cyan(activeEnvPath)} and run ${pc.cyan('bun run landing')} later.`
      );
    } else {
      const templateKey = await p.select({
        message: 'Landing template',
        options: [
          { value: 'ai-saas', label: 'AI SaaS' },
          { value: 'developer-tool', label: 'Developer tool' },
          { value: 'ecommerce', label: 'E-commerce' },
          { value: 'content-platform', label: 'Content platform' },
          { value: 'general', label: 'General' },
        ],
        initialValue: preset === 'full' ? 'ai-saas' : 'general',
      });
      if (p.isCancel(templateKey)) {
        p.cancel('Setup cancelled.');
        process.exit(130);
      }

      const productName = await p.text({
        message: 'Product name',
        placeholder: projectNameValue,
        defaultValue: projectNameValue,
        initialValue: projectNameValue,
        validate: (val: string | undefined) => {
          if (!resolveTextPromptValue(val, projectNameValue)) {
            return 'Product name is required';
          }
        },
      });
      if (p.isCancel(productName)) {
        p.cancel('Setup cancelled.');
        process.exit(130);
      }
      const productNameValue = resolveTextPromptValue(
        productName,
        projectNameValue
      );

      const landingDescription = await p.text({
        message: 'One-line product description',
        placeholder: 'e.g. AI-powered photo editing platform',
        validate: (val: string | undefined) => {
          if (!val?.trim()) return 'Description is required';
        },
      });
      if (p.isCancel(landingDescription)) {
        p.cancel('Setup cancelled.');
        process.exit(130);
      }

      const landingFeatures = await p.text({
        message: 'Core features (comma-separated)',
        placeholder: 'e.g. Background removal, Upscaling, Style transfer',
        validate: (val: string | undefined) => {
          if (!val?.trim()) return 'Features are required';
        },
      });
      if (p.isCancel(landingFeatures)) {
        p.cancel('Setup cancelled.');
        process.exit(130);
      }

      const landingTarget = await p.text({
        message: 'Target users',
        placeholder: 'e.g. Photographers and designers',
        validate: (val: string | undefined) => {
          if (!val?.trim()) return 'Target audience is required';
        },
      });
      if (p.isCancel(landingTarget)) {
        p.cancel('Setup cancelled.');
        process.exit(130);
      }

      const landingPricing = await p.text({
        message: 'Pricing (optional, press Enter to skip)',
        placeholder: 'e.g. Free tier + $19/month Pro',
      });
      if (p.isCancel(landingPricing)) {
        p.cancel('Setup cancelled.');
        process.exit(130);
      }

      if (configIsNew) {
        appendTrackedFileSync(
          activeEnvPath,
          `\n# landing generator\n` +
            `LANDING_AI_API_KEY = "${apiKey}"\n` +
            `LANDING_AI_BASE_URL = "${baseUrl}"\n` +
            `LANDING_AI_MODEL = "${model}"\n`
        );
        p.log.info(`Appended LANDING_AI_* vars to ${pc.cyan(activeEnvPath)}.`);
      }

      // Make env vars available to the in-process AI call below.
      process.env.LANDING_AI_API_KEY = apiKey;
      process.env.LANDING_AI_BASE_URL = baseUrl;
      process.env.LANDING_AI_MODEL = model;

      const pricingTrim = landingPricing.trim();
      const { generateContent } = await import('./ai-generate');
      const { writePageConfigs } = await import('./config-writer');
      const { getTemplate } = await import('./templates');

      const s = p.spinner();
      s.start(
        `Generating landing for "${productNameValue}" via ${templateKey as string} template`
      );

      try {
        const template = getTemplate(templateKey as string);
        const content = await generateContent(
          {
            name: productNameValue,
            description: landingDescription.trim(),
            features: landingFeatures.trim(),
            target: landingTarget.trim(),
            pricing: pricingTrim || undefined,
          },
          template,
          (event) => {
            if (event.type === 'connecting') {
              s.message('Connecting to AI provider...');
            } else if (event.type === 'streaming') {
              s.message(`Streaming response: ${event.chars} chars received`);
            } else if (event.type === 'stream-done') {
              s.message(`Stream complete (${event.chars} chars) — parsing...`);
            } else if (event.type === 'parsing') {
              s.message('Parsing AI response as JSON...');
            }
          }
        );

        s.message('Writing locale page configs...');
        const { enPath, zhPath } = writePageConfigs(
          content,
          template,
          productNameValue
        );
        s.stop(`Landing page generated (en + zh)`);
        p.log.info(`English: ${pc.cyan(enPath)}`);
        p.log.info(`Chinese: ${pc.cyan(zhPath)}`);
      } catch (err) {
        s.stop('Landing generation failed.');
        p.log.error(err instanceof Error ? err.message : String(err));
        p.log.error(`Run manually later: ${pc.cyan('bun run landing')}`);
      }
    }
  }

  // ─── Done ──────────────────────────────────────────────────────
  discardCleanupSnapshots();
  setupCompleted = true;
  p.outro(pc.green('Setup complete! 🎉'));

  console.log('');
  console.log(pc.dim('  Next steps:'));
  console.log('');
  console.log(
    `  ${pc.dim('Header layout')}        ${pc.cyan(headerPositionValue)}`
  );
  if (!hasDatabase) {
    console.log(
      `  ${pc.dim('Database')}             ${pc.cyan('disabled')} ${pc.dim('(static landing / MDX content)')}`
    );
  }
  if (blogStorageMode === 'mdx') {
    console.log(
      `  ${pc.dim('Blog posts')}           ${pc.cyan('content/posts/*.mdx')} ${pc.dim('(local files only)')}`
    );
  } else {
    console.log(
      `  ${pc.dim('Blog posts')}           ${pc.cyan('content/posts/*.mdx')} ${pc.dim('+ database posts')}`
    );
  }
  console.log(
    `  ${pc.dim('Cloudflare deploy')}     ${pc.cyan('./deploy.sh')} ${pc.dim(`(${cloudflareDeployTarget})`)}`
  );
  if (preset === 'full') {
    console.log(`  ${pc.cyan('bun run dev')}           Start dev server`);
    console.log(
      `  ${pc.dim('Admin account')}        ${pc.dim('Use the email/password configured during init')}`
    );
    console.log(
      `  ${pc.cyan('bun run admin:init')}    Create/promote a super_admin account`
    );
    console.log(
      `  ${pc.dim('Visit')} ${pc.cyan(`${appUrlValue}/admin`)}    ${pc.dim('Access admin panel')}`
    );
  } else {
    console.log(
      `  ${pc.cyan('bun run dev:lite')}      Start dev server (lite mode)`
    );
    console.log(
      `  ${pc.dim('Visit')} ${pc.cyan(appUrlValue)}      ${pc.dim('Preview your site')}`
    );
    console.log('');
    console.log(pc.dim('  Configure auth/analytics via .env.development:'));
    console.log(`  ${pc.dim('GOOGLE_CLIENT_ID, GOOGLE_ANALYTICS_ID, etc.')}`);
  }
  console.log('');
}

main().catch((e) => {
  p.log.error(e.message);
  process.exit(1);
});
