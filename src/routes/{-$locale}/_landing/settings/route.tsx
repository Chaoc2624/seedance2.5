import { createFileRoute, Outlet } from '@tanstack/react-router';

import { useTranslations } from '@/core/i18n/hooks';

import { ConsoleLayout } from '@/components/layouts/console/layout';

export const Route = createFileRoute('/{-$locale}/_landing/settings')({
  component: SettingsLayout,
});

function SettingsLayout() {
  const t = useTranslations('settings.sidebar');

  const title = t('title');
  const nav = t.raw('nav') as any;
  const topNav = t.raw('top_nav') as any;

  return (
    <ConsoleLayout title={title} nav={nav} topNav={topNav}>
      <Outlet />
    </ConsoleLayout>
  );
}
