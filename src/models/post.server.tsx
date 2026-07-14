import fs from 'node:fs/promises';
import path from 'node:path';

import { and, count, desc, eq, like } from 'drizzle-orm';
import moment from 'moment';

import { db } from '@/core/db/index.server';

import { post } from '@/config/db/schema';
import {
  getMomentLocale,
  isChineseLocale,
  splitLocaleSuffix,
} from '@/config/locale';

import { MarkdownContent } from '@/components/blocks/common/content/markdown-content';
import { MDXContent } from '@/components/blocks/common/content/mdx-content';
import {
  Category as BlogCategoryType,
  Post as BlogPostType,
} from '@/types/blocks/blog';

import { getTaxonomies, TaxonomyStatus, TaxonomyType } from './taxonomy.server';

export type Post = typeof post.$inferSelect;
export type NewPost = typeof post.$inferInsert;
export type UpdatePost = Partial<Omit<NewPost, 'id' | 'createdAt'>>;

export enum PostType {
  ARTICLE = 'article',
  PAGE = 'page',
  LOG = 'log',
}

export enum PostStatus {
  PUBLISHED = 'published', // published and visible to the public
  PENDING = 'pending', // pending review by admin
  DRAFT = 'draft', // draft and not visible to the public
  ARCHIVED = 'archived', // archived means deleted
}

export async function addPost(data: NewPost) {
  const [result] = await db().insert(post).values(data).returning();

  return result;
}

export async function updatePost(id: string, data: UpdatePost) {
  const [result] = await db()
    .update(post)
    .set(data)
    .where(eq(post.id, id))
    .returning();

  return result;
}

export async function deletePost(id: string) {
  const result = await updatePost(id, {
    status: PostStatus.ARCHIVED,
  });

  return result;
}

export async function findPost({
  id,
  slug,
  status,
  language,
}: {
  id?: string;
  slug?: string;
  status?: PostStatus;
  language?: string;
}) {
  const [result] = await db()
    .select()
    .from(post)
    .where(
      and(
        id ? eq(post.id, id) : undefined,
        slug ? eq(post.slug, slug) : undefined,
        status ? eq(post.status, status) : undefined,
        language ? eq(post.language, language) : undefined
      )
    )
    .limit(1);

  return result;
}

/** Distinct published languages for a slug — used for accurate hreflang. */
export async function getPostLanguages({
  slug,
  status = PostStatus.PUBLISHED,
}: {
  slug: string;
  status?: PostStatus;
}): Promise<string[]> {
  const rows = await db()
    .select({ language: post.language })
    .from(post)
    .where(
      and(eq(post.slug, slug), status ? eq(post.status, status) : undefined)
    );

  return Array.from(
    new Set(
      rows.map((row) => String(row.language || '').trim()).filter(Boolean)
    )
  ).sort();
}

