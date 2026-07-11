import { createServerFn } from '@tanstack/react-start';
import { desc, eq } from 'drizzle-orm';

import { db } from '@/core/db/index.server';

import { feedback } from '@/config/db/schema';

import { getUuid } from '@/lib/hash';

/**
 * Submit feedback (public — no auth required)
 */
export const submitFeedbackFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      email?: string;
      name?: string;
      type?: string;
      content: string;
      userId?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const { email, name, type, content, userId } = data;

    if (!content?.trim()) {
      throw new Error('Feedback content is required');
    }

    const [result] = await db()
      .insert(feedback)
      .values({
        id: getUuid(),
        userId: userId || null,
        email: email || null,
        name: name || null,
        type: type || 'general',
        content: content.trim(),
        status: 'pending',
      })
      .returning();

    return result;
  });

/**
 * Get feedback list (admin only)
 */
export const getFeedbackListFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { status?: string; page?: number; pageSize?: number }) => data
  )
  .handler(async ({ data }) => {
    const { status, page = 1, pageSize = 20 } = data;

    let query = db().select().from(feedback);

    if (status) {
      query = query.where(eq(feedback.status, status)) as any;
    }

    const results = await (query as any)
      .orderBy(desc(feedback.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return results;
  });
