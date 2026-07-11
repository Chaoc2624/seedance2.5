/**
 * SQLite schema — re-exports all schema shards.
 *
 * Schema is split by module for clarity:
 *   - core: user, session, account, verification (always enabled)
 *   - config: config KV table (full only)
 *   - blog: post, taxonomy (always enabled)
 *   - payment: order, subscription, credit (full only)
 *   - rbac: role, permission, role_permission, user_role (full only)
 *   - ai: ai_task (full only)
 *
 * All shards are always re-exported here because Drizzle needs the full
 * schema at migration time. Runtime module filtering happens elsewhere
 * (preset.ts / route guards).
 */
export { sqliteNowMs } from './schemas/core.sqlite';
export * from './schemas/core.sqlite';
export * from './schemas/config.sqlite';
export * from './schemas/blog.sqlite';
export * from './schemas/payment.sqlite';
export * from './schemas/rbac.sqlite';
export * from './schemas/ai.sqlite';
export * from './schemas/feedback.sqlite';
export * from './schemas/showcase.sqlite';
