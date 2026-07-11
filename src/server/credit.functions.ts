import { createServerFn } from '@tanstack/react-start';

import { PERMISSIONS, requirePermission } from '@/core/rbac/index.server';

import {
  getCredits,
  getCreditsCount,
  CreditStatus,
  type CreditTransactionType,
} from '@/models/credit.server';
import { getUserInfo } from '@/models/user.server';

export const getAdminCreditsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      page?: number;
      limit?: number;
      type?: string;
      keyword?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => data
  )
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.CREDITS_READ });
    const { page, limit, type, keyword, sortBy, sortOrder } = data;
    const credits = await getCredits({
      transactionType: type as CreditTransactionType,
      status: CreditStatus.ACTIVE,
      keyword,
      sortBy,
      sortOrder,
      getUser: true,
      page,
      limit,
    });
    return credits;
  });

export const getAdminCreditsCountFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { type?: string; keyword?: string }) => data)
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.CREDITS_READ });
    const count = await getCreditsCount({
      transactionType: data.type as CreditTransactionType,
      status: CreditStatus.ACTIVE,
      keyword: data.keyword,
    });
    return count;
  });

export const getAdminCreditsPageDataFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      page?: number;
      limit?: number;
      type?: string;
      keyword?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => data
  )
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.CREDITS_READ });
    const { page, limit, type, keyword, sortBy, sortOrder } = data;
    const filter = {
      transactionType: type as CreditTransactionType,
      status: CreditStatus.ACTIVE,
      keyword,
    };
    const [total, credits] = await Promise.all([
      getCreditsCount(filter),
      getCredits({
        ...filter,
        sortBy,
        sortOrder,
        getUser: true,
        page,
        limit,
      }),
    ]);

    return { total, credits };
  });

export const getUserCreditsPageDataFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { page?: number; limit?: number; type?: string }) => data
  )
  .handler(async ({ data }) => {
    const userInfo = await getUserInfo();
    if (!userInfo) throw new Error('not authenticated');

    const { page, limit, type } = data;
    const filter = {
      userId: userInfo.id,
      transactionType:
        type && type !== 'all' ? (type as CreditTransactionType) : undefined,
      status: CreditStatus.ACTIVE,
    };

    const [total, credits] = await Promise.all([
      getCreditsCount(filter),
      getCredits({ ...filter, page, limit }),
    ]);

    return { total, credits };
  });

export const grantCreditsFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      userId: string;
      credits: number;
      validDays?: number;
      description?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.CREDITS_WRITE });
    const { findUserById } = await import('@/models/user.server');
    const { grantCreditsForUser } = await import('@/models/credit.server');

    const user = await findUserById(data.userId);
    if (!user) throw new Error('User not found');

    await grantCreditsForUser({
      user,
      credits: data.credits,
      validDays: data.validDays,
      description: data.description,
    });
    return { status: 'success' };
  });
