import {
  and,
  count,
  desc,
  asc,
  eq,
  inArray,
  like,
  or,
  gt,
  isNull,
} from 'drizzle-orm';

import { db } from '@/core/db/index.server';

import { subscription } from '@/config/db/schema';

import { appendUserToResult, User } from './user.server';

export type Subscription = typeof subscription.$inferSelect & {
  user?: User;
};
export type NewSubscription = typeof subscription.$inferInsert;
export type UpdateSubscription = Partial<
  Omit<NewSubscription, 'id' | 'subscriptionNo' | 'createdAt'>
>;

export enum SubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PENDING_CANCEL = 'pending_cancel',
  TRIALING = 'trialing',
  EXPIRED = 'expired',
  PAUSED = 'paused',
}

/**
 * create subscription
 */
export async function createSubscription(newSubscription: NewSubscription) {
  const [result] = await db()
    .insert(subscription)
    .values(newSubscription)
    .returning();
  return result;
}

/**
 * update subscription by subscription no
 */
export async function updateSubscriptionBySubscriptionNo(
  subscriptionNo: string,
  updateSubscription: UpdateSubscription
) {
  const [result] = await db()
    .update(subscription)
    .set(updateSubscription)
    .where(eq(subscription.subscriptionNo, subscriptionNo))
    .returning();

  return result;
}

export async function updateSubscriptionById(
  id: string,
  updateSubscription: UpdateSubscription
) {
  const [result] = await db()
    .update(subscription)
    .set(updateSubscription)
    .where(eq(subscription.id, id))
    .returning();
  return result;
}

/**
 * find subscription by id
 */
export async function findSubscriptionById(id: string) {
  const [result] = await db()
    .select()
    .from(subscription)
    .where(eq(subscription.id, id));

  return result;
}

/**
 * find subscription by subscription no
 */
export async function findSubscriptionBySubscriptionNo(subscriptionNo: string) {
  const [result] = await db()
    .select()
    .from(subscription)
    .where(eq(subscription.subscriptionNo, subscriptionNo));

  return result;
}

export async function findSubscriptionByProviderSubscriptionId({
  provider,
  subscriptionId,
}: {
  provider: string;
  subscriptionId: string;
}) {
  const [result] = await db()
    .select()
    .from(subscription)
    .where(
      and(
        eq(subscription.paymentProvider, provider),
        eq(subscription.subscriptionId, subscriptionId)
      )
    );

  return result;
}

/**
 * get subscriptions
 */
export async function getSubscriptions({
  userId,
  status,
  interval,
  keyword,
  sortBy,
  sortOrder,
  getUser,
  page = 1,
  limit = 30,
}: {
  userId?: string;
  status?: string;
  interval?: string;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  getUser?: boolean;
  page?: number;
  limit?: number;
}): Promise<Subscription[]> {
  let orderByClause: any = desc(subscription.createdAt);

  if (sortBy) {
    const orderFn = sortOrder === 'asc' ? asc : desc;
    if (sortBy === 'amount') orderByClause = orderFn(subscription.amount);
    else if (sortBy === 'createdAt')
      orderByClause = orderFn(subscription.createdAt);
  }

  const result = await db()
    .select()
    .from(subscription)
    .where(
      and(
        userId ? eq(subscription.userId, userId) : undefined,
        status ? eq(subscription.status, status) : undefined,
        interval ? eq(subscription.interval, interval) : undefined,
        keyword
          ? or(
              like(subscription.subscriptionNo, `%${keyword}%`),
              like(subscription.userEmail, `%${keyword}%`)
            )
          : undefined
      )
    )
    .orderBy(orderByClause)
    .limit(limit)
    .offset((page - 1) * limit);

  if (getUser) {
    return appendUserToResult(result);
  }

  return result;
}

/**
 * get current subscription
 */
export async function getCurrentSubscription(userId: string) {
  const now = new Date();
  const [result] = await db()
    .select()
    .from(subscription)
    .where(
      and(
        eq(subscription.userId, userId),
        inArray(subscription.status, [
          SubscriptionStatus.ACTIVE,
          SubscriptionStatus.PENDING_CANCEL,
          SubscriptionStatus.TRIALING,
        ]),
        or(
          isNull(subscription.currentPeriodEnd),
          gt(subscription.currentPeriodEnd, now)
        )
      )
    )
    .orderBy(desc(subscription.createdAt))
    .limit(1);

  return result;
}

export async function hasActiveSubscription({
  userId,
  planNames = [],
}: {
  userId: string;
  planNames?: string[];
}) {
  const now = new Date();
  const subscriptions: Subscription[] = await db()
    .select()
    .from(subscription)
    .where(
      and(
        eq(subscription.userId, userId),
        inArray(subscription.status, [
          SubscriptionStatus.ACTIVE,
          SubscriptionStatus.PENDING_CANCEL,
          SubscriptionStatus.TRIALING,
        ]),
        or(
          isNull(subscription.currentPeriodEnd),
          gt(subscription.currentPeriodEnd, now)
        )
      )
    )
    .orderBy(desc(subscription.createdAt))
    .limit(20);

  if (!subscriptions.length) {
    return false;
  }

  const allowedPlans = planNames
    .map((planName) => planName.trim().toLowerCase())
    .filter(Boolean);

  if (!allowedPlans.length) {
    return true;
  }

  return subscriptions.some((item: Subscription) => {
    const values = [item.planName, item.productId, item.productName]
      .map((value) =>
        String(value || '')
          .trim()
          .toLowerCase()
      )
      .filter(Boolean);

    return values.some((value) => allowedPlans.includes(value));
  });
}

/**
 * get subscriptions count
 */
export async function getSubscriptionsCount({
  userId,
  status,
  interval,
  keyword,
}: {
  userId?: string;
  status?: string;
  interval?: string;
  keyword?: string;
} = {}): Promise<number> {
  const [result] = await db()
    .select({ count: count() })
    .from(subscription)
    .where(
      and(
        userId ? eq(subscription.userId, userId) : undefined,
        status ? eq(subscription.status, status) : undefined,
        interval ? eq(subscription.interval, interval) : undefined,
        keyword
          ? or(
              like(subscription.subscriptionNo, `%${keyword}%`),
              like(subscription.userEmail, `%${keyword}%`)
            )
          : undefined
      )
    );

  return result?.count || 0;
}
