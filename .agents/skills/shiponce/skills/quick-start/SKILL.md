---
name: quick-start
description: Automate first-pass customization of a new shiponce project from a short project brief (app name, domain/app URL, product description/features, reference links, and branding preferences). Use when the user says they are starting a new project.
---

# Quick Start (Project Bootstrap)

This skill is intentionally split into small reference modules. Load only the module(s) you need.

## v1 edit scope (hard limit)

For the first pass, **only modify the files listed in** `references/09-checklist.md`.

- Do **not** change any other files (no routing, no components, no templates, no extra locale message files).
- Do **not** introduce login/auth/payment features unless explicitly requested.

## Dev workflow (required)

- Before starting edits: run `bun install` (once) to ensure dependencies are installed.
- After finishing all edits: **clear Vite cache** before validation, otherwise you may see stale assets:
  - macOS/Linux: `rm -rf .vinxi`
  - Windows (PowerShell): `Remove-Item -Recurse -Force .vinxi`
- Then run `bun run build` to validate the project. If it fails, fix issues **only within the v1 allowlist** unless the user expands scope.

## Project brief

Normalize the user's request first:

- `references/00-project-brief.md`

## Execution order

1. App basics (env-driven): `references/01-env-app-info.md`
2. SEO metadata: `references/02-seo-metadata.md`
3. Landing page (EN/ZH): `references/03-landing-page.md`
4. Theme styles: `references/04-theme-styles.md`
5. Logo + favicon: `references/05-logo-favicon.md`
6. Sitemap: `references/06-sitemap.md`
7. Legal pages: `references/07-legal-pages.md`
8. Images (extract from links or use Picsum placeholders): `references/08-images.md`
9. Minimal checklist: `references/09-checklist.md`

## Bundled script

- `scripts/fetch_og_image.py`: Best-effort OG/Twitter preview image downloader for a reference link.
