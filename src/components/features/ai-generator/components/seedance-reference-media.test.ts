import { describe, expect, test } from 'bun:test';

import {
  getSeedanceReferenceVideoDimensionError,
  hasValidSeedanceVideoDimensions,
} from './seedance-reference-media';

describe('Seedance reference video limits', () => {
  test('accepts provider-supported 480p and 720p reference sizes', () => {
    expect(hasValidSeedanceVideoDimensions({ width: 854, height: 480 })).toBe(
      true
    );
    expect(hasValidSeedanceVideoDimensions({ width: 1280, height: 720 })).toBe(
      true
    );
  });

  test('rejects 1080p reference videos before upload', () => {
    expect(hasValidSeedanceVideoDimensions({ width: 1920, height: 1080 })).toBe(
      false
    );
    expect(getSeedanceReferenceVideoDimensionError()).toContain('1080p');
  });
});
