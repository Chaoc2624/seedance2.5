import { createFileRoute } from '@tanstack/react-router';

import { useTranslations } from '@/core/i18n/hooks';

import { adminLocales, defaultLocale } from '@/config/locale';

import { FormCard } from '@/components/blocks/form';
import { Header, Main, MainHeader } from '@/components/layouts/admin-dashboard';
import { getHeadMeta } from '@/lib/seo';
import type { Crumb } from '@/types/blocks/common';
import type { Form } from '@/types/blocks/form';

export const Route = createFileRoute(
  '/{-$locale}/shiponce/categories/$id/edit'
)({
  loader: async ({ params }) => {
    const { findCategoryFn } = await import('@/server/category.functions');
    const category = await findCategoryFn({ data: { id: params.id } });
    if (!category) throw new Error('Category not found');
    return { category };
  },
  head: () =>
    getHeadMeta({
      metadataKey: 'admin.categories.metadata',
      canonicalUrl: '/shiponce/categories/edit',
    }),
  component: EditCategoryPage,
});

function EditCategoryPage() {
  const { category } = Route.useLoaderData();
  const t = useTranslations('admin.categories');

  const crumbs: Crumb[] = [
    { title: t('edit.crumbs.admin'), url: '/shiponce' },
    { title: t('edit.crumbs.categories'), url: '/shiponce/categories' },
    { title: t('edit.crumbs.edit'), is_active: true },
  ];

  let titleObj: Record<string, string> = {};
  for (const l of adminLocales) {
    titleObj[l] = category.title; // fallback
  }

  try {
    if (category.title && category.title.startsWith('{')) {
      const parsed = JSON.parse(category.title);
      titleObj = { ...titleObj, ...parsed };
    }
  } catch {}

  const formData: Record<string, any> = { ...category };
  for (const l of adminLocales) {
    formData[`title_${l}`] = titleObj[l] || category.title;
  }

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
    data: formData as Record<string, unknown>,
    submit: {
      button: {
        title: t('edit.buttons.submit'),
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

        const { updateCategoryFn } =
          await import('@/server/category.functions');
        await updateCategoryFn({
          data: { id: category.id, slug, title, description },
        });

        return {
          status: 'success',
          message: 'category updated',
          redirect_url: '/shiponce/categories',
        };
      },
    },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('edit.title')} />
        <FormCard form={form} className="md:max-w-xl" />
      </Main>
    </>
  );
}
