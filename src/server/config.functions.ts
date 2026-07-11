import { createServerFn } from '@tanstack/react-start';

import { PERMISSIONS, requirePermissions } from '@/core/rbac/index.server';

import { getRuntimeConfig } from '@/config/runtime.server';

import { getPublicConfigs, saveConfigs } from '@/models/config.server';
import {
  getAllSettingNames,
  getSettingGroupsByTab,
  getSettingsByTab,
} from '@/services/settings';

export const getConfigsFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    return getPublicConfigs();
  }
);

export const getAdminSettingsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { tab?: string }) => data)
  .handler(async ({ data }) => {
    await requirePermissions({
      codes: [PERMISSIONS.SETTINGS_READ, PERMISSIONS.SETTINGS_WRITE],
    });

    const activeTab = data.tab ?? 'auth';

    const [configs, settingGroups, settings] = await Promise.all([
      getRuntimeConfig(),
      Promise.resolve(getSettingGroupsByTab(activeTab)),
      getSettingsByTab(activeTab),
    ]);
    const settingNames = new Set(settings.map((setting) => setting.name));
    const tabConfigs = Object.fromEntries(
      Object.entries(configs).filter(([name]) => settingNames.has(name))
    );

    const sanitizeItem = (item: any): any => {
      const { icon: _icon, children, ...rest } = item;
      return {
        ...rest,
        ...(children ? { children: children.map(sanitizeItem) } : {}),
      };
    };

    return {
      configs: tabConfigs,
      settingGroups: settingGroups.map(sanitizeItem),
      settings,
    };
  });

export const saveAdminSettingsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: Record<string, string>) => data)
  .handler(async ({ data }) => {
    await requirePermissions({
      codes: [PERMISSIONS.SETTINGS_READ, PERMISSIONS.SETTINGS_WRITE],
    });

    const knownSettingNames = new Set(await getAllSettingNames());
    const payload: Record<string, string> = {};

    for (const [key, value] of Object.entries(data)) {
      if (!knownSettingNames.has(key)) {
        throw new Error(`Unknown setting: ${key}`);
      }
      payload[key] = String(value);
    }

    if (Object.keys(payload).length > 0) {
      await saveConfigs(payload);
    }

    return {
      status: 'success',
      message: 'Settings updated',
    };
  });
