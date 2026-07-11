import { getUsers } from '../../src/models/user.server';

async function testUsers() {
  console.log('Testing getUsers directly...');
  const users = await getUsers({ role: 'admin' });
  console.log(
    'Direct users:',
    users.map((u) => ({ id: u.id, rem: u.remainingCredits }))
  );

  // mock user info function so we don't hit permission error
  // Wait, I can't easily mock requirePermission in a standalone script.
  // I will just test `getUsers` with all parameters.

  const allUsers = await getUsers({});
  const myUser = allUsers.find(
    (u) => u.id === '24dff758-22f4-4825-9588-d63ef5bb5040'
  );
  console.log('My user directly from getUsers:', myUser);

  process.exit(0);
}

testUsers().catch(console.error);
