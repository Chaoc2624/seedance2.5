import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  adminLocales,
  defaultLocale,
  locales,
  routableLocales,
} from '@/config/locale';
import { modules } from '@/config/preset';

// Eagerly import all locale JSON files.
// Vite's import.meta.glob with { eager: true } ensures they are bundled.
const messageModules = import.meta.glob('../../config/locale/**/*.json', {
  eager: true,
}) as Record<string, { default: Record<string, unknown> }>;

/**
 * Build a nested resource object for i18next from the flat file map.
 *
 * Given files like:
 *   /src/config/locale/en/common.json
 *   /src/config/locale/en/pages/index.json
 *
 * Produces:
 *   { en: { translation: { common: {...}, pages: { index: {...} } } } }
 *
 * Builds a nested resource object for i18next from the flat file map.
 */
/**
 * Namespace prefixes to skip in lite preset.
 * These correspond to disabled modules' i18n directories.
 */
const liteSkipPrefixes = [
  'admin/', // admin panel translations
  'ai/', // AI generator translations
  'activity/', // activity center translations
];

/**
 * Check if a keyPath should be skipped based on preset.
 */
function shouldSkipNamespace(keyPath: string): boolean {
  if (modules.admin && modules.ai && modules.activity) return false; // full mode — load everything

  for (const prefix of liteSkipPrefixes) {
    if (keyPath.startsWith(prefix)) {
      // Check module flags
      if (prefix === 'admin/' && !modules.admin) return true;
      if (prefix === 'ai/' && !modules.ai) return true;
      if (prefix === 'activity/' && !modules.activity) return true;
    }
  }

  // Skip public payment pages in lite mode. Keep settings namespaces loaded
  // because those routes can still render in dev and shared shells.
  if (!modules.payment) {
    if (keyPath === 'pages/pricing') return true;
  }

  return false;
}

function buildResources() {
  const raw: Record<string, Record<string, unknown>> = {};

  for (const [path, mod] of Object.entries(messageModules)) {
    const match = path.match(/locale\/([^/]+)\/(.+)\.json$/);
    if (!match) continue;

    const locale = match[1];
    const keyPath = match[2]; // e.g. "common" or "pages/index"

    // Skip namespaces for disabled modules
    if (shouldSkipNamespace(keyPath)) continue;

    if (!raw[locale]) {
      raw[locale] = {};
    }

    const keys = keyPath.split('/');
    let current: Record<string, unknown> = raw[locale];

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = (mod as any).default ?? mod;
  }

  const resources: Record<string, { translation: Record<string, unknown> }> =
    {};
  for (const locale of Object.keys(raw)) {
    resources[locale] = { translation: raw[locale] };
  }
  return resources;
}

/**
 * Detect the initial locale from the URL path.
 * Works on both server (via i18n.language set by beforeLoad) and client.
 * On the client, window.location.pathname is available at module load time.
 */
function detectInitialLocale(): string {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    const match = window.location.pathname.match(
      /^\/([a-z]{2}(?:-[a-zA-Z]{2,4})?)(?:\/|$)/
    );
    if (match && locales.includes(match[1])) {
      return match[1];
    }
    if (
      match &&
      adminLocales.includes(match[1]) &&
      (pathname === `/${match[1]}/shiponce` ||
        pathname.startsWith(`/${match[1]}/shiponce/`))
    ) {
      return match[1];
    }
  }
  return defaultLocale;
}

i18n.use(initReactI18next).init({
  resources: buildResources(),
  lng: detectInitialLocale(),
  fallbackLng: defaultLocale,
  supportedLngs: routableLocales,
  lowerCaseLng: true,
  interpolation: {
    escapeValue: false, // React already escapes
    // Use single-brace {variable} syntax in translation strings.
    // Override to match existing translation strings.
    prefix: '{',
    suffix: '}',
  },
  returnObjects: true, // Allow t() to return objects (equivalent of t.raw())
});

export default i18n;

/**
 * Change the active language. Call this when the user navigates to a
 * different locale route.
 */
export function changeLanguage(locale: string) {
  // Synchronously set language FIRST so SSR renders with correct locale
  // i18n.changeLanguage() uses microtasks internally, which means SSR
  // rendering can start before the language is actually switched.
  if (i18n.language !== locale) {
    i18n.language = locale;
    i18n.languages = [
      locale,
      ...((i18n.options.fallbackLng as string[]) || [defaultLocale]),
    ];
  }
  return i18n.changeLanguage(locale);
}

/**
 * Get the currently active language.
 */
export function getCurrentLocale(): string {
  return i18n.language ?? defaultLocale;
}
