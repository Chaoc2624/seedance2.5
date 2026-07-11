import fs from 'node:fs/promises';
import path from 'node:path';

const KEY_CONFIG_NAMES = [
  'bing_indexnow_key',
  'bing_webmaster_verification_id',
];
const KEY_ENV_NAMES = [
  'BING_INDEXNOW_KEY',
  'INDEXNOW_KEY',
  'BING_WEBMASTER_VERIFICATION_ID',
];
const KEY_RE = /^[A-Za-z0-9_-]{8,128}$/;
const ENV_LINE_RE = /^(\s*(?:export\s+)?)([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/;

type EnvMap = Record<string, string>;

function unquoteEnvValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const quote = trimmed[0];
  if ((quote === '"' || quote === "'") && trimmed.endsWith(quote)) {
    const inner = trimmed.slice(1, -1);
    if (quote === '"') {
      return inner
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    }
    return inner.replace(/\\'/g, "'");
  }

  const commentIndex = trimmed.search(/\s#/);
  return commentIndex >= 0 ? trimmed.slice(0, commentIndex).trim() : trimmed;
}

function parseEnvContent(content: string) {
  const values: EnvMap = {};

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(ENV_LINE_RE);
    if (!match) continue;

    const [, , key, rawValue] = match;
    values[key] = unquoteEnvValue(rawValue);
  }

  return values;
}

async function readEnvFile(envFile: string) {
  try {
    const content = await fs.readFile(envFile, 'utf8');
    return parseEnvContent(content);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw error;
  }
}

async function loadEnvFiles() {
  const values: EnvMap = {};
  const explicitEnvFile =
    process.env.SHIPONCE_INDEXNOW_ENV_FILE || process.env.ENV_FILE;
  const mode = process.env.SHIPONCE_INDEXNOW_MODE || 'development';

  const envFiles = explicitEnvFile
    ? [explicitEnvFile]
    : [
        '.env',
        '.env.local',
        `.env.${mode}`,
        `.env.${mode}.local`,
        ...(mode === 'production' ? ['.env.deploy', 'deploy.env'] : []),
      ];

  for (const envFile of envFiles) {
    Object.assign(values, await readEnvFile(envFile));
  }

  return values;
}

function syncEnvToProcess(fileValues: EnvMap) {
  for (const [key, value] of Object.entries(fileValues)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function loadAdminConfigs() {
  try {
    const [{ getConfigs }, { closeDb }] = await Promise.all([
      import('@/models/config.server'),
      import('@/core/db/index.server'),
    ]);

    try {
      return await getConfigs();
    } finally {
      await closeDb().catch(() => {});
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(
      `IndexNow admin config read failed; falling back to env: ${message}`
    );
    return {};
  }
}

function getIndexNowKey(adminConfigs: EnvMap, fileValues: EnvMap) {
  for (const configName of KEY_CONFIG_NAMES) {
    const value = adminConfigs[configName];
    if (value?.trim()) {
      return { source: `admin:${configName}`, key: value.trim() };
    }
  }

  for (const envName of KEY_ENV_NAMES) {
    const value = process.env[envName] ?? fileValues[envName];
    if (value?.trim()) return { source: `env:${envName}`, key: value.trim() };
  }

  return null;
}

async function main() {
  const fileValues = await loadEnvFiles();
  syncEnvToProcess(fileValues);

  const adminConfigs = await loadAdminConfigs();
  const configuredKey = getIndexNowKey(adminConfigs, fileValues);

  if (!configuredKey) {
    console.log(
      'IndexNow key is not configured; skipping key file generation.'
    );
    return;
  }

  const { source, key } = configuredKey;
  if (!KEY_RE.test(key)) {
    throw new Error(
      `${source} must be 8-128 characters and only contain letters, numbers, "_" or "-".`
    );
  }

  const publicDir = path.resolve(
    process.cwd(),
    process.env.SHIPONCE_INDEXNOW_PUBLIC_DIR || 'public'
  );
  const keyFile = path.join(publicDir, `${key}.txt`);

  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(keyFile, key, 'utf8');

  console.log(
    `Generated IndexNow key file: ${path.relative(process.cwd(), keyFile)}`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
