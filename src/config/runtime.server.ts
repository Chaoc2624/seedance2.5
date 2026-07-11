/**
 * Runtime configuration resolver.
 *
 * Single entry point for auth / analytics / email / storage / payment configs.
 *
 * Priority:
 *   1. Code defaults (runtime.defaults.ts)
 *   2. Environment variables (Cloudflare/request env or process.env)
 *   3. DB config table — only in 'full' preset when configTable module is enabled
 *
 * In 'full' mode the DB layer has highest priority so admin panel changes take
 * effect immediately. In 'lite' mode the DB is never queried.
 */

import { envConfigs, getEnv } from '@/config';
import { isCloudflareWorker } from '@/lib/env';

import { modules } from './preset';
import { defaults } from './runtime.defaults';

export type RuntimeConfigs = Record<string, string>;

declare global {
  var _runtimeConfigCache: RuntimeConfigs | null;
  var _runtimeConfigCacheTime: number | null;
}

const CACHE_TTL_MS = 60_000; // 1 minute

/**
 * Get merged runtime configuration.
 */
export async function getRuntimeConfig(): Promise<RuntimeConfigs> {
  const now = Date.now();
  if (
    globalThis._runtimeConfigCache &&
    now - (globalThis._runtimeConfigCacheTime || 0) < CACHE_TTL_MS
  ) {
    return globalThis._runtimeConfigCache;
  }

  // 1) Start with code defaults
  const merged: RuntimeConfigs = { ...defaults };

  // 2) Override with env vars (support both UPPER_CASE and lower_case)
  for (const key of Object.keys(defaults)) {
    const upperKey = key.toUpperCase();
    const upperValue = getEnv(upperKey);
    const lowerValue = getEnv(key);
    if (upperValue) {
      merged[key] = upperValue;
    } else if (lowerValue) {
      merged[key] = lowerValue;
    }
  }

  // 3) Override with DB config table (full mode only, server-side only)
  if (modules.configTable && typeof window === 'undefined') {
    const hasDb =
      envConfigs.database_url ||
      (envConfigs.database_provider === 'd1' && isCloudflareWorker);

    if (hasDb) {
      try {
        // Dynamic import to avoid pulling DB code into lite bundles
        const { getConfigs } = await import('@/models/config.server');
        const dbConfigs = await getConfigs();
        // DB has highest priority in full mode (admin changes take effect immediately)
        Object.assign(merged, dbConfigs);
      } catch (e) {
        console.log(
          'getRuntimeConfig: DB config read failed, using env/defaults:',
          e
        );
      }
    }
  }

  // Merge envConfigs (app-level VITE_ vars) underneath
  const result: RuntimeConfigs = {
    ...envConfigs,
    ...merged,
  };

  globalThis._runtimeConfigCache = result;
  globalThis._runtimeConfigCacheTime = now;

  return result;
}

/**
 * Invalidate the runtime config cache.
 * Call this after admin saves settings via the config table.
 */
export function invalidateRuntimeConfig(): void {
  globalThis._runtimeConfigCache = null;
  globalThis._runtimeConfigCacheTime = 0;
}

/**
 * Get only the public-safe subset of runtime configs (for client-side use).
 */
export async function getPublicRuntimeConfig(): Promise<RuntimeConfigs> {
  // Re-use the existing publicSettingNames list
  const { publicSettingNames } = await import('@/services/settings');
  const all = await getRuntimeConfig();
  const pub: RuntimeConfigs = {};
  for (const key of publicSettingNames) {
    if (key in all) {
      pub[key] = all[key];
    }
  }
  return pub;
}
