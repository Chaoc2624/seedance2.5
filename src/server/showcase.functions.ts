import { createServerFn } from '@tanstack/react-start';

import {
  getPublicShowcasePrompts,
  getPublicShowcasePromptsPage,
} from '@/models/showcase_prompt.server';

const DEFAULT_SHOWCASE_PAGE_SIZE = 24;
const MAX_SHOWCASE_PAGE_SIZE = 60;

function normalizePage(value?: number) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function normalizeLimit(value?: number) {
  const limit = Number(value);
  if (!Number.isFinite(limit) || limit <= 0) return DEFAULT_SHOWCASE_PAGE_SIZE;
  return Math.min(Math.floor(limit), MAX_SHOWCASE_PAGE_SIZE);
}

export const getPublicShowcasePromptsFn = createServerFn({ method: 'GET' })
  .inputValidator((data?: null) => data ?? null)
  .handler(async () => {
    try {
      return await getPublicShowcasePrompts();
    } catch (error) {
      console.error('Failed to load database showcase prompts:', error);
      return [];
    }
  });

export const getPublicShowcasePromptsPageFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data?: { page?: number; limit?: number; useCase?: string }) => data ?? {}
  )
  .handler(async ({ data }) => {
    const page = normalizePage(data.page);
    const limit = normalizeLimit(data.limit);
    const useCase = data.useCase?.trim() || undefined;

    try {
      const result = await getPublicShowcasePromptsPage({
        page,
        limit,
        useCase,
      });

      return {
        ...result,
        page,
        limit,
        hasMore: page * limit < result.total,
      };
    } catch (error) {
      console.error('Failed to load database showcase prompts page:', error);
      return { items: [], total: 0, page, limit, hasMore: false };
    }
  });
