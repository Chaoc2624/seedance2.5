/**
 * Initialize an admin account for local/project setup.
 *
 * Creates an email/password user when the email does not exist, then assigns an
 * RBAC role. If the user already exists, the credential password and role are
 * updated.
 *
 * Usage:
 *   ADMIN_PASSWORD="plain-password" bunx tsx scripts/init-admin.ts --email=user@example.com --name=Admin --role=super_admin
 *   bunx tsx scripts/init-admin.ts --email=user@example.com --password=plain-password --role=super_admin
 */

import { hashPassword } from 'better-auth/crypto';
import { and, eq } from 'drizzle-orm';

import { db } from '@/core/db/index.server';

import { envConfigs } from '@/config';
import { getUuid } from '@/lib/hash';

type SchemaTables = {
  account: any;
  role: any;
  user: any;
  userRole: any;
};

function getArgValue(args: string[], name: string): string | undefined {
  const prefix = `--${name}=`;
  return args.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function loadSchemaTables(): Promise<SchemaTables> {
  if (envConfigs.database_provider === 'mysql') {
    return (await import('@/config/db/schema.mysql')) as any;
  }

  if (['sqlite', 'turso'].includes(envConfigs.database_provider)) {
    return (await import('@/config/db/schema.sqlite')) as any;
  }

  return (await import('@/config/db/schema')) as any;
}

async function findUserByEmail(schema: SchemaTables, email: string) {
  const [foundUser] = await db()
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, email));

  return foundUser;
}

async function createAdminUser(
  schema: SchemaTables,
  email: string,
  name: string,
  password: string
) {
  const id = getUuid();

  await db().insert(schema.user).values({
    id,
    name,
    email,
    emailVerified: true,
  });

  await ensureCredentialPassword(schema, id, password);

  const createdUser = await findUserByEmail(schema, email);
  if (!createdUser) {
    throw new Error('Admin user creation did not return a persisted user');
  }

  return {
    ...createdUser,
    emailVerified: true,
  };
}

async function markEmailVerified(schema: SchemaTables, userId: string) {
  await db()
    .update(schema.user)
    .set({ emailVerified: true })
    .where(eq(schema.user.id, userId));
}

async function ensureCredentialPassword(
  schema: SchemaTables,
  userId: string,
  password: string
) {
  const hashedPassword = await hashPassword(password);
  const [credentialAccount] = await db()
    .select()
    .from(schema.account)
    .where(
      and(
        eq(schema.account.userId, userId),
        eq(schema.account.providerId, 'credential')
      )
    );

  if (credentialAccount) {
    await db()
      .update(schema.account)
      .set({
        accountId: userId,
        password: hashedPassword,
      })
      .where(eq(schema.account.id, credentialAccount.id));
    return 'updated';
  }

  await db().insert(schema.account).values({
    id: getUuid(),
    accountId: userId,
    providerId: 'credential',
    userId,
    password: hashedPassword,
  });

  return 'created';
}

async function assignRoleToUser(
  schema: SchemaTables,
  userId: string,
  roleName: string
) {
  const [foundRole] = await db()
    .select()
    .from(schema.role)
    .where(eq(schema.role.name, roleName));

  if (!foundRole) {
    throw new Error(
      `Role not found: ${roleName}. Run bun run rbac:init first.`
    );
  }

  const [existingUserRole] = await db()
    .select()
    .from(schema.userRole)
    .where(
      and(
        eq(schema.userRole.userId, userId),
        eq(schema.userRole.roleId, foundRole.id)
      )
    );

  if (existingUserRole) {
    return { assigned: false, role: foundRole };
  }

  await db().insert(schema.userRole).values({
    id: getUuid(),
    userId,
    roleId: foundRole.id,
  });

  return { assigned: true, role: foundRole };
}

async function initAdmin() {
  const args = process.argv.slice(2);
  const email = getArgValue(args, 'email')?.trim().toLowerCase();
  const password = getArgValue(args, 'password') ?? process.env.ADMIN_PASSWORD;
  const roleName = getArgValue(args, 'role')?.trim() || 'super_admin';
  const providedName = getArgValue(args, 'name')?.trim();

  if (!email || !isValidEmail(email)) {
    console.error('Error: provide a valid --email=user@example.com');
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error(
      'Error: provide an admin password with at least 8 characters'
    );
    process.exit(1);
  }

  const name = providedName || email.split('@')[0] || 'Admin';
  const schema = await loadSchemaTables();

  let adminUser = await findUserByEmail(schema, email);
  let created = false;

  if (!adminUser) {
    console.log(`Creating admin user: ${email}`);
    adminUser = await createAdminUser(schema, email, name, password);
    created = true;
  } else {
    console.log(`Found existing user: ${adminUser.name} (${adminUser.email})`);
    const credentialStatus = await ensureCredentialPassword(
      schema,
      adminUser.id,
      password
    );
    await markEmailVerified(schema, adminUser.id);
    adminUser = {
      ...adminUser,
      emailVerified: true,
    };
    console.log(`Credential password ${credentialStatus}.`);
  }

  const roleResult = await assignRoleToUser(schema, adminUser.id, roleName);

  console.log('');
  console.log('Admin setup complete.');
  console.log(`  User: ${adminUser.name} (${adminUser.email})`);
  console.log(`  Created: ${created ? 'yes' : 'no'}`);
  console.log(`  Email verified: ${adminUser.emailVerified ? 'yes' : 'no'}`);
  console.log(
    `  Role: ${roleResult.role.name} (${roleResult.assigned ? 'assigned' : 'already assigned'})`
  );
}

initAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Admin setup failed:', error);
    process.exit(1);
  });
