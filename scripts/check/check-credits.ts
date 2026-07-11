import { db } from '../../src/core/db/index.server';
import { user } from '../../src/config/db/schema';

async function verify() {
  const users = await db().select().from(user);
  console.log('Users:');
  for (const u of users) {
    console.log(`- ${u.id} | Rem: ${u.remainingCredits} | Tot: ${u.totalCredits} | Use: ${u.usedCredits}`);
  }
  process.exit(0);
}

verify().catch(console.error);
