import { describe, expect, test } from 'bun:test';

import {
  getNextHeroCreationModeState,
  hasHeroCreationInputContent,
  shouldAutoExpandComposerAtPageBottom,
} from './hero-creation-state';

describe('getNextHeroCreationModeState', () => {
  test('preserves video and image model selections when switching modes', () => {
    const currentState = {
      workflowId: 'text-image-video',
      modelId: 'pollo-2',
      videoModelKey: 'qwen-video-model',
      imageModelKey: 'gpt-image-model',
    };

    const imageState = getNextHeroCreationModeState('image', currentState);
    const videoState = getNextHeroCreationModeState('video', imageState);

    expect(imageState).toMatchObject({
      workflowId: 'text-image',
      videoModelKey: 'qwen-video-model',
      imageModelKey: 'gpt-image-model',
    });
    expect(videoState).toMatchObject({
      workflowId: 'text-image-video',
      videoModelKey: 'qwen-video-model',
      imageModelKey: 'gpt-image-model',
    });
  });
});

describe('shouldAutoExpandComposerAtPageBottom', () => {
  test('does not auto expand after the user manually collapsed the composer', () => {
    expect(
      shouldAutoExpandComposerAtPageBottom({
        distanceToBottom: 0,
        hasScrollablePage: true,
        userCollapsed: true,
      })
    ).toBe(false);
  });
});

describe('hasHeroCreationInputContent', () => {
  test('shows clear controls when prompt text or uploads exist', () => {
    expect(
      hasHeroCreationInputContent({
        prompt: '  cinematic portrait  ',
        assetCount: 0,
      })
    ).toBe(true);
    expect(
      hasHeroCreationInputContent({
        prompt: '',
        assetCount: 1,
      })
    ).toBe(true);
    expect(
      hasHeroCreationInputContent({
        prompt: '   ',
        assetCount: 0,
      })
    ).toBe(false);
  });
});
