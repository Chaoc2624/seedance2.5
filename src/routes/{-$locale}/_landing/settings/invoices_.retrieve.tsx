import { createFileRoute } from '@tanstack/react-router';

import { useTranslations } from '@/core/i18n/hooks';

import ThemeDynamicPage from '@/themes/default/pages/dynamic-page';

import { getHeadMeta } from '@/lib/seo';
import { DynamicPage } from '@/types/blocks/landing';

export const Route = createFileRoute(
  '/{-$locale}/_landing/settings/invoices_/retrieve'
)({
  component: RetrieveInvoicePage,
  head: ({ params }) =>
    getHeadMeta({
      metadataKey: 'settings.invoices.metadata',
      canonicalUrl: '/settings/invoices/retrieve',
      locale: params.locale,
    }),
});

function RetrieveInvoicePage() {
  const { locale } = Route.useParams();
  const t = useTranslations('settings.invoices');

  const page: DynamicPage = {
    title: t('page.title'),
    sections: {
      invoices: {
        ...t.raw('page.sections.invoices'),
      },
    },
  };

  return <ThemeDynamicPage locale={locale} page={page} />;
}
