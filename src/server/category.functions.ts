import { createServerFn } from '@tanstack/react-start';

import { PERMISSIONS, requirePermission } from '@/core/rbac/index.server';

import { getUuid } from '@/lib/hash';
import {
  addTaxonomy,
  deleteTaxonomy,
  findTaxonomy,
  getTaxonomies,
  getTaxonomiesCount,
  updateTaxonomy,
  TaxonomyStatus,
  TaxonomyType,
  type NewTaxonomy,
  type UpdateTaxonomy,
} from '@/models/taxonomy.server';
import { getUserInfo } from '@/models/user.server';

export const getAdminCategoriesFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { page?: number; limit?: number }) => data)
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.CATEGORIES_READ });
    const { page, limit } = data;
    const categories = await getTaxonomies({
      type: TaxonomyType.CATEGORY,
      page,
      limit,
    });
    return categories;
  });

export const getAdminCategoriesCountFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  await requirePermission({ code: PERMISSIONS.CATEGORIES_READ });
  const count = await getTaxonomiesCount({ type: TaxonomyType.CATEGORY });
  return count;
});

export const getAdminCategoriesPageDataFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { page?: number; limit?: number }) => data)
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.CATEGORIES_READ });
    const { page, limit } = data;
    const [total, dataRows] = await Promise.all([
      getTaxonomiesCount({ type: TaxonomyType.CATEGORY }),
      getTaxonomies({ type: TaxonomyType.CATEGORY, page, limit }),
    ]);

    return { total, data: dataRows };
  });

export const findCategoryFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.CATEGORIES_READ });
    const category = await findTaxonomy({ id: data.id });
    return category || null;
  });

export const addCategoryFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      slug: string;
      language: string;
      title: string;
      description?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.CATEGORIES_WRITE });
    const user = await getUserInfo();
    if (!user) throw new Error('no auth');

    const newCategory: NewTaxonomy = {
      id: getUuid(),
      userId: user.id,
      parentId: '',
      slug: data.slug.trim().toLowerCase(),
      language: data.language,
      type: TaxonomyType.CATEGORY,
      title: data.title.trim(),
      description: (data.description || '').trim(),
      image: '',
      icon: '',
      status: TaxonomyStatus.PUBLISHED,
    };

    const result = await addTaxonomy(newCategory);
    if (!result) throw new Error('add category failed');
    return result;
  });

export const updateCategoryFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      id: string;
      slug: string;
      language?: string;
      title: string;
      description?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.CATEGORIES_WRITE });
    const user = await getUserInfo();
    if (!user) throw new Error('no auth');

    const updateData: UpdateTaxonomy = {
      slug: data.slug.trim().toLowerCase(),
      ...(data.language ? { language: data.language } : {}),
      title: data.title.trim(),
      description: (data.description || '').trim(),
      status: TaxonomyStatus.PUBLISHED,
    };

    const result = await updateTaxonomy(data.id, updateData);
    if (!result) throw new Error('update category failed');
    return result;
  });

export const deleteCategoryFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.CATEGORIES_WRITE });
    const result = await deleteTaxonomy(data.id);
    if (!result) throw new Error('delete category failed');
    return result;
  });

export const getCategoriesOptionsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { language?: string } | void) => data || {})
  .handler(async ({ data }) => {
    const categories = await getTaxonomies({
      type: TaxonomyType.CATEGORY,
      language: data?.language,
      status: TaxonomyStatus.PUBLISHED,
    });
    return categories.map((c) => {
      return { title: c.title, value: c.id };
    });
  });
