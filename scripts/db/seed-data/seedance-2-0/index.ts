import { postFastVsMini } from './post-fast-vs-mini';
import { postOverview } from './post-overview';
import { postWorkflows } from './post-workflows';
import type { SeedPostDefinition } from './types';

export type {
  BlogLocale,
  LocalizedPostBody,
  SeedPostDefinition,
} from './types';
export { SEEDANCE_BLOG_LOCALES } from './types';

export const seedance20PostDefinitions: SeedPostDefinition[] = [
  postOverview,
  postWorkflows,
  postFastVsMini,
];
