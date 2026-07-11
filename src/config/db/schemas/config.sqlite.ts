/**
 * Config schema — system KV config table.
 * Module: configTable (full only)
 */
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

const table = sqliteTable;

export const config = table('config', {
  name: text('name').unique().notNull(),
  value: text('value'),
});
