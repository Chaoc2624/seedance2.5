import { createFileRoute, redirect } from '@tanstack/react-router';

import { modules } from '@/config/preset';

import ThemeDynamicPage from '@/themes/default/pages/dynamic-page';

import { getHeadMeta } from '@/lib/seo';
import { DynamicPage } from '@/types/blocks/landing';

export const Route = createFileRoute('/{-$locale}/_landing/pricing')({
  beforeLoad: () => {
    if (!modules.payment) {
      throw redirect({ to: '/' as any });
    }
  },
  loader: async ({ params }) => {
    const { getPricingPageDataFn } = await import('@/server/pricing.functions');
    return await getPricingPageDataFn({
      data: {
        locale: params.locale,
      },
    });
  },
  component: PricingPage,
  head: ({ params }) =>
    getHeadMeta({
      metadataKey: 'pages.pricing.metadata',
      canonicalUrl: '/pricing',
      locale: params.locale,
    }),
});

function PricingPage() {
  const { locale } = Route.useParams();
  const page = Route.useLoaderData() as DynamicPage;

  return <ThemeDynamicPage locale={locale} page={page} />;
}
