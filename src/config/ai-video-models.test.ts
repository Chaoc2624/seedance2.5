import { describe, expect, test } from 'bun:test';

import {
  DEFAULT_VIDEO_MODEL_CATALOG,
  getVideoModelCreditCost,
  normalizeVideoModelDuration,
} from './ai-video-models';

describe('AI video model durations and credits', () => {
  test('charges Kling 3.0 by selected seconds', () => {
    const model = DEFAULT_VIDEO_MODEL_CATALOG.find(
      (item) => item.id === 'kie:kling-3-0'
    );

    expect(model).toBeDefined();
    expect(model?.defaults?.duration).toBe('10');
    expect(model?.capabilities?.durationRange).toEqual({
      min: 4,
      max: 15,
      step: 1,
    });
    expect(
      getVideoModelCreditCost({
        model: model!,
        scene: 'text-to-video',
        duration: '10',
      })
    ).toBe(220);
  });

  test('normalizes ranged duration before credit calculation', () => {
    const model = DEFAULT_VIDEO_MODEL_CATALOG.find(
      (item) => item.id === 'kie:kling-3-0'
    );

    expect(model).toBeDefined();
    expect(normalizeVideoModelDuration({ model: model!, duration: '2' })).toBe(
      '4'
    );
    expect(normalizeVideoModelDuration({ model: model!, duration: '30' })).toBe(
      '15'
    );
    expect(
      getVideoModelCreditCost({
        model: model!,
        scene: 'image-to-video',
        duration: '30',
      })
    ).toBe(330);
  });

  test('snaps fixed duration models to supported anchors', () => {
    const model = DEFAULT_VIDEO_MODEL_CATALOG.find(
      (item) => item.id === 'kie:kling-2-6-text'
    );

    expect(model).toBeDefined();
    expect(normalizeVideoModelDuration({ model: model!, duration: '7' })).toBe(
      '5'
    );
    expect(
      getVideoModelCreditCost({
        model: model!,
        scene: 'text-to-video',
        duration: '10',
      })
    ).toBe(180);
  });

  test('reuses the duration slider model for Seedance 2 anchors', () => {
    const model = DEFAULT_VIDEO_MODEL_CATALOG.find(
      (item) => item.id === 'kie:seedance-2'
    );

    expect(model).toBeDefined();
    expect(model?.capabilities?.durationOptions).toEqual(['5', '10']);
    expect(normalizeVideoModelDuration({ model: model!, duration: '9' })).toBe(
      '10'
    );
    expect(
      getVideoModelCreditCost({
        model: model!,
        scene: 'text-to-video',
        duration: '10',
      })
    ).toBe(180);
  });
});
