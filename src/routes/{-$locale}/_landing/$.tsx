import { createFileRoute, notFound } from '@tanstack/react-router';

import { useTranslations, getTranslations } from '@/core/i18n/hooks';

import { defaultLocale } from '@/config/locale';

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

export const Route = createFileRoute('/{-$locale}/_landing/$')({
  component: CatchAllPage,
  loader: ({ params }) => {
    const locale = params.locale || defaultLocale;
    const slug = params._splat || '';

    const localizedPath = `/content/pages/${slug}.${locale}.mdx`;
    const defaultPath = `/content/pages/${slug}.mdx`;
    const indexPath = `/content/pages/${slug}/index.mdx`;

    // Validate if page exists
    const existsInMdx = !!(
      localPages[localizedPath] ||
      localPages[defaultPath] ||
      localPages[indexPath]
    );
    if (existsInMdx) return;

    const messageKey = `pages.${slug.replace(/\//g, '.')}`;
    const t = getTranslations(messageKey);
    const pageData = t.raw('page');

    const existsInJson =
      pageData &&
      typeof pageData === 'object' &&
      !Array.isArray(pageData) &&
      typeof (pageData as any).title !== 'undefined';
    if (existsInJson) return;

    // Throw notFound before React renders to ensure proper 404 status and page presentation
    throw notFound();
  },
  head: ({ params }) => {
    // Attempt to extract title/description synchronously for head meta
    const slug = params._splat || '';
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

function CatchAllPage() {
  const { locale, _splat } = Route.useParams();
  const slug = _splat || '';

  // Try parsing from local pages
  const localizedPath = `/content/pages/${slug}.${locale}.mdx`;
  const defaultPath = `/content/pages/${slug}.mdx`;
  const indexPath = `/content/pages/${slug}/index.mdx`;

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
    // i18next returns the key string if translation is missing, so we must check if it's an actual object
    if (
      pageData &&
      typeof pageData === 'object' &&
      !Array.isArray(pageData) &&
      typeof (pageData as any).title !== 'undefined'
    ) {
      return <ThemeDynamicPage locale={locale} page={pageData as any} />;
    }
  } catch {
    // Translation not found
  }

  return null;
}
