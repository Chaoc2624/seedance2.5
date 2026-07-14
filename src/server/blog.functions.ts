import { createServerFn } from '@tanstack/react-start';

import { defaultLocale, splitLocaleSuffix } from '@/config/locale';

import { envConfigs } from '@/config';
import {
  findPost,
  getPostDate,
  getPostLanguages,
  getPosts,
  PostStatus,
  PostType,
} from '@/models/post.server';
import {
  findTaxonomy,
  getTaxonomies,
  TaxonomyStatus,
  TaxonomyType,
} from '@/models/taxonomy.server';
import type {
  Category as BlogCategoryType,
  Post as BlogPostType,
} from '@/types/blocks/blog';

// Pre-load all local posts
const contentPosts = import.meta.glob('/content/posts/**/*.{md,mdx}', {
  query: '?raw',
  eager: true,
}) as Record<string, { default: string }>;

type BlogStorageMode = 'mdx' | 'mdx-db';
type SerializablePost = Omit<BlogPostType, 'body' | 'toc'>;

type LocalPostEntry = {
  filePath: string;
  slug: string;
  post: SerializablePost;
  categoryValues: string[];
};

function getBlogStorageMode(): BlogStorageMode {
  return envConfigs.blog_storage_mode === 'mdx' ? 'mdx' : 'mdx-db';
}

function shouldUseBlogDatabase(): boolean {
  if (getBlogStorageMode() !== 'mdx-db') return false;

  return Boolean(envConfigs.database_url);
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function parseFrontmatterValue(value: string): unknown {
  const trimmed = value.trim();

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const arrayContent = trimmed.slice(1, -1).trim();
    if (!arrayContent) return [];

    return arrayContent
      .split(',')
      .map((item) => stripQuotes(item.trim()))
      .filter(Boolean);
  }

  return stripQuotes(trimmed);
}

function parseFrontmatter(raw: string): {
  frontmatter: Record<string, unknown>;
  content: string;
} {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!fmMatch) return { frontmatter: {}, content: raw };
  const fm = fmMatch[1];
  const content = raw.slice(fmMatch[0].length);
  const frontmatter: Record<string, unknown> = {};
  for (const line of fm.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf(':');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    frontmatter[key] = parseFrontmatterValue(value);
  }
  return { frontmatter, content };
}

/**
 * Handle slug parsing for local files.
 * /content/posts/what-is-xxx.zh.mdx -> slug: what-is-xxx, locale: zh
 */
function parseLocalPostSlug(filePath: string): {
  slug: string;
  locale: string | undefined;
} {
  const rel = filePath
    .replace(/^\/content\/posts\//, '')
    .replace(/\.mdx?$/, '');
  const segments = rel.split('/');
  const last = segments[segments.length - 1];
  const { baseName, locale } = splitLocaleSuffix(last);
  if (locale) {
    segments[segments.length - 1] = baseName;
    return {
      slug: segments.join('/'),
      locale,
    };
  }
  return {
    slug: segments.join('/'),
    locale: undefined,
  };
}

function stringValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
}

function listValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map(stringValue)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  const raw = stringValue(value).trim();
  if (!raw) return [];

  if (raw.startsWith('[') && raw.endsWith(']')) {
    return raw
      .slice(1, -1)
      .split(',')
      .map((item) => stripQuotes(item.trim()))
      .filter(Boolean);
  }

  return raw
    .split(',')
    .map((item) => stripQuotes(item.trim()))
    .filter(Boolean);
}

function categorySlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeCategoryKey(value: unknown): string {
  const raw = stringValue(value).trim();
  return categorySlug(raw) || raw.toLowerCase();
}

function isLocalPostForLocale(filePath: string, locale: string): boolean {
  const { locale: fileLocale } = parseLocalPostSlug(filePath);
  if (fileLocale) return fileLocale === locale;
  return locale === defaultLocale;
}

function toSerializableLocalPost({
  filePath,
  slug,
  frontmatter,
  locale,
}: {
  filePath: string;
  slug: string;
  frontmatter: Record<string, unknown>;
  locale: string;
}): SerializablePost {
  const createdAt = stringValue(frontmatter.created_at);

  return {
    id: filePath,
    slug,
    title: stringValue(frontmatter.title),
    description: stringValue(frontmatter.description),
    author_name: stringValue(frontmatter.author_name),
    author_image: stringValue(frontmatter.author_image),
    created_at: createdAt ? getPostDate({ created_at: createdAt, locale }) : '',
    image: stringValue(frontmatter.image),
    url: `/blog/${slug}`,
  };
}

function getLocalPostEntries(locale: string): LocalPostEntry[] {
  const entries: LocalPostEntry[] = [];

  for (const [filePath, file] of Object.entries(contentPosts)) {
    if (!file?.default || !isLocalPostForLocale(filePath, locale)) continue;

    const { slug } = parseLocalPostSlug(filePath);
    const { frontmatter } = parseFrontmatter(file.default);

    entries.push({
      filePath,
      slug,
      post: toSerializableLocalPost({
        filePath,
        slug,
        frontmatter,
        locale,
      }),
      categoryValues: listValue(frontmatter.categories),
    });
  }

  return entries;
}

