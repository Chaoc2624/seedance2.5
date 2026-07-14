import { describe, expect, test } from 'bun:test';

import { locales } from '@/config/locale';

import { measureEnHomeSeo } from './-home-en-seo';
import { getHomePageCopy, listHomePageCopyLocales } from './-home-page-copy';

function corpusLength(locale: string): number {
  const copy = getHomePageCopy(locale);
  const faq = copy.faq.items
    .map((item) => `${item.question} ${item.answer}`)
    .join(' ');
  const capabilities = copy.capabilities
    .map((item) => `${item.title} ${item.description}`)
    .join(' ');
  const useCases = copy.useCases.items
    .map(([title, description]) => `${title} ${description}`)
    .join(' ');
  const steps = copy.workflow.steps
    .map(([title, description]) => `${title} ${description}`)
    .join(' ');
  const plans = copy.paywall.plans
    .map(
      (plan) => `${plan.name} ${plan.description} ${plan.features.join(' ')}`
    )
    .join(' ');
  const cards = copy.whatsNew.cards
    .map((card) => `${card.title} ${card.label}`)
    .join(' ');

  return [
    copy.meta.title,
    copy.meta.description,
    copy.hero.eyebrow,
    copy.hero.title,
    copy.hero.description,
    ...copy.hero.chips,
    copy.gallery.title,
    copy.gallery.description,
    copy.whatsNew.eyebrow,
    copy.whatsNew.title,
    copy.whatsNew.description,
    cards,
    copy.capability.title,
    copy.capability.description,
    capabilities,
    copy.multilingual.title,
    copy.multilingual.description,
    copy.multilingual.footer,
    copy.useCases.title,
    copy.useCases.description,
    useCases,
    copy.workflow.title,
    copy.workflow.description,
    steps,
    copy.creatorFeedback.title,
    copy.creatorFeedback.description,
    copy.faq.title,
    copy.faq.description,
    faq,
    copy.paywall.title,
    copy.paywall.description,
    copy.paywall.comparePlans,
    plans,
  ].join(' ').length;
}

describe('multilingual home page copy parity', () => {
  test('every public locale has a full home copy pack', () => {
    const covered = new Set(listHomePageCopyLocales());
    for (const locale of locales) {
      expect(covered.has(locale as never)).toBe(true);
      const copy = getHomePageCopy(locale);
      expect(copy.faq.items.length).toBe(7);
      expect(copy.capabilities.length).toBe(6);
      expect(copy.useCases.items.length).toBe(6);
      expect(copy.workflow.steps.length).toBe(3);
      expect(copy.whatsNew.cards.length).toBe(4);
      expect(copy.meta.title.toLowerCase()).toContain('seedance 2.5');
      expect(copy.hero.title.toLowerCase()).toContain('seedance 2.5');
      expect(copy.faq.items[0]!.answer.length).toBeGreaterThan(80);
    }
  });

  test('non-EN locales are not thin relative to EN marketing body', () => {
    const enLen = corpusLength('en');
    expect(enLen).toBeGreaterThan(2500);

    const latinLocales = new Set(['de', 'fr', 'es', 'it', 'pl']);

    for (const locale of locales) {
      if (locale === 'en') continue;
      const copy = getHomePageCopy(locale);
      const len = corpusLength(locale);
      // Latin scripts: keep near-EN depth. CJK is denser per glyph, so use a
      // lower character ratio but still require full section/FAQ structure.
      if (latinLocales.has(locale)) {
        expect(len / enLen).toBeGreaterThanOrEqual(0.7);
      } else {
        expect(len / enLen).toBeGreaterThanOrEqual(0.4);
        expect(len).toBeGreaterThanOrEqual(2200);
      }
      expect(copy.meta.description).not.toBe(
        getHomePageCopy('en').meta.description
      );
      expect(copy.hero.description).not.toBe(
        getHomePageCopy('en').hero.description
      );
      for (const item of copy.faq.items) {
        // CJK answers are denser per character; require substantive prose.
        expect(item.answer.trim().length).toBeGreaterThan(45);
      }
    }
  });

  test('EN density bands still hold after i18n wiring', () => {
    const metrics = measureEnHomeSeo();
    expect(metrics.longTailCount).toBeGreaterThanOrEqual(5);
    expect(metrics.longTailCount).toBeLessThanOrEqual(7);
    expect(metrics.brandCount).toBeGreaterThanOrEqual(22);
    expect(metrics.brandOccupyPct).toBeGreaterThanOrEqual(2.5);
  });
});
