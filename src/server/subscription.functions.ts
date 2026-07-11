import { createServerFn } from '@tanstack/react-start';

import { PERMISSIONS, requirePermission } from '@/core/rbac/index.server';

import {
  getSubscriptions,
  getSubscriptionsCount,
  getCurrentSubscription,
} from '@/models/subscription.server';
import { getUserInfo } from '@/models/user.server';

export const getAdminSubscriptionsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      page?: number;
      limit?: number;
      interval?: string;
      keyword?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => data
  )
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.SUBSCRIPTIONS_READ });
    const { page, limit, interval, keyword, sortBy, sortOrder } = data;
    const subscriptions = await getSubscriptions({
      interval,
      keyword,
      sortBy,
      sortOrder,
      getUser: true,
      page,
      limit,
    });
    return subscriptions;
  });

export const getAdminSubscriptionsCountFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { interval?: string; keyword?: string }) => data)
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.SUBSCRIPTIONS_READ });
    const { interval, keyword } = data;
    const count = await getSubscriptionsCount({
      interval,
      keyword,
    });
    return count;
  });

export const getAdminSubscriptionsPageDataFn = createServerFn({
  method: 'GET',
})
  .inputValidator(
    (data: {
      page?: number;
      limit?: number;
      interval?: string;
      keyword?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => data
  )
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.SUBSCRIPTIONS_READ });
    const { page, limit, interval, keyword, sortBy, sortOrder } = data;
    const filter = { interval, keyword };
    const [total, subscriptions] = await Promise.all([
      getSubscriptionsCount(filter),
      getSubscriptions({
        ...filter,
        sortBy,
        sortOrder,
        getUser: true,
        page,
        limit,
      }),
    ]);

    return { total, subscriptions };
  });

export const getUserSubscriptionsPageDataFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { page?: number; limit?: number; status?: string }) => data
  )
  .handler(async ({ data }) => {
    const userInfo = await getUserInfo();
    if (!userInfo) throw new Error('not authenticated');

    const { page, limit, status } = data;
    const filter = {
      userId: userInfo.id,
      status: status && status !== 'all' ? status : undefined,
    };

    const [total, subscriptions] = await Promise.all([
      getSubscriptionsCount(filter),
      getSubscriptions({ ...filter, page, limit }),
    ]);

    return { total, subscriptions };
  });

export const getCurrentSubscriptionFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const userInfo = await getUserInfo();
  if (!userInfo) return null;

  const subscription = await getCurrentSubscription(userInfo.id);
  return subscription;
});
