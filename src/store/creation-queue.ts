import { create } from 'zustand';

import type { HeroGenerationPayload } from '@/components/features/ai-generator/components/hero-creation-form';

interface CreationQueueState {
  pendingPayload: HeroGenerationPayload | null;
  setPayload: (payload: HeroGenerationPayload | null) => void;
}

/**
 * In-memory store for passing a generation payload from the creation form
 * to the workspace page. Using a store (instead of URL params or sessionStorage)
 * prevents the URL from carrying auto-trigger params that would re-fire
 * generation on every navigation to /generate.
 */
export const useCreationQueueStore = create<CreationQueueState>((set) => ({
  pendingPayload: null,
  setPayload: (payload) => set({ pendingPayload: payload }),
}));
