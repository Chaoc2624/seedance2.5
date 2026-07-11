import { useCallback, useState } from 'react';

import { useRouter } from '@/core/i18n/navigation';

import type { UpgradePaywallReason } from './upgrade-paywall-dialog';

export function useUpgradePaywall() {
  const [upgradeReason, setUpgradeReason] =
    useState<UpgradePaywallReason | null>(null);
  const { push } = useRouter();

  const requestUpgrade = useCallback(
    async (reason: UpgradePaywallReason) => {
      try {
        const { getAIEntitlementsFn } = await import('@/server/ai.functions');
        const entitlements = await getAIEntitlementsFn();

        if (entitlements.tier === 'free') {
          push('/pricing');
          return;
        }

        setUpgradeReason(reason);
      } catch (error) {
        console.error('Failed to resolve upgrade destination:', error);
        push('/pricing');
      }
    },
    [push]
  );

  return {
    closeUpgradePaywall: () => setUpgradeReason(null),
    requestUpgrade,
    upgradeReason,
  };
}
