import { describe, expect, test } from 'bun:test';

import { getMembershipEntitlements, getMembershipTier } from './membership';

describe('membership entitlements', () => {
  test('keeps unauthenticated and unknown subscriptions at the safe tiers', () => {
    expect(getMembershipTier()).toBe('free');
    expect(getMembershipTier({ planName: 'Custom contract' })).toBe('starter');
    expect(getMembershipEntitlements()).toMatchObject({
      canUse4K: false,
      canUseVideo: false,
      maxConcurrentTasks: 1,
    });
  });

  test('maps current catalog plan names and product ids to their access tiers', () => {
    expect(getMembershipTier({ planName: 'Starter' })).toBe('starter');
    expect(getMembershipTier({ productId: 'pro-yearly' })).toBe('pro');
    expect(getMembershipTier({ productId: 'studio-monthly' })).toBe('ultra');
  });

  test('increases generation access only for the entitled tiers', () => {
    expect(getMembershipEntitlements({ planName: 'Pro' })).toMatchObject({
      canUse4K: true,
      canUseVideo: true,
      canUseMusic: true,
      maxBatchOutputs: 2,
      maxConcurrentTasks: 2,
    });
    expect(getMembershipEntitlements({ planName: 'Ultra' })).toMatchObject({
      maxBatchOutputs: 4,
      maxConcurrentTasks: 4,
    });
  });
});
