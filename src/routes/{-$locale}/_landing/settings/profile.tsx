import { createFileRoute, useRouter } from '@tanstack/react-router';

import { useTranslations } from '@/core/i18n/hooks';

import { Empty } from '@/components/blocks/common/empty';
import { FormCard } from '@/components/blocks/form';
import { getHeadMeta } from '@/lib/seo';
import { Form as FormType } from '@/types/blocks/form';

export const Route = createFileRoute('/{-$locale}/_landing/settings/profile')({
  component: ProfilePage,
  loader: async () => {
    const { getUserInfoFn } = await import('@/server/user.functions');
    const user = await getUserInfoFn();
    return { user };
  },
  head: ({ params }) =>
    getHeadMeta({
      metadataKey: 'settings.profile.metadata',
      canonicalUrl: '/settings/profile',
      locale: params.locale,
    }),
});

function ProfilePage() {
  const { user } = Route.useLoaderData();
  const t = useTranslations('settings.profile');
  const router = useRouter();

  if (!user) {
    return <Empty message="not authenticated" />;
  }

  const form: FormType = {
    fields: [
      {
        name: 'email',
        title: t('fields.email'),
        type: 'email',
        attributes: { disabled: true },
      },
      { name: 'name', title: t('fields.name'), type: 'text' },
      {
        name: 'image',
        title: t('fields.avatar'),
        type: 'upload_image',
        metadata: {
          max: 1,
        },
      },
    ],
    data: user as Record<string, any>,
    submit: {
      handler: async (data: FormData) => {
        const payload = {
          name: data.get('name') as string,
          image: data.get('image') as string,
        };
        const { updateUserFn } = await import('@/server/user.functions');
        const res = await updateUserFn({ data: payload });
        router.invalidate();
        return {
          status: res.status,
          message: res.message,
        };
      },
      button: {
        title: t('edit.buttons.submit'),
      },
    },
  };

  return (
    <div className="space-y-8">
      <FormCard
        title={t('edit.title')}
        description={t('edit.description')}
        form={form}
      />
    </div>
  );
}
