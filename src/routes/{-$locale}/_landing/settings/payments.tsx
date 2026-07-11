import { createFileRoute } from '@tanstack/react-router';

import { useTranslations } from '@/core/i18n/hooks';

import { Empty } from '@/components/blocks/common/empty';
import { TableCard } from '@/components/blocks/table';
import { getHeadMeta } from '@/lib/seo';
import { Tab } from '@/types/blocks/common';
import { type Table } from '@/types/blocks/table';

export const Route = createFileRoute('/{-$locale}/_landing/settings/payments')({
  component: PaymentsPage,
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
    const { getUserPaymentsPageDataFn } =
      await import('@/server/payment.functions');
    const data = await getUserPaymentsPageDataFn({
      data: { type, page, limit },
    });
    return {
      total: data.total,
      payments: data.payments,
      type,
      page,
      limit,
    };
  },
  head: ({ params }) =>
    getHeadMeta({
      metadataKey: 'settings.payments.metadata',
      canonicalUrl: '/settings/payments',
      locale: params.locale,
    }),
});

function PaymentsPage() {
  const t = useTranslations('settings.payments');
  const { total, payments, type, page, limit } = Route.useLoaderData();

  if (payments === undefined) {
    return <Empty message="not authenticated" />;
  }

  const table: Table = {
    title: t('list.title'),
    columns: [
      {
        name: 'orderNo',
        title: t('fields.order_no'),
        type: 'copy',
      },
      {
        name: 'productName',
        title: t('fields.product_name'),
      },
      {
        name: 'paymentType',
        title: t('fields.payment_type'),
        callback: function (item) {
          if (!item.paymentType) {
            return '-';
          }
          if (item.paymentType === 'one-time') {
            return t('types.one_time');
          }
          return t('types.subscription');
        },
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
        name: 'status',
        title: t('fields.status'),
        type: 'label',
        metadata: { variant: 'outline' },
      },
      {
        name: 'createdAt',
        title: t('fields.created_at'),
        type: 'time',
      },
    ],
    data: payments,
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
      url: '/settings/payments',
      is_active: !type || type === 'all',
    },
    {
      title: t('list.tabs.subscription'),
      name: 'subscription',
      url: '/settings/payments?type=subscription',
      is_active: type === 'subscription',
    },
    {
      title: t('list.tabs.one_time'),
      name: 'one-time',
      url: '/settings/payments?type=one-time',
      is_active: type === 'one-time',
    },
  ];

  return (
    <div className="space-y-8">
      <TableCard title={t('list.title')} tabs={tabs} table={table} />
    </div>
  );
}
