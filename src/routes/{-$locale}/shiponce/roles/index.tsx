import {
  createFileRoute,
  defer,
  Await,
  useRouter,
} from '@tanstack/react-router';
import * as React from 'react';

import { useTranslations } from '@/core/i18n/hooks';

import { FormCard } from '@/components/blocks/form';
import { TableCard } from '@/components/blocks/table';
import { Header, Main, MainHeader } from '@/components/layouts/admin-dashboard';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getHeadMeta } from '@/lib/seo';
import type { Role } from '@/services/rbac.server';
import type { Crumb } from '@/types/blocks/common';
import type { Form } from '@/types/blocks/form';
import type { Table, TableColumn } from '@/types/blocks/table';

export const Route = createFileRoute('/{-$locale}/shiponce/roles/')({
  loader: () => {
    const dataPromise = (async () => {
      const { getAdminRolesPageDataFn } =
        await import('@/server/rbac.functions');
      return await getAdminRolesPageDataFn();
    })();
    return { dataDeferred: defer(dataPromise) };
  },
  staleTime: 30 * 1000,
  head: () =>
    getHeadMeta({
      metadataKey: 'admin.roles.metadata',
      canonicalUrl: '/shiponce/roles',
    }),
  // pendingComponent: PendingAdminList,
  component: AdminRolesPage,
});

function AdminRolesPage() {
  const { dataDeferred } = Route.useLoaderData();
  const router = useRouter();
  const t = useTranslations('admin.roles');

  const [modalState, setModalState] = React.useState<{
    isOpen: boolean;
    type?: 'edit' | 'edit-permissions';
    item: any | null;
  }>({
    isOpen: false,
    item: null,
  });

  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/shiponce' },
    { title: t('list.crumbs.roles'), is_active: true },
  ];

  const columns: TableColumn[] = [
    { name: 'name', title: t('fields.name') },
    { name: 'title', title: t('fields.title') },
    {
      name: 'description',
      title: t('fields.description'),
      type: 'copy',
      resizable: true,
    },
    { name: 'status', title: t('fields.status'), type: 'label' },
    { name: 'createdAt', title: t('fields.created_at'), type: 'time' },
    {
      name: 'actions',
      title: t('fields.actions'),
      type: 'actions',
      className: 'w-[200px] text-right',
      callback: (item: Role) => [
        {
          name: 'edit',
          title: t('list.buttons.edit'),
          onClick: () => setModalState({ isOpen: true, type: 'edit', item }),
        },
        {
          name: 'edit_permissions',
          title: t('list.buttons.edit_permissions'),
          onClick: () =>
            setModalState({ isOpen: true, type: 'edit-permissions', item }),
        },
      ],
    },
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
            {({ roles, permissions }) => {
              const table: Table = {
                columns,
                data: roles,
              };

              const isEdit = modalState.type === 'edit';
              const isPermissions = modalState.type === 'edit-permissions';

              const editForm: Form = {
                fields: [
                  {
                    name: 'name',
                    type: 'text',
                    title: t('fields.name'),
                    validation: { required: true },
                  },
                  {
                    name: 'title',
                    type: 'text',
                    title: t('fields.title'),
                    validation: { required: false },
                  },
                  {
                    name: 'description',
                    type: 'textarea',
                    title: t('fields.description'),
                    validation: { required: false },
                  },
                ],
                data: modalState.item ? { ...modalState.item } : {},
                submit: {
                  button: { title: 'Update' },
                  handler: async (data: FormData) => {
                    const { editRoleFn } =
                      await import('@/server/rbac.functions');
                    await editRoleFn({
                      data: {
                        id: modalState.item.id,
                        name: data.get('name') as string,
                        title: data.get('title') as string,
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
                          {isEdit && 'Edit Role'}
                          {isPermissions && 'Edit Permissions'}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        {isEdit && <FormCard form={editForm} />}
                        {isPermissions && (
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              const fd = new FormData(e.currentTarget);
                              const selectedPerms = fd.getAll(
                                'permissionIds'
                              ) as string[];
                              const { editRolePermissionsFn } =
                                await import('@/server/rbac.functions');
                              await editRolePermissionsFn({
                                data: {
                                  roleId: modalState.item.id,
                                  permissions: selectedPerms,
                                },
                              });
                              router.invalidate();
                              setModalState({ isOpen: false, item: null });
                            }}
                          >
                            <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto py-4">
                              {permissions.map((p) => {
                                const hasPerm =
                                  modalState.item?.permissions?.some(
                                    (up: any) => up.id === p.id
                                  );
                                return (
                                  <label
                                    key={p.id}
                                    className="flex cursor-pointer items-center gap-3 rounded-md border p-3 hover:bg-muted/50"
                                  >
                                    <input
                                      type="checkbox"
                                      name="permissionIds"
                                      value={p.id}
                                      defaultChecked={hasPerm}
                                      className="h-4 w-4"
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-semibold">
                                        {p.title || p.action}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        {p.description || p.code}
                                      </span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                            <div className="flex justify-end border-t pt-4">
                              <Button type="submit">Update Permissions</Button>
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
