import { createFileRoute } from '@tanstack/react-router';

import { useTranslations } from '@/core/i18n/hooks';

import ThemeDynamicPage from '@/themes/default/pages/dynamic-page';

import { MarkdownContent } from '@/components/blocks/common/content/markdown-content';
import { getHeadMeta } from '@/lib/seo';

// Parse markdown frontmatter
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

// Pre-load all local MDX pages
const localPages = import.meta.glob('/content/pages/**/*.mdx', {
  query: '?raw',
  eager: true,
}) as Record<string, { default: string }>;

export const Route = createFileRoute('/{-$locale}/_landing/privacy-policy')({
  component: PrivacyPolicyPage,
  head: ({ params }) => {
    // Attempt to extract title/description synchronously for head meta
    const slug = 'privacy-policy';
    const localizedPath = `/content/pages/${slug}.${params.locale}.mdx`;
    const defaultPath = `/content/pages/${slug}.mdx`;
    const indexPath = `/content/pages/${slug}/index.mdx`;

    // Find matching path by priority
    let matchPath;
    if (localPages[localizedPath]) matchPath = localizedPath;
    else if (localPages[defaultPath]) matchPath = defaultPath;
    else if (localPages[indexPath]) matchPath = indexPath;

    let title = undefined;
    let description = undefined;

    if (matchPath && localPages[matchPath]?.default) {
      const parsed = parseFrontmatter(localPages[matchPath].default);
      title = parsed.frontmatter.title;
      description = parsed.frontmatter.description;
    }

    return getHeadMeta({
      locale: params.locale,
      title,
      description,
    });
  },
});

function PrivacyPolicyPage() {
  const { locale } = Route.useParams();
  const slug = 'privacy-policy';

  // Try parsing from local pages
  const localizedPath = `/content/pages/${slug}.${locale}.mdx`;
  const defaultPath = `/content/pages/${slug}.mdx`;
  const indexPath = `/content/pages/${slug}/index.mdx`;

  // Find matching path by priority
  let matchPath;
  if (localPages[localizedPath]) matchPath = localizedPath;
  else if (localPages[defaultPath]) matchPath = defaultPath;
  else if (localPages[indexPath]) matchPath = indexPath;

  if (matchPath && localPages[matchPath]?.default) {
    const parsed = parseFrontmatter(localPages[matchPath].default);

    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-24">
        <h1 className="mb-8 text-4xl font-bold">{parsed.frontmatter.title}</h1>
        {parsed.frontmatter.description && (
          <p className="mb-8 text-lg text-muted-foreground">
            {parsed.frontmatter.description}
          </p>
        )}
        <div className="prose dark:prose-invert max-w-none">
          <MarkdownContent content={parsed.content} />
        </div>
      </div>
    );
  }

  // Fallback to JSON translations map
  const messageKey = `pages.${slug.replace(/\//g, '.')}`;
  const t = useTranslations(messageKey);

  try {
    const pageData = t.raw('page');
    if (pageData) {
      return <ThemeDynamicPage locale={locale} page={pageData as any} />;
    }
  } catch {
    // Translation not found
  }

  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
      </div>
    </div>
  );
}
