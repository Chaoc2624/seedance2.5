import { envConfigs } from '@/config';

export const themeNames = ['default'];
export const defaultTheme = 'default';

/**
 * Theme loading system — Vite-compatible.
 *
 * Uses import.meta.glob to eagerly load all theme modules at build time,
 * replacing the old dynamic import(`@/themes/...`) pattern which doesn't
 * work with Vite's SSR module runner (path aliases aren't resolved).
 */

type ThemeModule = { default?: any; [key: string]: any };

// Pre-load all theme modules via import.meta.glob (eager)
const themeBlocks = import.meta.glob<ThemeModule>(
  '../../themes/*/blocks/*/index.{ts,tsx}',
  { eager: true }
);

const themeBlocksDirect = import.meta.glob<ThemeModule>(
  '../../themes/*/blocks/*.{ts,tsx}',
  { eager: true }
);

const themeLayouts = import.meta.glob<ThemeModule>(
  '../../themes/*/layouts/*.{ts,tsx}',
  { eager: true }
);

const themePages = import.meta.glob<ThemeModule>(
  '../../themes/*/pages/*.{ts,tsx}',
  { eager: true }
);

/**
 * get active theme
 */
export function getActiveTheme(): string {
  const theme = envConfigs.theme as string;
  return theme || defaultTheme;
}

/**
 * Convert kebab-case to PascalCase
 */
function kebabToPascalCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Find a module from the glob results by theme and name.
 */
function findModule<T extends ThemeModule>(
  globs: Record<string, T>[],
  theme: string,
  category: string,
  name: string
): T | null {
  for (const modules of globs) {
    for (const [path, mod] of Object.entries(modules)) {
      // Match patterns like:
      //   ../../themes/default/blocks/header.tsx
      //   ../../themes/default/blocks/header/index.tsx
      const regex = new RegExp(
        `themes/${theme}/${category}/${name}(?:/index)?\\.[jt]sx?$`
      );
      if (regex.test(path)) {
        return mod;
      }
    }
  }
  return null;
}

/**
 * Load theme block component (synchronous — all modules are pre-loaded).
 */
export function getThemeBlock(blockName: string, theme?: string) {
  const loadTheme = theme || getActiveTheme();
  const pascalCaseName = kebabToPascalCase(blockName);

  let mod = findModule(
    [themeBlocksDirect, themeBlocks],
    loadTheme,
    'blocks',
    blockName
  );

  // Fallback to default theme
  if (!mod && loadTheme !== defaultTheme) {
    mod = findModule(
      [themeBlocksDirect, themeBlocks],
      defaultTheme,
      'blocks',
      blockName
    );
  }

  if (!mod) {
    throw new Error(
      `Theme block "${blockName}" not found in theme "${loadTheme}"`
    );
  }

  // Try PascalCase named export first, then original blockName, then default
  return mod[pascalCaseName] || mod[blockName] || mod.default;
}

/**
 * Load theme layout component (synchronous).
 */
export function getThemeLayout(layoutName: string, theme?: string) {
  const loadTheme = theme || getActiveTheme();

  let mod = findModule([themeLayouts], loadTheme, 'layouts', layoutName);

  if (!mod && loadTheme !== defaultTheme) {
    mod = findModule([themeLayouts], defaultTheme, 'layouts', layoutName);
  }

  if (!mod) {
    throw new Error(
      `Theme layout "${layoutName}" not found in theme "${loadTheme}"`
    );
  }

  return mod.default;
}

/**
 * Load theme page component (synchronous).
 */
export function getThemePage(pageName: string, theme?: string) {
  const loadTheme = theme || getActiveTheme();

  let mod = findModule([themePages], loadTheme, 'pages', pageName);

  if (!mod && loadTheme !== defaultTheme) {
    mod = findModule([themePages], defaultTheme, 'pages', pageName);
  }

  if (!mod) {
    throw new Error(
      `Theme page "${pageName}" not found in theme "${loadTheme}"`
    );
  }

  return mod.default;
}
