import { envConfigs } from '..';

export const localeOptions = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh-hant', label: '繁體中文', flag: '🇭🇰' },
] as const;

export type AppLocale = (typeof localeOptions)[number]['code'];
export type LocaleOption = (typeof localeOptions)[number];

const fallbackLocale = 'en' as const;
const localeCodeLookup = new Map(
  localeOptions.map(
    (option) => [option.code.toLowerCase(), option.code] as const
  )
);
const localeOptionsByCode = new Map(
  localeOptions.map((option) => [option.code, option] as const)
);
const localeSuffixes = localeOptions
  .map((option) => option.code)
  .sort((a, b) => b.length - a.length);

const localeAliases: Record<string, AppLocale> = {
  en: 'en',
  'en-us': 'en',
  'en-gb': 'en',
  ja: 'ja',
  'ja-jp': 'ja',
  de: 'de',
  'de-de': 'de',
  fr: 'fr',
  'fr-fr': 'fr',
  es: 'es',
  'es-es': 'es',
  'es-mx': 'es',
  it: 'it',
  'it-it': 'it',
  pl: 'pl',
  'pl-pl': 'pl',
  ko: 'ko',
  'ko-kr': 'ko',
  zh: 'zh-hant',
  'zh-tw': 'zh-hant',
  'zh-hk': 'zh-hant',
  'zh-mo': 'zh-hant',
  'zh-hant': 'zh-hant',
};

export function normalizeLocale(locale?: string | null): AppLocale | null {
  if (!locale) {
    return null;
  }

  const normalized = locale.trim().replace(/_/g, '-');
  if (!normalized) {
    return null;
  }

  const exactMatch = localeCodeLookup.get(normalized.toLowerCase());
  if (exactMatch) {
    return exactMatch;
  }

  const lower = normalized.toLowerCase();
  return localeAliases[lower] || localeAliases[lower.split('-')[0]] || null;
}

export const localeFlags = Object.fromEntries([
  ...localeOptions.map(({ code, flag }) => [code, flag]),
  ['zh', '🇨🇳'],
]) as Record<string, string>;

export const localeNames = Object.fromEntries([
  ...localeOptions.map(({ code, label }) => [code, label]),
  ['zh', '中文'],
]) as Record<string, string>;

export const locales = localeOptions.map((option) => option.code) as string[];

export const adminLocaleOptions = [
  localeOptions[0],
  { code: 'zh', label: '中文', flag: '🇨🇳' },
] as const;

export const adminLocales = adminLocaleOptions.map(
  (option) => option.code
) as string[];

export const routableLocales = Array.from(
  new Set([...locales, ...adminLocales])
) as string[];

export const defaultLocale: AppLocale =
  normalizeLocale(envConfigs.locale) ?? fallbackLocale;

export const localePrefix = 'as-needed';

export const localeDetection = false;

export function getLocaleOption(locale?: string | null): LocaleOption | null {
  const normalized = normalizeLocale(locale);
  if (!normalized) {
    return null;
  }

  return localeOptionsByCode.get(normalized) ?? null;
}

export function splitLocaleSuffix(value: string): {
  baseName: string;
  locale: AppLocale | undefined;
} {
  const lower = value.toLowerCase();

  for (const locale of localeSuffixes) {
    const suffix = `.${locale.toLowerCase()}`;
    if (lower.endsWith(suffix)) {
      return {
        baseName: value.slice(0, value.length - suffix.length),
        locale,
      };
    }
  }

  return {
    baseName: value,
    locale: undefined,
  };
}

export function getMomentLocale(locale?: string | null): string {
  const normalized = normalizeLocale(locale) ?? defaultLocale;
  return normalized;
}

export function isChineseLocale(locale?: string | null): boolean {
  return normalizeLocale(locale) === 'zh-hant';
}

export const localeMessagesRootPath = '@/config/locale';

export const localeMessagesPaths = [
  'common',
  'landing',
  'showcases',
  'blog',
  'updates',
  'pricing',
  'settings/sidebar',
  'settings/profile',
  'settings/security',
  'settings/billing',
  'settings/payments',
  'settings/credits',
  'admin/sidebar',
  'admin/users',
  'admin/roles',
  'admin/permissions',
  'admin/categories',
  'admin/posts',
  'admin/payments',
  'admin/subscriptions',
  'admin/credits',
  'admin/settings',
  'admin/ai-tasks',
  'ai/music',
  'ai/image',
  'ai/video',
  'activity/sidebar',
  'activity/ai-tasks',
  'pages/index',
  'pages/ai-image-generator',
  'pages/generate',
  'pages/pricing',
  'pages/showcases',
  'pages/blog',
  'pages/updates',
];
