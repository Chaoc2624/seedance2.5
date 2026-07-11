import { createFileRoute } from '@tanstack/react-router';

import { useTranslations } from '@/core/i18n/hooks';

import ThemeDynamicPage from '@/themes/default/pages/dynamic-page';

import { getHeadMeta } from '@/lib/seo';
import type { Category as CategoryType } from '@/types/blocks/blog';
import { DynamicPage } from '@/types/blocks/landing';

export const Route = createFileRoute(
  '/{-$locale}/_landing/blog/category/$slug'
)({
  loader: async ({ params }) => {
    const { getBlogCategoryPostsFn } = await import('@/server/blog.functions');
    const result = await getBlogCategoryPostsFn({
      data: {
        categorySlug: params.slug,
        locale: params.locale || 'en',
      },
    });
    return result;
  },
  head: ({ params }) =>
    getHeadMeta({
      metadataKey: 'pages.blog.metadata',
      canonicalUrl: `/blog/category/${params.slug}`,
      locale: params.locale,
    }),
  component: CategoryBlogPage,
});

function CategoryBlogPage() {
  const { locale } = Route.useParams();
  const t = useTranslations('pages.blog');
  const result = Route.useLoaderData();

  if (!result) {
    return (
      <section className="py-24 md:py-32">
        <div className="mx-auto text-center">
          <h1 className="text-2xl font-bold">Category not found</h1>
        </div>
      </section>
    );
  }

  const { currentCategory, categories: rawCategories, posts } = result;

  const categories: CategoryType[] = [
    {
      id: 'all',
      slug: 'all',
      title: t('messages.all'),
      url: '/blog',
    },
    ...rawCategories,
  ];

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
