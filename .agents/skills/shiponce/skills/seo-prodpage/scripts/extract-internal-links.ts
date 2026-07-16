#!/usr/bin/env bun
/**
 * extract-internal-links.ts
 *
 * Discovery-only helper for seo-prodpage.
 * Fetches one page and prints same-origin <a href> URLs (sorted), one per line.
 * Does not judge SEO quality.
 *
 * Usage:
 *   bun .agents/skills/shiponce/skills/seo-prodpage/scripts/extract-internal-links.ts <url>
 */

const SKIP_SCHEMES = /^(javascript:|mailto:|tel:|sms:|data:)/i;

function usage(): never {
  console.error(
    'Usage: bun extract-internal-links.ts <url>\n' +
      'Prints same-origin internal links, one per line.'
  );
  process.exit(1);
}

function normalizeBase(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) usage();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function sameOrigin(a: URL, b: URL): boolean {
  return (
    a.protocol === b.protocol && a.host.toLowerCase() === b.host.toLowerCase()
  );
}

function extractHrefs(html: string): string[] {
  const hrefs: string[] = [];
  const re = /<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const raw = (match[1] ?? match[2] ?? match[3] ?? '').trim();
    if (raw) hrefs.push(raw);
  }
  return hrefs;
}

function toInternalUrl(base: URL, href: string): string | null {
  if (!href || href.startsWith('#') || SKIP_SCHEMES.test(href)) return null;
  let absolute: URL;
  try {
    absolute = new URL(href, base);
  } catch {
    return null;
  }
  if (!sameOrigin(base, absolute)) return null;
  absolute.hash = '';
  return absolute.href;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'ShipOnce-SEO-ProdPage/1.0 (link-discovery; +https://github.com/)',
      Accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return await res.text();
}

async function main(): Promise<void> {
  const arg = process.argv[2];
  if (!arg) usage();

  const baseHref = normalizeBase(arg);
  const base = new URL(baseHref);
  const html = await fetchHtml(base.href);
  const links = new Set<string>();

  for (const href of extractHrefs(html)) {
    const internal = toInternalUrl(base, href);
    if (internal) links.add(internal);
  }

  for (const link of [...links].sort((a, b) => a.localeCompare(b))) {
    console.log(link);
  }

  console.error(`Total: ${links.size} internal link(s)`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
