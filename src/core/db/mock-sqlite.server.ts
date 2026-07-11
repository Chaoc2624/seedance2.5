export function getSqliteDb(): any {
  throw new Error(
    'SQLite is not supported in the Cloudflare Edge runtime. Please configure PostgreSQL or MySQL via DATABASE_PROVIDER.'
  );
}
