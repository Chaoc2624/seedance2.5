import { createFileRoute } from '@tanstack/react-router';

import { useTranslations } from '@/core/i18n/hooks';

import { adminLocales, defaultLocale } from '@/config/locale';

import { FormCard } from '@/components/blocks/form';
import { Header, Main, MainHeader } from '@/components/layouts/admin-dashboard';
import { getHeadMeta } from '@/lib/seo';
import type { Crumb } from '@/types/blocks/common';
import type { Form } from '@/types/blocks/form';

export const Route = createFileRoute('/{-$locale}/shiponce/categories/add')({
  component: AddCategoryPage,
  head: () =>
    getHeadMeta({
      metadataKey: 'admin.categories.metadata',
      canonicalUrl: '/shiponce/categories/add',
    }),
});

function AddCategoryPage() {
  const t = useTranslations('admin.categories');

  const crumbs: Crumb[] = [
    { title: t('add.crumbs.admin'), url: '/shiponce' },
    { title: t('add.crumbs.categories'), url: '/shiponce/categories' },
    { title: t('add.crumbs.add'), is_active: true },
  ];

  const form: Form = {
    fields: [
      {
        name: 'slug',
        type: 'text',
        title: t('fields.slug'),
        tip: 'unique slug for the category',
        validation: { required: true },
      },
      ...adminLocales.map((l: string) => ({
        name: `title_${l}`,
        type: 'text' as const,
        title: t('fields.title') + ` (${l.toUpperCase()})`,
        validation: { required: l === defaultLocale },
      })),
      {
        name: 'description',
        type: 'textarea',
        title: t('fields.description'),
      },
    ],
    data: {},
    submit: {
      button: {
        title: t('add.buttons.submit'),
      },
      handler: async (data) => {
        const slug = data.get('slug') as string;
        const description = data.get('description') as string;

        const titleObj: Record<string, string> = {};
        for (const l of adminLocales) {
          const val = data.get(`title_${l}`) as string;
          if (val && val.trim()) {
            titleObj[l] = val.trim();
          }
        }

        if (!slug?.trim() || !titleObj[defaultLocale]) {
          throw new Error(
            `slug and title (${defaultLocale.toUpperCase()}) are required`
          );
        }

        const title = JSON.stringify(titleObj);

        const { addCategoryFn } = await import('@/server/category.functions');
        await addCategoryFn({
          data: { slug, title, description, language: defaultLocale },
        });

        return {
          status: 'success',
          message: 'category added',
          redirect_url: '/shiponce/categories',
        };
      },
    },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('add.title')} />
        <FormCard form={form} className="md:max-w-xl" />
      </Main>
    </>
  );
}
