# Layout and Header Reference

Covers the public landing layout, the `top` vs `left` header switch, and the
sidebar (left header) UI patterns. Read this when changing landing layout
shape, header position, sidebar UI, or any utility (theme/locale/sign-in)
that surfaces inside the sidebar.

## Source of Truth

Layout primitives live in `src/config/layout.ts`:

- `HeaderPosition = 'top' | 'left'`
- `DEFAULT_HEADER_POSITION = 'top'`
- `SIDE_HEADER_COLLAPSED_WIDTH = 68`
- `SIDE_HEADER_EXPANDED_WIDTH = 208`
- `normalizeHeaderPosition(value)` for env/DB string coercion

Do not duplicate these constants in component or theme code. Import them.

## Runtime Setting

`layout_header_position` is a runtime setting, not a build-time env.

- Default: `src/config/runtime.defaults.ts` → `layout_header_position: 'top'`
- Env override: `LAYOUT_HEADER_POSITION` in `.env.development`,
  `wrangler.toml`, or the platform's bound vars
- Read on the server via `getRuntimeConfig()` and exposed to the landing
  layout by `getLandingLayoutDataFn` in `src/server/root.functions.ts`
- Consumed by `src/routes/{-$locale}/_landing/route.tsx` which calls the
  loader and forwards `headerPosition` to the theme `LandingLayout`
- Theme entry point: `src/themes/default/layouts/landing.tsx` accepts
  `headerPosition` and applies sidebar `paddingLeft` only when `'left'`
- Mobile-first rule: even when `headerPosition === 'left'`, the left sidebar
  is desktop-only. On mobile/tablet widths, keep the public header at the
  top and do not leave sidebar padding behind.

When adding new public layout settings, follow the same path:
default → env → loader server fn → route loader → theme layout prop.

## Init Script Convention

`scripts/init/init-project.ts` prompts for header layout with `p.select(...)` and
writes the value into the generated `.env.development`. Mirror this pattern
for any new layout choice:

1. Add a `select` prompt with stable string values
2. Type the result so `'top' | 'left'` etc. is preserved
3. Bake the value into the generated env file
4. Echo the choice in the "Next steps" summary so the user can see it

Keep `.env.example` and `wrangler.toml.example` in sync with new settings.

## Mobile-First Contract

For public layout work, mobile friendliness is required by default.

- `left` header mode means desktop uses the fixed left sidebar, while mobile
  still uses the top header and hamburger menu.
- Do not apply sidebar spacing globally with inline `paddingLeft`; scope it
  to desktop breakpoints only, or mobile will retain a dead left gutter.
- When a desktop interaction has no strong mobile version, simplify it on
  small screens instead of forcing the desktop pattern through.
- Verify tap targets, header visibility, and menu reachability on narrow
  screens before polishing desktop-only behavior.

## Sidebar (Left Header) Implementation Rules

The left header lives in `src/themes/default/blocks/header.tsx`. Several
non-obvious rules keep its transitions and active states correct.

### 1. Hoist all sidebar sub-components to module scope

Do NOT define `SideHeader`, `SideNavMenu`, `SideNavItemLink`,
`SideUtilityPanel`, or any other sidebar-only helper inside `Header()` as
inline closures. Inline closures get a new function reference on every
parent render; React reconciles them as a different component type and
remounts the entire DOM subtree. CSS transitions need the _same_ DOM node
to persist between style changes — remounting silently kills every
`transition: ...` declaration on the sidebar.

Pass any closed-over values (header data, `pathname`, `activeHash`,
`isSideHeaderCollapsed`, callbacks) explicitly via props.

### 2. Keep transitions in sync

The sidebar element animates its inline `width` and the landing layout
animates its `paddingLeft`. Use the same duration and easing on both:

```ts
transition: 'width 300ms ease-out, min-width 300ms ease-out, max-width 300ms ease-out';
// and on the layout wrapper
transition: 'padding-left 300ms ease-out';
```

Do not introduce a third timing in any sidebar child.

### 3. Use inset shadow, not `border-r`, for the sidebar divider

A 1px `border-r` consumes 1px of the sidebar's content area
(box-sizing: border-box). Inner wrappers that target the full collapsed
width (`w-[var(--landing-side-header-collapsed-width)]` = 68px) then
overflow by 1px and sub-pixel-rounded differently each animation frame,
producing visible 1–2px jitter on logos and pinned icons. Use:

