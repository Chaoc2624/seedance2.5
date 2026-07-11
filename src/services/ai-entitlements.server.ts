import { AIMediaType } from '@/extensions/ai';

import {
  getMembershipEntitlements,
  type MembershipEntitlements,
} from '@/lib/membership';
import { getActiveAITasksCount } from '@/models/ai_task.server';
import { getCurrentSubscription } from '@/models/subscription.server';

export async function getAIEntitlementsForUser(
  userId: string
): Promise<MembershipEntitlements> {
  const subscription = await getCurrentSubscription(userId);
  return getMembershipEntitlements(subscription);
}

export async function assertAIRequestAccess({
  userId,
  mediaType,
  is4K,
}: {
  userId: string;
  mediaType: string;
  is4K: boolean;
}) {
  const entitlements = await getAIEntitlementsForUser(userId);

  if (mediaType === AIMediaType.VIDEO && !entitlements.canUseVideo) {
    throw new Error('Video generation is available for Pro and Ultra members');
  }

  if (mediaType === AIMediaType.MUSIC && !entitlements.canUseMusic) {
    throw new Error('Music generation is available for Pro and Ultra members');
  }

  if (is4K && !entitlements.canUse4K) {
    throw new Error(
      '4K image generation is available for Pro and Ultra members'
    );
  }

  const activeTasks = await getActiveAITasksCount(userId);
  if (activeTasks >= entitlements.maxConcurrentTasks) {
    throw new Error(
      `Your ${entitlements.label} plan supports ${entitlements.maxConcurrentTasks} active generation${entitlements.maxConcurrentTasks === 1 ? '' : 's'} at a time`
    );
  }

  return entitlements;
}
