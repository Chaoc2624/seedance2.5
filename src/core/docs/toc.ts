export interface TOCItem {
  title: string;
  url: string;
  depth: number;
}

/**
 * Generate TOC (Table of Contents) from markdown content.
 * Extracts headings (h1-h6) and generates anchor links.
 */
export function generateTOC(content: string): TOCItem[] {
  if (!content) return [];

  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const toc: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const url = `#${generateHeadingId(text)}`;

    toc.push({
      title: text,
      url,
      depth: level,
    });
  }

  return toc;
}

/**
 * Generate heading ID from text.
 * Mirrors rehype-slug behavior.
 */
export function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/(^-|-$)/g, '');
}
