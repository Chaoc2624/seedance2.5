import { sql } from 'drizzle-orm';

import { db } from '@/core/db/index.server';

import { config } from '@/config/db/schema';
import {
  getRuntimeConfig,
  invalidateRuntimeConfig,
} from '@/config/runtime.server';

import { envConfigs } from '@/config';
import { isCloudflareWorker } from '@/lib/env';
import { publicSettingNames } from '@/services/settings';

export type Config = typeof config.$inferSelect;
export type NewConfig = typeof config.$inferInsert;
export type UpdateConfig = Partial<Omit<NewConfig, 'name'>>;

export type Configs = Record<string, string>;

declare global {
  var _cachedConfigs: Configs | null;
  var _cachedConfigsTime: number | null;
}

const CONFIG_CACHE_TTL_MS = 60_000;

export async function saveConfigs(configs: Record<string, string>) {
  const configEntries = Object.entries(configs).map(([name, value]) => ({
    name,
    value,
  }));

  if (configEntries.length === 0) {
    return [];
  }

  const result =
    envConfigs.database_provider === 'mysql'
      ? await db()
          .insert(config)
          .values(configEntries)
          .onDuplicateKeyUpdate({
            // MySQL uses VALUES() instead of EXCLUDED for insert conflicts.
            set: { value: sql.raw(`values(\`${config.value.name}\`)`) },
          })
      : await db()
          .insert(config)
          .values(configEntries)
          .onConflictDoUpdate({
            target: config.name,
            set: { value: sql.raw(`excluded."${config.value.name}"`) },
          });

  if (typeof globalThis !== 'undefined') {
    globalThis._cachedConfigs = null;
    globalThis._cachedConfigsTime = 0;
  }
  invalidateRuntimeConfig();

  return result;
}

export async function addConfig(newConfig: NewConfig) {
  const [result] = await db().insert(config).values(newConfig).returning();
  return result;
}

export async function getConfigs(): Promise<Configs> {
  const now = Date.now();
  if (
    globalThis._cachedConfigs &&
    now - (globalThis._cachedConfigsTime || 0) < CONFIG_CACHE_TTL_MS
  ) {
    return globalThis._cachedConfigs;
  }

  const configs: Record<string, string> = {};

  if (envConfigs.database_provider === 'd1' && !isCloudflareWorker) {
    return configs;
  }
  if (!envConfigs.database_url && envConfigs.database_provider !== 'd1') {
    return configs;
  }

  const result = await db().select().from(config);
  if (!result) {
    return configs;
  }

  for (const item of result) {
    configs[item.name] = item.value ?? '';
  }

  globalThis._cachedConfigs = configs;
  globalThis._cachedConfigsTime = now;

  return configs;
}

export async function getAllConfigs(): Promise<Configs> {
  return getRuntimeConfig();
}

export async function getPublicConfigs(): Promise<Configs> {
  const allConfigs = await getAllConfigs();
  const publicConfigs: Record<string, string> = {};

  for (const key in allConfigs) {
    if (publicSettingNames.includes(key)) {
      publicConfigs[key] = String(allConfigs[key]);
    }
  }

  return publicConfigs;
}
