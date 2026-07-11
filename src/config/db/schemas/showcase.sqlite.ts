/**
 * Showcase schema — prompt card records backed by object storage images.
 * Module: showcases
 */
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { sqliteNowMs } from './core.sqlite';

const table = sqliteTable;

export const showcasePrompt = table(
  'showcase_prompt',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    prompt: text('prompt').notNull(),
    useCase: text('use_case').notNull(),
    style: text('style').notNull(),
    subject: text('subject').notNull(),
    image: text('image').notNull(),
    imageKey: text('image_key'),
    storageProvider: text('storage_provider').notNull().default('r2'),
    status: text('status').notNull().default('active'),
    sort: integer('sort').default(0).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    deletedAt: integer('deleted_at', { mode: 'timestamp_ms' }),
  },
  (table) => [
    index('idx_showcase_prompt_status_sort').on(table.status, table.sort),
  ]
);
