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
  type: z.string().optional(),
  keyword: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const Route = createFileRoute('/{-$locale}/shiponce/credits')({
  validateSearch: searchSchema,
  loaderDeps: ({
    search: { page, pageSize, type, keyword, sortBy, sortOrder },
  }) => ({
    page: page || 1,
    limit: pageSize || 30,
    type,
    keyword,
    sortBy,
    sortOrder,
  }),
  loader: ({ deps }) => {
    const dataPromise = (async () => {
      const { getAdminCreditsPageDataFn } =
        await import('@/server/credit.functions');
      return await getAdminCreditsPageDataFn({ data: deps });
    })();
    return { dataDeferred: defer(dataPromise) };
  },
  staleTime: 30 * 1000,
  head: () =>
    getHeadMeta({
      metadataKey: 'admin.credits.metadata',
      canonicalUrl: '/shiponce/credits',
    }),
  // pendingComponent: PendingAdminList,
  component: CreditsPage,
});

function CreditsPage() {
  const { dataDeferred } = Route.useLoaderData();
  const searchParams = Route.useSearch();
  const t = useTranslations('admin.credits');

  const page = searchParams.page || 1;
  const limit = searchParams.pageSize || 30;
  const type = searchParams.type;
  const keyword = searchParams.keyword;

  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/shiponce' },
    { title: t('list.crumbs.credits'), is_active: true },
  ];

  const search = {
    name: 'keyword',
    title: 'Search',
    placeholder: 'Search Transaction No., Desc...',
    value: keyword || '',
  };

  const tabs: Tab[] = [
    {
      name: 'all',
      title: t('list.tabs.all'),
      url: '/shiponce/credits',
      is_active: !type || type === 'all',
    },
    {
      name: 'grant',
      title: t('list.tabs.grant'),
      url: '/shiponce/credits?type=grant',
      is_active: type === 'grant',
    },
    {
      name: 'consume',
      title: t('list.tabs.consume'),
      url: '/shiponce/credits?type=consume',
      is_active: type === 'consume',
    },
  ];

  const columns: TableColumn[] = [
    {
      name: 'transactionNo',
      title: t('fields.transaction_no'),
      type: 'copy',
      resizable: true,
    },
    { name: 'user', title: t('fields.user'), type: 'user' },
    {
      name: 'credits',
      title: t('fields.amount'),
      sortable: true,
      callback: (item: any) => {
        if (item.credits > 0) {
          return <div className="text-green-500">+{item.credits}</div>;
        } else {
          return <div className="text-red-500">{item.credits}</div>;
        }
      },
    },
    {
      name: 'remainingCredits',
      title: t('fields.remaining'),
      type: 'label',
      placeholder: '-',
      callback: (item: any) => {
        if (item.metadata) {
          try {
            const meta =
              typeof item.metadata === 'string'
                ? JSON.parse(item.metadata)
                : item.metadata;
            if (meta.balanceAfter !== undefined) return meta.balanceAfter;
          } catch {}
        }
        if (item.transactionType === 'consume') return undefined;
        return item.remainingCredits;
      },
    },
    { name: 'transactionType', title: t('fields.type') },
    { name: 'transactionScene', title: t('fields.scene'), placeholder: '-' },
    {
      name: 'description',
      title: t('fields.description'),
      placeholder: '-',
      resizable: true,
    },
    {
      name: 'createdAt',
      title: t('fields.created_at'),
      type: 'time',
      sortable: true,
    },
    {
      name: 'expiresAt',
      title: t('fields.expires_at'),
      type: 'time',
      placeholder: '-',
      metadata: { format: 'YYYY-MM-DD HH:mm:ss' },
    },
    {
      name: 'metadata',
      title: t('fields.metadata'),
      type: 'json_preview',
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
            {({ total, credits }) => {
              const table: Table = {
                columns,
                data: credits,
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
