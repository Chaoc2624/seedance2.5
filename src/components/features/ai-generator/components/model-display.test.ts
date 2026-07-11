import { describe, expect, test } from 'bun:test';

import { formatPublicModelMeta } from './model-display';

describe('formatPublicModelMeta', () => {
  test('hides provider slugs and only shows credits', () => {
    for (const provider of ['kie', 'replicate', 'fal']) {
      expect(formatPublicModelMeta({ credits: 20, provider })).toBe(
        '20 credits'
      );
    }
  });
});
