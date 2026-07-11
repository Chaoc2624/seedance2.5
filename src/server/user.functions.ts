import { createServerFn } from '@tanstack/react-start';

import {
  requirePermission,
  PERMISSIONS,
  canAccessAdmin,
} from '@/core/rbac/index.server';

import {
  getUserCredits,
  getUserInfo,
  isEmailVerified,
  getUsers,
  getUsersCount,
  updateUser,
  getSignUser,
} from '@/models/user.server';

type AdminUsersInput = {
  email?: string;
  keyword?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};

export const getUserInfoFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    const user = await getUserInfo();
    return user;
  }
);

export const getUserCreditsFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    const user = await getUserInfo();
    if (!user) throw new Error('not authenticated');
    const { grantDailyCreditsForUser } = await import('@/models/credit.server');
    await grantDailyCreditsForUser({ user });
    const credits = await getUserCredits(user.id);
    return credits;
  }
);

export const isEmailVerifiedFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    const email = String(data.email || '')
      .trim()
      .toLowerCase();
    if (!email) throw new Error('email is required');
    const emailVerified = await isEmailVerified(email);
    return { emailVerified };
  });

export const checkAdminAccessFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getSignUser();
    if (!user) return false;
    return await canAccessAdmin(user.id);
  }
);

export const getAdminBootstrapFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getSignUser();
    if (!user) return { user: null, isAdmin: false };

    const isAdmin = await canAccessAdmin(user.id);
    return { user, isAdmin };
  }
);

export const getAdminUsersFn = createServerFn({ method: 'GET' })
  .inputValidator((data: AdminUsersInput) => data)
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.USERS_READ });
    const users = await getUsers(data);
    const { getUserRolesByUserIds } = await import('@/services/rbac.server');
    const rolesByUserId = await getUserRolesByUserIds(users.map((u) => u.id));

    return users.map((u) => ({ ...u, roles: rolesByUserId.get(u.id) ?? [] }));
  });

export const getAdminUsersCountFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { email?: string; keyword?: string; role?: string }) => data
  )
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.USERS_READ });
    const count = await getUsersCount(data);
    return count;
  });

export const getAdminUsersPageDataFn = createServerFn({ method: 'GET' })
  .inputValidator((data: AdminUsersInput) => data)
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.USERS_READ });
    const { getRoles, getUserRolesByUserIds } =
      await import('@/services/rbac.server');
    const [total, users, roles] = await Promise.all([
      getUsersCount(data),
      getUsers(data),
      getRoles(),
    ]);
    const rolesByUserId = await getUserRolesByUserIds(users.map((u) => u.id));

    return {
      total,
      users: users.map((u) => ({
        ...u,
        roles: rolesByUserId.get(u.id) ?? [],
      })),
      roles,
    };
  });

export const updateUserFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { name?: string; image?: string }) => data)
  .handler(async ({ data }) => {
    const userInfo = await getUserInfo();
    if (!userInfo) throw new Error('not authenticated');

    const name = data.name;
    const image = data.image;

    const updatedUser: Record<string, any> = {};
    if (name) updatedUser.name = name.trim();
    if (image) updatedUser.image = image.trim();

    await updateUser(userInfo.id, updatedUser);

    return {
      status: 'success',
      message: 'Profile updated successfully',
      redirect_url: '/settings/profile',
    };
  });

export const changePasswordFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      password?: string;
      new_password?: string;
      confirm_password?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const userInfo = await getUserInfo();
    if (!userInfo) throw new Error('not authenticated');

    const password = data.password;
    const newPassword = data.new_password;
    const confirmPassword = data.confirm_password;

    if (!password || !newPassword || !confirmPassword) {
      throw new Error('All password fields are required');
    }

    if (newPassword !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const { getAuth } = await import('@/core/auth/index.server');
    const { getRequestHeaders } = await import('@tanstack/start-server-core');

    try {
      const auth = await getAuth();
      await auth.api.changePassword({
        body: {
          currentPassword: password,
          newPassword: newPassword,
          revokeOtherSessions: true,
        },
        headers: getRequestHeaders(),
      });

      return {
        status: 'success',
        message: 'Password changed successfully',
        redirect_url: '/settings/security',
      };
    } catch (err: any) {
      console.error('Change password failed', err);
      throw new Error(err.message || 'Failed to change password');
    }
  });

export const editAdminUserFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { id: string; name?: string; image?: string; locale?: string }) =>
      data
  )
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.USERS_WRITE });
    const { id, name, image, locale } = data;
    const updatedUser: Record<string, any> = {};
    if (name !== undefined) updatedUser.name = name.trim();
    if (image !== undefined) updatedUser.image = image.trim();
    if (locale !== undefined) updatedUser.locale = locale.trim() || null;
    await updateUser(id, updatedUser);
    return { status: 'success' };
  });

export const editUserRolesFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string; roles: string[] }) => data)
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.USERS_WRITE });
    const { assignRolesToUser } = await import('@/services/rbac.server');
    await assignRolesToUser(data.userId, data.roles);
    return { status: 'success' };
  });
