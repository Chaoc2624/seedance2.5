import { createFileRoute } from '@tanstack/react-router';

import { useTranslations } from '@/core/i18n/hooks';

import { FormCard } from '@/components/blocks/form';
import { PanelCard } from '@/components/blocks/panel';
import { getHeadMeta } from '@/lib/seo';
import { Form as FormType } from '@/types/blocks/form';

export const Route = createFileRoute('/{-$locale}/_landing/settings/security')({
  component: SecurityPage,
  head: ({ params }) =>
    getHeadMeta({
      metadataKey: 'settings.security.metadata',
      canonicalUrl: '/settings/security',
      locale: params.locale,
    }),
});

function SecurityPage() {
  const t = useTranslations('settings.security');

  const form: FormType = {
    fields: [
      {
        name: 'password',
        title: t('fields.password'),
        type: 'password',
        attributes: { type: 'password' },
        validation: { required: true },
      },
      {
        name: 'new_password',
        title: t('fields.new_password'),
        type: 'password',
        attributes: { type: 'password' },
        validation: { required: true },
      },
      {
        name: 'confirm_password',
        title: t('fields.confirm_password'),
        type: 'password',
        attributes: { type: 'password' },
        validation: { required: true },
      },
    ],
    submit: {
      handler: async (data: FormData) => {
        const payload = {
          password: data.get('password') as string,
          new_password: data.get('new_password') as string,
          confirm_password: data.get('confirm_password') as string,
        };
        const { changePasswordFn } = await import('@/server/user.functions');
        const res = await changePasswordFn({ data: payload });
        return {
          status: res.status,
          message: res.message,
        };
        // Not invalidating router since there's no data fetching for password
      },
      button: {
        title: t('reset_password.buttons.submit'),
      },
    },
  };

  return (
    <div className="space-y-8">
      <FormCard
        title={t('reset_password.title')}
        description={t('reset_password.description')}
        form={form}
      />

      <PanelCard
        title={t('delete_account.title')}
        description={t('delete_account.description')}
        content={t('delete_account.tip')}
        buttons={[
          {
            title: t('delete_account.buttons.submit'),
            url: '#', // placeholder until implement delete
            variant: 'destructive',
            size: 'sm',
            icon: 'RiDeleteBinLine',
          },
        ]}
        className="max-w-md"
      />
    </div>
  );
}
