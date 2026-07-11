import { envConfigs } from '@/config';

const defaultTheme = 'default';

type ThemeModule = { default?: any; [key: string]: any };

const themeBlocks = import.meta.glob<ThemeModule>(
  '../../themes/*/blocks/*/index.{ts,tsx}',
  { eager: true }
);

const themeBlocksDirect = import.meta.glob<ThemeModule>(
  '../../themes/*/blocks/*.{ts,tsx}',
  { eager: true }
);

function getActiveTheme(): string {
  const theme = envConfigs.theme as string;
  return theme || defaultTheme;
}

function kebabToPascalCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function findModule<T extends ThemeModule>(
  globs: Record<string, T>[],
  theme: string,
  category: string,
  name: string
): T | null {
  for (const modules of globs) {
    for (const [path, mod] of Object.entries(modules)) {
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

export function getThemeBlock(blockName: string, theme?: string) {
  const loadTheme = theme || getActiveTheme();
  const pascalCaseName = kebabToPascalCase(blockName);

  let mod = findModule(
    [themeBlocksDirect, themeBlocks],
    loadTheme,
    'blocks',
    blockName
  );

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

  return mod[pascalCaseName] || mod[blockName] || mod.default;
}
