import { describe, expect, test } from 'bun:test';

import {
  getTimelineEntryUrls,
  getTimelineMediaSlots,
} from './create-workspace-media';

describe('getTimelineEntryUrls', () => {
  test('prefers the stored task-info copy and ignores the provider result copy of the same image', () => {
    // `taskInfo.images` (the app's stored/re-hosted copy) and
    // `taskResult.resultJson.resultUrls` (the provider's original temp URL)
    // describe the SAME generated image under different URLs. Only the stored
    // copy should be returned, otherwise one image renders as two.
    const urls = getTimelineEntryUrls({
      mediaType: 'image',
      taskInfo: JSON.stringify({
        images: [{ imageUrl: '/stored/generated-a.png' }],
      }),
      taskResult: JSON.stringify({
        resultJson: JSON.stringify({
          resultUrls: ['https://example.com/generated-b.png'],
        }),
        param: JSON.stringify({
          input: JSON.stringify({
            image_urls: ['https://example.com/reference.png'],
          }),
        }),
      }),
    });

    expect(urls).toEqual(['/stored/generated-a.png']);
  });

  test('falls back to the provider result when nothing has been stored yet', () => {
    const urls = getTimelineEntryUrls({
      mediaType: 'image',
      taskInfo: null,
      taskResult: JSON.stringify({
        resultJson: JSON.stringify({
          resultUrls: ['https://example.com/generated-b.png'],
        }),
      }),
    });

    expect(urls).toEqual(['https://example.com/generated-b.png']);
  });

  test('keeps a failed task empty instead of duplicating another task result', () => {
    const slots = getTimelineMediaSlots({
      taskIds: ['failed-task', 'succeeded-task'],
      taskResults: {
        'failed-task': {
          status: 'failed',
          resultUrls: [],
          error: 'Provider rejected the request.',
        },
        'succeeded-task': {
          status: 'success',
          resultUrls: ['/stored/generated.png'],
        },
      },
      expectedResults: 2,
      resultUrls: ['/stored/generated.png'],
      status: 'partial_failed',
    });

    expect(slots).toEqual([
      {
        key: 'failed-task',
        status: 'failed',
        error: 'Provider rejected the request.',
      },
      {
        key: 'succeeded-task',
        url: '/stored/generated.png',
        status: 'success',
      },
    ]);
  });

  test('keeps an unfinished task as a pending slot', () => {
    const slots = getTimelineMediaSlots({
      taskIds: ['succeeded-task', 'pending-task'],
      taskResults: {
        'succeeded-task': {
          status: 'success',
          resultUrls: ['/stored/generated.png'],
        },
        'pending-task': {
          status: 'processing',
          resultUrls: [],
        },
      },
      expectedResults: 2,
      resultUrls: ['/stored/generated.png'],
      status: 'processing',
    });

    expect(slots).toEqual([
      {
        key: 'succeeded-task',
        url: '/stored/generated.png',
        status: 'success',
      },
      {
        key: 'pending-task',
        status: 'processing',
      },
    ]);
  });
});
