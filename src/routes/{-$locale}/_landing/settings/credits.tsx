import { createFileRoute } from '@tanstack/react-router';
import { Trans } from 'react-i18next';

import { useLocale, useTranslations } from '@/core/i18n/hooks';

import { Empty } from '@/components/blocks/common/empty';
import { PanelCard } from '@/components/blocks/panel';
import { TableCard } from '@/components/blocks/table';
import { getHeadMeta } from '@/lib/seo';
import { Tab } from '@/types/blocks/common';
import { type Table } from '@/types/blocks/table';

export const Route = createFileRoute('/{-$locale}/_landing/settings/credits')({
  component: CreditsPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      type: search.type as string | undefined,
      page: search.page ? Number(search.page) : 1,
      limit: search.limit ? Number(search.limit) : 20,
    };
  },
  loaderDeps: ({ search: { type, page, limit } }) => ({
    type,
    page,
    limit,
  }),
  loader: async ({ deps: { type, page, limit } }) => {
    const { getUserCreditsFn } = await import('@/server/user.functions');
    const { getUserCreditsPageDataFn } =
      await import('@/server/credit.functions');
    const [creditsInfo, data] = await Promise.all([
      getUserCreditsFn(),
      getUserCreditsPageDataFn({ data: { type, page, limit } }),
    ]);
    return {
      remainingCredits: creditsInfo.remainingCredits,
      soonestExpiringCredits: creditsInfo.soonestExpiringCredits,
      total: data.total,
      creditsLogs: data.credits,
      type,
      page,
      limit,
    };
  },
  head: ({ params }) =>
    getHeadMeta({
      metadataKey: 'settings.credits.metadata',
      canonicalUrl: '/settings/credits',
      locale: params.locale,
    }),
});

function CreditsPage() {
  const t = useTranslations('settings.credits');
  const locale = useLocale();
  const {
    remainingCredits,
    soonestExpiringCredits,
    total,
    creditsLogs,
    type,
    page,
    limit,
  } = Route.useLoaderData();

  if (creditsLogs === undefined) {
    return <Empty message="not authenticated" />;
  }

  const table: Table = {
    title: t('list.title'),
    columns: [
      {
        name: 'transactionNo',
        title: t('fields.transaction_no'),
        type: 'copy',
      },
      {
        title: t('fields.type'),
        callback: function (item) {
          if (!item.transactionType) {
            return '-';
          }
          if (item.transactionType === 'grant') {
            return t('types.grant');
          }
          return t('types.consume');
        },
      },
      {
        name: 'credits',
        title: t('fields.credits'),
      },
      {
        name: 'description',
        title: t('fields.description'),
      },
      {
        title: t('fields.expires_at'),
        callback: function (item) {
          if (!item.expiresAt) return t('view.never_expires');
          return new Date(item.expiresAt).toLocaleDateString();
        },
      },
      {
        name: 'createdAt',
        title: t('fields.created_at'),
        type: 'time',
      },
    ],
    data: creditsLogs,
    pagination: {
      total,
      page,
      limit,
    },
  };

  const tabs: Tab[] = [
    {
      title: t('list.tabs.all'),
      name: 'all',
      url: '/settings/credits',
      is_active: !type || type === 'all',
    },
    {
      title: t('list.tabs.grant'),
      name: 'grant',
      url: '/settings/credits?type=grant',
      is_active: type === 'grant',
    },
    {
      title: t('list.tabs.consume'),
      name: 'consume',
      url: '/settings/credits?type=consume',
      is_active: type === 'consume',
    },
  ];

  const numberFormatter = new Intl.NumberFormat(locale);
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  });
  const expiringCredits = soonestExpiringCredits
    ? numberFormatter.format(soonestExpiringCredits.credits)
    : '';
  const expiringDate = soonestExpiringCredits
    ? dateFormatter.format(new Date(soonestExpiringCredits.expiresAt))
    : '';

  return (
    <div className="space-y-8">
      <PanelCard
        title={t('view.title')}
        buttons={[
          {
            title: t('view.buttons.purchase'),
            url: '/pricing',
            target: '_blank',
            icon: 'ArrowUpRight',
            size: 'sm',
          },
        ]}
        className="max-w-md"
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <div className="text-3xl font-bold text-primary">
            {numberFormatter.format(remainingCredits || 0)}
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            {soonestExpiringCredits ? (
              <Trans
                i18nKey="settings.credits.view.soonest_expiring"
                values={{ credits: expiringCredits, date: expiringDate }}
                components={{
                  credits: <span className="font-semibold text-primary" />,
                  date: <span className="font-semibold text-primary" />,
                }}
              />
            ) : (
              t('view.no_expiring_credits')
            )}
          </div>
        </div>
        <div className="mt-4 text-sm font-normal text-muted-foreground">
          {t('view.description')}
        </div>
      </PanelCard>
      <TableCard title={t('list.title')} tabs={tabs} table={table} />
    </div>
  );
}
