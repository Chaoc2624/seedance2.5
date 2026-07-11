import { createFileRoute } from '@tanstack/react-router';

import { getDocBySlug } from '@/core/docs/source';
import { generateTOC } from '@/core/docs/toc';

import { defaultLocale } from '@/config/locale';

import { MDXContent } from '@/components/blocks/common/content/mdx-content';
import { TableOfContents } from '@/components/blocks/common/media/table-of-contents';
import { getHeadMeta } from '@/lib/seo';

export const Route = createFileRoute('/{-$locale}/_docs/docs/$')({
  component: DocsPage,
  head: ({ params }) => {
    const slug = params._splat || '';
    const locale = params.locale || defaultLocale;
    const doc = getDocBySlug(slug, locale);
    return getHeadMeta({
      locale,
      title: doc?.frontmatter.title,
      description: doc?.frontmatter.description,
    });
  },
});

function DocsPage() {
  const { locale: rawLocale, _splat } = Route.useParams();
  const locale = rawLocale || defaultLocale;
  const slug = _splat || '';

  const doc = getDocBySlug(slug, locale);

  if (!doc) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="mt-2 text-muted-foreground">Document not found</p>
        </div>
      </div>
    );
  }

  const toc = generateTOC(doc.content);

  return (
    <div className="flex">
      {/* Content area */}
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
        {/* Title + Description */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {doc.frontmatter.title}
          </h1>
          {doc.frontmatter.description && (
            <p className="mt-3 text-lg text-muted-foreground">
              {doc.frontmatter.description}
            </p>
          )}
        </div>

        {/* Markdown body */}
        <article className="docs prose prose-neutral dark:prose-invert max-w-none">
          <MDXContent source={doc.content} />
        </article>
      </div>

      {/* TOC sidebar */}
      {toc.length > 0 && (
        <div className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 overflow-y-auto py-8 pr-4 xl:block">
          <TableOfContents toc={toc} />
        </div>
      )}
    </div>
  );
}
