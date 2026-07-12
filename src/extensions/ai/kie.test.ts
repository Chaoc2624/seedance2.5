import { describe, expect, test } from 'bun:test';

import { KieProvider } from './kie';

describe('KieProvider Seedance 2 references', () => {
  test('maps frame mode without mixing multimodal references', () => {
    const provider = new KieProvider({ apiKey: 'test-key' });
    const input = (
      provider as unknown as {
        formatVideoInput: (input: {
          model: string;
          prompt: string;
          options: Record<string, unknown>;
        }) => Record<string, unknown>;
      }
    ).formatVideoInput({
      model: 'bytedance/seedance-2',
      prompt: 'A small boat crossing a glassy lake at sunrise.',
      options: {
        sound: true,
        reference_first_frame: 'https://cdn.example.com/first.png',
        reference_last_frame: 'https://cdn.example.com/last.png',
        reference_images: ['https://cdn.example.com/reference.png'],
        reference_videos: ['https://cdn.example.com/reference.mov'],
        reference_audio: ['https://cdn.example.com/reference.wav'],
      },
    });

    expect(input).toEqual({
      prompt: 'A small boat crossing a glassy lake at sunrise.',
      generate_audio: true,
      first_frame_url: 'https://cdn.example.com/first.png',
      last_frame_url: 'https://cdn.example.com/last.png',
    });
  });

  test('maps multimodal references and the official audio flag', () => {
    const provider = new KieProvider({ apiKey: 'test-key' });
    const input = (
      provider as unknown as {
        formatVideoInput: (input: {
          model: string;
          prompt: string;
          options: Record<string, unknown>;
        }) => Record<string, unknown>;
      }
    ).formatVideoInput({
      model: 'bytedance/seedance-2',
      prompt: 'Match the rhythm and camera motion from the references.',
      options: {
        generate_audio: true,
        reference_images: ['https://cdn.example.com/reference.png'],
        reference_videos: ['https://cdn.example.com/reference.mov'],
        reference_audio: ['https://cdn.example.com/reference.wav'],
      },
    });

    expect(input).toEqual({
      prompt: 'Match the rhythm and camera motion from the references.',
      generate_audio: true,
      reference_image_urls: ['https://cdn.example.com/reference.png'],
      reference_video_urls: ['https://cdn.example.com/reference.mov'],
      reference_audio_urls: ['https://cdn.example.com/reference.wav'],
    });
  });
});
