import { and, asc, count, eq, isNull } from 'drizzle-orm';

import { db } from '@/core/db/index.server';

import { showcasePrompt } from '@/config/db/schema';
import type { ShowcasePrompt } from '@/config/showcase-data';

export type ShowcasePromptRecord = typeof showcasePrompt.$inferSelect;
export type NewShowcasePromptRecord = typeof showcasePrompt.$inferInsert;

export function toShowcasePrompt(record: ShowcasePromptRecord): ShowcasePrompt {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    prompt: record.prompt,
    useCase: record.useCase,
    style: record.style,
    subject: record.subject,
    image: record.image,
  };
}

export async function getPublicShowcasePrompts(): Promise<ShowcasePrompt[]> {
  const result = await db()
    .select()
    .from(showcasePrompt)
    .where(
      and(eq(showcasePrompt.status, 'active'), isNull(showcasePrompt.deletedAt))
    )
    .orderBy(asc(showcasePrompt.sort), asc(showcasePrompt.createdAt));

  return result.map(toShowcasePrompt);
}

export async function getPublicShowcasePromptsPage({
  page = 1,
  limit = 24,
  useCase,
}: {
  page?: number;
  limit?: number;
  useCase?: string;
} = {}): Promise<{ items: ShowcasePrompt[]; total: number }> {
  const where = and(
    eq(showcasePrompt.status, 'active'),
    isNull(showcasePrompt.deletedAt),
    useCase ? eq(showcasePrompt.useCase, useCase) : undefined
  );

  const [totalResult] = await db()
    .select({ count: count() })
    .from(showcasePrompt)
    .where(where);

  const result = await db()
    .select()
    .from(showcasePrompt)
    .where(where)
    .orderBy(asc(showcasePrompt.sort), asc(showcasePrompt.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return {
    items: result.map(toShowcasePrompt),
    total: totalResult?.count || 0,
  };
}

export async function upsertShowcasePrompt(
  values: NewShowcasePromptRecord
): Promise<ShowcasePromptRecord> {
  const [result] = await db()
    .insert(showcasePrompt)
    .values(values)
    .onConflictDoUpdate({
      target: showcasePrompt.id,
      set: {
        title: values.title,
        description: values.description,
        prompt: values.prompt,
        useCase: values.useCase,
        style: values.style,
        subject: values.subject,
        image: values.image,
        imageKey: values.imageKey,
        storageProvider: values.storageProvider,
        status: values.status,
        sort: values.sort,
        deletedAt: null,
      },
    })
    .returning();

  return result;
}
