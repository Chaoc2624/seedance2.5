import { createFileRoute } from '@tanstack/react-router';

import { useTranslations } from '@/core/i18n/hooks';

import { Empty } from '@/components/blocks/common/empty';
import { PanelCard } from '@/components/blocks/panel';
import { TableCard } from '@/components/blocks/table';
import { getHeadMeta } from '@/lib/seo';
import { Button as ButtonType, Tab } from '@/types/blocks/common';
import { type Table } from '@/types/blocks/table';

const SubscriptionStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PENDING_CANCEL: 'pending_cancel',
  TRIALING: 'trialing',
  EXPIRED: 'expired',
  PAUSED: 'paused',
};

export const Route = createFileRoute('/{-$locale}/_landing/settings/billing')({
  component: BillingPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      status: search.status as string | undefined,
      page: search.page ? Number(search.page) : 1,
      limit: search.limit ? Number(search.limit) : 20,
    };
  },
  loaderDeps: ({ search: { status, page, limit } }) => ({
    status,
    page,
    limit,
  }),
  loader: async ({ deps: { status, page, limit } }) => {
    const { getCurrentSubscriptionFn, getUserSubscriptionsPageDataFn } =
      await import('@/server/subscription.functions');
    const [currentSubscription, subscriptionsData] = await Promise.all([
      getCurrentSubscriptionFn(),
      getUserSubscriptionsPageDataFn({ data: { status, page, limit } }),
    ]);
    return {
      currentSubscription,
      total: subscriptionsData.total,
      subscriptions: subscriptionsData.subscriptions,
      status,
      page,
      limit,
    };
  },
  head: ({ params }) =>
    getHeadMeta({
      metadataKey: 'settings.billing.metadata',
      canonicalUrl: '/settings/billing',
      locale: params.locale,
    }),
});

function BillingPage() {
  const t = useTranslations('settings.billing');
  const { currentSubscription, total, subscriptions, status, page, limit } =
    Route.useLoaderData();

  if (subscriptions === undefined) {
    return <Empty message="not authenticated" />;
  }

  const table: Table = {
    title: t('list.title'),
    columns: [
      {
        name: 'subscriptionNo',
        title: t('fields.subscription_no'),
        type: 'copy',
      },
      {
        name: 'interval',
        title: t('fields.interval'),
        callback: function (item) {
          if (!item.interval || !item.intervalCount) {
            return '-';
          }
          return <div>{`${item.intervalCount}-${item.interval}`}</div>;
        },
      },
      {
        name: 'status',
        title: t('fields.status'),
        type: 'label',
        metadata: { variant: 'outline' },
      },
      {
        title: t('fields.amount'),
        callback: function (item) {
          const currency = (item.currency || 'USD').toUpperCase();
          let prefix = '';
          if (currency === 'USD') prefix = '$';
          else if (currency === 'EUR') prefix = '€';
          else if (currency === 'CNY') prefix = '¥';
          else prefix = `${currency} `;

          return (
            <div className="text-primary">{`${prefix}${item.amount / 100}`}</div>
          );
        },
      },
      {
        name: 'createdAt',
        title: t('fields.created_at'),
        type: 'time',
      },
      {
        title: t('fields.current_period'),
        callback: function (item) {
          if (!item.currentPeriodStart || !item.currentPeriodEnd) return '-';
          const start = new Date(item.currentPeriodStart).toLocaleDateString();
          const end = new Date(item.currentPeriodEnd).toLocaleDateString();
          return (
            <div>
              {start} ~ <br /> {end}
            </div>
          );
        },
      },
      {
        title: t('fields.end_time'),
        callback: function (item) {
          if (item.canceledEndAt) {
            return (
              <div>{new Date(item.canceledEndAt).toLocaleDateString()}</div>
            );
          }
          return '-';
        },
      },
      {
        title: t('fields.action'),
        type: 'dropdown',
        callback: function (item) {
          if (
            item.status !== SubscriptionStatus.ACTIVE &&
            item.status !== SubscriptionStatus.TRIALING
          ) {
            return null;
          }

          return [
            {
              title: t('view.buttons.cancel') || 'Cancel',
              url: `/settings/billing/cancel?subscription_no=${item.subscriptionNo}`,
              icon: 'Ban',
              size: 'sm',
              variant: 'outline',
            },
          ];
        },
      },
    ],
    data: subscriptions,
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
      url: '/settings/billing',
      is_active: !status || status === 'all',
    },
    {
      title: t('list.tabs.active'),
      name: 'active',
      url: '/settings/billing?status=active',
      is_active: status === 'active',
    },
    {
      title: t('list.tabs.trialing'),
      name: 'trialing',
      url: '/settings/billing?status=trialing',
      is_active: status === 'trialing',
    },
    {
      title: t('list.tabs.paused'),
      name: 'paused',
      url: '/settings/billing?status=paused',
      is_active: status === 'paused',
    },
    {
      title: t('list.tabs.expired'),
      name: 'expired',
      url: '/settings/billing?status=expired',
      is_active: status === 'expired',
    },
    {
      title: t('list.tabs.pending_cancel'),
      name: 'pending_cancel',
      url: '/settings/billing?status=pending_cancel',
      is_active: status === 'pending_cancel',
    },
    {
      title: t('list.tabs.canceled'),
      name: 'canceled',
      url: '/settings/billing?status=canceled',
      is_active: status === 'canceled',
    },
  ];

  let buttons: ButtonType[] = [];
  if (currentSubscription) {
    buttons = [
      {
        title: t('view.buttons.adjust'),
        url: '/pricing',
        target: '_blank',
        icon: 'Pencil',
        size: 'sm',
      },
    ];
    if (currentSubscription.paymentUserId) {
      buttons.push({
        title: t('view.buttons.manage'),
        url: `/settings/billing/retrieve?subscription_no=${currentSubscription.subscriptionNo}`,
        target: '_blank',
        icon: 'Settings',
        size: 'sm',
        variant: 'outline',
      });
    }
  } else {
    buttons = [
      {
        title: t('view.buttons.subscribe'),
        url: '/pricing',
        target: '_blank',
        icon: 'ArrowUpRight',
        size: 'sm',
      },
    ];
  }

  return (
    <div className="space-y-8">
      <PanelCard
        label={currentSubscription?.status}
        title={t('view.title')}
        buttons={buttons}
        className="max-w-md"
      >
        <div className="text-3xl font-bold text-primary">
          {currentSubscription?.planName || t('view.no_subscription')}
        </div>
        {currentSubscription ? (
          <>
            {currentSubscription?.status === SubscriptionStatus.ACTIVE ||
            currentSubscription?.status === SubscriptionStatus.TRIALING ? (
              <div className="mt-4 text-sm font-normal text-muted-foreground">
                {t('view.tip', {
                  date: new Date(
                    currentSubscription?.currentPeriodEnd || ''
                  ).toLocaleDateString(),
                })}
              </div>
            ) : (
              <div className="mt-4 text-sm font-normal text-destructive">
                {t('view.end_tip', {
                  date: new Date(
                    currentSubscription?.canceledEndAt || ''
                  ).toLocaleDateString(),
                })}
              </div>
            )}
          </>
        ) : null}
      </PanelCard>
      <TableCard title={t('list.title')} tabs={tabs} table={table} />
    </div>
  );
}
