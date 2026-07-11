import { createFileRoute } from '@tanstack/react-router';

import { useTranslations } from '@/core/i18n/hooks';

import { adminLocales, localeNames } from '@/config/locale';

import { FormCard } from '@/components/blocks/form';
import { Header, Main, MainHeader } from '@/components/layouts/admin-dashboard';
import { getHeadMeta } from '@/lib/seo';
import type { Crumb } from '@/types/blocks/common';
import type { Form } from '@/types/blocks/form';

export const Route = createFileRoute('/{-$locale}/shiponce/posts/$id/edit')({
  loader: async ({ params }) => {
    const { findPostFn } = await import('@/server/post.functions');
    const { getCategoriesOptionsFn } =
      await import('@/server/category.functions');
    const [postData, categoriesOptions] = await Promise.all([
      findPostFn({ data: { id: params.id } }),
      getCategoriesOptionsFn(),
    ]);
    if (!postData) throw new Error('Post not found');
    return { post: postData, categoriesOptions };
  },
  head: () =>
    getHeadMeta({
      metadataKey: 'admin.posts.metadata',
      canonicalUrl: '/shiponce/posts/edit',
    }),
  component: EditPostPage,
});

function EditPostPage() {
  const { post, categoriesOptions } = Route.useLoaderData();
  const t = useTranslations('admin.posts');

  const crumbs: Crumb[] = [
    { title: t('edit.crumbs.admin'), url: '/shiponce' },
    { title: t('edit.crumbs.posts'), url: '/shiponce/posts' },
    { title: t('edit.crumbs.edit'), is_active: true },
  ];

  const form: Form = {
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
        metadata: {
          max: 1,
        },
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
    data: post as Record<string, unknown>,
    submit: {
      button: {
        title: t('edit.buttons.submit'),
      },
      handler: async (data) => {
        const slug = data.get('slug') as string;
        const language = data.get('language') as string;
        const title = data.get('title') as string;
        const description = data.get('description') as string;
        const content = data.get('content') as string;
        const categories = data.get('categories') as string;
        const image = data.get('image') as string;
        const authorName = data.get('authorName') as string;
        const authorImage = data.get('authorImage') as string;

        if (!slug?.trim() || !title?.trim()) {
          throw new Error('slug and title are required');
        }

        const { updatePostFn } = await import('@/server/post.functions');
        await updatePostFn({
          data: {
            id: post.id,
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

        return {
          status: 'success',
          message: 'post updated',
          redirect_url: '/shiponce/posts',
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