```
shadow-[inset_-1px_0_0_rgba(15,23,42,0.1),18px_0_45px_-32px_rgba(15,23,42,0.24)]
```

instead of `border-r border-foreground/10`. The painted divider line is
identical; layout space is preserved.

### 4. Active pill needs symmetric horizontal breathing room

The side nav container should use `px-2` (or equivalent) so the active
background pill has equal gaps on both sides in collapsed AND expanded
state. Set the link to `w-full` in both states and shrink the icon column
to `w-[calc(var(--landing-side-header-collapsed-width)-1rem)]` so the icon
stays centered within the padded area. Section title indents adjust to
match.

### 5. Anchor scroll-spy

`isActivePath()` correctly excludes anchor URLs (`/#features`) for the top
nav, but the sidebar should highlight the section currently in view.
Reuse the IntersectionObserver pattern from
`src/components/blocks/common/media/table-of-contents.tsx`:

- Collect anchor IDs from the visible nav items
- Observe matching elements with `rootMargin: '-20% 0px -70% 0px'`
- Update an `activeHash` state when a section intersects
- Reset `activeHash = ''` when `pathname` changes — otherwise an old
  page's hash bleeds into the new route and lights up an item the new
  page doesn't even contain
- On click, optimistically set `activeHash` and lock the observer for
  ~600ms so the smooth-scroll doesn't immediately overwrite it

### 6. Stable icon position during width transitions

When a sidebar utility button shrinks from `w-[10.5rem]` to `w-11`, the
icon must NOT teleport. Common bug: toggling `justify-start ↔
justify-center` or `px-3 ↔ px-0` between collapsed and expanded states.
`justify-content` and `padding` are not interpolated when the className
swaps, so at frame 0 the icon snaps to the new layout position while only
`width` smoothly transitions.

Rule: keep `justify-content` and effective left-padding identical in both
collapsed and expanded variants. Only `width` (and right-padding, which
just trims dead space) should change between states. The icon stays
glued to its left-padding offset throughout the 300ms shrink.

### 7. Component contracts to consume from blocks

The sidebar relies on prop surfaces added to shared blocks:

- `LocaleSelector` accepts `compact` — hides the label text via `sr-only`
  and removes the chevron, leaving just the flag
- `SignUser` accepts `iconOnly`, `showIcon`, `showName`, `className`, and
  `buttonClassName` so the sidebar can swap the rendered button between
  icon-only (collapsed) and icon+label (expanded) modes without
  duplicating the component. `showName` (default `false`) opts the
  signed-in trigger into avatar + display-name layout; only turn it on
  where the trigger is wider than a round icon button (e.g. the
  expanded sidebar). Leaving it off preserves the round-avatar layout
  used by the top header and mobile menu.

When you add a new utility that needs a sidebar variant, follow the same
contract: a `compact`/`iconOnly` flag plus a `className` override that
the sidebar can stack onto with `cn()`/`twMerge`.

### 8. CSS class merging gotcha

`cn()` from `@/lib/utils` uses `tailwind-merge`. Later classes win for the
same property group. Sidebar passes `buttonClassName` AFTER the component's
own base class, so the sidebar's `ml-0`, `w-11`, `pl-4`, etc., correctly
override block defaults. Don't add another util-merge layer; trust this.

## Verification Checklist (sidebar work)

After any change to `src/themes/default/blocks/header.tsx` or the layout
wiring:

1. Toggle the collapse button repeatedly. Sidebar `width` and main content
   `padding-left` glide together over ~300ms — no instant snap.
2. Active pill has equal left/right inset in both collapsed and expanded
   modes.
3. Scroll the landing page; section anchors light up as their section
   enters view; navigate to `/blog` and confirm the previous page's anchor
   no longer stays highlighted.
4. Bottom utility icons (theme, locale, sign-in) stay anchored at their
   left-padding offset throughout the width transition. No left/right jump
   at frame 0.
5. Brand logo position is pixel-stable in both states.
6. In a mobile viewport, `left` header mode still renders the top header and
   hamburger menu, and the page content has no leftover left padding.

Then run the standard Oxc gate:

- `bun run format:check`
- `bun run lint`
- `bunx oxfmt --check src/themes/default/blocks/header.tsx <other edited files>`
