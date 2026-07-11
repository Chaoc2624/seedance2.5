import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { envConfigs } from '@/config';
import { isCloudflareWorker } from '@/lib/env';

declare global {
  var _postgresDbInstance: ReturnType<typeof drizzle> | null | undefined;
  var _postgresClient: ReturnType<typeof postgres> | null | undefined;
  var _postgresSignature: string | null | undefined;
}

function getDbSignature(databaseUrl: string, schemaName: string) {
  return JSON.stringify({
    databaseUrl,
    schemaName,
    max: Number(envConfigs.db_max_connections) || 1,
  });
}

export function getPostgresDb() {
  let databaseUrl = envConfigs.database_url;

  let isHyperdrive = false;
  const schemaName = (envConfigs.db_schema || 'public').trim();
  const connectionSchemaOptions =
    schemaName && schemaName !== 'public'
      ? { connection: { options: `-c search_path=${schemaName}` } }
      : {};

  if (isCloudflareWorker) {
    const { env }: { env: any } = { env: {} };
    // Detect if set Hyperdrive
    isHyperdrive = 'HYPERDRIVE' in env;

    if (isHyperdrive) {
      const hyperdrive = env.HYPERDRIVE;
      databaseUrl = hyperdrive.connectionString;
      console.log('using Hyperdrive connection');
    }
  }

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  // In Cloudflare Workers, create new connection each time
  if (isCloudflareWorker) {
    console.log('in Cloudflare Workers environment');
    // Workers environment uses minimal configuration
    const client = postgres(databaseUrl, {
      prepare: false,
      max: 1, // Limit to 1 connection in Workers
      idle_timeout: 10, // Shorter timeout for Workers
      connect_timeout: 5,
      ...connectionSchemaOptions,
    });

    return drizzle(client);
  }

  // Singleton mode: reuse existing connection (good for traditional servers and serverless warm starts)
  if (envConfigs.db_singleton_enabled === 'true') {
    const signature = getDbSignature(databaseUrl, schemaName);

    if (
      globalThis._postgresDbInstance &&
      globalThis._postgresSignature === signature
    ) {
      return globalThis._postgresDbInstance;
    }

    if (
      globalThis._postgresClient &&
      globalThis._postgresSignature &&
      globalThis._postgresSignature !== signature
    ) {
      void globalThis._postgresClient.end().catch(() => {});
    }

    const postgresClient = postgres(databaseUrl, {
      prepare: false,
      max: Number(envConfigs.db_max_connections) || 1, // Maximum connections in pool (default 1)
      idle_timeout: 30, // Idle connection timeout (seconds)
      connect_timeout: 10, // Connection timeout (seconds)
      ...connectionSchemaOptions,
    });

    const dbInstance = drizzle({ client: postgresClient });
    globalThis._postgresClient = postgresClient;
    globalThis._postgresDbInstance = dbInstance;
    globalThis._postgresSignature = signature;
    return dbInstance;
  }

  // Non-singleton mode: create new connection each time (good for serverless)
  // In serverless, the connection will be cleaned up when the function instance is destroyed
  const serverlessClient = postgres(databaseUrl, {
    prepare: false,
    max: 1, // Use single connection in serverless
    idle_timeout: 20,
    connect_timeout: 10,
    ...connectionSchemaOptions,
  });

  return drizzle({ client: serverlessClient });
}

// Optional: Function to close database connection (useful for testing or graceful shutdown)
// Note: Only works in singleton mode
export async function closePostgresDb() {
  if (envConfigs.db_singleton_enabled && globalThis._postgresClient) {
    await globalThis._postgresClient.end();
    globalThis._postgresClient = null;
    globalThis._postgresDbInstance = null;
    globalThis._postgresSignature = null;
  }
}
