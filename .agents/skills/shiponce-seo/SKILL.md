---
name: shiponce-seo
description: ShipOnce SEO operating standard for product sites. Use when optimizing or reviewing SEO, GEO/AI-search readiness, multilingual indexability, metadata, canonicals, hreflang, sitemaps, robots.txt, llms.txt, JSON-LD, blog/detail pages, or GSC "crawled but not indexed" issues. Keeps traditional SEO, GEO, and crawl/indexability concerns separated under one ShipOnce standard.
---

# shiponce-seo

## Workflow

1. Inspect the routing, locale config, content source, metadata helper, sitemap generator, and public assets before editing.
2. Map every public indexable URL by page type: homepage, blog index, blog detail, category/tag pages, static MDX pages, auth/account/admin pages, and API routes.
3. Classify each issue before changing code:
   - **SEO**: titles, descriptions, canonicals, headings, internal links, schema, sitemap, robots, performance-facing metadata.
   - **GEO / AI Search**: answerability, citation readiness, factual consistency, FAQs, `llms.txt`, structured data usefulness.
   - **Indexability**: crawlability, duplicate localization, noindex rules, hreflang coverage, sitemap inclusion/exclusion.
4. For multilingual pages, verify whether each locale has real localized content. Do not let indexable non-default locale URLs silently render default-language content.
5. Fix canonical and hreflang together:
   - Canonical should normally be the current locale's stable URL.
   - `hreflang` alternates should include only locales with real equivalent content.
   - Add `x-default` to the default-locale URL when the site has a clear default.
6. Generate or update the sitemap with the production domain. Include only URLs worth indexing and avoid missing-locale variants that would duplicate another language.
7. Add crawler-facing public files:
   - `robots.txt`: allow public pages, disallow API/admin/account/auth/private surfaces, and point to the production sitemap.
   - `llms.txt`: summarize the product, important URLs, multilingual variants, crawl guidance, and a short suggested citation. Do not include secrets, private paths, or marketing claims the product cannot support.

## SEO

- Localize titles, meta descriptions, headings, and visible page summaries.
- Keep titles and descriptions factual, page-specific, and aligned with visible copy.
- Do not emit `meta name="keywords"` or fill keyword text fields; keep keyword lists empty/omitted because modern search engines ignore them and they can create spam signals.
- Add JSON-LD through the existing head/SEO abstraction:
  - Homepage: `Organization`, `WebSite`, `SoftwareApplication` or relevant product schema, and `FAQPage` when real FAQs exist.
  - Blog detail: `BlogPosting` with localized title/description, canonical URL, image, publish/modified date, author, publisher, and main entity URL.
  - Keep URLs absolute and derived from the production app URL config.
  - Escape serialized JSON-LD before embedding in HTML, at least replacing `<` with `\u003c`.

## GEO / AI Search

- Make the product answerable: short definition near the top, direct FAQ answers, clear feature lists, supported formats/platforms, privacy/security claims, pricing/free limits, and update dates where appropriate.
- Make pages citable: stable canonical URLs, factual sentences, named organization/publisher, publish and modified dates for articles, and consistent brand facts across homepage, blog, `llms.txt`, JSON-LD, and metadata.
- Prefer concise Q-style headings and answer-first paragraphs for FAQ and how-to content.
- Avoid vague AI-search claims. If the site says processing is local, browser-based, free, or private, confirm the app actually behaves that way.

## Indexability

- A localized URL is indexable only when it has meaningful localized content or a deliberate localized landing experience.
- If the default locale is used as fallback for missing content, make that fallback non-indexable or return not found for non-default locales.
- Blog detail pages should expose `availableLocales` or an equivalent list so the head can emit accurate alternates.
- Blog indexes in non-default locales should list only posts that actually exist in that locale unless the UI clearly marks translated availability.
- Dynamic MDX/static pages should not fallback to the default locale under a localized URL unless canonical/noindex behavior is explicit.
- For thin category/tag pages, either strengthen them with useful localized intro content and internal links or exclude/noindex them. Do not pretend a thin listing page is a strong landing page.

## Verification

Run checks appropriate to the repo:

- Compare supported homepage locales with localized content files for every blog/detail page.
- Search for template residue: `rg "ShipAny|PhotoAI|localhost|example.com|TODO" src public content`.
- Build the app with the project's normal command.
- Inspect generated HTML or route head output for canonical, hreflang, and `application/ld+json`.
- Confirm `robots.txt`, `llms.txt`, and `sitemap.xml` are in the public output and use the production domain.
- If possible, validate JSON-LD with a structured data validator and test a few localized URLs with a crawler-like request.

## Cautions

- Do not add hreflang links for pages that do not exist or that duplicate another language.
- Do not canonical every language back to the default language when the localized page should rank independently.
- Do not add or reintroduce `meta name="keywords"` content. Use the visible page copy, headings, descriptions, canonical URLs, and structured data for relevance signals instead.
- Do not expose admin, account, API, payment callback, or private user surfaces in robots or llms files.
- Do not hand-edit generated route trees or generated sitemap artifacts unless that is the established project workflow.
- Preserve unrelated user changes in dirty working trees.
