import { redirect } from '@tanstack/react-router';

import { localePath } from '@/core/i18n/navigation';

// ─── Permission registry (module-based) ──────────────────────────

/** Core permissions — always registered */
const corePermissions = {
  ADMIN_ACCESS: 'admin.access',
  USERS_READ: 'admin.users.read',
  USERS_WRITE: 'admin.users.write',
  USERS_DELETE: 'admin.users.delete',
  SETTINGS_READ: 'admin.settings.read',
  SETTINGS_WRITE: 'admin.settings.write',
} as const;

/** Blog module permissions */
const blogPermissions = {
  POSTS_READ: 'admin.posts.read',
  POSTS_WRITE: 'admin.posts.write',
  POSTS_DELETE: 'admin.posts.delete',
  CATEGORIES_READ: 'admin.categories.read',
  CATEGORIES_WRITE: 'admin.categories.write',
  CATEGORIES_DELETE: 'admin.categories.delete',
} as const;

/** Payment module permissions */
const paymentPermissions = {
  PAYMENTS_READ: 'admin.payments.read',
  SUBSCRIPTIONS_READ: 'admin.subscriptions.read',
  CREDITS_READ: 'admin.credits.read',
  CREDITS_WRITE: 'admin.credits.write',
} as const;

/** RBAC module permissions */
const rbacPermissions = {
  ROLES_READ: 'admin.roles.read',
  ROLES_WRITE: 'admin.roles.write',
  ROLES_DELETE: 'admin.roles.delete',
  PERMISSIONS_READ: 'admin.permissions.read',
  PERMISSIONS_WRITE: 'admin.permissions.write',
  PERMISSIONS_DELETE: 'admin.permissions.delete',
} as const;

/** AI module permissions */
const aiPermissions = {
  AITASKS_READ: 'admin.ai-tasks.read',
  AITASKS_WRITE: 'admin.ai-tasks.write',
  AITASKS_DELETE: 'admin.ai-tasks.delete',
} as const;

/** API Keys permissions */
const apiKeyPermissions = {
  APIKEYS_READ: 'admin.apikeys.read',
  APIKEYS_WRITE: 'admin.apikeys.write',
  APIKEYS_DELETE: 'admin.apikeys.delete',
} as const;

/**
 * Full permission type — all possible permissions across all modules.
 */
type AllPermissions = typeof corePermissions &
  typeof blogPermissions &
  typeof paymentPermissions &
  typeof rbacPermissions &
  typeof aiPermissions &
  typeof apiKeyPermissions;

/**
 * Assembled PERMISSIONS object — includes all permission codes.
 * At runtime, disabled module routes are guarded by preset.ts beforeLoad,
 * so these permission codes are safe to reference even if the module is off.
 */
export const PERMISSIONS: AllPermissions = {
  ...corePermissions,
  ...blogPermissions,
  ...paymentPermissions,
  ...rbacPermissions,
  ...aiPermissions,
  ...apiKeyPermissions,
};

/**
 * Permission guard error
 */
export class PermissionDeniedError extends Error {
  constructor(message = 'Permission denied') {
    super(message);
    this.name = 'PermissionDeniedError';
  }
}

/**
 * Check if user can access admin area
 */
export async function canAccessAdmin(userId: string): Promise<boolean> {
  const { hasPermission } = await import('@/services/rbac.server');
  return await hasPermission(userId, PERMISSIONS.ADMIN_ACCESS);
}

/**
 * Check if current user has permission, throw error if not
 */
export async function requirePermission({
  code,
  redirectUrl,
  locale,
}: {
  code: string;
  redirectUrl?: string;
  locale?: string;
}): Promise<void> {
  const { getSignUser } = await import('@/models/user.server');
  const { hasPermission } = await import('@/services/rbac.server');
  const user = await getSignUser();

  if (!user) {
    if (redirectUrl) {
      redirect({ to: localePath(redirectUrl, locale) as any });
    }
    throw new PermissionDeniedError('User not authenticated');
  }

  const allowed = await hasPermission(user.id, code);

  if (!allowed) {
    if (redirectUrl) {
      redirect({ to: localePath(redirectUrl, locale) as any });
    }
    throw new PermissionDeniedError(`Permission required: ${code}`);
  }
}

export async function requirePermissions({
  codes,
  redirectUrl,
  locale,
}: {
  codes: string[];
  redirectUrl?: string;
  locale?: string;
}): Promise<void> {
  const { getSignUser } = await import('@/models/user.server');
  const { hasPermission } = await import('@/services/rbac.server');
  const user = await getSignUser();

  if (!user) {
    if (redirectUrl) {
      redirect({ to: localePath(redirectUrl, locale) as any });
    }
    throw new PermissionDeniedError('User not authenticated');
  }

  for (const code of codes) {
    const allowed = await hasPermission(user.id, code);
    if (!allowed) {
      if (redirectUrl) {
        redirect({ to: localePath(redirectUrl, locale) as any });
      }
      throw new PermissionDeniedError(`Permission required: ${code}`);
    }
  }
}

/**
 * Check if current user has any of the permissions, throw error if not
 */
