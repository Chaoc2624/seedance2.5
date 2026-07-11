import { createFileRoute, defer, Await } from '@tanstack/react-router';
import * as React from 'react';

import { useTranslations } from '@/core/i18n/hooks';

import { TableCard } from '@/components/blocks/table';
import { Header, Main, MainHeader } from '@/components/layouts/admin-dashboard';
import { getHeadMeta } from '@/lib/seo';
import type { Crumb } from '@/types/blocks/common';
import type { Table, TableColumn } from '@/types/blocks/table';

export const Route = createFileRoute('/{-$locale}/shiponce/permissions')({
  loader: () => {
    const dataPromise = (async () => {
      const { getAdminPermissionsPageDataFn } =
        await import('@/server/rbac.functions');
      return await getAdminPermissionsPageDataFn();
    })();
    return { dataDeferred: defer(dataPromise) };
  },
  staleTime: 30 * 1000,
  head: () =>
    getHeadMeta({
      metadataKey: 'admin.permissions.metadata',
      canonicalUrl: '/shiponce/permissions',
    }),
  // pendingComponent: PendingAdminList,
  component: AdminPermissionsPage,
});

function AdminPermissionsPage() {
  const { dataDeferred } = Route.useLoaderData();
  const t = useTranslations('admin.permissions');

  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/shiponce' },
    { title: t('list.crumbs.permissions'), is_active: true },
  ];

  const columns: TableColumn[] = [
    { name: 'code', title: t('fields.code'), resizable: true },
    { name: 'title', title: t('fields.title') },
    { name: 'resource', title: t('fields.resource'), resizable: true },
    { name: 'action', title: t('fields.action') },
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
        <MainHeader title={t('list.title')} />
        <React.Suspense fallback={<TableCard table={fallbackTable} />}>
          <Await promise={dataDeferred}>
            {({ permissions }) => {
              const table: Table = {
                columns,
                data: permissions,
              };
              return <TableCard table={table} />;
            }}
          </Await>
        </React.Suspense>
      </Main>
    </>
  );
}
