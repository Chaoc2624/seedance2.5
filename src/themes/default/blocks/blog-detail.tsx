import CalendarIcon from 'lucide-react/dist/esm/icons/calendar';
import ListIcon from 'lucide-react/dist/esm/icons/list';

import { generateTOC, type TOCItem } from '@/core/docs/toc';
import { useTranslations } from '@/core/i18n/hooks';

import { MarkdownPreview } from '@/components/blocks/common/media/markdown-preview';
import { TableOfContents } from '@/components/blocks/common/media/table-of-contents';
import { Crumb } from '@/components/blocks/common/navigation/crumb';
import { type Post as PostType } from '@/types/blocks/blog';
import { NavItem } from '@/types/blocks/common';

export function BlogDetail({ post }: { post: PostType }) {
  const t = useTranslations('pages.blog');

  const crumbItems: NavItem[] = [
    {
      title: t('messages.crumb'),
      url: '/blog',
      icon: 'Newspaper',
      is_active: false,
    },
    {
      title: post.title || '',
      url: `/blog/${post.slug}`,
      is_active: true,
    },
  ];

  // Safely map post.toc to TOCItem[] if it exists, or generate from content
  const toc: TOCItem[] =
    (post.toc as any[])?.map((t: any) => ({
      title: t.title || t.text || '',
      url: t.url || (t.id ? `#${t.id}` : ''),
      depth: t.depth || t.level || 2,
    })) || (post.content ? generateTOC(post.content) : []);
  const showToc = toc.length > 0;

  // Check if Author info should be shown
  const showAuthor = post.author_name || post.author_image || post.author_role;

  // Calculate main content column span based on what sidebars are shown
  const getMainColSpan = () => {
    if (showToc && showAuthor) return 'lg:col-span-6';
    if (showToc || showAuthor) return 'lg:col-span-9';
    return 'lg:col-span-12';
  };

  return (
    <section id={post.id}>
      <div className="py-24 md:py-32">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
          <Crumb items={crumbItems} />

          {/* Header Section */}
          <div className="mt-16 text-center">
            <h1 className="mx-auto mb-4 w-full text-3xl font-bold text-foreground md:max-w-4xl md:text-4xl">
              {post.title}
            </h1>
            <div className="text-md mb-8 flex items-center justify-center gap-4 text-muted-foreground">
              {post.created_at && (
                <div className="text-md mb-8 flex items-center justify-center gap-2 text-muted-foreground">
                  <CalendarIcon className="size-4" /> {post.created_at}
                </div>
              )}
            </div>
          </div>

          {post.image && (
            <img
              src={post.image}
              alt={post.title || ''}
              width={1280}
              height={720}
              fetchPriority="high"
              className="mx-auto mt-10 aspect-video w-full max-w-5xl rounded-lg object-cover"
            />
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-8 md:mt-12 lg:grid-cols-12">
            {/* Table of Contents - Left Sidebar */}
            {showToc && (
              <div className="lg:col-span-3">
                <div className="sticky top-24 hidden md:block">
                  <div className="rounded-lg bg-muted/30 p-4">
                    <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                      <ListIcon className="size-4" />{' '}
                      {t('messages.toc') || 'On this page'}
                    </h2>
                    <TableOfContents toc={toc} />
                  </div>
                </div>
              </div>
            )}

            {/* Main Content - Center */}
            <div className={getMainColSpan()}>
              <article className="p-0">
                {post.body ? (
                  <div className="docs text-md space-y-4 font-normal text-foreground *:leading-relaxed">
                    {post.body}
                  </div>
                ) : (
                  post.content && (
                    <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground *:leading-relaxed">
                      <MarkdownPreview content={post.content} />
                    </div>
                  )
                )}
              </article>
            </div>

            {/* Author Info - Right Sidebar */}
            {showAuthor && (
              <div className="lg:col-span-3">
                <div className="sticky top-24">
                  <div className="rounded-lg bg-muted/30 p-6">
                    <div className="text-center">
                      {post.author_image && (
                        <div className="mx-auto mb-4 aspect-square size-20 overflow-hidden rounded-xl border border-transparent shadow-md ring-1 shadow-black/15 ring-foreground/10">
                          <img
                            src={post.author_image}
                            alt={post.author_name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      {post.author_name && (
                        <p className="mb-1 text-lg font-semibold text-foreground">
                          {post.author_name}
                        </p>
                      )}
                      {post.author_role && (
                        <p className="mb-4 text-sm text-muted-foreground">
                          {post.author_role}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