export async function requireAnyPermission({
  codes,
  redirectUrl,
  locale,
}: {
  codes: string[];
  redirectUrl?: string;
  locale?: string;
}): Promise<void> {
  const { getSignUser } = await import('@/models/user.server');
  const { hasAnyPermission } = await import('@/services/rbac.server');
  const user = await getSignUser();

  if (!user) {
    if (redirectUrl) {
      redirect({ to: localePath(redirectUrl, locale) as any });
    }
    throw new PermissionDeniedError('User not authenticated');
  }

  const allowed = await hasAnyPermission(user.id, codes);

  if (!allowed) {
    if (redirectUrl) {
      redirect({ to: localePath(redirectUrl, locale) as any });
    }
    throw new PermissionDeniedError(
      `Any of these permissions required: ${codes.join(', ')}`
    );
  }
}

/**
 * Check if current user has all of the permissions, throw error if not
 */
export async function requireAllPermissions({
  codes,
  redirectUrl,
  locale,
}: {
  codes: string[];
  redirectUrl?: string;
  locale?: string;
}): Promise<void> {
  const { getSignUser } = await import('@/models/user.server');
  const { hasAllPermissions } = await import('@/services/rbac.server');
  const user = await getSignUser();

  if (!user) {
    if (redirectUrl) {
      redirect({ to: localePath(redirectUrl, locale) as any });
    }
    throw new PermissionDeniedError('User not authenticated');
  }

  const allowed = await hasAllPermissions(user.id, codes);

  if (!allowed) {
    if (redirectUrl) {
      redirect({ to: localePath(redirectUrl, locale) as any });
    }
    throw new PermissionDeniedError(
      `All of these permissions required: ${codes.join(', ')}`
    );
  }
}

/**
 * Check if current user has role, throw error if not
 */
export async function requireRole({
  roleName,
  redirectUrl,
  locale,
}: {
  roleName: string;
  redirectUrl?: string;
  locale?: string;
}): Promise<void> {
  const { getSignUser } = await import('@/models/user.server');
  const { hasRole } = await import('@/services/rbac.server');
  const user = await getSignUser();

  if (!user) {
    if (redirectUrl) {
      redirect({ to: localePath(redirectUrl, locale) as any });
    }
    throw new PermissionDeniedError('User not authenticated');
  }

  const allowed = await hasRole(user.id, roleName);

  if (!allowed) {
    if (redirectUrl) {
      redirect({ to: localePath(redirectUrl, locale) as any });
    }
    throw new PermissionDeniedError(`Role required: ${roleName}`);
  }
}

/**
 * Check if current user has any of the roles, throw error if not
 */
export async function requireAnyRole({
  roleNames,
  redirectUrl,
  locale,
}: {
  roleNames: string[];
  redirectUrl?: string;
  locale?: string;
}): Promise<void> {
  const { getSignUser } = await import('@/models/user.server');
  const { hasAnyRole } = await import('@/services/rbac.server');
  const user = await getSignUser();

  if (!user) {
    if (redirectUrl) {
      redirect({ to: localePath(redirectUrl, locale) as any });
    }
    throw new PermissionDeniedError('User not authenticated');
  }

  const allowed = await hasAnyRole(user.id, roleNames);

  if (!allowed) {
    if (redirectUrl) {
      redirect({ to: localePath(redirectUrl, locale) as any });
    }
    throw new PermissionDeniedError(
      `Any of these roles required: ${roleNames.join(', ')}`
    );
  }
}

/**
 * Check if current user can access admin area
 */
export async function requireAdminAccess({
  redirectUrl,
  locale,
}: {
  redirectUrl?: string;
  locale?: string;
}): Promise<void> {
  const { getSignUser } = await import('@/models/user.server');
  const user = await getSignUser();

  if (!user) {
    redirect({ to: localePath('/sign-in', locale) as any });
  }

  const allowed = await canAccessAdmin(user!.id);

  if (!allowed) {
    redirect({ to: localePath(redirectUrl || '', locale) as any });
  }
}

/**
 * Get current user with permission check
 * Returns null if user doesn't have permission
 */
export async function getCurrentUserWithPermission({
  code,
  locale: _locale,
}: {
  code: string;
  locale?: string;
}): Promise<{ id: string; email: string; name: string } | null> {
  const { getSignUser } = await import('@/models/user.server');
  const { hasPermission } = await import('@/services/rbac.server');
  const user = await getSignUser();
  if (!user) return null;

  const allowed = await hasPermission(user.id, code);
  if (!allowed) return null;

  return user;
}

/**
 * Check page access permissions
 * Returns true if user has access, false otherwise
 */
export async function checkPageAccess({
  codes,
  locale: _locale,
}: {
  codes: string[];
  locale?: string;
}): Promise<boolean> {
  const { getSignUser } = await import('@/models/user.server');
  const { hasAnyPermission } = await import('@/services/rbac.server');
  const user = await getSignUser();
  if (!user) return false;

  return await hasAnyPermission(user.id, codes);
}

/**
 * Higher-order function for API routes with permission check
 */
export function withPermission<T extends (...args: any[]) => any>(
  handler: T,
  {
    code,
    locale,
  }: {
    code: string;
    locale?: string;
  }
): T {
  return (async (...args: Parameters<T>) => {
    await requirePermission({ code, locale });
    return handler(...args);
  }) as T;
}

/**
 * Higher-order function for API routes with role check
 */
export function withRole<T extends (...args: any[]) => any>(
  handler: T,
  {
    roleName,
    locale,
  }: {
    roleName: string;
    locale?: string;
  }
): T {
  return (async (...args: Parameters<T>) => {
    await requireRole({ roleName, locale });
    return handler(...args);
  }) as T;
}
