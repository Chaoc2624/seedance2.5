import { createFileRoute } from '@tanstack/react-router';

import { useTranslations } from '@/core/i18n/hooks';

import ThemeDynamicPage from '@/themes/default/pages/dynamic-page';

import { getHeadMeta } from '@/lib/seo';
import type { Category as CategoryType } from '@/types/blocks/blog';
import { DynamicPage } from '@/types/blocks/landing';

export const Route = createFileRoute('/{-$locale}/_landing/blog/')({
  loader: async ({ params }) => {
    const { getBlogPostsAndCategoriesFn } =
      await import('@/server/blog.functions');
    const result = await getBlogPostsAndCategoriesFn({
      data: { locale: params.locale || 'en' },
    });
    return result;
  },
  head: ({ params }) =>
    getHeadMeta({
      metadataKey: 'pages.blog.metadata',
      canonicalUrl: '/blog',
      locale: params.locale,
    }),
  component: BlogPage,
});

function BlogPage() {
  const { locale } = Route.useParams();
  const t = useTranslations('pages.blog');
  const { posts, categories: rawCategories } = Route.useLoaderData();

  const currentCategory: CategoryType = {
    id: 'all',
    slug: 'all',
    title: t('messages.all'),
    url: '/blog',
  };

  const categories: CategoryType[] = [currentCategory, ...rawCategories];

  const page: DynamicPage = {
    title: t('page.title'),
    sections: {
      blog: {
        ...t.raw('page.sections.blog'),
        data: {
          categories,
          currentCategory,
          posts,
        },
      },
    },
  };

  return <ThemeDynamicPage locale={locale} page={page} />;
}
