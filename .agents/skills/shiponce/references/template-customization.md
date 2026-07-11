# Template Customization Reference

## Theme Block System

All theme blocks live in `src/themes/default/blocks/`. Each block is a self-contained React component using Tailwind CSS. Blocks are composed into pages by the theme system and `scripts/init/generate-landing.ts`.

### Available Blocks

| Block                 | File                        | Purpose                      |
| --------------------- | --------------------------- | ---------------------------- |
| Blog                  | `blog.tsx`                  | Blog post listing with cards |
| Blog Detail           | `blog-detail.tsx`           | Single blog post view        |
| CTA                   | `cta.tsx`                   | Call-to-action section       |
| FAQ                   | `faq.tsx`                   | Accordion FAQ section        |
| Features              | `features.tsx`              | Feature highlights grid      |
| Features Accordion    | `features-accordion.tsx`    | Accordion-style features     |
| Features Flow         | `features-flow.tsx`         | Flow/process features        |
| Features List         | `features-list.tsx`         | Bulleted features list       |
| Features Media        | `features-media.tsx`        | Features with media/images   |
| Features Step         | `features-step.tsx`         | Step-by-step features        |
| Footer                | `footer.tsx`                | Site footer                  |
| Gallery Grid          | `gallery-grid.tsx`          | Image gallery grid           |
| GPT Image Benefits    | `gpt-image-benefits.tsx`    | AI image benefits display    |
| Header                | `header.tsx`                | Landing page header/hero     |
| Hero                  | `hero.tsx`                  | Hero section                 |
| Logos                 | `logos.tsx`                 | Partner/client logo strip    |
| Page Detail           | `page-detail.tsx`           | Static page renderer         |
| Pricing               | `pricing.tsx`               | Pricing plans table          |
| Prompt Showcase       | `prompt-showcase.tsx`       | AI prompt examples           |
| Showcases             | `showcases.tsx`             | Showcase listing             |
| Showcases Flow        | `showcases-flow.tsx`        | Flow-style showcases         |
| Social Avatars        | `social-avatars.tsx`        | Social proof avatars         |
| Stats                 | `stats.tsx`                 | Statistics/metrics display   |
| Subscribe             | `subscribe.tsx`             | Email subscribe form         |
| Testimonials          | `testimonials.tsx`          | Customer testimonials        |
| Updates               | `updates.tsx`               | Changelog/updates listing    |
| Creator Feedback Wall | `creator-feedback-wall.tsx` | Public feedback display      |

### Pages

- `src/themes/default/pages/dynamic-page.tsx` — renders locale JSON-driven pages
- `src/themes/default/pages/static-page.tsx` — renders simple static pages

### Layouts

- `src/themes/default/layouts/landing.tsx` — main landing page layout

### Landing Generation

`scripts/init/generate-landing.ts` composes landing pages from theme blocks. The block list is driven by the selected init template (`scripts/init/templates/`). When adding a block, also add its mapping in the relevant template file.

## Magic UI Components

`src/components/magicui/` contains 8 animated visual effect components:

| Component              | File                         | Effect                            |
| ---------------------- | ---------------------------- | --------------------------------- |
| Animated Theme Toggler | `animated-theme-toggler.tsx` | Animated light/dark toggle button |
| Avatar Circles         | `avatar-circles.tsx`         | Overlapping circular avatars      |
| Border Beam            | `border-beam.tsx`            | Animated border glow effect       |
| Meteors                | `meteors.tsx`                | Falling meteor animation          |
| Particles              | `particles.tsx`              | Floating particle background      |
| Retro Grid             | `retro-grid.tsx`             | Retro grid background pattern     |
| Ripple                 | `ripple.tsx`                 | Click ripple effect               |
| Text Shimmer           | `text-shimmer.tsx`           | Shimmering text animation         |

These are used primarily in hero sections, feature highlights, and landing page visual accents. They are self-contained and importable from `@/components/magicui/*`.

## Utility Libraries

`src/lib/` contains 13 shared utility modules:

| Module             | File                    | Purpose                                             |
| ------------------ | ----------------------- | --------------------------------------------------- |
| Browser            | `browser.ts`            | Client-side browser detection                       |
| Cache              | `cache.ts`              | In-memory cache with TTL                            |
| Cloudflare Image   | `cloudflare-image.ts`   | Cloudflare Image optimization URLs                  |
| Configured Links   | `configured-links.ts`   | App-wide link configuration                         |
| Cookie             | `cookie.ts`             | Cookie read/write helpers                           |
| Device Fingerprint | `device-fingerprint.ts` | Browser fingerprinting                              |
| Env                | `env.ts`                | Runtime environment detection (Node/Worker/browser) |
| Hash               | `hash.ts`               | UUID/hash generation                                |
| IP                 | `ip.ts`                 | Client IP extraction from request                   |
| Rate Limit         | `rate-limit.ts`         | Request rate limiting                               |
| Response           | `resp.ts`               | HTTP response helpers                               |
| SEO                | `seo.ts`                | Head metadata generation                            |
| Time               | `time.ts`               | Date/time formatting utilities                      |
| Utils              | `utils.ts`              | General-purpose helpers                             |

Import from `@/lib/*`. Keep server-only utilities out of client bundles.

## Block Component Catalog

`src/components/blocks/` is organized by domain:

### Common (`blocks/common/`)

- **branding/**: brand-logo, copyright, top-banner
- **content/**: markdown-content, markdown-editor, mdx-content, section-header
- **media/**: app-image, audio-player, lazy-image, markdown-preview, table-of-contents
- **navigation/**: back-to-top, crumb, page-header, pagination, tabs
- **other/**: empty, error-boundary, locale-detector, locale-selector, smart-icon, theme-toggler, utm-capture, not-found

### Form (`blocks/form/`)

- checkbox, form-card, input, markdown, select, switch, upload-image

### Panel (`blocks/panel/`)

- panel-card

### Payment (`blocks/payment/`)

- payment-modal, payment-providers

### Sign (`blocks/sign/`)

- sign-in-form, sign-up-form, sign-user, social-providers

### Table (`blocks/table/`)

- copy, dropdown

### Email (`blocks/email/`)

- verification-code, verify-email

## Cross-References

- For landing page content replacement flow: `references/media-and-content-replacement.md`
- For header/layout/sidebar UI: `references/layout-and-header.md`
- For feature workflows (AI, payment, auth): `references/feature-workflows.md`
- For architecture and directory ownership: `references/architecture.md`
