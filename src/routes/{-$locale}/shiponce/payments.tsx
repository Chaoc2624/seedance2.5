import { createFileRoute, defer, Await } from '@tanstack/react-router';
import * as React from 'react';
import { z } from 'zod';

import { useTranslations } from '@/core/i18n/hooks';

import { TableCard } from '@/components/blocks/table';
import { Header, Main, MainHeader } from '@/components/layouts/admin-dashboard';
import { getHeadMeta } from '@/lib/seo';
import type { Crumb, Filter, Search, Tab } from '@/types/blocks/common';
import type { Table, TableColumn } from '@/types/blocks/table';

const searchSchema = z.object({
  page: z.number().catch(1).optional(),
  pageSize: z.number().catch(30).optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  provider: z.string().optional(),
  orderNo: z.string().optional(),
});

export const Route = createFileRoute('/{-$locale}/shiponce/payments')({
  validateSearch: searchSchema,
  loaderDeps: ({
    search: { page, pageSize, type, status, provider, orderNo },
  }) => ({
    page: page || 1,
    limit: pageSize || 30,
    type,
    status,
    provider,
    orderNo,
  }),
  loader: ({ deps }) => {
    const dataPromise = (async () => {
      const { getAdminPaymentsPageDataFn } =
        await import('@/server/payment.functions');
      const { total, payments } = await getAdminPaymentsPageDataFn({
        data: deps,
      });
      return { total, payments };
    })();
    return { dataDeferred: defer(dataPromise) };
  },
  staleTime: 30 * 1000,
  head: () =>
    getHeadMeta({
      metadataKey: 'admin.payments.metadata',
      canonicalUrl: '/shiponce/payments',
    }),
  // pendingComponent: PendingAdminList,
  component: PaymentsPage,
});

function PaymentsPage() {
  const { dataDeferred } = Route.useLoaderData();
  const searchParams = Route.useSearch();
  const t = useTranslations('admin.payments');

  const page = searchParams.page || 1;
  const limit = searchParams.pageSize || 30;
  const { type, status, provider, orderNo } = searchParams;

  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/shiponce' },
    { title: t('list.crumbs.payments'), is_active: true },
  ];

  const tabs: Tab[] = [
    {
      name: 'all',
      title: t('list.tabs.all'),
      url: '/shiponce/payments',
      is_active: !type || type === 'all',
    },
    {
      name: 'subscription',
      title: t('list.tabs.subscription'),
      url: '/shiponce/payments?type=subscription',
      is_active: type === 'subscription',
    },
    {
      name: 'one-time',
      title: t('list.tabs.one-time'),
      url: '/shiponce/payments?type=one-time',
      is_active: type === 'one-time',
    },
  ];

  const filters: Filter[] = [
    {
      name: 'status',
      title: t('list.filters.status.title'),
      value: status,
      options: [
        { value: 'all', label: t('list.filters.status.options.all') },
        {
          value: 'paid',
          label: t('list.filters.status.options.paid'),
        },
        {
          value: 'created',
          label: t('list.filters.status.options.created'),
        },
        {
          value: 'failed',
          label: t('list.filters.status.options.failed'),
        },
      ],
    },
    {
      name: 'provider',
      title: t('list.filters.provider.title'),
      value: provider,
      options: [
        { value: 'all', label: t('list.filters.provider.options.all') },
        {
          value: 'stripe',
          label: t('list.filters.provider.options.stripe'),
        },
        {
          value: 'creem',
          label: t('list.filters.provider.options.creem'),
        },
        {
          value: 'lemonsqueezy',
          label: t('list.filters.provider.options.lemonsqueezy'),
        },
        {
          value: 'paypal',
          label: t('list.filters.provider.options.paypal'),
        },
      ],
    },
  ];

  const search: Search = {
    name: 'orderNo',
    title: t('list.search.order_no.title'),
    placeholder: t('list.search.order_no.placeholder'),
    value: orderNo || '',
  };

  const columns: TableColumn[] = [
    {
      name: 'orderNo',
      title: t('fields.order_no'),
      type: 'copy',
      resizable: true,
    },
    { name: 'user', title: t('fields.user'), type: 'user' },
    {
      title: t('fields.amount'),
      callback: (item: any) => {
        return (
          <div className="text-primary">{`${item.amount / 100} ${
            item.currency
          }`}</div>
        );
      },
      type: 'copy',
    },
    { name: 'status', title: t('fields.status'), type: 'label' },
    {
      name: 'paymentType',
      title: t('fields.type'),
      type: 'label',
      placeholder: '-',
    },
    {
      name: 'productId',
      title: t('fields.product'),
      type: 'label',
      placeholder: '-',
    },
    {
      name: 'description',
      title: t('fields.description'),
      placeholder: '-',
      resizable: true,
    },
    {
      name: 'paymentProvider',
      title: t('fields.provider'),
      type: 'label',
    },
    { name: 'createdAt', title: t('fields.created_at'), type: 'time' },
  ];

  const fallbackTable: Table = {
    columns,
    data: [],
    isLoading: true,
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader
          title={t('list.title')}
          tabs={tabs}
          filters={filters}
          search={search}
        />
        <React.Suspense fallback={<TableCard table={fallbackTable} />}>
          <Await promise={dataDeferred}>
            {({ total, payments }) => {
              const table: Table = {
                columns,
                data: payments,
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
