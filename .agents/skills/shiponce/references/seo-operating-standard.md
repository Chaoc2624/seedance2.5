# SEO Operating Standard

Apply this reference for ShipOnce SEO, GEO/AI-search readiness, multilingual
indexability, metadata, canonical and hreflang, sitemaps, crawler-facing files,
JSON-LD, blog/detail pages, and indexation diagnostics. This reference owns
project-specific invariants; use `references/skill-routing.md` to select any
generic SEO skill needed for analysis, data, or focused verification.

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

### Non-EN body must not be thin (anti-pattern)

**Rule:** If a non-default locale page is published and indexable, its **body
content must carry comparable information density to the EN (or primary)
version** — not a title + short abstract pretending to be a full article.

Shipping “translation stubs” is a known anti-pattern in this stack:

| Anti-pattern                                          | Why it hurts                                                                  |
| ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| EN ~5–6k chars; ja/ko ~900–1.5k (~15–25% of EN)       | Thin content under a real hreflang locale; weak ranking and weak GEO citation |
| Keep EN tables/FAQ/recipes; cut them in other locales | Hreflang claims “equivalent page” while intent and utility are not equivalent |
| Machine-summary body + full EN metadata structure     | Looks localized in SERP, fails on-page depth and user trust                   |
| Publish many locales fast by summarizing              | Scale without quality; one thin locale can drag cluster quality               |

**Required standard for public blog / landing / SEO pages**

1. Prefer **fewer locales with full localization** over many stub locales.
2. If you publish a locale, keep the **same section jobs** as EN where
   applicable: definition, steps/recipes, comparison tables, limits, FAQ,
   CTA — adapted for local intent, not word-for-word paste.
3. As a practical bar for long articles: non-EN body should generally stay
   **well above a short summary** (stubs around **≤ ~30% of EN length with
   sections removed** are a red flag). Shorter languages (e.g. ja/ko) may use
   fewer characters than EN for the same facts, but must not drop whole
   decision tables, FAQs, or how-to blocks.
4. If you cannot localize fully, **do not publish that locale**: omit the
   row/file, exclude from hreflang and sitemap, and 404 the URL. Incomplete
   matrices are correct; thin indexable pages are not.
5. Review fail condition: “non-EN page exists in hreflang + is indexable +
   body is summary-only vs EN.”

This is **page content quality**, separate from head/hreflang wiring. Both
must pass.

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

### Chinese locales (`zh` / `zh-hant`) for outbound SaaS

These products are primarily **outbound / global SaaS**. Public landing and
marketing locales usually prioritize EN + target market languages over
Simplified/Traditional Chinese.

**Priority policy**

- Public landing, blog, pricing, and SEO pages: `zh` / `zh-hant` may be **lower
  priority** for new content creation and campaign localization.
- Admin / dashboard UI: when **adding or changing UI/UX**, still supply
  **Simplified Chinese (`zh`)** admin copy so operators can work in Chinese.
- Lower content priority is **not** permission to ship broken SEO on Chinese
  routes.

**Hard SEO rules when a Chinese (or any) route exists**

1. **No silent EN fallback under `/zh/...` or `/zh-hant/...`.** Missing locale
   content must `404` / `notFound`, or be explicitly `noindex` with a correct
   self-canonical — never render default-language body under a localized URL
   while claiming that locale.
2. **Hreflang must list only locales with real equivalent content.** Never emit
   `hreflang="zh"` or `hreflang="zh-hant"` that points at the EN URL. Never
   invent alternates for missing `zh` / `zh-hant`.
3. **Canonical stays on the current locale URL** when that locale has real
   content. Do not canonical every language to EN by default.
4. **Blog / detail `availableLocales` is the content matrix**, not the full
   site locale list. Derive it from published rows or real MDX files per slug.
5. **On-page SEO still applies on every live public route:** unique title and
   description, correct OG/Twitter, absolute image URL, JSON-LD where required
   (`BlogPosting` for articles), and no template residue. A weak single route
   can drag crawl/quality signals for the whole site.

Treat “we deprioritize Chinese landing content” as a **roadmap choice**, not as
skipping hreflang/canonical/title acceptance for routes that already resolve.

## Verification

For **live production or preview public URL acceptance** (multi-URL scan, severity
ledger under `tmp/seo-issues/`, post-deploy gate), use nested skill
`seo-prodpage` at `.agents/skills/shiponce/skills/seo-prodpage/SKILL.md`. That skill
executes this standard against real production/preview URLs; it does not replace
this document. Use generic `seo-page` for single-page analysis without a live
prod acceptance goal.

Run checks appropriate to the repo:

- Compare supported homepage locales with localized content files for every blog/detail page.
- For each public detail slug, list real content locales and confirm head
  `hreflang` matches that set only (especially that missing `zh` / `zh-hant`
  do **not** appear or point at EN).
- Spot-check `/zh/blog/<slug>` and `/zh-hant/blog/<slug>` when those locales are
  routable: expect `404` if content is missing, never EN body with indexable
  zh URL.
- Blog detail head must use the post title/description/image, not the generic
  blog index metadata string.
- For each published non-EN locale of a blog/detail page, compare body depth to
  EN: fail if the locale is a short stub (missing FAQ/tables/key sections, or
  roughly summary-only length). Prefer unpublishing the locale over shipping
  thin content under hreflang.
- Search for template residue: `rg "ShipAny|PhotoAI|localhost|example.com|TODO" src public content`.
- Build the app with the project's normal command.
- Inspect generated HTML or route head output for canonical, hreflang, and `application/ld+json`.
- Confirm `robots.txt`, `llms.txt`, and `sitemap.xml` are in the public output and use the production domain.
- If possible, validate JSON-LD with a structured data validator and test a few localized URLs with a crawler-like request.

## Cautions

- Do not add hreflang links for pages that do not exist or that duplicate another language.
- Do not point missing `zh` / `zh-hant` (or any missing locale) hreflang at EN
  “to fill the matrix.” Incomplete matrices are correct; false alternates are not.
- Do not ship non-EN public bodies as thin summaries of EN (anti-pattern:
  full EN article + ja/ko stub at a fraction of the length). Either full
  localization or no locale page.
- Do not canonical every language back to the default language when the localized page should rank independently.
- Do not add or reintroduce `meta name="keywords"` content. Use the visible page copy, headings, descriptions, canonical URLs, and structured data for relevance signals instead.
- Do not expose admin, account, API, payment callback, or private user surfaces in robots or llms files.
- Do not hand-edit generated route trees or generated sitemap artifacts unless that is the established project workflow.
- Preserve unrelated user changes in dirty working trees.
