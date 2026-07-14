export type BlogLocale = 'en' | 'de' | 'fr' | 'es' | 'it' | 'pl' | 'ko' | 'ja';

export type LocalizedPostBody = {
  title: string;
  description: string;
  content: string;
};

export type SeedPostDefinition = {
  slug: string;
  /** Shared publish time for all locales of this article */
  createdAt: string;
  authorName: string;
  tags: string;
  /** Public cover image path, e.g. /imgs/blog/slug.jpg */
  image: string;
  locales: Record<BlogLocale, LocalizedPostBody>;
};

export const SEEDANCE_BLOG_LOCALES: BlogLocale[] = [
  'en',
  'de',
  'fr',
  'es',
  'it',
  'pl',
  'ko',
  'ja',
];
