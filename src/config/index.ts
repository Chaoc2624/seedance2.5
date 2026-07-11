import packageJson from '../../package.json';

// Note: Environment variables are loaded via dotenv-cli in package.json scripts.
// Vite automatically loads .env files. Client-side variables need VITE_ prefix.

export type ConfigMap = Record<string, string>;

function getProcessEnv(key: string): string | undefined {
  if (typeof process === 'undefined') {
    return undefined;
  }

  return process.env?.[key];
}

/**
 * Cloudflare injects bindings per request. The Nitro plugin mirrors those
 * bindings to globalThis so server code can read them lazily from this proxy.
 */
export function getEnv(key: string): string | undefined {
  const cloudflareEnv = (globalThis as { __env__?: Record<string, string> })
    .__env__;

  if (cloudflareEnv && key in cloudflareEnv) {
    return cloudflareEnv[key];
  }

  return getProcessEnv(key);
}

export const envConfigs: ConfigMap = new Proxy({} as ConfigMap, {
  get(_target, prop: string) {
    const map: Record<string, () => string> = {
      app_url: () =>
        getEnv('VITE_APP_URL') ??
        import.meta.env?.VITE_APP_URL ??
        'http://localhost:3000',
      app_name: () =>
        getEnv('VITE_APP_NAME') ??
        import.meta.env?.VITE_APP_NAME ??
        'Seedance 2.5',
      app_description: () =>
        getEnv('VITE_APP_DESCRIPTION') ??
        import.meta.env?.VITE_APP_DESCRIPTION ??
        '',
      app_logo: () =>
        getEnv('VITE_APP_LOGO') ??
        import.meta.env?.VITE_APP_LOGO ??
        '/logo.svg',
      app_favicon: () =>
        getEnv('VITE_APP_FAVICON') ??
        import.meta.env?.VITE_APP_FAVICON ??
        '/favicon.ico',
      app_preview_image: () =>
        getEnv('VITE_APP_PREVIEW_IMAGE') ??
        import.meta.env?.VITE_APP_PREVIEW_IMAGE ??
        '/preview.png',
      theme: () =>
        getEnv('VITE_THEME') ?? import.meta.env?.VITE_THEME ?? 'default',
      appearance: () =>
        getEnv('VITE_APPEARANCE') ??
        import.meta.env?.VITE_APPEARANCE ??
        'system',
      locale: () =>
        getEnv('VITE_DEFAULT_LOCALE') ??
        import.meta.env?.VITE_DEFAULT_LOCALE ??
        'en',
      database_url: () => getEnv('DATABASE_URL') ?? '',
      database_auth_token: () => getEnv('DATABASE_AUTH_TOKEN') ?? '',
      database_provider: () => getEnv('DATABASE_PROVIDER') ?? 'postgresql',
      db_schema_file: () =>
        getEnv('DB_SCHEMA_FILE') ?? './src/config/db/schema.ts',
      db_schema: () => getEnv('DB_SCHEMA') ?? 'public',
      db_migrations_table: () =>
        getEnv('DB_MIGRATIONS_TABLE') ?? '__drizzle_migrations',
      db_migrations_schema: () => getEnv('DB_MIGRATIONS_SCHEMA') ?? 'drizzle',
      db_migrations_out: () =>
        getEnv('DB_MIGRATIONS_OUT') ?? './src/config/db/migrations',
      db_singleton_enabled: () => getEnv('DB_SINGLETON_ENABLED') ?? 'true',
      db_max_connections: () =>
        getEnv('DB_MAX_CONNECTIONS') ||
        (getEnv('DATABASE_PROVIDER') === 'postgresql' ? '1' : '10'),
      blog_storage_mode: () =>
        getEnv('BLOG_STORAGE_MODE') ??
        getEnv('VITE_BLOG_STORAGE_MODE') ??
        import.meta.env?.VITE_BLOG_STORAGE_MODE ??
        (import.meta.env?.VITE_APP_PRESET === 'lite' ? 'mdx' : 'mdx-db'),
      auth_url: () =>
        getEnv('AUTH_URL') ??
        getEnv('VITE_APP_URL') ??
        import.meta.env?.VITE_APP_URL ??
        'http://localhost:3000',
      auth_secret: () => getEnv('AUTH_SECRET') ?? '',
      version: () => packageJson.version,
      locale_detect_enabled: () =>
        getEnv('VITE_LOCALE_DETECT_ENABLED') ??
        import.meta.env?.VITE_LOCALE_DETECT_ENABLED ??
        'false',
    };

    const getter = map[prop];
    return getter ? getter() : undefined;
  },
});
