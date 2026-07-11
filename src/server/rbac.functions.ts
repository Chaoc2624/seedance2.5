import { createServerFn } from '@tanstack/react-start';

import {
  PERMISSIONS,
  requirePermission,
  requirePermissions,
} from '@/core/rbac/index.server';

import { getPermissions } from '@/services/rbac.server';

export const getAdminRolesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requirePermission({ code: PERMISSIONS.ROLES_READ });
    const { getRoles, getRolePermissionsByRoleIds } =
      await import('@/services/rbac.server');
    const roles = await getRoles();
    const permissionsByRoleId = await getRolePermissionsByRoleIds(
      roles.map((r) => r.id)
    );

    return roles.map((r) => ({
      ...r,
      permissions: permissionsByRoleId.get(r.id) ?? [],
    }));
  }
);

export const getAdminPermissionsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requirePermission({ code: PERMISSIONS.PERMISSIONS_READ });
    const permissions = await getPermissions();
    return permissions;
  }
);

export const getAdminPermissionsPageDataFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  await requirePermission({ code: PERMISSIONS.PERMISSIONS_READ });
  const permissions = await getPermissions();
  return { permissions };
});

export const getAdminRolesPageDataFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  await requirePermissions({
    codes: [PERMISSIONS.ROLES_READ, PERMISSIONS.PERMISSIONS_READ],
  });
  const { getRoles, getRolePermissionsByRoleIds, getPermissions } =
    await import('@/services/rbac.server');
  const [roles, permissions] = await Promise.all([
    getRoles(),
    getPermissions(),
  ]);
  const permissionsByRoleId = await getRolePermissionsByRoleIds(
    roles.map((r) => r.id)
  );

  return {
    roles: roles.map((r) => ({
      ...r,
      permissions: permissionsByRoleId.get(r.id) ?? [],
    })),
    permissions,
  };
});

export const editRoleFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      id: string;
      name?: string;
      title?: string;
      description?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.ROLES_WRITE });
    const { updateRole } = await import('@/services/rbac.server');
    const { id, name, title, description } = data;

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;

    await updateRole(id, updates);
    return { status: 'success' };
  });

export const editRolePermissionsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { roleId: string; permissions: string[] }) => data)
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.ROLES_WRITE });
    const { assignPermissionsToRole } = await import('@/services/rbac.server');
    await assignPermissionsToRole(data.roleId, data.permissions);
    return { status: 'success' };
  });
