import { normalizeLocale, type AppLocale } from '@/config/locale';

import {
  jaHomePageCopy,
  koHomePageCopy,
  plHomePageCopy,
  zhHantHomePageCopy,
} from './-home-page-copy-asia-pl';
import { deHomePageCopy } from './-home-page-copy-de';
import { enHomePageCopy } from './-home-page-copy-en';
import {
  esHomePageCopy,
  frHomePageCopy,
  itHomePageCopy,
} from './-home-page-copy-romance';
import type { HomePageCopy } from './-home-page-copy-types';

export type { HomePageCopy } from './-home-page-copy-types';

const homePageCopyByLocale: Record<AppLocale, HomePageCopy> = {
  en: enHomePageCopy,
  de: deHomePageCopy,
  fr: frHomePageCopy,
  es: esHomePageCopy,
  it: itHomePageCopy,
  pl: plHomePageCopy,
  ja: jaHomePageCopy,
  ko: koHomePageCopy,
  'zh-hant': zhHantHomePageCopy,
};

export function getHomePageCopy(locale?: string | null): HomePageCopy {
  const normalized = normalizeLocale(locale) ?? 'en';
  return homePageCopyByLocale[normalized] ?? enHomePageCopy;
}

export function listHomePageCopyLocales(): AppLocale[] {
  return Object.keys(homePageCopyByLocale) as AppLocale[];
}
