/**
 * i18n hooks for translation access.
 *
 * Usage:
 *   import { useTranslations, useLocale } from '@/core/i18n/hooks';
 *
 *   const t = useTranslations('common');
 *   t('sign.sign_in_title')        // string
 *   t.raw('sign')                   // raw object
 */
import { useParams } from '@tanstack/react-router';

import { defaultLocale } from '@/config/locale';

import i18n from './index';

/**
 * Hook to access translations for a given namespace.
 *
 * Returns a translator function `t(key, params?)` with a `.raw(key)` method
 * for accessing raw object/array values.
 */
export function useTranslations(namespace?: string) {
  // Use route params to get locale explicitly — avoids SSR hydration mismatch
  // caused by react-i18next's async changeLanguage not completing before render.
  const params = useParams({ strict: false }) as Record<string, string>;
  const locale = params?.locale || defaultLocale;
  const fixedT = i18n.getFixedT(locale);

  const translate = (key: string, interpolation?: Record<string, unknown>) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return fixedT(fullKey, interpolation as any) as string;
  };

  // Attach .raw() method — returns the raw object without interpolation
  translate.raw = (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return fixedT(fullKey, { returnObjects: true });
  };

  return translate;
}

/**
 * Hook to get the current locale from route params.
 */
export function useLocale(): string {
  const params = useParams({ strict: false }) as Record<string, string>;
  return params?.locale || defaultLocale;
}

/**
 * Server-side / non-hook translation getter (for loaders, etc.).
 * Non-hook translation getter (for loaders, server functions, etc.).
 */
export function getTranslations(namespace?: string) {
  const t = (key: string, params?: Record<string, unknown>) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return i18n.t(fullKey, params as any) as string;
  };

  t.raw = (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return i18n.t(fullKey, { returnObjects: true });
  };

  return t;
}
