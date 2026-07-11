import { createFileRoute, notFound } from '@tanstack/react-router';

import ThemeDynamicPage from '@/themes/default/pages/dynamic-page';

import { getHeadMeta } from '@/lib/seo';
import { DynamicPage } from '@/types/blocks/landing';

export const Route = createFileRoute('/{-$locale}/_landing/blog/$slug')({
  loader: async ({ params }) => {
    const { getBlogPostFn } = await import('@/server/blog.functions');
    const post = await getBlogPostFn({
      data: { slug: params.slug, locale: params.locale || 'en' },
    });

    if (!post) {
      throw notFound();
    }

    return { post };
  },
  head: ({ params }) =>
    getHeadMeta({
      metadataKey: 'pages.blog.metadata',
      canonicalUrl: `/blog/${params.slug}`,
      locale: params.locale,
    }),
  component: BlogDetailPage,
});

function BlogDetailPage() {
  const { locale } = Route.useParams();
  const { post } = Route.useLoaderData();

  const page: DynamicPage = {
    sections: {
      blogDetail: {
        block: 'blog-detail',
        data: {
          post,
        },
      },
    },
  };

  return <ThemeDynamicPage locale={locale} page={page} />;
}