function getLocalCategories(localPosts: LocalPostEntry[]): BlogCategoryType[] {
  const categoriesMap = new Map<string, BlogCategoryType>();

  for (const post of localPosts) {
    for (const categoryTitle of post.categoryValues) {
      const slug = categorySlug(categoryTitle);
      if (!slug || categoriesMap.has(slug)) continue;

      categoriesMap.set(slug, {
        id: slug,
        slug,
        title: categoryTitle,
        url: `/blog/category/${slug}`,
      });
    }
  }

  return Array.from(categoriesMap.values());
}

function findLocalCategory(
  localCategories: BlogCategoryType[],
  categorySlugParam: string
): BlogCategoryType | undefined {
  let decodedSlug = categorySlugParam;
  try {
    decodedSlug = decodeURIComponent(categorySlugParam);
  } catch {
    decodedSlug = categorySlugParam;
  }

  const normalizedSlug = normalizeCategoryKey(decodedSlug);

  return localCategories.find((category) => {
    return (
      normalizeCategoryKey(category.slug) === normalizedSlug ||
      normalizeCategoryKey(category.title) === normalizedSlug
    );
  });
}

function localPostMatchesCategory(
  post: LocalPostEntry,
  category: BlogCategoryType
): boolean {
  const categoryKeys = new Set(
    [category.id, category.slug, category.title]
      .map(normalizeCategoryKey)
      .filter(Boolean)
  );

  return post.categoryValues.some((value) =>
    categoryKeys.has(normalizeCategoryKey(value))
  );
}

function sortPostsByDate(posts: SerializablePost[]): SerializablePost[] {
  return posts.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
}

export const getBlogPostsAndCategoriesFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { locale: string; page?: number; limit?: number }) => data
  )
  .handler(async ({ data }) => {
    const { locale, page = 1, limit = 30 } = data;
    const useDatabase = shouldUseBlogDatabase();

    const postsMap = new Map<string, SerializablePost>();
    const categoriesMap = new Map<string, BlogCategoryType>();

    if (useDatabase) {
      const dbPostsData = await getPosts({
        type: PostType.ARTICLE,
        status: PostStatus.PUBLISHED,
        language: locale,
      });

      dbPostsData.forEach((post) => {
        postsMap.set(post.slug, {
          id: post.id,
          slug: post.slug,
          title: post.title || '',
          description: post.description || '',
          author_name: post.authorName || '',
          author_image: post.authorImage || '',
          created_at:
            getPostDate({ created_at: post.createdAt.toISOString(), locale }) ||
            '',
          image: post.image || '',
          url: `/blog/${post.slug}`,
        });
      });

      const categoriesData = await getTaxonomies({
        type: TaxonomyType.CATEGORY,
        language: locale,
        status: TaxonomyStatus.PUBLISHED,
      });

      categoriesData.forEach((category) => {
        categoriesMap.set(category.slug, {
          id: category.id,
          slug: category.slug,
          title: category.title,
          url: `/blog/category/${category.slug}`,
        });
      });
    }

    const localPosts = getLocalPostEntries(locale);
    for (const localPost of localPosts) {
      if (!postsMap.has(localPost.slug)) {
        postsMap.set(localPost.slug, localPost.post);
      }
    }

    getLocalCategories(localPosts).forEach((category) => {
      if (category.slug && !categoriesMap.has(category.slug)) {
        categoriesMap.set(category.slug, category);
      }
    });

    const posts = sortPostsByDate(Array.from(postsMap.values())).slice(
      (page - 1) * limit,
      page * limit
    );
    const categories = Array.from(categoriesMap.values());

    return {
      posts,
      postsCount: postsMap.size,
      categories,
      categoriesCount: categories.length,
    };
  });

function getLocalPostAvailableLocales(slug: string): string[] {
  const found = new Set<string>();

  for (const filePath of Object.keys(contentPosts)) {
    if (!contentPosts[filePath]?.default) continue;
    const parsed = parseLocalPostSlug(filePath);
    if (parsed.slug !== slug) continue;
    found.add(parsed.locale || defaultLocale);
  }

  return Array.from(found).sort();
}

async function getDbPostAvailableLocales(slug: string): Promise<string[]> {
  if (!shouldUseBlogDatabase()) return [];
  return getPostLanguages({ slug, status: PostStatus.PUBLISHED });
}

function toIsoDate(value: Date | string | null | undefined): string {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
}

