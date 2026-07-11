import { getRequestHeaders } from '@tanstack/start-server-core';
import {
  count,
  desc,
  asc,
  eq,
  inArray,
  like,
  or,
  and,
  exists,
  notExists,
} from 'drizzle-orm';

import { getAuth } from '@/core/auth/index.server';
import { db } from '@/core/db/index.server';

import { user, userRole } from '@/config/db/schema';

import { Permission, Role } from '../services/rbac.server';
import {
  getRemainingCredits,
  getSoonestExpiringCredits,
} from './credit.server';

export interface UserCredits {
  remainingCredits: number;
  soonestExpiringCredits: {
    expiresAt: Date;
    credits: number;
  } | null;
}

export type User = typeof user.$inferSelect & {
  isAdmin?: boolean;
  credits?: UserCredits;
  roles?: Role[];
  permissions?: Permission[];
};
export type NewUser = typeof user.$inferInsert;
export type UpdateUser = Partial<Omit<NewUser, 'id' | 'createdAt' | 'email'>>;

export async function updateUser(userId: string, updatedUser: UpdateUser) {
  const [result] = await db()
    .update(user)
    .set(updatedUser)
    .where(eq(user.id, userId))
    .returning();

  return result;
}

export async function findUserById(userId: string) {
  const [result] = await db().select().from(user).where(eq(user.id, userId));

  return result;
}

export async function getUsers({
  page = 1,
  limit = 30,
  email,
  keyword,
  role,
  sortBy,
  sortOrder,
}: {
  email?: string;
  keyword?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
} = {}): Promise<User[]> {
  let orderByClause: any = desc(user.createdAt);

  const adminSubquery = db()
    .select({ userId: userRole.userId })
    .from(userRole)
    .where(eq(userRole.userId, user.id));

  if (sortBy) {
    const orderFn = sortOrder === 'asc' ? asc : desc;
    if (sortBy === 'remainingCredits')
      orderByClause = orderFn(user.remainingCredits);
    else if (sortBy === 'totalCredits')
      orderByClause = orderFn(user.totalCredits);
    else if (sortBy === 'usedCredits')
      orderByClause = orderFn(user.usedCredits);
    else if (sortBy === 'createdAt') orderByClause = orderFn(user.createdAt);
    else if (sortBy === 'email') orderByClause = orderFn(user.email);
    else if (sortBy === 'name') orderByClause = orderFn(user.name);
  }

  const result = await db()
    .select()
    .from(user)
    .where(
      and(
        email ? eq(user.email, email) : undefined,
        keyword
          ? or(
              like(user.email, `%${keyword}%`),
              like(user.name, `%${keyword}%`)
            )
          : undefined,
        role === 'admin' ? exists(adminSubquery) : undefined,
        role === 'user' ? notExists(adminSubquery) : undefined
      )
    )
    .orderBy(orderByClause)
    .limit(limit)
    .offset((page - 1) * limit);

  return result;
}

export async function getUsersCount({
  email,
  keyword,
  role,
}: {
  email?: string;
  keyword?: string;
  role?: string;
}) {
  const adminSubquery = db()
    .select({ userId: userRole.userId })
    .from(userRole)
    .where(eq(userRole.userId, user.id));

  const [result] = await db()
    .select({ count: count() })
    .from(user)
    .where(
      and(
        email ? eq(user.email, email) : undefined,
        keyword
          ? or(
              like(user.email, `%${keyword}%`),
              like(user.name, `%${keyword}%`)
            )
          : undefined,
        role === 'admin' ? exists(adminSubquery) : undefined,
        role === 'user' ? notExists(adminSubquery) : undefined
      )
    );
  return result?.count || 0;
}

export async function getUserByUserIds(userIds: string[]) {
  const result = await db()
    .select()
    .from(user)
    .where(inArray(user.id, userIds));

  return result;
}

export async function getUserInfo() {
  const signUser = await getSignUser();

  return signUser;
}

export async function getUserCredits(userId: string) {
  const [remainingCredits, soonestExpiringCredits] = await Promise.all([
    getRemainingCredits(userId),
    getSoonestExpiringCredits(userId),
  ]);

  return { remainingCredits, soonestExpiringCredits };
}

export async function getSignUser() {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: getRequestHeaders(),
  });

  return session?.user;
}

export async function isEmailVerified(email: string): Promise<boolean> {
  const normalized = String(email || '')
    .trim()
    .toLowerCase();
  if (!normalized) return false;

  const [row] = await db()
    .select({ emailVerified: user.emailVerified })
    .from(user)
    .where(eq(user.email, normalized))
    .limit(1);

  return !!row?.emailVerified;
}

export async function appendUserToResult<T extends { userId?: string | null }>(
  result: T[]
) {
  if (!result || !result.length) {
    return result as (T & { user?: User })[];
  }

  const userIds = result
    .map((item) => item.userId)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  const users: User[] = await getUserByUserIds(Array.from(new Set(userIds)));
  const userById = new Map(users.map((user) => [user.id, user]));

  const finalResult = result.map((item) => {
    const user = item.userId ? userById.get(item.userId) : undefined;
    return { ...item, user };
  });

  return finalResult;
}
