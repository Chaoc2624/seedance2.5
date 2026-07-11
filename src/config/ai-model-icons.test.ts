import { describe, expect, test } from 'bun:test';

import { DEFAULT_IMAGE_MODEL_CATALOG, getImageModelIconSrc } from './ai-models';
import {
  DEFAULT_VIDEO_MODEL_CATALOG,
  getVideoModelIconSrc,
} from './ai-video-models';

describe('AI model icon assets', () => {
  test('uses local static icons for image Grok', () => {
    const grok = DEFAULT_IMAGE_MODEL_CATALOG.find((model) =>
      model.id.includes('grok')
    );

    expect(grok).toBeDefined();
    expect(getImageModelIconSrc(grok!)).toBe('/ai-model-icons/grok.png');
  });

  test('uses local static icons for video families that favicon fallback misses', () => {
    const expected: Record<string, string> = {
      kling: '/ai-model-icons/kling.png',
      grok: '/ai-model-icons/grok.png',
      happyhorse: '/ai-model-icons/happyhorse.png',
    };

    for (const [familyId, iconSrc] of Object.entries(expected)) {
      const model = DEFAULT_VIDEO_MODEL_CATALOG.find(
        (item) => item.familyId === familyId
      );

      expect(model).toBeDefined();
      expect(getVideoModelIconSrc(model!)).toBe(iconSrc);
    }
  });
});
