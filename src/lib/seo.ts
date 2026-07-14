import i18n from '@/core/i18n';

import { defaultLocale } from '@/config/locale';

/**
 * SEO utilities for generating head meta tags.
 *
 * In TanStack Start, SEO meta tags are set via `head()` in route definitions.
 * These helpers generate the meta/link arrays for TanStack's head() format.
 */
import { envConfigs } from '@/config';

// Get translated metadata value safely
function getTranslatedValue(key: string, locale?: string): string {
  const t = locale ? i18n.getFixedT(locale) : i18n.t.bind(i18n);
  const value = t(key, { defaultValue: '' });
  // i18next returns the key itself if not found; treat that as empty
  return typeof value === 'string' && value !== key ? value : '';
}

const defaultMetadataKey = 'common.metadata';

function getTranslatedMetadata(metadataKey: string, locale?: string) {
  return {
    title: getTranslatedValue(`${metadataKey}.title`, locale),
    description: getTranslatedValue(`${metadataKey}.description`, locale),
  };
}

function getCanonicalUrl(canonicalUrl: string, locale: string): string {
  if (!canonicalUrl) {
    canonicalUrl = '/';
  }

  if (canonicalUrl.startsWith('http')) {
    return canonicalUrl;
  }

  if (!canonicalUrl.startsWith('/')) {
    canonicalUrl = `/${canonicalUrl}`;
  }

  canonicalUrl = `${envConfigs.app_url}${
    !locale || locale === defaultLocale ? '' : `/${locale}`
  }${canonicalUrl}`;

  if (locale !== defaultLocale && canonicalUrl.endsWith('/')) {
    canonicalUrl = canonicalUrl.slice(0, -1);
  }

  return canonicalUrl;
}

function isAdminCanonicalUrl(canonicalUrl?: string): boolean {
  if (!canonicalUrl) {
    return false;
  }

  try {
    const pathname = canonicalUrl.startsWith('http')
      ? new URL(canonicalUrl).pathname
      : canonicalUrl;
    return /^\/?shiponce(?:\/|$)/.test(pathname);
  } catch {
    return false;
  }
}

function formatAdminTitle(
  title: string,
  canonicalUrl?: string,
  appName?: string
): string {
  if (!isAdminCanonicalUrl(canonicalUrl)) {
    return title;
  }

  return `${appName || envConfigs.app_name} - Admin`;
}

/**
 * Build TanStack head() meta/links arrays for SEO.
 *
 * Usage in route definition:
 *   head: ({ params }) => getHeadMeta({ metadataKey: 'pages.pricing.metadata', locale: params.locale })
 */
export function getHeadMeta(
  options: {
    title?: string;
    description?: string;
    metadataKey?: string;
    canonicalUrl?: string;
    imageUrl?: string;
    appName?: string;
    noIndex?: boolean;
    locale?: string;
  } = {}
) {
  const locale = options.locale || i18n.language || defaultLocale;
  const shouldNoIndex =
    options.noIndex || isAdminCanonicalUrl(options.canonicalUrl);

  const passedMetadata = {
    title: options.title,
    description: options.description,
  };

  const defaultMeta = getTranslatedMetadata(defaultMetadataKey, locale);
  let translatedMeta: any = {};
  if (options.metadataKey) {
    translatedMeta = getTranslatedMetadata(options.metadataKey, locale);
  }

  const resolvedTitle =
    passedMetadata.title || translatedMeta.title || defaultMeta.title;
  const title = formatAdminTitle(
    resolvedTitle,
    options.canonicalUrl,
    options.appName
  );
  const description =
    passedMetadata.description ||
    translatedMeta.description ||
    defaultMeta.description;

  const canonicalUrl = getCanonicalUrl(options.canonicalUrl || '', locale);

  let imageUrl = options.imageUrl || envConfigs.app_preview_image;
  if (!imageUrl.startsWith('http')) {
    imageUrl = `${envConfigs.app_url}${imageUrl}`;
  }

  const appName = options.appName || envConfigs.app_name || '';

  return {
    meta: [
      { title },
      { name: 'description', content: description },
      // Open Graph
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: locale },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:site_name', content: appName },
      { property: 'og:image', content: imageUrl },
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },
      // Robots
      ...(shouldNoIndex
        ? [
            { name: 'robots', content: 'noindex, nofollow, noarchive' },
            { name: 'googlebot', content: 'noindex, nofollow, noarchive' },
          ]
        : []),
    ],
    links: [{ rel: 'canonical', href: canonicalUrl }],
  };
}

// Backwards-compatible alias — remove old getMetadata usage gradually
export const getMetadata = getHeadMeta;
