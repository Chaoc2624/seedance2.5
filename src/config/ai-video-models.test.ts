import { describe, expect, test } from 'bun:test';

import {
  DEFAULT_VIDEO_MODEL_CATALOG,
  assertVideoModelReferenceMedia,
  getVideoModelCreditCost,
  getVideoModelPickerModels,
  getVideoModelReferenceMedia,
  normalizeVideoModelDuration,
} from './ai-video-models';

describe('AI video model durations and credits', () => {
  test('limits the generator model picker to Seedance, Kling, and HappyHorse', () => {
    expect(
      new Set(
        getVideoModelPickerModels(DEFAULT_VIDEO_MODEL_CATALOG).map(
          (model) => model.familyId
        )
      )
    ).toEqual(new Set(['seedance', 'kling', 'happyhorse']));
  });

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

  test('supports common duration values for Kling 2.6 Text', () => {
    const model = DEFAULT_VIDEO_MODEL_CATALOG.find(
      (item) => item.id === 'kie:kling-2-6-text'
    );

    expect(model).toBeDefined();
    expect(normalizeVideoModelDuration({ model: model!, duration: '7' })).toBe(
      '7'
    );
    expect(
      getVideoModelCreditCost({
        model: model!,
        scene: 'text-to-video',
        duration: '10',
      })
    ).toBe(180);
  });

  test('matches the documented Seedance 2 duration range', () => {
    const model = DEFAULT_VIDEO_MODEL_CATALOG.find(
      (item) => item.id === 'kie:seedance-2'
    );

    expect(model).toBeDefined();
    expect(model?.capabilities?.durationOptions).toEqual([
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
    ]);
    expect(normalizeVideoModelDuration({ model: model!, duration: '9' })).toBe(
      '9'
    );
    expect(
      getVideoModelCreditCost({
        model: model!,
        scene: 'text-to-video',
        duration: '10',
      })
    ).toBe(180);
  });

  test('uses the selected model as the source of reference media limits', () => {
    const model = DEFAULT_VIDEO_MODEL_CATALOG.find(
      (item) => item.id === 'kie:seedance-2'
    );

    expect(getVideoModelReferenceMedia(model)).toEqual({
      imageCount: 9,
      videoCount: 3,
      audioCount: 3,
    });
    expect(() =>
      assertVideoModelReferenceMedia({
        model: model!,
        options: {
          reference_videos: ['a', 'b', 'c', 'd'],
        },
      })
    ).toThrow('up to 3 video references');
  });
});
