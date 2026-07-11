import {
  createFileRoute,
  defer,
  Await,
  useRouter,
} from '@tanstack/react-router';
import * as React from 'react';
import { z } from 'zod';

import { useTranslations } from '@/core/i18n/hooks';

import { FormCard } from '@/components/blocks/form';
import { TableCard } from '@/components/blocks/table';
import { Header, Main, MainHeader } from '@/components/layouts/admin-dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getHeadMeta } from '@/lib/seo';
// Types
import type { Crumb, Search, Tab } from '@/types/blocks/common';
import type { Form } from '@/types/blocks/form';
import type { Table, TableColumn } from '@/types/blocks/table';

const searchSchema = z.object({
  page: z.number().catch(1).optional(),
  pageSize: z.number().catch(30).optional(),
  email: z.string().optional(),
  keyword: z.string().optional(),
  role: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const Route = createFileRoute('/{-$locale}/shiponce/users/')({
  validateSearch: searchSchema,
  loaderDeps: ({
    search: { page, pageSize, email, keyword, role, sortBy, sortOrder },
  }) => ({
    page: page || 1,
    limit: pageSize || 30,
    email,
    keyword,
    role,
    sortBy,
    sortOrder,
  }),
  loader: ({ deps }) => {
    const dataPromise = (async () => {
      const { getAdminUsersPageDataFn } =
        await import('@/server/user.functions');
      return await getAdminUsersPageDataFn({ data: deps });
    })();
    return { dataDeferred: defer(dataPromise) };
  },
  staleTime: 30 * 1000,
  head: () =>
    getHeadMeta({
      metadataKey: 'admin.users.metadata',
      canonicalUrl: '/shiponce/users',
    }),
  // pendingComponent: PendingAdminList,
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { dataDeferred } = Route.useLoaderData();
  const searchParams = Route.useSearch();
  const router = useRouter();
  const t = useTranslations('admin.users');

  const [modalState, setModalState] = React.useState<{
    isOpen: boolean;
    type?: 'edit' | 'edit-roles' | 'grant-credits';
    item: any | null;
  }>({
    isOpen: false,
    item: null,
  });

  const page = searchParams.page || 1;
  const limit = searchParams.pageSize || 30;
  const keyword = searchParams.keyword;
  const role = searchParams.role;

  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/shiponce' },
    { title: t('list.crumbs.users'), is_active: true },
  ];

  const tabs: Tab[] = [
    {
      name: 'user',
      title: '普通用户',
      url: '/shiponce/users',
      is_active: !role,
    },
    {
      name: 'admin',
      title: '后台用户',
      url: '/shiponce/users?role=admin',
      is_active: role === 'admin',
    },
  ];

  const search: Search = {
    name: 'keyword',
    title: t('list.search.email.title'),
    placeholder: t('list.search.email.placeholder'),
    value: keyword || '',
  };

  const columns: TableColumn[] = [
    { name: 'id', title: t('fields.id'), type: 'copy', resizable: true },
    { name: 'name', title: t('fields.name') },
    {
      name: 'image',
      title: t('fields.avatar'),
      type: 'image',
      placeholder: '-',
    },
    { name: 'email', title: t('fields.email'), type: 'copy', resizable: true },
    {
      name: 'roles',
      title: t('fields.roles'),
      callback: (item: any) => {
        const roles = item.roles || [];
        return (
          <div className="flex flex-col gap-2">
            {roles.map((role: any) => (
              <Badge key={role.id} variant="outline">
                {role.title}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      name: 'emailVerified',
      title: t('fields.email_verified'),
      type: 'label',
      placeholder: '-',
    },
    {
      name: 'remainingCredits',
      title: t('fields.remaining_credits'),
      sortable: true,
      callback: (item: any) => {
        return <div className="text-green-500">{item.remainingCredits}</div>;
      },
    },
    {
      name: 'totalCredits',
      title: 'Total Credits',
      sortable: true,
      callback: (item: any) => {
        return <div className="text-muted-foreground">{item.totalCredits}</div>;
      },
    },
    {
      name: 'usedCredits',
      title: 'Used Credits',
      sortable: true,
      callback: (item: any) => {
        return <div className="text-muted-foreground">{item.usedCredits}</div>;
      },
    },
    {
      name: 'createdAt',
      title: t('fields.created_at'),
      type: 'time',
      sortable: true,
    },
    { name: 'ip', title: t('fields.ip'), type: 'copy', resizable: true },
    { name: 'locale', title: t('fields.locale') },
    { name: 'utmSource', title: t('fields.utm_source'), resizable: true },
    {
      name: 'actions',
      title: t('fields.actions'),
      type: 'actions',
      className: 'w-[360px] min-w-[360px] text-right',
      metadata: {
        actionsWrap: false,
        actionsClassName: 'justify-end',
      },
      callback: (item: any) => [
        {
          name: 'edit',
          title: t('list.buttons.edit'),
          onClick: () => setModalState({ isOpen: true, type: 'edit', item }),
        },
        {
          name: 'edit-roles',
          title: t('list.buttons.edit_roles'),
          onClick: () =>
            setModalState({ isOpen: true, type: 'edit-roles', item }),
        },
        {
          name: 'grant-credits',
          title: t('list.buttons.grant_credits'),
          onClick: () =>
            setModalState({ isOpen: true, type: 'grant-credits', item }),
        },
      ],
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
            {({ total, users, roles }) => {
              const table: Table = {
                columns,
                data: users,
                pagination: { total, page, limit },
              };

              const isEdit = modalState.type === 'edit';
              const isCredits = modalState.type === 'grant-credits';
              const isRoles = modalState.type === 'edit-roles';

              const editForm: Form = {
                fields: [
                  {
                    name: 'name',
                    type: 'text',
                    title: t('fields.name'),
                    validation: { required: false },
                  },
                  {
                    name: 'image',
                    type: 'text',
                    title: t('fields.avatar'),
                    validation: { required: false },
                  },
                  {
                    name: 'locale',
                    type: 'text',
                    title: t('fields.locale'),
                    validation: { required: false },
                  },
                ],
                data: modalState.item ? { ...modalState.item } : {},
                submit: {
                  button: { title: 'Update' },
                  handler: async (data: FormData) => {
                    const { editAdminUserFn } =
                      await import('@/server/user.functions');
                    await editAdminUserFn({
                      data: {
                        id: modalState.item.id,
                        name: data.get('name') as string,
                        image: data.get('image') as string,
                        locale: data.get('locale') as string,
                      },
                    });
                    router.invalidate();
                    setModalState({ isOpen: false, item: null });
                    return { status: 'success', message: 'Success' };
                  },
                },
              };

              const creditsForm: Form = {
                fields: [
                  {
                    name: 'credits',
                    type: 'text',
                    title: 'Credits',
                    validation: { required: true },
                  },
                  {
                    name: 'validDays',
                    type: 'text',
                    title: 'Valid Days (0 = unlimited)',
                    validation: { required: false },
                  },
                  {
                    name: 'description',
                    type: 'textarea',
                    title: 'Description',
                    validation: { required: false },
                  },
                ],
                data: { validDays: 0 },
                submit: {
                  button: { title: 'Grant' },
                  handler: async (data: FormData) => {
                    const credits =
                      parseInt(data.get('credits') as string) || 0;
                    const validDays =
                      parseInt(data.get('validDays') as string) || 0;
                    const { grantCreditsFn } =
                      await import('@/server/credit.functions');
                    await grantCreditsFn({
                      data: {
                        userId: modalState.item.id,
                        credits,
                        validDays,
                        description: data.get('description') as string,
                      },
                    });
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
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {isEdit && 'Edit User'}
                          {isRoles && 'Edit Roles'}
                          {isCredits && 'Grant Credits'}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        {isEdit && <FormCard form={editForm} />}
                        {isCredits && <FormCard form={creditsForm} />}
                        {isRoles && (
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              const fd = new FormData(e.currentTarget);
                              const selectedRoles = fd.getAll(
                                'roleIds'
                              ) as string[];
                              const { editUserRolesFn } =
                                await import('@/server/user.functions');
                              await editUserRolesFn({
                                data: {
                                  userId: modalState.item.id,
                                  roles: selectedRoles,
                                },
                              });
                              router.invalidate();
                              setModalState({ isOpen: false, item: null });
                            }}
                          >
                            <div className="flex flex-col gap-3 py-4">
                              {roles.map((r) => {
                                const hasRole = modalState.item?.roles?.some(
                                  (ur: any) => ur.id === r.id
                                );
                                return (
                                  <label
                                    key={r.id}
                                    className="flex cursor-pointer items-center gap-3 rounded-md border p-3 hover:bg-muted/50"
                                  >
                                    <input
                                      type="checkbox"
                                      name="roleIds"
                                      value={r.id}
                                      defaultChecked={hasRole}
                                      className="h-4 w-4"
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-semibold">
                                        {r.title || r.name}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        {r.description}
                                      </span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                            <div className="flex justify-end border-t pt-4">
                              <Button type="submit">Update Roles</Button>
                            </div>
                          </form>
                        )}
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
