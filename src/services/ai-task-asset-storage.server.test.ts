import { describe, expect, test } from 'bun:test';

import { replaceUrlsInValue } from './ai-task-asset-storage.server';

describe('replaceUrlsInValue', () => {
  test('replaces provider URLs embedded in a nested JSON string', () => {
    const providerUrl = 'https://kie.example.com/result.png';
    const persistedUrl = 'https://assets.example.com/ai-results/result.png';
    const taskResult = {
      resultJson: JSON.stringify({ resultUrls: [providerUrl] }),
    };

    expect(
      replaceUrlsInValue(taskResult, new Map([[providerUrl, persistedUrl]]))
    ).toEqual({
      resultJson: JSON.stringify({ resultUrls: [persistedUrl] }),
    });
  });
});
