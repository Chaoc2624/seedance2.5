/**
 * Quick verification for Seedance 2.0 seeded posts.
 *   bun run db:seed:seedance-2-0-posts  (optional)
 *   tsx scripts/with-env.ts bunx tsx scripts/db/verify-seedance-2-0-posts.ts
 */

import { sql } from 'drizzle-orm';

import { db } from '@/core/db/index.server';

import { post } from '@/config/db/schema';

import {
  SEEDANCE_BLOG_LOCALES,
  seedance20PostDefinitions,
} from './seed-data/seedance-2-0';

async function main() {
  const expectedSlugs = seedance20PostDefinitions.map((p) => p.slug);
  const rows = await db()
    .select({
      language: post.language,
      slug: post.slug,
      categories: post.categories,
      status: post.status,
    })
    .from(post)
    .where(sql`${post.slug} in ${expectedSlugs}`);

  const expectedCount = expectedSlugs.length * SEEDANCE_BLOG_LOCALES.length;
  console.log(`rows=${rows.length} expected=${expectedCount}`);

  const missing: string[] = [];
  for (const slug of expectedSlugs) {
    for (const language of SEEDANCE_BLOG_LOCALES) {
      const hit = rows.find((r) => r.slug === slug && r.language === language);
      if (!hit) missing.push(`${slug}[${language}]`);
    }
  }

  const zhHant = rows.filter((r) => r.language === 'zh-hant');
  const badCats = rows.filter((r) => (r.categories || '').trim() !== '');
  const notPublished = rows.filter((r) => r.status !== 'published');

  console.log('missing', missing.length ? missing.join(', ') : 'none');
  console.log('zh-hant rows', zhHant.length);
  console.log('non-empty categories', badCats.length);
  console.log('not published', notPublished.length);

  // same slug across locales
  for (const slug of expectedSlugs) {
    const langs = rows.filter((r) => r.slug === slug).map((r) => r.language);
    console.log(
      `slug ${slug}: ${langs.length} locales -> ${[...langs].sort().join(',')}`
    );
  }

  if (
    missing.length ||
    zhHant.length ||
    badCats.length ||
    notPublished.length ||
    rows.length !== expectedCount
  ) {
    process.exit(1);
  }

  console.log('verify ok');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
