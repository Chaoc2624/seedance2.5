import { getAdminUsersFn } from '../../src/server/user.functions';

async function testFn() {
  console.log('Testing getAdminUsersFn...');
  try {
    // we have to mock requirePermission since getAdminUsersFn calls it
    // Wait, let's just spy on it this way:
    const users = await getAdminUsersFn({ data: { role: 'admin' } });
    console.log(users.map(u => ({ id: u.id, credits: u.remainingCredits })));
  } catch (e) {
    console.log('Caught error:', (e as Error).message);
  }
}

testFn().catch(console.error);
