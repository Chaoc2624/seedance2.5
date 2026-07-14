import { createFileRoute, notFound } from '@tanstack/react-router';

import { defaultLocale } from '@/config/locale';

import ThemeDynamicPage from '@/themes/default/pages/dynamic-page';

import { envConfigs } from '@/config';
import { getHeadMeta } from '@/lib/seo';
import { DynamicPage } from '@/types/blocks/landing';

function toAbsoluteUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${envConfigs.app_url}${url.startsWith('/') ? '' : '/'}${url}`;
}

function toLocaleAbsoluteBlogUrl(slug: string, locale: string): string {
  const path =
    !locale || locale === defaultLocale
      ? `/blog/${slug}`
      : `/${locale}/blog/${slug}`;
  return toAbsoluteUrl(path);
}

function buildBlogPostingJsonLd(
  post: {
    title?: string;
    description?: string;
    image?: string;
    author_name?: string;
    created_at_iso?: string;
    updated_at_iso?: string;
    slug?: string;
  },
  locale: string
): Record<string, unknown> {
  const pageUrl = toLocaleAbsoluteBlogUrl(post.slug || '', locale);
  const imageUrl = toAbsoluteUrl(post.image);
  const authorName = post.author_name || envConfigs.app_name || 'Editorial';
  const logoUrl = envConfigs.app_logo ? toAbsoluteUrl(envConfigs.app_logo) : '';

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title || '',
    description: post.description || '',
    ...(imageUrl ? { image: [imageUrl] } : {}),
    ...(post.created_at_iso ? { datePublished: post.created_at_iso } : {}),
    ...(post.updated_at_iso || post.created_at_iso
      ? { dateModified: post.updated_at_iso || post.created_at_iso }
      : {}),
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: envConfigs.app_name || '',
      ...(logoUrl
        ? {
            logo: {
              '@type': 'ImageObject',
              url: logoUrl,
            },
          }
        : {}),
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  };
}

export const Route = createFileRoute('/{-$locale}/_landing/blog/$slug')({
  loader: async ({ params }) => {
    const { getBlogPostFn } = await import('@/server/blog.functions');
    const post = await getBlogPostFn({
      data: { slug: params.slug, locale: params.locale || defaultLocale },
    });

    if (!post) {
      throw notFound();
    }

    return { post };
  },
  head: ({ params, loaderData }) => {
    const post = loaderData?.post;
    const locale = params.locale || defaultLocale;
    const availableLocales = post?.availableLocales?.length
      ? post.availableLocales
      : post
        ? [locale]
        : [];

    return getHeadMeta({
      title: post?.title,
      description: post?.description,
      imageUrl: post?.image,
      canonicalUrl: `/blog/${params.slug}`,
      locale,
      ogType: 'article',
      // Only real content locales — never emit zh/zh-hant → EN when missing
      availableLocales,
      jsonLd: post ? buildBlogPostingJsonLd(post, locale) : undefined,
    });
  },
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