export async function getPosts({
  type,
  status,
  category,
  tag,
  language,
  page = 1,
  limit = 30,
}: {
  type?: PostType;
  status?: PostStatus;
  category?: string;
  tag?: string[];
  language?: string;
  page?: number;
  limit?: number;
} = {}): Promise<Post[]> {
  const result = await db()
    .select()
    .from(post)
    .where(
      and(
        type ? eq(post.type, type) : undefined,
        status ? eq(post.status, status) : undefined,
        language ? eq(post.language, language) : undefined,
        category ? like(post.categories, `%${category}%`) : undefined,
        tag ? like(post.tags, `%${tag}%`) : undefined
      )
    )
    .orderBy(desc(post.updatedAt), desc(post.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return result;
}

export async function getPostsCount({
  type,
  status,
  category,
  tag,
  language,
}: {
  type?: PostType;
  status?: PostStatus;
  category?: string;
  tag?: string;
  language?: string;
} = {}): Promise<number> {
  const [result] = await db()
    .select({ count: count() })
    .from(post)
    .where(
      and(
        type ? eq(post.type, type) : undefined,
        status ? eq(post.status, status) : undefined,
        language ? eq(post.language, language) : undefined,
        category ? like(post.categories, `%${category}%`) : undefined,
        tag ? like(post.tags, `%${tag}%`) : undefined
      )
    )
    .limit(1);

  return result?.count || 0;
}

// get single post, both from local file and database
// database post has higher priority
export async function getPost({
  slug,
  locale,
  postPrefix = '/blog/',
}: {
  slug: string;
  locale: string;
  postPrefix?: string;
}): Promise<BlogPostType | null> {
  let post: BlogPostType | null = null;

  try {
    // get post from database
    const postData = await findPost({
      slug,
      status: PostStatus.PUBLISHED,
      language: locale,
    });
    if (postData) {
      // post exist in database
      const content = postData.content || '';

      // Convert markdown content to MarkdownContent component
      const body = content ? <MarkdownContent content={content} /> : undefined;

      post = {
        id: postData.id,
        slug: postData.slug,
        title: postData.title || '',
        description: postData.description || '',
        content: '',
        body: body,
        toc: undefined,
        created_at:
          getPostDate({
            created_at: postData.createdAt.toISOString(),
            locale,
          }) || '',
        author_name: postData.authorName || '',
        author_image: postData.authorImage || '',
        author_role: '',
        url: `${postPrefix}${postData.slug}`,
      };

      return post;
    }
  } catch (e) {
    console.log('get post from database failed:', e);
  }

  // get post from locale file
  return getLocalPost({ slug, locale, postPrefix });
}

export async function getLocalPost({
  slug,
  locale,
  postPrefix = '/blog/',
}: {
  slug: string;
  locale: string;
  postPrefix?: string;
}): Promise<BlogPostType | null> {
  // Try localized first, then default
  const baseDir = path.join(process.cwd(), 'content', 'posts');
  const filePath = await resolveMDXPath(baseDir, slug, locale);
  if (!filePath) return null;

  const raw = await fs.readFile(filePath, 'utf8');
  const { frontmatter, content } = parseFrontmatter(raw);

  const body = content ? <MDXContent source={content} /> : undefined;

  const createdAt = frontmatter.created_at
    ? getPostDate({ created_at: frontmatter.created_at, locale })
    : '';

  const post: BlogPostType = {
    id: filePath,
    slug,
    title: frontmatter.title || '',
    description: frontmatter.description || '',
    content: '',
    body,
    created_at: createdAt,
    author_name: frontmatter.author_name || '',
    author_image: frontmatter.author_image || '',
    author_role: '',
    url: `${postPrefix}${slug}`,
    image: frontmatter.image || '',
    tags: frontmatter.tags || [],
    categories: frontmatter.categories || [],
  };

  return post;
}

// get local page from: content/pages/*.md
export async function getLocalPage({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}): Promise<BlogPostType | null> {
  const baseDir = path.join(process.cwd(), 'content', 'pages');
  const filePath = await resolveMDXPath(baseDir, slug, locale);
  if (!filePath) return null;

  const raw = await fs.readFile(filePath, 'utf8');
  const { frontmatter, content } = parseFrontmatter(raw);

  const body = content ? <MDXContent source={content} /> : undefined;

  const createdAt = frontmatter.created_at
    ? getPostDate({ created_at: frontmatter.created_at, locale })
    : '';

  const post: BlogPostType = {
    id: filePath,
    slug,
    title: frontmatter.title || '',
    description: frontmatter.description || '',
    content: '',
    body,
    created_at: createdAt,
    author_name: frontmatter.author_name || '',
    author_image: frontmatter.author_image || '',
    author_role: '',
    url: `/${locale}/${slug}`,
    image: frontmatter.image || '',
    tags: frontmatter.tags || [],
    categories: frontmatter.categories || [],
  };

  return post;
}

// get posts and categories, both from local files and database
export async function getPostsAndCategories({
  page = 1,
  limit = 30,
  locale,
  postPrefix = '/blog/',
  categoryPrefix = '/blog/category/',
}: {
  page?: number;
  limit?: number;
  locale: string;
  postPrefix?: string;
  categoryPrefix?: string;
}) {
  let posts: BlogPostType[] = [];

  // merge posts from both locale and remote, remove duplicates by slug
  // remote posts have higher priority
  const postsMap = new Map<string, BlogPostType>();

  // Only get remote posts (local docs removed)
  const {
    posts: remotePosts,
    categories: remoteCategories,
    categoriesCount: remoteCategoriesCount,
  } = await getRemotePostsAndCategories({
    page,
    limit,
    locale,
    postPrefix,
    categoryPrefix,
  });

  // add remote posts to postsMap
  remotePosts.forEach((post) => {
    if (post.slug) {
      postsMap.set(post.slug, post);
    }
  });

  // Convert map to array and sort by created_at desc
  posts = Array.from(postsMap.values()).sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  return {
    posts,
    postsCount: posts.length,
    categories: remoteCategories, // todo: merge local categories
    categoriesCount: remoteCategoriesCount, // todo: merge local categories count
  };
}

// get remote posts and categories
export async function getRemotePostsAndCategories({
  page = 1,
  limit = 30,
  locale,
  postPrefix = '/blog/',
  categoryPrefix = '/blog/category/',
}: {
  page?: number;
  limit?: number;
  locale: string;
  postPrefix?: string;
  categoryPrefix?: string;
}) {
  const dbPostsList: BlogPostType[] = [];
  const dbCategoriesList: BlogCategoryType[] = [];

  try {
    // get posts from database
    const dbPosts = await getPosts({
      type: PostType.ARTICLE,
      status: PostStatus.PUBLISHED,
      page,
      limit,
    });

    if (!dbPosts || dbPosts.length === 0) {
      return {
        posts: [],
        postsCount: 0,
        categories: [],
        categoriesCount: 0,
      };
    }

    dbPostsList.push(
      ...dbPosts.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title || '',
        description: post.description || '',
        author_name: post.authorName || '',
        author_image: post.authorImage || '',
        created_at:
          getPostDate({
            created_at: post.createdAt.toISOString(),
            locale,
          }) || '',
        image: post.image || '',
        url: `${postPrefix}${post.slug}`,
      }))
    );

    // get categories from database
    const dbCategories = await getTaxonomies({
      type: TaxonomyType.CATEGORY,
      status: TaxonomyStatus.PUBLISHED,
    });

    dbCategoriesList.push(
      ...(dbCategories || []).map((category) => ({
        id: category.id,
        slug: category.slug,
        title: category.title,
        url: `${categoryPrefix}${category.slug}`,
      }))
    );
  } catch (e) {
    console.log('get remote posts and categories failed:', e);
  }

  return {
    posts: dbPostsList,
    postsCount: dbPostsList.length,
    categories: dbCategoriesList,
    categoriesCount: dbCategoriesList.length,
  };
}

