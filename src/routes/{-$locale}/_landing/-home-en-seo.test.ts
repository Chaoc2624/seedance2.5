import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import landingEn from '@/config/locale/en/landing.json';

import {
  buildEnHomeSeoCorpus,
  enFaqSection,
  enHeroCopy,
  enHomeMeta,
  extractVisibleTextFromHtml,
  measureEnHomeSeo,
  measureEnHomeSeoCorpus,
  measureEnHomeSeoFromHtml,
} from './-home-en-seo';

describe('EN homepage SEO density (shipped copy module)', () => {
  test('long-tail is 5–7 and brand occupy on marketing corpus stays usable', () => {
    const metrics = measureEnHomeSeo({
      footerBrandDescription: landingEn.footer.brand.description,
    });

    expect(metrics.longTailCount).toBeGreaterThanOrEqual(5);
    expect(metrics.longTailCount).toBeLessThanOrEqual(7);
    // Marketing-only corpus is denser than full-page HTML; require enough brand
    // hits for ~3% occupy once chrome/testimonials inflate total words.
    expect(metrics.brandCount).toBeGreaterThanOrEqual(22);
    expect(metrics.brandCount).toBeLessThanOrEqual(40);
    expect(metrics.brandOccupyPct).toBeGreaterThanOrEqual(2.5);
  });

  test('FAQ answers used by the home page include crawlable prose', () => {
    expect(enFaqSection.items.length).toBeGreaterThanOrEqual(5);
    for (const item of enFaqSection.items) {
      expect(item.question.trim().length).toBeGreaterThan(5);
      expect(item.answer.trim().length).toBeGreaterThan(40);
    }
    const corpus = buildEnHomeSeoCorpus();
    expect(corpus).toContain(enFaqSection.items[0]!.answer.slice(0, 40));
  });

  test('meta and hero long-tail placements come from the same shipped strings', () => {
    expect(enHomeMeta.title.toLowerCase()).toContain(
      'seedance 2.5 video generation'
    );
    expect(enHomeMeta.description.toLowerCase()).toContain(
      'seedance 2.5 video generation'
    );
    expect(enHeroCopy.eyebrow.toLowerCase()).toBe(
      'seedance 2.5 video generation'
    );
    const fromMeta = measureEnHomeSeoCorpus(
      `${enHomeMeta.title} ${enHomeMeta.description} ${enHeroCopy.eyebrow}`
    );
    expect(fromMeta.longTailCount).toBe(3);
  });

  test('HTML extractor finds crawlable FAQ answer text for crawlers', () => {
    const sampleAnswer = enFaqSection.items[0]!.answer;
    const html = `<!DOCTYPE html><html><head>
      <title>${enHomeMeta.title}</title>
      <meta name="description" content="${enHomeMeta.description}" />
      </head><body>
      <h1>${enHeroCopy.title}</h1>
      <p>${enHeroCopy.eyebrow}</p>
      <p>${enHeroCopy.description}</p>
      <div class="sr-only" data-faq-seo-answers aria-hidden="true">
        <article><h3>${enFaqSection.items[0]!.question}</h3><p>${sampleAnswer}</p></article>
      </div>
      <div data-state="closed" data-slot="accordion-content" hidden=""></div>
      </body></html>`;
    const visible = extractVisibleTextFromHtml(html);
    expect(visible).toContain(sampleAnswer.slice(0, 48));
    // Closed interactive panel may be empty; crawlable path still supplies prose.
    expect(html).toContain('data-faq-seo-answers');
    expect(html).toMatch(
      /data-state="closed"[^>]*(hidden|style=|class=)[^>]*>\s*<\/div>/
    );
    const metrics = measureEnHomeSeoFromHtml(html);
    expect(metrics.longTailCount).toBeGreaterThanOrEqual(3);
  });
});

describe('FAQ SSR wiring', () => {
  test('Faq block uses crawlable answers without forceMount', () => {
    const faqSource = readFileSync(
      join(import.meta.dir, '../../../themes/default/blocks/faq.tsx'),
      'utf8'
    );
    expect(faqSource).toContain('FaqCrawlableAnswers');
    expect(faqSource).toContain('data-faq-seo-answers');
    // Prop usage only — comments may mention forceMount as the anti-pattern.
    expect(faqSource).not.toMatch(/<AccordionContent[^>]*forceMount/);
    expect(faqSource).not.toMatch(/forceMount\s*[=/{]/);
    expect(faqSource).toContain('<AccordionContent>');
  });

  test('home sections wire FAQ answers from the SEO module', () => {
    const sectionsSource = readFileSync(
      join(import.meta.dir, '-home-sections.tsx'),
      'utf8'
    );
    expect(sectionsSource).toContain('getHomePageCopy');
    expect(sectionsSource).toContain('copy.faq');
    expect(sectionsSource).toContain('<Faq section={faqSection} />');
  });
});
