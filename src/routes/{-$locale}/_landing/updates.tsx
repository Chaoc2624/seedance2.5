import { createFileRoute, redirect } from '@tanstack/react-router';

import { useTranslations } from '@/core/i18n/hooks';

import { modules } from '@/config/preset';

import ThemeDynamicPage from '@/themes/default/pages/dynamic-page';

import { getHeadMeta } from '@/lib/seo';
import { DynamicPage } from '@/types/blocks/landing';

export const Route = createFileRoute('/{-$locale}/_landing/updates')({
  beforeLoad: () => {
    if (!modules.updates) {
      throw redirect({ to: '/' as any });
    }
  },
  component: UpdatesPage,
  head: ({ params }) =>
    getHeadMeta({
      metadataKey: 'pages.updates.metadata',
      canonicalUrl: '/updates',
      locale: params.locale,
    }),
});

function UpdatesPage() {
  const { locale } = Route.useParams();
  const t = useTranslations('pages.updates');

  const page: DynamicPage = {
    sections: {
      updates: {
        ...t.raw('page.sections.updates'),
      },
    },
  };

  return <ThemeDynamicPage locale={locale} page={page} />;
}
