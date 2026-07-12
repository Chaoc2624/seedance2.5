import { describe, expect, test } from 'bun:test';

import { buildSeedanceReferenceSettings } from './hero-reference-assets';

describe('buildSeedanceReferenceSettings', () => {
  test('keeps frame mode separate from multimodal references', () => {
    expect(
      buildSeedanceReferenceSettings([
        {
          mediaType: 'image',
          referenceRole: 'first-frame',
          url: 'https://cdn.example.com/first.png',
        },
        {
          mediaType: 'image',
          referenceRole: 'last-frame',
          url: 'https://cdn.example.com/last.png',
        },
        {
          mediaType: 'image',
          referenceRole: 'reference-image',
          url: 'https://cdn.example.com/image.png',
        },
        {
          mediaType: 'video',
          referenceRole: 'reference-video',
          url: 'https://cdn.example.com/video.mov',
        },
        {
          mediaType: 'audio',
          referenceRole: 'reference-audio',
          url: 'https://cdn.example.com/audio.wav',
        },
      ])
    ).toEqual({
      reference_first_frame: 'https://cdn.example.com/first.png',
      reference_last_frame: 'https://cdn.example.com/last.png',
    });
  });

  test('preserves all multimodal reference roles', () => {
    expect(
      buildSeedanceReferenceSettings([
        {
          mediaType: 'image',
          referenceRole: 'reference-image',
          url: 'https://cdn.example.com/image.png',
        },
        {
          mediaType: 'video',
          referenceRole: 'reference-video',
          url: 'https://cdn.example.com/video.mov',
        },
        {
          mediaType: 'audio',
          referenceRole: 'reference-audio',
          url: 'https://cdn.example.com/audio.wav',
        },
      ])
    ).toEqual({
      reference_images: ['https://cdn.example.com/image.png'],
      reference_videos: ['https://cdn.example.com/video.mov'],
      reference_audio: ['https://cdn.example.com/audio.wav'],
    });
  });
});
