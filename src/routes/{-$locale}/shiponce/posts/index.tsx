import {
  createFileRoute,
  defer,
  Await,
  useRouter,
} from '@tanstack/react-router';
import * as React from 'react';
import { z } from 'zod';

import { useTranslations } from '@/core/i18n/hooks';

import { adminLocales, localeNames, defaultLocale } from '@/config/locale';

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
import type { Button, Crumb } from '@/types/blocks/common';
import type { Form } from '@/types/blocks/form';
import type { Table, TableColumn } from '@/types/blocks/table';

const searchSchema = z.object({
  page: z.number().catch(1).optional(),
  pageSize: z.number().catch(30).optional(),
});

export const Route = createFileRoute('/{-$locale}/shiponce/posts/')({
  validateSearch: searchSchema,
  loaderDeps: ({ search: { page, pageSize } }) => ({
    page: page || 1,
    limit: pageSize || 30,
  }),
  loader: ({ deps }) => {
    const dataPromise = (async () => {
      const { getAdminPostsPageDataFn } =
        await import('@/server/post.functions');
      return await getAdminPostsPageDataFn({ data: deps });
    })();
    return { dataDeferred: defer(dataPromise) };
  },
  staleTime: 30 * 1000,
  head: () =>
    getHeadMeta({
      metadataKey: 'admin.posts.metadata',
      canonicalUrl: '/shiponce/posts',
    }),
  // pendingComponent: PendingAdminList,
  component: PostsPage,
});

function PostsPage() {
  const { dataDeferred } = Route.useLoaderData();
  const searchParams = Route.useSearch();
  const t = useTranslations('admin.posts');
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
    { title: t('list.crumbs.posts'), is_active: true },
  ];

  const columns: TableColumn[] = [
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
    { name: 'authorName', title: t('fields.author_name') },
    {
      name: 'image',
      title: t('fields.image'),
      type: 'image',
      metadata: {
        width: 100,
        height: 80,
      },
      className: 'rounded-md',
    },
    {
      name: 'categories',
      title: t('fields.categories'),
      callback: (item: any) => {
        return item.categoriesNames || '-';
      },
    },
    { name: 'createdAt', title: t('fields.created_at'), type: 'time' },
    {
      name: 'action',
      title: '',
      type: 'actions',
      className: 'w-[200px] text-right',
      callback: (item: any) => {
        return [
          {
            id: 'edit',
            name: 'edit',
            title: t('list.buttons.edit'),
            onClick: () => {
              setModalState({ isOpen: true, item });
            },
          },
          {
            id: 'view',
            name: 'view',
            title: t('list.buttons.view'),
            onClick: () => {
              const url =
                item.language === defaultLocale
                  ? `/blog/${item.slug}`
                  : `/${item.language}/blog/${item.slug}`;
              window.open(url, '_blank');
            },
          },
        ];
      },
    },
  ];

  const actionsBase: Button[] = [
    {
      id: 'edit',
      title: t('list.buttons.edit'),
      onClick: () => {},
    },
  ];

  const actions: Button[] = [
    {
      id: 'add',
      title: t('list.buttons.add'),
      onClick: () => {
        setModalState({ isOpen: true, item: null });
      },
    },
  ];

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('list.title')} actions={actions} />
        <React.Suspense
          fallback={
            <TableCard
              table={{
                columns,
                actions: actionsBase,
                data: [],
                isLoading: true,
              }}
            />
          }
        >
          <Await promise={dataDeferred}>
            {({ total, posts, categoriesOptions }) => {
              const table: Table = {
                columns,
                actions: actionsBase,
                data: posts,
                pagination: { total, page, limit },
              };

              const formConfig: Form = {
                fields: [
                  {
                    name: 'slug',
                    type: 'text',
                    title: t('fields.slug'),
                    tip: 'unique slug for the post',
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
                    name: 'title',
                    type: 'text',
                    title: t('fields.title'),
                    validation: { required: true },
                  },
                  {
                    name: 'description',
                    type: 'textarea',
                    title: t('fields.description'),
                  },
                  {
                    name: 'categories',
                    type: 'select',
                    title: t('fields.categories'),
                    options: categoriesOptions,
                  },
                  {
                    name: 'image',
                    type: 'upload_image',
                    title: t('fields.image'),
                    metadata: { max: 1 },
                  },
                  {
                    name: 'authorName',
                    type: 'text',
                    title: t('fields.author_name'),
                  },
                  {
                    name: 'authorImage',
                    type: 'upload_image',
                    title: t('fields.author_image'),
                  },
                  {
                    name: 'content',
                    type: 'markdown_editor',
                    title: t('fields.content'),
                  },
                ],
                data: modalState.item
                  ? { ...modalState.item }
                  : { language: adminLocales[0] },
                submit: {
                  button: {
                    title: modalState.item
                      ? t('list.buttons.edit')
                      : t('list.buttons.add'),
                  },
                  handler: async (data: FormData) => {
                    const slug = data.get('slug') as string;
                    const language = data.get('language') as string;
                    const title = data.get('title') as string;
                    const description = data.get('description') as string;
                    const content = data.get('content') as string;
                    const categories = data.get('categories') as string;
                    const image = data.get('image') as string;
                    const authorName = data.get('authorName') as string;
                    const authorImage = data.get('authorImage') as string;

                    if (!slug?.trim() || !title?.trim() || !language) {
                      throw new Error('Missing required fields');
                    }

                    const { addPostFn, updatePostFn } =
                      await import('@/server/post.functions');
                    if (modalState.item) {
                      await updatePostFn({
                        data: {
                          id: modalState.item.id,
                          slug,
                          language,
                          title,
                          description,
                          content,
                          categories,
                          image,
                          authorName,
                          authorImage,
                        },
                      });
                    } else {
                      await addPostFn({
                        data: {
                          slug,
                          language,
                          title,
                          description,
                          content,
                          categories,
                          image,
                          authorName,
                          authorImage,
                        },
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
                  <TableCard table={table} />
                  <Dialog
                    open={modalState.isOpen}
                    onOpenChange={(open) =>
                      setModalState((prev) => ({ ...prev, isOpen: open }))
                    }
                  >
                    <DialogContent className="max-h-[90vh] w-[95vw] max-w-7xl overflow-y-auto sm:w-[90vw]">
                      <DialogHeader>
                        <DialogTitle>
                          {modalState.item
                            ? t('list.buttons.edit')
                            : t('list.buttons.add')}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <FormCard form={formConfig} />
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              );
            }}
          </Await>
        </React.Suspense>
      </Main>
    </>
  );
}
