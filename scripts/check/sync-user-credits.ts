import { eq, sum, and, gt, isNull, or } from 'drizzle-orm';

import { user, credit } from '../../src/config/db/schema';
import { db } from '../../src/core/db/index.server';
import {
  CreditTransactionType,
  CreditStatus,
} from '../../src/models/credit.server';

async function syncUserCredits() {
  console.log('Starting user credits synchronization...');

  // Get all users
  const users = await db().select({ id: user.id }).from(user);
  console.log(`Found ${users.length} users to sync.`);

  for (const u of users) {
    const userId = u.id;

    // 1. Calculate total granted credits (historical)
    const [grantResult] = await db()
      .select({ total: sum(credit.credits) })
      .from(credit)
      .where(
        and(
          eq(credit.userId, userId),
          eq(credit.transactionType, CreditTransactionType.GRANT),
          eq(credit.status, CreditStatus.ACTIVE)
        )
      );
    const totalCredits = parseInt(grantResult?.total || '0');

    // 2. Calculate total consumed credits (stored as negative, so we sum and negate or sum(abs))
    const [consumeResult] = await db()
      .select({ total: sum(credit.credits) })
      .from(credit)
      .where(
        and(
          eq(credit.userId, userId),
          eq(credit.transactionType, CreditTransactionType.CONSUME),
          eq(credit.status, CreditStatus.ACTIVE)
        )
      );
    const usedRaw = parseInt(consumeResult?.total || '0');
    // consumed credits are negative integers, e.g., -5, so used = absolute sum
    const usedCredits = Math.abs(usedRaw);

    // 3. Calculate remaining valid credits
    const currentTime = new Date();
    const [remainingResult] = await db()
      .select({ total: sum(credit.remainingCredits) })
      .from(credit)
      .where(
        and(
          eq(credit.userId, userId),
          eq(credit.transactionType, CreditTransactionType.GRANT),
          eq(credit.status, CreditStatus.ACTIVE),
          gt(credit.remainingCredits, 0),
          or(isNull(credit.expiresAt), gt(credit.expiresAt, currentTime))
        )
      );
    const remainingCredits = parseInt(remainingResult?.total || '0');

    // 4. Update the user record
    await db()
      .update(user)
      .set({
        totalCredits,
        usedCredits,
        remainingCredits,
      })
      .where(eq(user.id, userId));

    console.log(
      `Synced user ${userId} => Total: ${totalCredits}, Used: ${usedCredits}, Remaining: ${remainingCredits}`
    );
  }

  console.log('Synchronization completed successfully.');
  process.exit(0);
}

syncUserCredits().catch((err) => {
  console.error('Error syncing credits:', err);
  process.exit(1);
});
