import { useMemo } from 'react';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

interface MDXContentProps {
  source: string;
}

/**
 * Render markdown content from a string source.
 * Replaces next-mdx-remote/rsc with a client-side unified pipeline.
 */
export function MDXContent({ source }: MDXContentProps) {
  const html = useMemo(() => {
    try {
      const result = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeSlug)
        .use(rehypeStringify)
        .processSync(source);
      return String(result);
    } catch {
      return source;
    }
  }, [source]);

  return (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
