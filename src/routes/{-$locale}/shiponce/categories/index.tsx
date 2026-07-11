import {
  createFileRoute,
  defer,
  Await,
  useRouter,
} from '@tanstack/react-router';
import * as React from 'react';
import { z } from 'zod';

import { useTranslations } from '@/core/i18n/hooks';

import { adminLocales, localeNames } from '@/config/locale';

import { FormCard } from '@/components/blocks/form';
import { TableCard } from '@/components/blocks/table';
import { Header, Main, MainHeader } from '@/components/layouts/admin-dashboard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getHeadMeta } from '@/lib/seo';
import type { Taxonomy } from '@/models/taxonomy.server';
import type { Button, Crumb } from '@/types/blocks/common';
import type { Form } from '@/types/blocks/form';
import type { Table, TableColumn } from '@/types/blocks/table';

const searchSchema = z.object({
  page: z.number().catch(1).optional(),
  pageSize: z.number().catch(30).optional(),
});

export const Route = createFileRoute('/{-$locale}/shiponce/categories/')({
  validateSearch: searchSchema,
  loaderDeps: ({ search: { page, pageSize } }) => ({
    page: page || 1,
    limit: pageSize || 30,
  }),
  loader: ({ deps }) => {
    const dataPromise = (async () => {
      const { getAdminCategoriesPageDataFn } =
        await import('@/server/category.functions');
      return await getAdminCategoriesPageDataFn({ data: deps });
    })();
    return { dataDeferred: defer(dataPromise) };
  },
  staleTime: 30 * 1000,
  head: () =>
    getHeadMeta({
      metadataKey: 'admin.categories.metadata',
      canonicalUrl: '/shiponce/categories',
    }),
  // pendingComponent: PendingAdminList,
  component: CategoriesPage,
});

function CategoriesPage() {
  const { dataDeferred } = Route.useLoaderData();
  const searchParams = Route.useSearch();
  const t = useTranslations('admin.categories');
  const router = useRouter();

  const [modalState, setModalState] = React.useState<{
    isOpen: boolean;
    item?: any;
  }>({
    isOpen: false,
  });

  const page = searchParams.page || 1;
  const limit = searchParams.pageSize || 30;

  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/shiponce' },
    { title: t('list.crumbs.categories'), is_active: true },
  ];

  const columns: TableColumn[] = [
    {
      name: 'slug',
      title: t('fields.slug'),
      type: 'copy',
      metadata: { message: 'Copied' },
      resizable: true,
    },
    { name: 'title', title: t('fields.title'), resizable: true },
    {
      name: 'language',
      title: t('fields.language', { defaultValue: 'Language' }),
      type: 'label',
      metadata: { variant: 'outline' },
      callback: (item: any) => {
        return `${localeNames[item.language] || item.language} (${item.language})`;
      },
    },
    {
      name: 'status',
      title: t('fields.status'),
      type: 'label',
      metadata: { variant: 'outline' },
    },
    { name: 'createdAt', title: t('fields.created_at'), type: 'time' },
    { name: 'updatedAt', title: t('fields.updated_at'), type: 'time' },
    {
      name: 'action',
      title: '',
      type: 'actions',
      className: 'w-[150px] text-right',
      callback: (item: Taxonomy) => {
        return [
          {
            id: 'edit',
            name: 'edit',
            title: t('list.buttons.edit'),
            onClick: () => {
              setModalState({ isOpen: true, item });
            },
          },
        ];
      },
    },
  ];

  // We remove URL and specify onClick
  const actionsBase: Button[] = [
    {
      id: 'edit',
      title: t('list.buttons.edit'),
      onClick: () => {},
    },
  ];

  const fallbackTable: Table = {
    columns,
    actions: actionsBase,
    data: [],
    isLoading: true,
  };

  const actions: Button[] = [
    {
      id: 'add',
      title: t('list.buttons.add'),
      onClick: () => {
        setModalState({ isOpen: true, item: null });
      },
    },
  ];

  const formConfig: Form = {
    fields: [
      {
        name: 'title',
        type: 'text',
        title: t('fields.title'),
        validation: { required: true },
      },
      {
        name: 'slug',
        type: 'text',
        title: t('fields.slug'),
        tip: 'unique slug for the category',
        validation: { required: true },
      },
      {
        name: 'language',
        type: 'select',
        title: t('fields.language', { defaultValue: 'Language' }),
        options: adminLocales.map((l: string) => ({
          title: `${localeNames[l] || l} (${l})`,
          value: l,
        })),
        validation: { required: true },
      },
      {
        name: 'description',
        type: 'textarea',
        title: t('fields.description'),
        validation: { required: false },
      },
    ],
    data: modalState.item
      ? { ...modalState.item }
      : { language: adminLocales[0] },
    submit: {
      button: {
        title: modalState.item ? t('list.buttons.edit') : t('list.buttons.add'),
      },
      handler: async (data: FormData) => {
        const slug = data.get('slug') as string;
        const title = data.get('title') as string;
        const description = data.get('description') as string;
        const language = data.get('language') as string;

        if (!slug?.trim() || !title?.trim() || !language) {
          throw new Error('Missing required fields');
        }

        const { addCategoryFn, updateCategoryFn } =
          await import('@/server/category.functions');
        if (modalState.item) {
          await updateCategoryFn({
            data: {
              id: modalState.item.id,
              slug,
              title,
              description,
              language,
            },
          });
        } else {
          await addCategoryFn({
            data: { slug, title, description, language },
          });
        }

        router.invalidate();
        setModalState({ isOpen: false, item: null });
        return { status: 'success', message: 'Success' };
      },
    },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('list.title')} actions={actions} />
        <React.Suspense fallback={<TableCard table={fallbackTable} />}>
          <Await promise={dataDeferred}>
            {({ total, data }) => {
              const table: Table = {
                columns,
                actions: actionsBase,
                data: data,
                pagination: { total, page, limit },
              };
              return <TableCard table={table} />;
            }}
          </Await>
        </React.Suspense>
      </Main>

      <Dialog
        open={modalState.isOpen}
        onOpenChange={(open) =>
          setModalState((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {modalState.item ? t('list.buttons.edit') : t('list.buttons.add')}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <FormCard form={formConfig} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
