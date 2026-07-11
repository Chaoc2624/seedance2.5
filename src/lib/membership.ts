export type MembershipTier = 'free' | 'starter' | 'pro' | 'ultra';

export type MembershipSubscription = {
  planName?: string | null;
  productId?: string | null;
  productName?: string | null;
};

export type MembershipEntitlements = {
  tier: MembershipTier;
  label: string;
  canUse4K: boolean;
  canUseVideo: boolean;
  canUseMusic: boolean;
  maxBatchOutputs: number;
  maxConcurrentTasks: number;
};

const MEMBERSHIP_ENTITLEMENTS: Record<MembershipTier, MembershipEntitlements> =
  {
    free: {
      tier: 'free',
      label: 'Free',
      canUse4K: false,
      canUseVideo: false,
      canUseMusic: false,
      maxBatchOutputs: 1,
      maxConcurrentTasks: 1,
    },
    starter: {
      tier: 'starter',
      label: 'Starter',
      canUse4K: false,
      canUseVideo: false,
      canUseMusic: false,
      maxBatchOutputs: 1,
      maxConcurrentTasks: 1,
    },
    pro: {
      tier: 'pro',
      label: 'Pro',
      canUse4K: true,
      canUseVideo: true,
      canUseMusic: true,
      maxBatchOutputs: 2,
      maxConcurrentTasks: 2,
    },
    ultra: {
      tier: 'ultra',
      label: 'Ultra',
      canUse4K: true,
      canUseVideo: true,
      canUseMusic: true,
      maxBatchOutputs: 4,
      maxConcurrentTasks: 4,
    },
  };

function getSubscriptionSearchText(
  subscription?: MembershipSubscription | null
) {
  return [
    subscription?.planName,
    subscription?.productId,
    subscription?.productName,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function getMembershipTier(
  subscription?: MembershipSubscription | null
): MembershipTier {
  const value = getSubscriptionSearchText(subscription);

  if (value.includes('ultra') || value.includes('studio')) return 'ultra';
  if (value.includes('pro')) return 'pro';
  if (value.includes('starter')) return 'starter';

  return subscription ? 'starter' : 'free';
}

export function getMembershipEntitlements(
  subscription?: MembershipSubscription | null
): MembershipEntitlements {
  return MEMBERSHIP_ENTITLEMENTS[getMembershipTier(subscription)];
}
