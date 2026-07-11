import { betterAuth, BetterAuthOptions } from 'better-auth';

import { getRuntimeConfig } from '@/config/runtime.server';

import { getAuthOptions } from './config.server';

declare global {
  var _cachedAuth: ReturnType<typeof betterAuth> | null;
  var _cachedConfigsSignature: string | null;
}

// get auth instance in server side
export async function getAuth() {
  // get configs from runtime resolver (env > defaults > db in full mode)
  const configs = await getRuntimeConfig();
  const signature = JSON.stringify(configs);

  if (
    globalThis._cachedAuth &&
    globalThis._cachedConfigsSignature === signature
  ) {
    return globalThis._cachedAuth;
  }

  const authOptions = await getAuthOptions(configs);

  globalThis._cachedAuth = betterAuth(authOptions as BetterAuthOptions);
  globalThis._cachedConfigsSignature = signature;

  return globalThis._cachedAuth;
}
