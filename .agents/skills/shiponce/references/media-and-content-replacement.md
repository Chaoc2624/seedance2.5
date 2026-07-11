# Media and Content Replacement Sub-Skill

Use this when the user asks to replace landing modules, showcases, testimonials, partner logos, brand copy, or public images from natural language and optional image files.

## Core Rule

Rendered landing modules are mostly configuration-driven. Prefer editing locale JSON and assets first; edit React blocks only when the block schema or rendering behavior must change.

Public files under `public/` are referenced without the `public` prefix:

- `public/imgs/features/admin.png` -> `/imgs/features/admin.png`
- `public/imgs/avatars/1.png` -> `/imgs/avatars/1.png`
- `public/imgs/cases/5.png` -> `/imgs/cases/5.png`
- `public/logo.png` -> `/logo.png`

Rendering primitives:

- Use native `<img>` directly for one-off images when no shared behavior is needed.
- Use `src/components/blocks/common/media/app-image.tsx` for repeated app/template images that should share default native `loading` and `decoding` behavior.
- Use `src/components/blocks/common/media/lazy-image.tsx` for lightweight lazy image rendering in data-driven blocks.
- Use `@/core/i18n/navigation` for internal and locale-aware navigation. Use plain `<a>` for external URLs, anchors, and email links.
- Keep rendering primitives based on native `<img>` and `<a>` behavior so SSR works on Cloudflare Pages and Workers.
- Do not add framework-specific image/link wrappers or browser-only lazy image libraries to shared SSR blocks.

## Request Workflow

1. Inspect `git status --short` and identify whether the request targets existing modules, generated template defaults, or both.
2. Convert the user's natural language into a module spec: target page, target locales, section ids, item count, copy tone, links, image intent, and whether old assets should be overwritten.
3. If the user supplies image files, copy them into the correct `public/imgs/*` bucket with lowercase hyphenated names. Preserve useful extensions (`.svg` for logos, `.png/.jpg/.webp` for raster). Do not invent external image URLs.
4. If no images are supplied, reuse semantically closest existing assets from the relevant bucket, or create a new local asset only when the user explicitly asks for generated/custom images.
5. Update all locale JSON files for the module unless the user names specific locales. Keep each locale localized; do not leave one locale with old product copy.
6. For generated init/template defaults, also update `scripts/init/templates/base.ts` and, where fallback images are assigned, `scripts/init/config-writer.ts`.
7. Validate JSON and formatting. Run `bunx oxfmt --check <edited files>` after edits.

## Locale and Page Map

Existing locale roots live under `src/config/locale/*`.

- Landing page modules: `src/config/locale/{locale}/pages/index.json`
- Showcases page: `src/config/locale/{locale}/pages/showcases.json`
- Header/footer brand and navigation: `src/config/locale/{locale}/landing.json`
- Admin sidebar brand: `src/config/locale/{locale}/admin/sidebar.json`
- Blog/posts/logs images: `content/**/*.mdx`
- Generated landing skeletons: `scripts/init/templates/base.ts`
- AI-generated landing writer: `scripts/init/config-writer.ts`

## Module Map

