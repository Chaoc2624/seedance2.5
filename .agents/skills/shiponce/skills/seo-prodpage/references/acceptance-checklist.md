# Production/Preview URL Acceptance Checklist

Executable gates for `seo-prodpage` (live public HTML). Authority remains
`../../../references/seo-operating-standard.md`. If a generic SEO habit
conflicts with the operating standard, **follow the operating standard**.

Severity: **错误** (P0) · **警告** (P1) · **提示** (P2)

## A. Document & head foundations

| ID  | Check                                                                 | Severity |
| --- | --------------------------------------------------------------------- | -------- |
| A1  | HTML has doctype, `lang` matches locale URL, charset + viewport       | 错误     |
| A2  | Exactly one non-empty `<title>`; page-specific; no template residue   | 错误     |
| A3  | Non-empty meta description; page-specific; not shared sitewide stub   | 错误     |
| A4  | No duplicate `<title>`, description, or canonical in one document     | 错误     |
| A5  | No `meta name="keywords"` content                                     | 警告     |
| A6  | Favicon / icon link present and resolvable                            | 警告     |
| A7  | Title/description length are reasonable for SERP (soft guidance only) | 提示     |

## B. Canonical, URL, status

| ID  | Check                                                               | Severity |
| --- | ------------------------------------------------------------------- | -------- |
| B1  | Self-canonical absolute HTTPS URL for indexable pages               | 错误     |
| B2  | Canonical matches preferred URL (host, path, trailing-slash policy) | 错误     |
| B3  | Missing slugs return real 404 (not soft-200 empty shell)            | 错误     |
| B4  | Tracking params (`utm_*`, `fbclid`) not baked into canonical        | 警告     |
| B5  | Public URLs use HTTPS; no mixed-content SEO assets                  | 错误     |

## C. Multilingual & hreflang (ShipOnce rules)

| ID  | Check                                                                 | Severity |
| --- | --------------------------------------------------------------------- | -------- |
| C1  | `hreflang` lists **only** locales with real equivalent content        | 错误     |
| C2  | Self-reference + absolute alternate URLs; `x-default` when applicable | 错误     |
| C3  | Never invent `zh` / `zh-hant` (or any locale) pointing at EN          | 错误     |
| C4  | Non-default locale URL does **not** serve default-language body       | 错误     |
| C5  | Published non-EN body is not a thin stub of EN (sections/depth)       | 错误     |
| C6  | Blog/detail `availableLocales` (or equivalent) drives alternates      | 错误     |

## D. Social & structured data

| ID  | Check                                                                 | Severity |
| --- | --------------------------------------------------------------------- | -------- |
| D1  | `og:title`, `og:description`, `og:url`, `og:image` absolute HTTPS     | 错误     |
| D2  | OG/Twitter values align with visible title/description/canonical      | 警告     |
| D3  | Required JSON-LD present for page type (home / article / FAQ, etc.)   | 警告     |
| D4  | JSON-LD is valid JSON, escaped for HTML, values match visible content | 错误     |
| D5  | Article pages include BlogPosting (or equivalent) with dates/author   | 警告     |

## E. Semantics & media

| ID  | Check                                                              | Severity |
| --- | ------------------------------------------------------------------ | -------- |
| E1  | One visible thematic `<h1>` aligned with title/intent              | 错误     |
| E2  | Heading levels do not skip absurdly; no H1 inside reusable cards   | 警告     |
| E3  | Informative images have descriptive `alt`; decorative use `alt=""` | 警告     |
| E4  | Primary content in a main landmark when structure allows           | 警告     |

## F. Crawl / index control

| ID  | Check                                                                 | Severity |
| --- | --------------------------------------------------------------------- | -------- |
| F1  | `/robots.txt` exists, allows public pages, disallows private surfaces | 错误     |
| F2  | robots points at production sitemap absolute URL                      | 警告     |
| F3  | `/sitemap.xml` (or index) exists; absolute HTTPS locs; no duplicates  | 错误     |
| F4  | Sitemap excludes noindex / private / non-existent locale URLs         | 错误     |
| F5  | Auth/account/admin/API not treated as indexable; noindex when needed  | 警告     |
| F6  | robots meta / X-Robots-Tag / robots.txt do not conflict               | 错误     |
| F7  | `/llms.txt` present for public products; no secrets or false claims   | 警告     |

## G. Integrity / SSR / security (stack-critical)

| ID  | Check                                                                   | Severity |
| --- | ----------------------------------------------------------------------- | -------- |
| G1  | Title, description, canonical, hreflang, JSON-LD appear in **SSR** HTML | 错误     |
| G2  | No `undefined` / `null` / empty string as emitted SEO metadata          | 错误     |
| G3  | No client-only head rewrite as the sole source of SEO tags              | 错误     |
| G4  | User/content fields in JSON-LD/title escaped (no tag breakout)          | 错误     |
| G5  | Public HTML free of template residue (ShipAny, PhotoAI, localhost, …)   | 错误     |
| G6  | 404 responses use 404 status with sensible title/robots behavior        | 警告     |

## H. Smoke probes (minimum set)

For `smoke` mode, always include:

1. `/` (default locale home)
2. One non-default locale home when locales exist
3. Pricing or primary conversion public page when present
4. Blog index + one published blog detail when blog is enabled
5. `/robots.txt`, `/sitemap.xml`, `/llms.txt`
6. One deliberate missing slug (expect 404)

For `matrix` / `full`, expand from sitemap and locale content matrix.

## Judgment notes

- Character-count ranges for title/description are **提示**, not automatic 错误
- Pagination `rel=prev/next` is optional 提示, not a ship blocker
- Prefer fewer full locales over many thin hreflang rows
- When unsure whether a locale body is “thin”, compare section jobs to EN
  (FAQ, tables, how-to blocks), not raw character ratio alone
