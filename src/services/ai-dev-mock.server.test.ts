import { describe, expect, test } from 'bun:test';

import { buildImageMockFixtureKey } from './ai-dev-mock.server';

describe('buildImageMockFixtureKey', () => {
  test('separates local image mock fixtures by prompt and options', () => {
    const base = {
      mediaType: 'image',
      scene: 'text-to-image',
      provider: 'kie',
      model: 'gpt-image-2-text-to-image',
    };

    const first = buildImageMockFixtureKey({
      ...base,
      prompt: 'a student portrait',
      options: { aspect_ratio: '1:1' },
    });
    const second = buildImageMockFixtureKey({
      ...base,
      prompt: 'a cosplay story photo',
      options: { aspect_ratio: '1:1' },
    });
    const third = buildImageMockFixtureKey({
      ...base,
      prompt: 'a student portrait',
      options: { aspect_ratio: '16:9' },
    });

    expect(first).not.toBe(second);
    expect(first).not.toBe(third);
  });
});
