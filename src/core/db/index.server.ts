import { getSqliteDb } from '#db/sqlite';

import { envConfigs } from '@/config';

import { getD1Db } from './d1.server';
import { closePostgresDb, getPostgresDb } from './postgres.server';

const mysqlCompatProxyCache = new WeakMap<object, any>();
const sqliteCompatProxyCache = new WeakMap<object, any>();

function withMysqlCompat<T extends object>(dbInstance: T): T {
  if (dbInstance && typeof dbInstance === 'object') {
    const cached = mysqlCompatProxyCache.get(dbInstance);
    if (cached) return cached as T;
  }

  const wrapQuery = (query: any, ctx: { payload?: any }) => {
    if (!query || typeof query !== 'object') return query;

    return new Proxy(query, {
      get(target, prop, receiver) {
        if (
          prop === 'onConflictDoUpdate' &&
          typeof (target as any).onConflictDoUpdate !== 'function' &&
          typeof (target as any).onDuplicateKeyUpdate === 'function'
        ) {
          return (cfg: any) => {
            const res = (target as any).onDuplicateKeyUpdate({ set: cfg?.set });
            return wrapQuery(res, ctx);
          };
        }

        if (
          prop === 'returning' &&
          typeof (target as any).returning !== 'function'
        ) {
          return async (..._args: any[]) => {
            await (target as any);
            if (ctx.payload === undefined) return [];
            return Array.isArray(ctx.payload) ? ctx.payload : [ctx.payload];
          };
        }

        const value = Reflect.get(target, prop, receiver);
        if (typeof value !== 'function') return value;

        return (...args: any[]) => {
          if (prop === 'values' || prop === 'set') ctx.payload = args[0];
          const res = value.apply(target, args);
          return wrapQuery(res, ctx);
        };
      },
    });
  };

  const proxied = new Proxy(dbInstance, {
    get(target, prop, receiver) {
      if (prop === 'transaction') {
        const original = Reflect.get(target, prop, receiver);
        if (typeof original !== 'function') return original;
        return (fn: any, ...rest: any[]) =>
          original.call(target, (tx: any) => fn(withMysqlCompat(tx)), ...rest);
      }

      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== 'function') return value;
      if (prop !== 'insert' && prop !== 'update' && prop !== 'delete')
        return value.bind(target);

      return (...args: any[]) => {
        const res = value.apply(target, args);
        return wrapQuery(res, {});
      };
    },
  }) as any as T;

  if (dbInstance && typeof dbInstance === 'object')
    mysqlCompatProxyCache.set(dbInstance, proxied);
  return proxied;
}

function withSqliteCompat<T extends object>(dbInstance: T): T {
  if (dbInstance && typeof dbInstance === 'object') {
    const cached = sqliteCompatProxyCache.get(dbInstance);
    if (cached) return cached as T;
  }

  const wrapQuery = (query: any) => {
    if (!query || typeof query !== 'object') return query;

    return new Proxy(query, {
      get(target, prop, receiver) {
        if (prop === 'for' && typeof (target as any).for !== 'function') {
          return (..._args: any[]) => receiver;
        }
        const value = Reflect.get(target, prop, receiver);
        if (typeof value !== 'function') return value;
        return (...args: any[]) => wrapQuery(value.apply(target, args));
      },
    });
  };

  const proxied = new Proxy(dbInstance, {
    get(target, prop, receiver) {
      if (prop === 'transaction') {
        const original = Reflect.get(target, prop, receiver);
        if (typeof original !== 'function') return original;
        return (fn: any, ...rest: any[]) =>
          original.call(target, (tx: any) => fn(withSqliteCompat(tx)), ...rest);
      }

      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== 'function') return value;

      if (typeof prop === 'string' && prop.startsWith('select')) {
        return (...args: any[]) => wrapQuery(value.apply(target, args));
      }

      return value.bind(target);
    },
  }) as any as T;

  if (dbInstance && typeof dbInstance === 'object')
    sqliteCompatProxyCache.set(dbInstance, proxied);
  return proxied;
}

export function db(): any {
  const provider = envConfigs.database_provider;

  if (provider === 'none') {
    throw new Error(
      'Database is disabled. Configure DATABASE_PROVIDER and DATABASE_URL before using DB-backed features.'
    );
  }

  if (provider === 'd1') return withSqliteCompat(getD1Db() as any);

  if (provider === 'sqlite' || provider === 'turso')
    return withSqliteCompat(getSqliteDb() as any);

  if (provider === 'mysql') {
    // Lazy load mysql2 to avoid bundling Node.js Buffer polyfill
    const { getMysqlDb } = require('./mysql.server');
    return withMysqlCompat(getMysqlDb() as any);
  }

  return getPostgresDb() as any;
}

export function dbPostgres(): ReturnType<typeof getPostgresDb> {
  if (envConfigs.database_provider !== 'postgresql')
    throw new Error('Database provider is not PostgreSQL');
  return getPostgresDb();
}

export function dbMysql() {
  if (envConfigs.database_provider !== 'mysql')
    throw new Error('Database provider is not MySQL');
  const { getMysqlDb } = require('./mysql.server');
  return getMysqlDb();
}

export function dbSqlite(): ReturnType<typeof getSqliteDb> {
  if (!['sqlite', 'turso'].includes(envConfigs.database_provider))
    throw new Error('Database provider is not SQLite');
  return getSqliteDb();
}

export function dbD1(): ReturnType<typeof getD1Db> {
  if (envConfigs.database_provider !== 'd1')
    throw new Error('Database provider is not D1');
  return getD1Db();
}

export async function closeDb() {
  if (envConfigs.database_provider === 'postgresql') {
    await closePostgresDb();
    return;
  }

  if (envConfigs.database_provider === 'mysql') {
    const { closeMysqlDb } = require('./mysql.server');
    await closeMysqlDb();
    return;
  }
}
