/**
 * Upsert Seedance 2.0 blog posts for public locales (excluding zh-hant).
 *
 * Identity key: (slug, language)
 * Categories: intentionally empty for this batch
 *
 * Usage:
 *   bun run db:seed:seedance-2-0-posts
 *   # or
 *   tsx scripts/with-env.ts bunx tsx scripts/db/seed-seedance-2-0-posts.ts
 *
 * Optional:
 *   --user-id=<uuid>   Force post.userId (default: first user in DB)
 */

import { and, eq } from 'drizzle-orm';

import { db } from '@/core/db/index.server';

import { envConfigs } from '@/config';
import { getUuid } from '@/lib/hash';

import {
  SEEDANCE_BLOG_LOCALES,
  seedance20PostDefinitions,
} from './seed-data/seedance-2-0';

type SchemaTables = {
  post: any;
  user: any;
};

function getArgValue(args: string[], name: string): string | undefined {
  const prefix = `--${name}=`;
  return args.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

async function loadSchemaTables(): Promise<SchemaTables> {
  if (envConfigs.database_provider === 'mysql') {
    return (await import('@/config/db/schema.mysql')) as any;
  }

  if (['sqlite', 'turso', 'd1'].includes(envConfigs.database_provider)) {
    return (await import('@/config/db/schema.sqlite')) as any;
  }

  return (await import('@/config/db/schema')) as any;
}

async function resolveOwnerUserId(
  schema: SchemaTables,
  forcedUserId?: string
): Promise<string> {
  if (forcedUserId) {
    const [found] = await db()
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.id, forcedUserId))
      .limit(1);

    if (!found) {
      throw new Error(`No user found for --user-id=${forcedUserId}`);
    }

    return found.id;
  }

  const [firstUser] = await db()
    .select({ id: schema.user.id })
    .from(schema.user)
    .limit(1);

  if (!firstUser) {
    throw new Error(
      'No users in database. Create an admin user first (bun run admin:init).'
    );
  }

  return firstUser.id;
}

async function main() {
  const args = process.argv.slice(2);
  const forcedUserId = getArgValue(args, 'user-id');

  if (!envConfigs.database_url) {
    throw new Error('DATABASE_URL is required to seed posts');
  }

  const schema = await loadSchemaTables();
  const userId = await resolveOwnerUserId(schema, forcedUserId);

  let inserted = 0;
  let updated = 0;

  for (const definition of seedance20PostDefinitions) {
    for (const language of SEEDANCE_BLOG_LOCALES) {
      const body = definition.locales[language];
      if (!body) {
        throw new Error(
          `Missing locale body for slug=${definition.slug} language=${language}`
        );
      }

      const createdAt = new Date(definition.createdAt);
      const [existing] = await db()
        .select({ id: schema.post.id })
        .from(schema.post)
        .where(
          and(
            eq(schema.post.slug, definition.slug),
            eq(schema.post.language, language)
          )
        )
        .limit(1);

      if (existing) {
        await db()
          .update(schema.post)
          .set({
            title: body.title,
            description: body.description,
            content: body.content,
            authorName: definition.authorName,
            authorImage: '',
            categories: '',
            tags: definition.tags,
            type: 'article',
            status: 'published',
            image: definition.image,
            deletedAt: null,
            updatedAt: new Date(),
          })
          .where(eq(schema.post.id, existing.id));
        updated += 1;
        console.log(`updated  ${definition.slug} [${language}]`);
      } else {
        await db().insert(schema.post).values({
          id: getUuid(),
          userId,
          parentId: '',
          slug: definition.slug,
          language,
          type: 'article',
          title: body.title,
          description: body.description,
          content: body.content,
          image: definition.image,
          categories: '',
          tags: definition.tags,
          authorName: definition.authorName,
          authorImage: '',
          status: 'published',
          createdAt,
          updatedAt: createdAt,
          sort: 0,
        });
        inserted += 1;
        console.log(`inserted ${definition.slug} [${language}]`);
      }
    }
  }

  console.log(
    `\nDone. inserted=${inserted} updated=${updated} locales=${SEEDANCE_BLOG_LOCALES.join(',')} posts=${seedance20PostDefinitions.length}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
