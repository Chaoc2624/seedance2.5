import {
  createFileRoute,
  Outlet,
  notFound,
  redirect,
} from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { changeLanguage } from '@/core/i18n';

import { adminLocales, defaultLocale, locales } from '@/config/locale';

function isAdminLocalePath(locale: string, pathname: string): boolean {
  const prefix = `/${locale}/shiponce`;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export const Route = createFileRoute('/{-$locale}')({
  // Validate that the locale parameter is a supported locale
  params: {
    parse: (params) => {
      // locale is optional — undefined means default locale
      if (
        params.locale &&
        !locales.includes(params.locale) &&
        !adminLocales.includes(params.locale)
      ) {
        throw notFound();
      }
      return params;
    },
  },
  // Sync i18next language before rendering
  beforeLoad: async ({ params, location }) => {
    if (
      params.locale &&
      adminLocales.includes(params.locale) &&
      !locales.includes(params.locale) &&
      !isAdminLocalePath(params.locale, location.pathname)
    ) {
      const targetPath =
        params.locale === 'zh'
          ? location.pathname.replace(/^\/zh(?=\/|$)/, '/zh-hant')
          : '/';
      throw redirect({ to: targetPath as any, replace: true });
    }

    const locale = params.locale || defaultLocale;
    await changeLanguage(locale);
  },
  component: LocaleLayout,
});

function LocaleLayout() {
  const { locale } = Route.useParams();
  const currentLocale = locale || defaultLocale;
  const { i18n } = useTranslation();

  // Keep i18next in sync when locale param changes
  useEffect(() => {
    if (i18n.language !== currentLocale) {
      i18n.changeLanguage(currentLocale);
    }
    // Update html lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLocale;
    }
  }, [currentLocale, i18n]);

  return <Outlet />;
}