export const getBlogPostFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { slug: string; locale: string }) => data)
  .handler(async ({ data }) => {
    const locale = data.locale || defaultLocale;

    if (shouldUseBlogDatabase()) {
      const dbPost = await findPost({
        slug: data.slug,
        status: PostStatus.PUBLISHED,
        language: locale,
      });

      if (dbPost) {
        const availableLocales = await getDbPostAvailableLocales(data.slug);
        const createdIso = toIsoDate(dbPost.createdAt);
        const updatedIso = toIsoDate(dbPost.updatedAt) || createdIso;

        return {
          id: dbPost.id,
          slug: dbPost.slug,
          title: dbPost.title || '',
          description: dbPost.description || '',
          content: dbPost.content || '',
          created_at:
            getPostDate({
              created_at: createdIso,
              locale,
            }) || '',
          created_at_iso: createdIso,
          updated_at_iso: updatedIso,
          author_name: dbPost.authorName || '',
          author_image: dbPost.authorImage || '',
          image: dbPost.image || '',
          url: `/blog/${dbPost.slug}`,
          // Only locales with real published content — never invent zh/zh-hant → EN
          availableLocales,
        };
      }

      // No silent EN fallback under a localized URL when using DB mode.
      // Missing locale (e.g. zh without a zh row) must 404 for indexability.
    }

    // Prefer exact locale files. Default-locale unsuffixed files only serve
    // the default locale — do not render EN under /zh/... or /zh-hant/...
    const candidates =
      locale === defaultLocale
        ? [
            `/content/posts/${data.slug}.${locale}.mdx`,
            `/content/posts/${data.slug}.${locale}.md`,
            `/content/posts/${data.slug}.mdx`,
            `/content/posts/${data.slug}.md`,
          ]
        : [
            `/content/posts/${data.slug}.${locale}.mdx`,
            `/content/posts/${data.slug}.${locale}.md`,
          ];

    for (const filePath of candidates) {
      if (contentPosts[filePath]?.default) {
        const { frontmatter, content } = parseFrontmatter(
          contentPosts[filePath].default
        );
        const createdAt = stringValue(frontmatter.created_at);
        const availableLocales = getLocalPostAvailableLocales(data.slug);
        const createdIso = createdAt ? toIsoDate(createdAt) : '';

        return {
          id: filePath,
          slug: data.slug,
          title: stringValue(frontmatter.title),
          description: stringValue(frontmatter.description),
          content,
          created_at: createdAt
            ? getPostDate({
                created_at: createdAt,
                locale,
              })
            : '',
          created_at_iso: createdIso,
          updated_at_iso: createdIso,
          author_name: stringValue(frontmatter.author_name),
          author_image: stringValue(frontmatter.author_image),
          image: stringValue(frontmatter.image),
          url: `/blog/${data.slug}`,
          availableLocales,
        };
      }
    }

    return null;
  });

export const getBlogCategoryPostsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      categorySlug: string;
      locale: string;
      page?: number;
      limit?: number;
    }) => data
  )
  .handler(async ({ data }) => {
    const { categorySlug, locale, page = 1, limit = 30 } = data;
    const useDatabase = shouldUseBlogDatabase();
    const localPosts = getLocalPostEntries(locale);
    const localCategories = getLocalCategories(localPosts);

    let dbCategoryData: Awaited<ReturnType<typeof findTaxonomy>> | undefined;
    let currentCategory = findLocalCategory(localCategories, categorySlug);

    if (useDatabase) {
      dbCategoryData = await findTaxonomy({
        slug: categorySlug,
        language: locale,
        status: TaxonomyStatus.PUBLISHED,
      });

      if (dbCategoryData) {
        currentCategory = {
          id: dbCategoryData.id,
          slug: dbCategoryData.slug,
          title: dbCategoryData.title,
          url: `/blog/category/${dbCategoryData.slug}`,
        };
      }
    }

    if (!currentCategory) return null;

    const postsMap = new Map<string, SerializablePost>();
    const categoriesMap = new Map<string, BlogCategoryType>();

    if (useDatabase && dbCategoryData) {
      const dbPostsData = await getPosts({
        category: dbCategoryData.id,
        type: PostType.ARTICLE,
        status: PostStatus.PUBLISHED,
        language: locale,
      });

      dbPostsData.forEach((post) => {
        postsMap.set(post.slug, {
          id: post.id,
          slug: post.slug,
          title: post.title || '',
          description: post.description || '',
          author_name: post.authorName || '',
          author_image: post.authorImage || '',
          created_at:
            getPostDate({ created_at: post.createdAt.toISOString(), locale }) ||
            '',
          image: post.image || '',
          url: `/blog/${post.slug}`,
        });
      });

      const categoriesData = await getTaxonomies({
        type: TaxonomyType.CATEGORY,
        language: locale,
        status: TaxonomyStatus.PUBLISHED,
      });

      categoriesData.forEach((category) => {
        categoriesMap.set(category.slug, {
          id: category.id,
          slug: category.slug,
          title: category.title,
          url: `/blog/category/${category.slug}`,
        });
      });
    }

    for (const localPost of localPosts) {
      if (
        !postsMap.has(localPost.slug) &&
        localPostMatchesCategory(localPost, currentCategory)
      ) {
        postsMap.set(localPost.slug, localPost.post);
      }
    }

    localCategories.forEach((category) => {
      if (category.slug && !categoriesMap.has(category.slug)) {
        categoriesMap.set(category.slug, category);
      }
    });

    const posts = sortPostsByDate(Array.from(postsMap.values())).slice(
      (page - 1) * limit,
      page * limit
    );
    const categories = Array.from(categoriesMap.values());

    return {
      currentCategory,
      posts,
      postsCount: postsMap.size,
      categories,
      categoriesCount: categories.length,
    };
  });