// get local posts and categories
export async function getLocalPostsAndCategories({
  locale,
  postPrefix = '/blog/',
  categoryPrefix: _categoryPrefix = '/blog/category/',
  type = PostType.ARTICLE,
}: {
  locale: string;
  postPrefix?: string;
  categoryPrefix?: string;
  type?: PostType;
}): Promise<{
  posts: BlogPostType[];
  postsCount: number;
  categories: BlogCategoryType[];
  categoriesCount: number;
}> {
  const localPostsList: BlogPostType[] = [];

  // Determine source directory
  const dir =
    type === PostType.LOG
      ? path.join(process.cwd(), 'content', 'logs')
      : path.join(process.cwd(), 'content', 'posts');

  // Collect .mdx files
  const files = await listMDXFiles(dir);

  // Map by slug without locale suffix to handle i18n preference
  const bySlug = new Map<string, string>();
  for (const file of files) {
    const { slug, locale: fileLocale } = parseContentPath(file, dir);
    // Prefer current locale over default
    if (!bySlug.has(slug)) {
      bySlug.set(slug, file);
    } else {
      const existing = bySlug.get(slug)!;
      const existingLocale = parseContentPath(existing, dir).locale;
      if (fileLocale === locale && existingLocale !== locale) {
        bySlug.set(slug, file);
      }
    }
  }

  for (const [slug, filePath] of bySlug.entries()) {
    const raw = await fs.readFile(filePath, 'utf8');
    const { frontmatter, content } = parseFrontmatter(raw);

    let body: React.ReactNode | undefined = undefined;
    if (type === PostType.LOG && content) {
      body = <MDXContent source={content} />;
    }

    const createdAtRaw = frontmatter.created_at || frontmatter.date || '';
    const createdAt = createdAtRaw
      ? getPostDate({ created_at: createdAtRaw, locale })
      : '';

    const post: BlogPostType = {
      id: filePath,
      slug,
      title: frontmatter.title || '',
      description: frontmatter.description || '',
      author_name: frontmatter.author_name || '',
      author_image: frontmatter.author_image || '',
      created_at: createdAt,
      date: frontmatter.date || createdAtRaw || '',
      image: frontmatter.image || '',
      url: `${postPrefix}${slug}`,
      version: frontmatter.version || '',
      tags: frontmatter.tags || [],
      categories: frontmatter.categories || [],
      body,
    };

    localPostsList.push(post);
  }

  return {
    posts: localPostsList,
    postsCount: localPostsList.length,
    categories: [],
    categoriesCount: 0,
  };
}

