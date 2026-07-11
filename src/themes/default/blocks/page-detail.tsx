import CalendarIcon from 'lucide-react/dist/esm/icons/calendar';
// TimerIcon not used currently; add if needed

import { MarkdownPreview } from '@/components/blocks/common/media/markdown-preview';
import { type Post as PostType } from '@/types/blocks/blog';

// docs styles removed with docs system

export async function PageDetail({ post }: { post: PostType }) {
  return (
    <section id={post.id}>
      <div className="py-24 md:py-32">
        <div className="mx-auto w-full max-w-4xl px-6 md:px-8">
          <div className="mt-16 text-center">
            <h1 className="mx-auto mb-4 w-full text-xl font-bold text-foreground md:max-w-4xl md:text-4xl">
              {post.title}
            </h1>
            <div className="text-md mb-8 flex items-center justify-center gap-4 text-muted-foreground">
              {post.description}
            </div>
            {post.created_at && (
              <div className="text-md mb-8 flex items-center justify-center gap-2 text-muted-foreground">
                <CalendarIcon className="size-4" /> {post.created_at}
              </div>
            )}
          </div>

          <div className="relative mt-8 rounded-3xl border border-transparent px-4 shadow ring-1 ring-foreground/5 md:px-8">
            <div>
              {post.body ? (
                <div className="docs text-md my-8 space-y-4 font-normal text-foreground *:leading-relaxed">
                  {post.body}
                </div>
              ) : (
                <>
                  {post.content && (
                    <div className="my-8 space-y-4 text-lg text-muted-foreground *:leading-relaxed">
                      <MarkdownPreview content={post.content} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
