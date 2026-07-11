import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  isNull,
  or,
  sum,
  sql,
  like,
} from 'drizzle-orm';

import { db } from '@/core/db/index.server';

import {
  credit,
  creditGrantClaim,
  user as userSchema,
} from '@/config/db/schema';

import {
  parseDeviceFingerprint,
  sanitizeDeviceFingerprint,
} from '@/lib/device-fingerprint';
import { getSnowId, getUuid, md5 } from '@/lib/hash';
import {
  getClientCountryCode,
  getClientIp,
  getRequestDeviceFingerprint,
} from '@/lib/ip';

import { getAllConfigs } from './config.server';
import { appendUserToResult, User } from './user.server';

export type Credit = typeof credit.$inferSelect & {
  user?: User;
};
export type NewCredit = typeof credit.$inferInsert;
export type UpdateCredit = Partial<
  Omit<NewCredit, 'id' | 'transactionNo' | 'createdAt'>
>;
export type CreditGrantUser = {
  id: string;
  email?: string | null;
  ip?: string | null;
  deviceFingerprint?: string | null;
  remainingCredits?: number | null;
};

export enum CreditStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  DELETED = 'deleted',
}

export enum CreditTransactionType {
  GRANT = 'grant', // grant credit
  CONSUME = 'consume', // consume credit
}

export enum CreditTransactionScene {
  PAYMENT = 'payment', // payment
  SUBSCRIPTION = 'subscription', // subscription
  RENEWAL = 'renewal', // renewal
  GIFT = 'gift', // gift
  REWARD = 'reward', // reward
  DAILY = 'daily', // daily free credits
}

const DAILY_CREDIT_GRANT_TYPE = 'daily';
const MAX_CLAIM_KEY_LENGTH = 180;

export interface DailyCreditGrantResult {
  granted: boolean;
  reason?:
    | 'disabled'
    | 'invalid_amount'
    | 'blocked_country'
    | 'already_claimed';
  credit?: Credit;
}

// Calculate credit expiration time based on order and subscription info
export function calculateCreditExpirationTime({
  creditsValidDays,
  currentPeriodEnd,
}: {
  creditsValidDays: number;
  currentPeriodEnd?: Date;
}): Date | null {
  const now = new Date();

  // Check if credits should never expire
  if (!creditsValidDays || creditsValidDays <= 0) {
    // never expires
    return null;
  }

  const expiresAt = new Date();

  if (currentPeriodEnd) {
    // For subscription: credits expire at the end of current period
    expiresAt.setTime(currentPeriodEnd.getTime());
  } else {
    // For one-time payment: use configured validity days
    expiresAt.setDate(now.getDate() + creditsValidDays);
  }

  return expiresAt;
}

// Helper function to create expiration condition for queries
export function createExpirationCondition() {
  const currentTime = new Date();
  // Credit is valid if: expires_at IS NULL OR expires_at > current_time
  return or(isNull(credit.expiresAt), gt(credit.expiresAt, currentTime));
}

// create credit
export async function createCredit(newCredit: NewCredit) {
  const [result] = await db().insert(credit).values(newCredit).returning();
  return result;
}

