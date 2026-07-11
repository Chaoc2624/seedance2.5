import { db } from '../../src/core/db/index.server';
import { userRole, role } from '../../src/config/db/schema';
import { eq } from 'drizzle-orm';

async function checkUserRole() {
  console.log('Checking roles for user "24dff758-22f4-4825-9588-d63ef5bb5040"...');
  const userRoles = await db()
    .select({
      roleName: role.name,
      roleTitle: role.title
    })
    .from(userRole)
    .innerJoin(role, eq(userRole.roleId, role.id))
    .where(eq(userRole.userId, '24dff758-22f4-4825-9588-d63ef5bb5040'));
    
  console.log('Roles found:', userRoles);
  process.exit(0);
}

checkUserRole().catch(console.error);
