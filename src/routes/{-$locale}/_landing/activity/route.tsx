import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { useTranslations } from '@/core/i18n/hooks';

import { modules } from '@/config/preset';

import { ConsoleLayout } from '@/components/layouts/console/layout';

export const Route = createFileRoute('/{-$locale}/_landing/activity')({
  beforeLoad: () => {
    if (!modules.activity) {
      throw redirect({ to: '/' as any });
    }
  },
  component: ActivityLayout,
});

function ActivityLayout() {
  const t = useTranslations('activity.sidebar');

  const title = t('title');
  const nav = t.raw('nav') as any;
  const topNav = t.raw('top_nav') as any;

  return (
    <ConsoleLayout title={title} nav={nav} topNav={topNav}>
      <Outlet />
    </ConsoleLayout>
  );
}
