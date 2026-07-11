/**
 * Docs content source — loads MDX files from content/docs/ via import.meta.glob.
 * Replaces fumadocs-core loader for TanStack Start.
 */
import { splitLocaleSuffix } from '@/config/locale';

import { generateHeadingId } from './toc';

// Pre-load all docs MDX files as raw strings
const docsFiles = import.meta.glob('/content/docs/**/*.mdx', {
  query: '?raw',
  eager: true,
}) as Record<string, { default: string }>;

export interface DocFrontmatter {
  title: string;
  description?: string;
  full?: boolean;
  icon?: string;
  [key: string]: any;
}

export interface DocEntry {
  slug: string;
  locale: string | undefined;
  frontmatter: DocFrontmatter;
  content: string;
}

/**
 * Parse frontmatter from raw MDX content.
 */
function parseFrontmatter(raw: string): {
  frontmatter: DocFrontmatter;
  content: string;
} {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!fmMatch) {
    return { frontmatter: { title: '' }, content: raw };
  }
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
  return { frontmatter: frontmatter as DocFrontmatter, content };
}

/**
 * Parse file path to extract slug and locale.
 * e.g. "/content/docs/getting-started.zh-tw.mdx" -> { slug: "getting-started", locale: "zh-tw" }
 * e.g. "/content/docs/index.mdx" -> { slug: "", locale: undefined }
 */
function parseDocPath(filePath: string): {
  slug: string;
  locale: string | undefined;
} {
  // Remove prefix and extension
  const rel = filePath.replace(/^\/content\/docs\//, '').replace(/\.mdx$/, '');

  const segments = rel.split('/');
  const last = segments[segments.length - 1];

  // Check for locale suffix: e.g. "index.zh" or "getting-started.zh"
  const { baseName, locale } = splitLocaleSuffix(last);
  if (locale) {
    segments[segments.length - 1] = baseName;
    const slug = segments.join('/');
    return {
      slug: slug === 'index' ? '' : slug,
      locale,
    };
  }

  const slug = segments.join('/');
  return {
    slug: slug === 'index' ? '' : slug,
    locale: undefined,
  };
}

/**
 * Get a single doc by slug and locale.
 * Returns null if not found.
 */
export function getDocBySlug(slug: string, locale: string): DocEntry | null {
  const normalizedSlug = slug || 'index';

  // Try localized file first, then default
  const candidates = [
    `/content/docs/${normalizedSlug}.${locale}.mdx`,
    `/content/docs/${normalizedSlug}/index.${locale}.mdx`,
    `/content/docs/${normalizedSlug}.mdx`,
    `/content/docs/${normalizedSlug}/index.mdx`,
  ];

  for (const path of candidates) {
    const file = docsFiles[path];
    if (file?.default) {
      const { frontmatter, content } = parseFrontmatter(file.default);
      const parsed = parseDocPath(path);
      return {
        slug: parsed.slug,
        locale: parsed.locale,
        frontmatter,
        content,
      };
    }
  }

  return null;
}

export interface DocNavItem {
  slug: string;
  title: string;
  url: string;
  content: string;
}

/**
 * Get all docs as a flat list for sidebar navigation.
 * Prefers current locale, falls back to default.
 */
export function getDocsList(locale: string): DocNavItem[] {
  const bySlug = new Map<
    string,
    { path: string; locale: string | undefined }
  >();

  for (const filePath of Object.keys(docsFiles)) {
    const { slug, locale: fileLocale } = parseDocPath(filePath);

    if (!bySlug.has(slug)) {
      bySlug.set(slug, { path: filePath, locale: fileLocale });
    } else {
      const existing = bySlug.get(slug)!;
      // Prefer current locale over default
      if (fileLocale === locale && existing.locale !== locale) {
        bySlug.set(slug, { path: filePath, locale: fileLocale });
      } else if (!fileLocale && existing.locale && existing.locale !== locale) {
        bySlug.set(slug, { path: filePath, locale: fileLocale });
      }
    }
  }

  const items: DocNavItem[] = [];
  for (const [slug, { path }] of bySlug.entries()) {
    const file = docsFiles[path];
    if (!file?.default) continue;
    const { frontmatter, content } = parseFrontmatter(file.default);
    items.push({
      slug,
      title: frontmatter.title || slug || 'Introduction',
      url: slug ? `/docs/${slug}` : '/docs',
      content,
    });
  }

  return items;
}

/* ─── Search index ────────────────────────────────────────────── */

export type SearchEntryType = 'page' | 'heading' | 'text';

export interface SearchEntry {
  /** 'page' = doc title, 'heading' = section heading, 'text' = paragraph */
  type: SearchEntryType;
  /** Which doc this belongs to */
  docSlug: string;
  docTitle: string;
  docUrl: string;
  /** Display text */
  text: string;
  /** For headings: the heading anchor id */
  anchor?: string;
}

/**
 * Build a flat search index from all docs.
 * Each doc produces: 1 page entry + N heading entries + M text entries.
 */
export function buildSearchIndex(locale: string): SearchEntry[] {
  const docs = getDocsList(locale);
  const entries: SearchEntry[] = [];

  for (const doc of docs) {
    const url = doc.url;

    // 1. Page-level entry
    entries.push({
      type: 'page',
      docSlug: doc.slug,
      docTitle: doc.title,
      docUrl: url,
      text: doc.title,
    });

    // 2. Extract headings and text paragraphs from content
    const lines = doc.content.split('\n');
    let currentParagraph = '';

    for (const line of lines) {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        // Flush paragraph
        if (currentParagraph.trim()) {
          entries.push({
            type: 'text',
            docSlug: doc.slug,
            docTitle: doc.title,
            docUrl: url,
            text: currentParagraph.trim(),
          });
          currentParagraph = '';
        }

        const headingText = headingMatch[2].trim();
        const anchor = generateHeadingId(headingText);

        entries.push({
          type: 'heading',
          docSlug: doc.slug,
          docTitle: doc.title,
          docUrl: url,
          text: headingText,
          anchor,
        });
      } else if (line.trim()) {
        currentParagraph += (currentParagraph ? ' ' : '') + line.trim();
      } else if (currentParagraph.trim()) {
        // Empty line = paragraph break
        entries.push({
          type: 'text',
          docSlug: doc.slug,
          docTitle: doc.title,
          docUrl: url,
          text: currentParagraph.trim(),
        });
        currentParagraph = '';
      }
    }

    // Flush remaining paragraph
    if (currentParagraph.trim()) {
      entries.push({
        type: 'text',
        docSlug: doc.slug,
        docTitle: doc.title,
        docUrl: url,
        text: currentParagraph.trim(),
      });
    }
  }

  return entries;
}