// Helper function to replace slug for local posts
export function getPostSlug({
  url,
  locale,
  prefix = '/blog/',
}: {
  url: string; // post url, like: /zh/blog/what-is-xxx
  locale: string; // locale
  prefix?: string; // post slug prefix
}): string {
  if (url.startsWith(prefix)) {
    return url.replace(prefix, '');
  } else if (url.startsWith(`/${locale}${prefix}`)) {
    return url.replace(`/${locale}${prefix}`, '');
  }

  return url;
}

export function getPostDate({
  created_at,
  locale,
}: {
  created_at: string;
  locale?: string;
}) {
  return moment(created_at)
    .locale(getMomentLocale(locale))
    .format(isChineseLocale(locale) ? 'YYYY/MM/DD' : 'MMM D, YYYY');
}

// Helper function to remove frontmatter from markdown content
export function removePostFrontmatter(content: string): string {
  // Match frontmatter pattern: ---\n...content...\n---
  const frontmatterRegex = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;
  return content.replace(frontmatterRegex, '').trim();
}

// ----------------------
// Local content helpers
// ----------------------

async function resolveMDXPath(baseDir: string, slug: string, locale: string) {
  const exts = [`.${locale}.mdx`, '.mdx'];
  const candidates = [
    ...exts.map((ext) => path.join(baseDir, `${slug}${ext}`)),
    ...exts.map((ext) => path.join(baseDir, slug, `index${ext}`)),
  ];
  for (const p of candidates) {
    try {
      await fs.access(p);
      return p;
    } catch {}
  }
  return null;
}

async function listMDXFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const item of items) {
      const p = path.join(dir, item.name);
      if (item.isDirectory()) {
        out.push(...(await listMDXFiles(p)));
      } else if (item.isFile() && /\.mdx?$/.test(item.name)) {
        out.push(p);
      }
    }
  } catch {
    // ignore
  }
  return out;
}

function parseContentPath(
  filePath: string,
  baseDir: string
): {
  slug: string;
  locale: string | undefined;
} {
  const rel = path.relative(baseDir, filePath).replace(/\\/g, '/');
  const name = rel.replace(/\.(mdx|md)$/i, '');
  const segments = name.split('/');
  const last = segments[segments.length - 1];
  const { baseName, locale } = splitLocaleSuffix(last);
  if (locale) {
    segments[segments.length - 1] = baseName;
    return { slug: segments.join('/'), locale };
  }
  return { slug: segments.join('/'), locale: undefined };
}

function parseFrontmatter(raw: string): {
  frontmatter: Record<string, any>;
  content: string;
} {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!fmMatch) {
    return { frontmatter: {}, content: raw };
  }
  const fm = fmMatch[1];
  const content = raw.slice(fmMatch[0].length);
  const frontmatter: Record<string, any> = {};
  for (const line of fm.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf(':');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    // Remove surrounding quotes
    if (
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))
    ) {
      value = value.slice(1, -1);
    }
    // Simple array parser for [a, b]
    if (value.startsWith('[') && value.endsWith(']')) {
      const arrRaw = value.slice(1, -1).trim();
      const arr = arrRaw
        ? arrRaw
            .split(',')
            .map((s) => s.trim())
            .map((s) =>
              s.startsWith("'") && s.endsWith("'")
                ? s.slice(1, -1)
                : s.startsWith('"') && s.endsWith('"')
                  ? s.slice(1, -1)
                  : s
            )
        : [];
      (frontmatter as any)[key] = arr;
      continue;
    }
    (frontmatter as any)[key] = value;
  }
  return { frontmatter, content };
}