| User intent               | Primary config                                                              | Asset bucket                                       | Important fields                                                                                                                                                        | Template defaults                                               |
| ------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Hero copy or screenshots  | `pages/index.json -> page.sections.hero`                                    | `public/imgs/features`                             | `title`, `description`, `tip`, `highlight_text`, `announcement`, `avatars_tip`, `buttons`, `image`, `image_invert`, `background_image`                                  | `heroSkeleton` in `scripts/init/templates/base.ts`              |
| Partner/customer logos    | `pages/index.json -> page.sections.logos`                                   | `public/imgs/logos`                                | `title`, `items[].title`, `items[].image.src`, `items[].image.alt`                                                                                                      | `logosSkeleton`                                                 |
| Product intro block       | `pages/index.json -> page.sections.introduce`                               | `public/imgs/features`                             | `title`, `description`, `image`, `items[].title`, `items[].description`, `items[].icon`, `items[].image`                                                                | `introduceSkeleton`; fallback item images in `config-writer.ts` |
| Benefit accordion         | `pages/index.json -> page.sections.benefits`                                | `public/imgs/features`                             | `title`, `description`, `items[].title`, `items[].description`, `items[].icon`, `items[].image`                                                                         | `benefitsSkeleton`; fallback item images in `config-writer.ts`  |
| Usage/how-it-works steps  | `pages/index.json -> page.sections.usage`                                   | `public/imgs/features`                             | `title`, `description`, `items[].title`, `items[].description`, `items[].image`, `image_position`, `text_align`                                                         | `usageSkeleton`; fallback item images in `config-writer.ts`     |
| Feature grid text         | `pages/index.json -> page.sections.features`                                | usually none                                       | `title`, `description`, `items[].title`, `items[].description`, `items[].icon`                                                                                          | `featuresSkeleton`                                              |
| Social proof/testimonials | `pages/index.json -> page.sections.testimonials`                            | `public/imgs/avatars`                              | `title`, `description`, `items[].name`, `items[].role`, `items[].quote`, `items[].image`                                                                                | `testimonialsSkeleton`; fallback avatars in `config-writer.ts`  |
| Hero avatar strip         | `src/themes/default/blocks/social-avatars.tsx`                              | `public/imgs/avatars`                              | hardcoded `avatars` array; `avatars_tip` remains in locale JSON                                                                                                         | none                                                            |
| Case studies/showcases    | `pages/showcases.json -> page.sections.showcases`                           | `public/imgs/cases`                                | `metadata`, `page.title`, `title`, `description`, `groups[]`, `items[].title`, `items[].description`, `items[].url`, `items[].target`, `items[].image`, `items[].group` | none                                                            |
| Brand logo/name           | `landing.json`, `admin/sidebar.json`, `.env.example`, `src/config/index.ts` | usually `public/logo.png`, not `public/imgs/logos` | `brand.title`, `brand.logo`, `brand.description`, `VITE_APP_NAME`, `VITE_APP_LOGO`                                                                                      | init defaults and runtime config                                |
| Blog/update images        | `content/**/*.mdx`                                                          | `public/imgs/features` or dedicated bucket         | frontmatter `image`, `author_image`, inline Markdown image paths                                                                                                        | none                                                            |

## Natural Language Replacement Rules

- When the user says "把首页改成 X 产品", update landing sections coherently: hero, introduce, benefits, usage, features, stats, testimonials, faq, cta, and relevant logos.
- When the user says "替换案例/客户案例", update `showcases.json` groups and items. Keep every `item.group` present in `groups[].name`.
- When the user says "替换头像/评价", update testimonials in `pages/index.json`; update `social-avatars.tsx` only if the hero overlapping avatar strip itself should change.
- When the user says "替换 logos", distinguish partner logos in `/imgs/logos/*` from the app brand logo `/logo.png`.
- When the user provides fewer images than items, assign provided images first and reuse existing bucket images for the remainder unless the user asks to reduce item count.
- When item counts change, keep layout-friendly counts: 4 intro items, 3 benefits, 4 usage steps, 6 feature cards, 6 testimonials, 6 logos, 6-9 showcases are good defaults.
- Always update `image.alt` with meaningful product/customer/person names instead of generic `showcases` or `avatar` when the content is known.

## Asset Handling

- Prefer adding new asset files over overwriting template assets. Overwrite only when the user explicitly asks for a global replacement.
- Use stable public paths in config. Avoid absolute filesystem paths, `file://`, remote URLs, or data URIs in locale JSON.
- Keep SVG logos as SVG where possible. Raster screenshots and avatars should use `.webp` or `.png` unless the source extension matters.
- If replacing a referenced asset globally, search first: `rg -n "/imgs/(features|avatars|cases|logos)/old-name" src content scripts public`.
- If adding a new asset path, make sure the file exists under `public/` and every config reference starts with `/imgs/...` or `/logo.png`.

## Editing Mechanics

- Use structured JSON edits where practical. Avoid broad string replacement across all locale files unless the replacement is intentionally global.
- Preserve `page.show_sections`; add a section id there only when enabling a new section.
- Do not hand-edit `src/routeTree.gen.ts` for media/content changes.
- React block files in `src/themes/default/blocks/*` should only change for new fields, hardcoded avatar strip changes, or layout/rendering changes.
- If generated template defaults should match the edited landing page, update `scripts/init/templates/base.ts` static images and `ai_hint`, then update `scripts/init/config-writer.ts` image fallback behavior if needed.

## Verification

- Check JSON parse for edited locale files.
- Run `bunx oxfmt --check <edited docs/json/ts/tsx/mdx files>`.
- For visual changes, run the dev server and inspect the affected page when practical. Key pages: `/`, `/showcases`, `/blog`, `/updates`.
