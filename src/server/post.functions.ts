import { createServerFn } from '@tanstack/react-start';

import { PERMISSIONS, requirePermission } from '@/core/rbac/index.server';

import { getUuid } from '@/lib/hash';
import {
  addPost,
  deletePost,
  findPost,
  getPosts,
  getPostsCount,
  PostStatus,
  PostType,
  updatePost,
  type NewPost,
  type UpdatePost,
} from '@/models/post.server';
import {
  getTaxonomies,
  TaxonomyStatus,
  TaxonomyType,
} from '@/models/taxonomy.server';
import { getUserInfo } from '@/models/user.server';

const contentPages = import.meta.glob('/content/pages/**/*.{md,mdx}', {
  query: '?raw',
  import: 'default',
});

function parseFrontmatter(raw: string): {
  frontmatter: Record<string, any>;
  content: string;
} {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!fmMatch) return { frontmatter: {}, content: raw };
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
    if (
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))
    ) {
      value = value.slice(1, -1);
    }
    frontmatter[key] = value;
  }
  return { frontmatter, content };
}

export const getPageFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { slug: string; locale?: string }) => data)
  .handler(async ({ data }) => {
    const { slug, locale } = data;
    if (!slug) throw new Error('slug is required');

    const safeSlug = slug.replace(/\\/g, '/').replace(/^\/+/, '').split('/')[0];

    const exts = locale ? [`.${locale}.mdx`, '.mdx'] : ['.mdx'];
    const candidates = [
      ...exts.map((ext) => `/content/pages/${safeSlug}${ext}`),
      ...exts.map((ext) => `/content/pages/${safeSlug}/index${ext}`),
    ];

    let contentRaw: string | undefined;
    for (const p of candidates) {
      if (contentPages[p]) {
        contentRaw = (await contentPages[p]()) as string;
        break;
      }
    }

    if (!contentRaw) throw new Error('page not found');

    const { frontmatter, content } = parseFrontmatter(contentRaw);

    return {
      slug: safeSlug,
      title: frontmatter.title || '',
      description: frontmatter.description || '',
      content,
    };
  });

export const getAdminPostsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { page?: number; limit?: number }) => data)
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.POSTS_READ });
    const { page, limit } = data;
    const posts = await getPosts({
      type: PostType.ARTICLE,
      page,
      limit,
    });

    return await appendCategoriesNames(posts);
  });

export const getAdminPostsCountFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requirePermission({ code: PERMISSIONS.POSTS_READ });
    const count = await getPostsCount({
      type: PostType.ARTICLE,
    });
    return count;
  }
);

export const getAdminPostsPageDataFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { page?: number; limit?: number }) => data)
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.POSTS_READ });
    const { page, limit } = data;

    const [total, posts, categoriesOptions] = await Promise.all([
      getPostsCount({ type: PostType.ARTICLE }),
      getPosts({ type: PostType.ARTICLE, page, limit }),
      getTaxonomies({
        type: TaxonomyType.CATEGORY,
        status: TaxonomyStatus.PUBLISHED,
      }),
    ]);

    return {
      total,
      posts: await appendCategoriesNames(posts),
      categoriesOptions: categoriesOptions.map((c) => ({
        title: c.title,
        value: c.id,
      })),
    };
  });

async function appendCategoriesNames<T extends { categories?: string | null }>(
  posts: T[]
) {
  const categoryIds = Array.from(
    new Set(
      posts.flatMap((post) =>
        post.categories
          ? post.categories.split(',').filter((id) => id.length > 0)
          : []
      )
    )
  );
  const categories =
    categoryIds.length > 0
      ? await getTaxonomies({ ids: categoryIds, limit: categoryIds.length })
      : [];
  const categoryTitleById = new Map(categories.map((c) => [c.id, c.title]));

  return posts.map((post) => {
    const categoriesNames = post.categories
      ? post.categories
          .split(',')
          .map((id) => categoryTitleById.get(id))
          .filter(Boolean)
          .join(', ') || '-'
      : '-';
    return { ...post, categoriesNames };
  });
}

export const findPostFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.POSTS_READ });
    const postData = await findPost({ id: data.id });
    return postData || null;
  });

export const addPostFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      slug: string;
      language?: string;
      title: string;
      description?: string;
      content?: string;
      categories?: string;
      image?: string;
      authorName?: string;
      authorImage?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.POSTS_WRITE });
    const user = await getUserInfo();
    if (!user) throw new Error('no auth');

    const newPost: NewPost = {
      id: getUuid(),
      userId: user.id,
      parentId: '',
      language: data.language || 'en',
      slug: data.slug.trim().toLowerCase(),
      type: PostType.ARTICLE,
      title: data.title.trim(),
      description: (data.description || '').trim(),
      image: (data.image || '') as string,
      content: (data.content || '').trim(),
      categories: (data.categories || '').trim(),
      tags: '',
      authorName: (data.authorName || '').trim(),
      authorImage: (data.authorImage || '') as string,
      status: PostStatus.PUBLISHED,
    };

    const result = await addPost(newPost);
    if (!result) throw new Error('add post failed');
    return result;
  });

export const updatePostFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      id: string;
      slug: string;
      language?: string;
      title: string;
      description?: string;
      content?: string;
      categories?: string;
      image?: string;
      authorName?: string;
      authorImage?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.POSTS_WRITE });
    const user = await getUserInfo();
    if (!user) throw new Error('no auth');

    const updateData: UpdatePost = {
      slug: data.slug.trim().toLowerCase(),
      language: data.language,
      type: PostType.ARTICLE,
      title: data.title.trim(),
      description: (data.description || '').trim(),
      image: (data.image || '') as string,
      content: (data.content || '').trim(),
      categories: (data.categories || '').trim(),
      tags: '',
      authorName: (data.authorName || '').trim(),
      authorImage: (data.authorImage || '') as string,
      status: PostStatus.PUBLISHED,
    };

    const result = await updatePost(data.id, updateData);
    if (!result) throw new Error('update post failed');
    return result;
  });

export const deletePostFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.POSTS_WRITE });
    const result = await deletePost(data.id);
    if (!result) throw new Error('delete post failed');
    return result;
  });