export async function getCredits({
  userId,
  status,
  transactionType,
  keyword,
  sortBy,
  sortOrder,
  getUser = false,
  page = 1,
  limit = 30,
}: {
  userId?: string;
  status?: CreditStatus;
  transactionType?: CreditTransactionType;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  getUser?: boolean;
  page?: number;
  limit?: number;
}): Promise<Credit[]> {
  let orderByClause: any = desc(credit.createdAt);

  if (sortBy) {
    const orderFn = sortOrder === 'asc' ? asc : desc;
    if (sortBy === 'credits') orderByClause = orderFn(credit.credits);
    else if (sortBy === 'createdAt') orderByClause = orderFn(credit.createdAt);
  }

  const result = await db()
    .select()
    .from(credit)
    .where(
      and(
        userId ? eq(credit.userId, userId) : undefined,
        status ? eq(credit.status, status) : undefined,
        transactionType
          ? eq(credit.transactionType, transactionType)
          : undefined,
        keyword
          ? or(
              like(credit.transactionNo, `%${keyword}%`),
              like(credit.description, `%${keyword}%`)
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

export async function getCreditsCount({
  userId,
  status,
  transactionType,
  keyword,
}: {
  userId?: string;
  status?: CreditStatus;
  transactionType?: CreditTransactionType;
  keyword?: string;
}): Promise<number> {
  const [result] = await db()
    .select({ count: count() })
    .from(credit)
    .where(
      and(
        userId ? eq(credit.userId, userId) : undefined,
        status ? eq(credit.status, status) : undefined,
        transactionType
          ? eq(credit.transactionType, transactionType)
          : undefined,
        keyword
          ? or(
              like(credit.transactionNo, `%${keyword}%`),
              like(credit.description, `%${keyword}%`)
            )
          : undefined
      )
    );

  return result?.count || 0;
}

// consume credits
export async function consumeCredits({
  userId,
  credits,
  scene,
  description,
  metadata,
  tx,
}: {
  userId: string;
  credits: number; // credits to consume
  scene?: string;
  description?: string;
  metadata?: string;
  tx?: any;
}) {
  const currentTime = new Date();

  // consume credits
  const execute = async (tx: any) => {
    // 1. check credits balance
    const [creditsBalance] = await tx
      .select({
        total: sum(credit.remainingCredits),
      })
      .from(credit)
      .where(
        and(
          eq(credit.userId, userId),
          eq(credit.transactionType, CreditTransactionType.GRANT),
          eq(credit.status, CreditStatus.ACTIVE),
          gt(credit.remainingCredits, 0),
          or(
            isNull(credit.expiresAt), // Never expires
            gt(credit.expiresAt, currentTime) // Not yet expired
          )
        )
      );

    // balance is not enough
    if (
      !creditsBalance ||
      !creditsBalance.total ||
      parseInt(creditsBalance.total) < credits
    ) {
      throw new Error(
        `Insufficient credits, ${creditsBalance?.total || 0} < ${credits}`
      );
    }

    // 2. get available credits, FIFO queue with expiresAt, batch query
    let remainingToConsume = credits; // remaining credits to consume

    // only deal with 10000 credit grant records
    let batchNo = 1; // batch no
    const maxBatchNo = 10; // max batch no
    const batchSize = 1000; // batch size
    const consumedItems: any[] = [];

    while (remainingToConsume > 0) {
      // get batch credits
      const batchCredits = await tx
        .select()
        .from(credit)
        .where(
          and(
            eq(credit.userId, userId),
            eq(credit.transactionType, CreditTransactionType.GRANT),
            eq(credit.status, CreditStatus.ACTIVE),
            gt(credit.remainingCredits, 0),
            or(
              isNull(credit.expiresAt), // Never expires
              gt(credit.expiresAt, currentTime) // Not yet expired
            )
          )
        )
        .orderBy(
          // FIFO queue: expired credits first, then by expiration date
          // NULL values (never expires) will be ordered last
          asc(credit.expiresAt)
        )
        .limit(batchSize) // batch size
        .offset((batchNo - 1) * batchSize) // offset
        .for('update'); // lock for update

      // no more credits
      if (batchCredits?.length === 0) {
        break;
      }

      // consume credits for each item
      for (const item of batchCredits) {
        // no need to consume more
        if (remainingToConsume <= 0) {
          break;
        }
        const toConsume = Math.min(remainingToConsume, item.remainingCredits);

        // update remaining credits
        await tx
          .update(credit)
          .set({ remainingCredits: item.remainingCredits - toConsume })
          .where(eq(credit.id, item.id));

        // update consumed items
        consumedItems.push({
          creditId: item.id,
          transactionNo: item.transactionNo,
          expiresAt: item.expiresAt,
          creditsToConsume: remainingToConsume,
          creditsConsumed: toConsume,
          creditsBefore: item.remainingCredits,
          creditsAfter: item.remainingCredits - toConsume,
          batchSize: batchSize,
          batchNo: batchNo,
        });

        batchNo += 1;
        remainingToConsume -= toConsume;

        // if too many batches, throw error
        if (batchNo > maxBatchNo) {
          throw new Error(`Too many batches: ${batchNo} > ${maxBatchNo}`);
        }
      }
    }

    let metaObj: any = {};
    if (metadata) {
      try {
        metaObj = JSON.parse(metadata);
      } catch {}
    }
    metaObj.balanceAfter = parseInt(creditsBalance.total as string) - credits;

    const consumedCredit: NewCredit = {
      id: getUuid(),
      transactionNo: getSnowId(),
      transactionType: CreditTransactionType.CONSUME,
      transactionScene: scene,
      userId: userId,
      status: CreditStatus.ACTIVE,
      description: description,
      credits: -credits,
      consumedDetail: JSON.stringify(consumedItems),
      metadata: JSON.stringify(metaObj),
    };
    await tx.insert(credit).values(consumedCredit);

    // 4. update user's aggregated credit fields
    await tx
      .update(userSchema)
      .set({
        remainingCredits: sql`${userSchema.remainingCredits} - ${credits}`,
        usedCredits: sql`${userSchema.usedCredits} + ${credits}`,
      })
      .where(eq(userSchema.id, userId));

    return consumedCredit;
  };

  // use provided transaction
  if (tx) {
    return await execute(tx);
  }

  // use default transaction
  return await db().transaction(execute);
}

// get remaining credits
export async function getRemainingCredits(userId: string): Promise<number> {
  const currentTime = new Date();

  const [result] = await db()
    .select({
      total: sum(credit.remainingCredits),
    })
    .from(credit)
    .where(
      and(
        eq(credit.userId, userId),
        eq(credit.transactionType, CreditTransactionType.GRANT),
        eq(credit.status, CreditStatus.ACTIVE),
        gt(credit.remainingCredits, 0),
        or(
          isNull(credit.expiresAt), // Never expires
          gt(credit.expiresAt, currentTime) // Not yet expired
        )
      )
    );

  return parseInt(result?.total || '0');
}

export async function getSoonestExpiringCredits(userId: string) {
  const currentTime = new Date();

  const [result] = await db()
    .select({
      expiresAt: credit.expiresAt,
      credits: sum(credit.remainingCredits),
    })
    .from(credit)
    .where(
      and(
        eq(credit.userId, userId),
        eq(credit.transactionType, CreditTransactionType.GRANT),
        eq(credit.status, CreditStatus.ACTIVE),
        gt(credit.remainingCredits, 0),
        gt(credit.expiresAt, currentTime)
      )
    )
    .groupBy(credit.expiresAt)
    .orderBy(asc(credit.expiresAt))
    .limit(1);

  if (!result?.expiresAt) {
    return null;
  }

  return {
    expiresAt: result.expiresAt,
    credits: parseInt(result.credits || '0'),
  };
}

// grant credits for new user
export async function grantCreditsForNewUser(user: CreditGrantUser) {
  // get configs from db
  const configs = await getAllConfigs();

  // if initial credits enabled
  if (configs.initial_credits_enabled !== 'true') {
    return;
  }

  // get initial credits amount and valid days
  const credits = parseInt(configs.initial_credits_amount as string) || 0;
  if (credits <= 0) {
    return;
  }

  const creditsValidDays =
    parseInt(configs.initial_credits_valid_days as string) || 0;

  const description = configs.initial_credits_description || 'initial credits';

  const newCredit = await grantCreditsForUser({
    user: user,
    credits: credits,
    validDays: creditsValidDays,
    description: description,
  });

  return newCredit;
}

function getGrantDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function parseCsvSetting(value?: string) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeCountryCode(countryCode?: string) {
  return String(countryCode || '')
    .trim()
    .toUpperCase()
    .slice(0, 2);
}

function normalizeIpForClaim(ip?: string) {
  const normalized = String(ip || '')
    .trim()
    .toLowerCase();

  if (
    !normalized ||
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized === 'localhost' ||
    normalized === '0.0.0.0'
  ) {
    return '';
  }

  return normalized;
}

function normalizeClaimKey(key: string) {
  if (key.length <= MAX_CLAIM_KEY_LENGTH) {
    return key;
  }

  return `hash:${md5(key)}`;
}

function getDailyCreditClaimKeys({
  userId,
  ip,
  deviceFingerprint,
}: {
  userId: string;
  ip?: string;
  deviceFingerprint?: string;
}) {
  const keys = [`user:${userId}`];
  const parsedDeviceFingerprint = parseDeviceFingerprint(deviceFingerprint);

  if (parsedDeviceFingerprint.deviceId) {
    keys.push(`device:${parsedDeviceFingerprint.deviceId}`);
  }

  if (parsedDeviceFingerprint.sourceHash) {
    keys.push(`fingerprint:${parsedDeviceFingerprint.sourceHash}`);
  }

  const claimIp = normalizeIpForClaim(ip);
  if (claimIp) {
    keys.push(`ip:${claimIp}`);
  }

  return Array.from(new Set(keys.map(normalizeClaimKey)));
}

function isUniqueConstraintError(error: unknown) {
  const maybeError = error as any;
  const code = maybeError?.code || maybeError?.cause?.code;
  const message = String(maybeError?.message || maybeError || '').toLowerCase();

  return (
    code === '23505' ||
    code === 'SQLITE_CONSTRAINT' ||
    code === 'ER_DUP_ENTRY' ||
    message.includes('unique constraint') ||
    message.includes('duplicate key') ||
    message.includes('unique failed') ||
    message.includes('duplicate entry')
  );
}

function parseMetadata(metadata?: Record<string, unknown> | string) {
  if (!metadata) {
    return {};
  }

  if (typeof metadata !== 'string') {
    return { ...metadata };
  }

  try {
    const parsed = JSON.parse(metadata);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function grantDailyCreditsForUser({
  user,
  ip,
  countryCode,
  deviceFingerprint,
  now = new Date(),
}: {
  user: CreditGrantUser;
  ip?: string;
  countryCode?: string;
  deviceFingerprint?: string;
  now?: Date;
}): Promise<DailyCreditGrantResult> {
  const configs = await getAllConfigs();

  if (configs.daily_credits_enabled !== 'true') {
    return { granted: false, reason: 'disabled' };
  }

  const credits = parseInt(configs.daily_credits_amount as string) || 0;
  if (credits <= 0) {
    return { granted: false, reason: 'invalid_amount' };
  }

  const effectiveCountryCode = normalizeCountryCode(
    countryCode || (await getClientCountryCode())
  );
  const blockedCountries = parseCsvSetting(
    configs.daily_credits_blocked_countries || 'IN'
  ).map(normalizeCountryCode);

  if (effectiveCountryCode && blockedCountries.includes(effectiveCountryCode)) {
    return { granted: false, reason: 'blocked_country' };
  }

  const effectiveIp = ip || user.ip || (await getClientIp());
  const effectiveDeviceFingerprint = sanitizeDeviceFingerprint(
    deviceFingerprint ||
      user.deviceFingerprint ||
      (await getRequestDeviceFingerprint())
  );
  const claimDate = getGrantDateKey(now);
  const claimKeys = getDailyCreditClaimKeys({
    userId: user.id,
    ip: effectiveIp,
    deviceFingerprint: effectiveDeviceFingerprint,
  });

  const creditsValidDays =
    parseInt(configs.daily_credits_valid_days as string) || 0;
  const description = configs.daily_credits_description || 'daily free credits';

  try {
    const creditRecord = await db().transaction(async (tx: any) => {
      await tx.insert(creditGrantClaim).values(
        claimKeys.map((claimKey) => ({
          id: getUuid(),
          userId: user.id,
          grantType: DAILY_CREDIT_GRANT_TYPE,
          claimDate,
          claimKey,
          credits,
          metadata: JSON.stringify({
            ip: effectiveIp || '',
            countryCode: effectiveCountryCode || '',
            deviceFingerprint: effectiveDeviceFingerprint || '',
          }),
        }))
      );

      return await grantCreditsForUser({
        user,
        credits,
        validDays: creditsValidDays,
        description,
        scene: CreditTransactionScene.DAILY,
        metadata: {
          type: DAILY_CREDIT_GRANT_TYPE,
          claimDate,
          claimKeys,
          ip: effectiveIp || '',
          countryCode: effectiveCountryCode || '',
          deviceFingerprint: effectiveDeviceFingerprint || '',
        },
        tx,
      });
    });

    return { granted: true, credit: creditRecord as Credit };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { granted: false, reason: 'already_claimed' };
    }

    throw error;
  }
}

// grant credits for user
export async function grantCreditsForUser({
  user,
  credits,
  validDays,
  description,
  scene = CreditTransactionScene.GIFT,
  metadata,
  tx,
}: {
  user: CreditGrantUser;
  credits: number;
  validDays?: number;
  description?: string;
  scene?: CreditTransactionScene;
  metadata?: Record<string, unknown> | string;
  tx?: any;
}) {
  if (credits <= 0) {
    return;
  }

  const creditsValidDays = validDays && validDays > 0 ? validDays : 0;

  const expiresAt = calculateCreditExpirationTime({
    creditsValidDays: creditsValidDays,
  });

  const creditDescription = description || 'grant credits';
  const metadataObject = parseMetadata(metadata);
  metadataObject.balanceAfter = (user.remainingCredits || 0) + credits;

  const newCredit: NewCredit = {
    id: getUuid(),
    userId: user.id,
    userEmail: user.email,
    orderNo: '',
    subscriptionNo: '',
    transactionNo: getSnowId(),
    transactionType: CreditTransactionType.GRANT,
    transactionScene: scene,
    credits: credits,
    remainingCredits: credits,
    description: creditDescription,
    expiresAt: expiresAt,
    status: CreditStatus.ACTIVE,
    metadata: JSON.stringify(metadataObject),
  };

  const execute = async (tx: any) => {
    const [createdCredit] = await tx
      .insert(credit)
      .values(newCredit)
      .returning();

    // Update user's aggregated credit fields
    await tx
      .update(userSchema)
      .set({
        totalCredits: sql`${userSchema.totalCredits} + ${credits}`,
        remainingCredits: sql`${userSchema.remainingCredits} + ${credits}`,
      })
      .where(eq(userSchema.id, user.id));

    return createdCredit;
  };

  if (tx) {
    return await execute(tx);
  }

  return await db().transaction(execute);
}
