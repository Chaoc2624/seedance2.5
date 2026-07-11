import { createFileRoute } from '@tanstack/react-router';

import { useTranslations } from '@/core/i18n/hooks';

import ThemeDynamicPage from '@/themes/default/pages/dynamic-page';

import { getHeadMeta } from '@/lib/seo';
import { DynamicPage } from '@/types/blocks/landing';

export const Route = createFileRoute(
  '/{-$locale}/_landing/settings/billing_/cancel'
)({
  component: CancelBillingPage,
  head: ({ params }) =>
    getHeadMeta({
      metadataKey: 'settings.billing.cancel.metadata',
      canonicalUrl: '/settings/billing/cancel',
      locale: params.locale,
    }),
});

function CancelBillingPage() {
  const { locale } = Route.useParams();
  const t = useTranslations('settings.billing.cancel');

  const page: DynamicPage = {
    title: t('page.title'),
    sections: {
      cancel: {
        ...t.raw('page.sections.cancel'),
      },
    },
  };

  return <ThemeDynamicPage locale={locale} page={page} />;
}
