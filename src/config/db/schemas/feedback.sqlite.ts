/**
 * Feedback schema — feedback table.
 * Module: always enabled (both lite and full)
 */
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { user, sqliteNowMs } from './core.sqlite';

const table = sqliteTable;

export const feedback = table(
  'feedback',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
    email: text('email'),
    name: text('name'),
    type: text('type').notNull().default('general'), // general, bug, feature, other
    content: text('content').notNull(),
    status: text('status').notNull().default('pending'), // pending, reviewed, resolved
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('idx_feedback_status').on(table.status),
    index('idx_feedback_created_at').on(table.createdAt),
  ]
);
