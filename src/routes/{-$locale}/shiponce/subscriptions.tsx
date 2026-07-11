import { createFileRoute, defer, Await } from '@tanstack/react-router';
import * as React from 'react';
import { z } from 'zod';

import { useTranslations } from '@/core/i18n/hooks';

import { TableCard } from '@/components/blocks/table';
import { Header, Main, MainHeader } from '@/components/layouts/admin-dashboard';
import { getHeadMeta } from '@/lib/seo';
import type { Crumb, Tab } from '@/types/blocks/common';
import type { Table, TableColumn } from '@/types/blocks/table';

const searchSchema = z.object({
  page: z.number().catch(1).optional(),
  pageSize: z.number().catch(30).optional(),
  interval: z.string().optional(),
  keyword: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const Route = createFileRoute('/{-$locale}/shiponce/subscriptions')({
  validateSearch: searchSchema,
  loaderDeps: ({
    search: { page, pageSize, interval, keyword, sortBy, sortOrder },
  }) => ({
    page: page || 1,
    limit: pageSize || 30,
    interval,
    keyword,
    sortBy,
    sortOrder,
  }),
  loader: ({ deps }) => {
    const dataPromise = (async () => {
      const { getAdminSubscriptionsPageDataFn } =
        await import('@/server/subscription.functions');
      return await getAdminSubscriptionsPageDataFn({ data: deps });
    })();
    return { dataDeferred: defer(dataPromise) };
  },
  staleTime: 30 * 1000,
  head: () =>
    getHeadMeta({
      metadataKey: 'admin.subscriptions.metadata',
      canonicalUrl: '/shiponce/subscriptions',
    }),
  // pendingComponent: PendingAdminList,
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  const { dataDeferred } = Route.useLoaderData();
  const searchParams = Route.useSearch();
  const t = useTranslations('admin.subscriptions');

  const page = searchParams.page || 1;
  const limit = searchParams.pageSize || 30;
  const interval = searchParams.interval;
  const keyword = searchParams.keyword;

  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/shiponce' },
    { title: t('list.crumbs.subscriptions'), is_active: true },
  ];

  const search = {
    name: 'keyword',
    title: 'Search',
    placeholder: 'Search Email, ID...',
    value: keyword || '',
  };

  const tabs: Tab[] = [
    {
      name: 'all',
      title: t('list.tabs.all'),
      url: '/shiponce/subscriptions',
      is_active: !interval || interval === 'all',
    },
    {
      name: 'month',
      title: t('list.tabs.month'),
      url: '/shiponce/subscriptions?interval=month',
      is_active: interval === 'month',
    },
    {
      name: 'year',
      title: t('list.tabs.year'),
      url: '/shiponce/subscriptions?interval=year',
      is_active: interval === 'year',
    },
  ];

  const columns: TableColumn[] = [
    {
      name: 'subscriptionNo',
      title: t('fields.subscription_no'),
      type: 'copy',
      resizable: true,
    },
    { name: 'user', title: t('fields.user'), type: 'user' },
    {
      name: 'amount',
      title: t('fields.amount'),
      sortable: true,
      callback: (item: any) => {
        return (
          <div className="text-primary">{`${item.amount / 100} ${
            item.currency
          }`}</div>
        );
      },
      type: 'copy',
    },
    {
      name: 'interval',
      title: t('fields.interval'),
      type: 'label',
      placeholder: '-',
    },
    {
      name: 'paymentProvider',
      title: t('fields.provider'),
      type: 'label',
    },
    {
      name: 'createdAt',
      title: t('fields.created_at'),
      type: 'time',
      sortable: true,
    },
    {
      name: 'currentPeriodStart',
      title: t('fields.current_period_start'),
      type: 'time',
      metadata: { format: 'YYYY-MM-DD HH:mm:ss' },
    },
    {
      name: 'currentPeriodEnd',
      title: t('fields.current_period_end'),
      type: 'time',
      metadata: { format: 'YYYY-MM-DD HH:mm:ss' },
    },
    { name: 'status', title: t('fields.status'), type: 'label' },
    {
      name: 'description',
      title: t('fields.description'),
      placeholder: '-',
      resizable: true,
    },
  ];

  const fallbackTable: Table = {
    columns,
    data: [],
    isLoading: true,
    pagination: { total: 0, page, limit },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader
          title={t('list.title')}
          tabs={tabs}
          search={search as any}
        />
        <React.Suspense fallback={<TableCard table={fallbackTable} />}>
          <Await promise={dataDeferred}>
            {({ total, subscriptions }) => {
              const table: Table = {
                columns,
                data: subscriptions,
                pagination: { total, page, limit },
              };
              return <TableCard table={table} />;
            }}
          </Await>
        </React.Suspense>
      </Main>
    </>
  );
}
