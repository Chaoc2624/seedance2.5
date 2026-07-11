/**
 * Admin layout — wraps admin pages with dashboard sidebar.
 */
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Suspense } from 'react';

import { useTranslations } from '@/core/i18n/hooks';
import { ThemeProvider } from '@/core/theme/provider';

import { adminLocales } from '@/config/locale';
import { modules } from '@/config/preset';

import { DashboardLayout } from '@/components/layouts/admin-dashboard/layout';
import { PendingAdminList } from '@/components/layouts/admin-dashboard/pending-list';
import { Toaster } from '@/components/ui/sonner';
import { AppContextProvider } from '@/contexts/app';
import { getHeadMeta } from '@/lib/seo';
import { Sidebar as SidebarType } from '@/types/blocks/dashboard';

export const Route = createFileRoute('/{-$locale}/shiponce')({
  beforeLoad: ({ params, location }) => {
    const locale = (params as { locale?: string }).locale || '';
    if (locale && !adminLocales.includes(locale)) {
      const localePrefix = `/${locale}`;
      const pathname =
        location.pathname === localePrefix
          ? '/shiponce'
          : location.pathname.startsWith(`${localePrefix}/`)
            ? location.pathname.slice(localePrefix.length)
            : '/shiponce';
      throw redirect({ to: pathname as any, replace: true });
    }

    if (!modules.admin) {
      throw redirect({ to: '/' as any });
    }
  },
  loader: async () => {
    const { getAdminBootstrapFn } = await import('@/server/user.functions');
    const { user, isAdmin } = await getAdminBootstrapFn();

    if (!user) {
      throw redirect({ to: '/sign-in' as any });
    }

    if (!isAdmin) {
      throw redirect({ to: '/' as any });
    }

    return { user };
  },
  staleTime: 5 * 60 * 1000,
  head: () =>
    getHeadMeta({
      canonicalUrl: '/shiponce',
      noIndex: true,
    }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user } = Route.useLoaderData();
  const t = useTranslations('admin');
  const tSidebar = t.raw('sidebar') as SidebarType;

  return (
    <AppContextProvider initialUser={user}>
      <ThemeProvider>
        <DashboardLayout sidebar={tSidebar}>
          <Suspense fallback={<PendingAdminList />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </AppContextProvider>
  );
}
