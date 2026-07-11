import fs from 'node:fs/promises';
import path from 'node:path';

import { createServerFn } from '@tanstack/react-start';

import {
  getRuntimeConfig,
  invalidateRuntimeConfig,
} from '@/config/runtime.server';

import { envConfigs, getEnv } from '@/config';
import {
  devConfigEnvNames,
  devConfigFields,
  devConfigGroups,
  devConfigTabs,
  type DevConfigField,
} from '@/services/config-settings';

const ENV_LINE_RE = /^(\s*(?:export\s+)?)([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/;
const DEV_CONFIG_SECTION = '# Local dev managed public runtime config';
const INDEXNOW_KEY_RE = /^[A-Za-z0-9_-]{8,128}$/;

type EnvMap = Record<string, string>;

function assertDevConfigEnabled() {
  if (!import.meta.env.DEV || process.env.NODE_ENV === 'production') {
    throw new Error('Local config is only available in the dev server.');
  }
}

function getEnvFilePath() {
  const envFile =
    process.env.SHIPONCE_DEV_CONFIG_ENV_FILE ||
    process.env.ENV_FILE ||
    '.env.development';
  return path.isAbsolute(envFile)
    ? envFile
    : path.resolve(process.cwd(), envFile);
}

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

function quoteEnvValue(value: string) {
  return JSON.stringify(value ?? '');
}

async function readEnvFile(envFilePath: string) {
  try {
    return await fs.readFile(envFilePath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return '';
    }
    throw error;
  }
}

function updateEnvContent(content: string, updates: EnvMap) {
  const remaining = new Set(Object.keys(updates));
  const lines = content ? content.split(/\r?\n/) : [];
  const nextLines = lines.map((line) => {
    const match = line.match(ENV_LINE_RE);
    if (!match) return line;

    const [, prefix, key] = match;
    if (!remaining.has(key)) return line;

    remaining.delete(key);
    return `${prefix}${key} = ${quoteEnvValue(updates[key])}`;
  });

  if (remaining.size > 0) {
    if (nextLines.length > 0 && nextLines[nextLines.length - 1]?.trim()) {
      nextLines.push('');
    }
    nextLines.push(DEV_CONFIG_SECTION);
    for (const key of remaining) {
      nextLines.push(`${key} = ${quoteEnvValue(updates[key])}`);
    }
  }

  const nextContent = nextLines.join('\n');
  return nextContent.endsWith('\n') ? nextContent : `${nextContent}\n`;
}

function syncAllowedEnvToProcess(fileValues: EnvMap) {
  for (const envName of devConfigEnvNames) {
    if (envName in fileValues) {
      process.env[envName] = fileValues[envName];
    }
  }
  invalidateRuntimeConfig();
}

function getFieldEffectiveValue(
  field: DevConfigField,
  runtimeConfigs: EnvMap,
  fileValues: EnvMap
) {
  if (field.name === 'app_url') {
    return (
      getEnv(field.envName) ?? fileValues[field.envName] ?? envConfigs.app_url
    );
  }
  if (field.name === 'app_name') {
    return (
      getEnv(field.envName) ?? fileValues[field.envName] ?? envConfigs.app_name
    );
  }

  return (
    runtimeConfigs[field.name] ??
    getEnv(field.envName) ??
    fileValues[field.envName] ??
    ''
  );
}

function validateFieldValue(field: DevConfigField, value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';

  if (field.inputMode === 'url') {
    try {
      new URL(trimmed);
    } catch {
      throw new Error(`${field.title} must be a valid URL.`);
    }
  }

  if (field.name === 'google_funding_choices_id') {
    if (trimmed.includes('<') || trimmed.includes('>')) {
      throw new Error(
        'Paste the Funding Choices publisher id or script URL only.'
      );
    }
  }

  if (field.name === 'bing_indexnow_key' && !INDEXNOW_KEY_RE.test(trimmed)) {
    throw new Error(
      'Bing IndexNow Key must be 8-128 characters and only contain letters, numbers, "_" or "-".'
    );
  }

  return trimmed;
}

function buildProductionEnvSnippet(values: EnvMap) {
  return devConfigFields
    .map(
      (field) => `${field.envName} = ${quoteEnvValue(values[field.name] ?? '')}`
    )
    .join('\n');
}

async function loadDevConfigPageData() {
  assertDevConfigEnabled();

  const envFilePath = getEnvFilePath();
  const envContent = await readEnvFile(envFilePath);
  const fileValues = parseEnvContent(envContent);
  syncAllowedEnvToProcess(fileValues);

  const runtimeConfigs = await getRuntimeConfig();
  const values = Object.fromEntries(
    devConfigFields.map((field) => [
      field.name,
      getFieldEffectiveValue(field, runtimeConfigs, fileValues) ?? '',
    ])
  );

  const databaseProvider = envConfigs.database_provider || 'none';
  const hasDatabase =
    databaseProvider !== 'none' &&
    (databaseProvider === 'd1' || Boolean(envConfigs.database_url));

  return {
    tabs: devConfigTabs,
    groups: devConfigGroups,
    fields: devConfigFields,
    values,
    envFilePath,
    productionEnvSnippet: buildProductionEnvSnippet(values),
    mode: {
      preset:
        getEnv('VITE_APP_PRESET') || import.meta.env.VITE_APP_PRESET || 'full',
      databaseProvider,
      hasDatabase,
      configTableEnabled:
        (getEnv('VITE_APP_PRESET') ||
          import.meta.env.VITE_APP_PRESET ||
          'full') === 'full',
    },
  };
}

export const getDevConfigSettingsFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  return loadDevConfigPageData();
});

export const saveDevConfigSettingsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: Record<string, string>) => data)
  .handler(async ({ data }) => {
    assertDevConfigEnabled();

    const fieldByName = new Map(
      devConfigFields.map((field) => [field.name, field])
    );
    const updates: EnvMap = {};

    for (const [name, rawValue] of Object.entries(data)) {
      const field = fieldByName.get(name);
      if (!field) {
        throw new Error(`Unknown local config field: ${name}`);
      }
      updates[field.envName] = validateFieldValue(field, String(rawValue));
    }

    if (Object.keys(updates).length > 0) {
      const envFilePath = getEnvFilePath();
      const envContent = await readEnvFile(envFilePath);
      await fs.writeFile(envFilePath, updateEnvContent(envContent, updates));
      syncAllowedEnvToProcess(updates);
    }

    return {
      status: 'success',
      message: 'Local config saved',
    };
  });
