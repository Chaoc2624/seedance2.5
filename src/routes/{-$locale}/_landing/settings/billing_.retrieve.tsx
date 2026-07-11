import { createFileRoute } from '@tanstack/react-router';

import { useTranslations } from '@/core/i18n/hooks';

import ThemeDynamicPage from '@/themes/default/pages/dynamic-page';

import { getHeadMeta } from '@/lib/seo';
import { DynamicPage } from '@/types/blocks/landing';

export const Route = createFileRoute(
  '/{-$locale}/_landing/settings/billing_/retrieve'
)({
  component: RetrieveBillingPage,
  head: ({ params }) =>
    getHeadMeta({
      metadataKey: 'settings.billing.metadata',
      canonicalUrl: '/settings/billing/retrieve',
      locale: params.locale,
    }),
});

function RetrieveBillingPage() {
  const { locale } = Route.useParams();
  const t = useTranslations('settings.billing');

  const page: DynamicPage = {
    title: t('page.title'),
    sections: {
      retrieve: {
        ...t.raw('page.sections.retrieve'),
      },
    },
  };

  return <ThemeDynamicPage locale={locale} page={page} />;
}
