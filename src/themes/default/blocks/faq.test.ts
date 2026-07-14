import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { FaqCrawlableAnswers, getFaqAnswerEntries } from './faq';

const sampleItems = [
  {
    question: 'What is Seedance 2.5?',
    answer:
      'Seedance 2.5 is a video-first AI creation workflow. Seedance 2.5 video generation turns prompts into cinematic videos.',
  },
  {
    question: 'Which inputs can I use?',
    answer:
      'You can start with a text prompt, reference images, video clips, or audio cues in Seedance 2.5.',
  },
];

describe('FAQ crawlable answers + collapsible accordion wiring', () => {
  test('getFaqAnswerEntries keeps non-empty answer prose for crawlers', () => {
    const entries = getFaqAnswerEntries([
      ...sampleItems,
      { question: 'Empty', answer: '   ' },
      { title: 'From title', description: 'From description body for SEO.' },
    ]);
    expect(entries).toEqual([
      {
        question: 'What is Seedance 2.5?',
        answer: sampleItems[0]!.answer,
      },
      {
        question: 'Which inputs can I use?',
        answer: sampleItems[1]!.answer,
      },
      {
        question: 'From title',
        answer: 'From description body for SEO.',
      },
    ]);
  });

  test('FaqCrawlableAnswers SSR markup includes answers while staying visually hidden', () => {
    const html = renderToStaticMarkup(
      createElement(FaqCrawlableAnswers, { items: sampleItems })
    );

    expect(html).toContain('data-faq-seo-answers');
    expect(html).toContain('sr-only');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain(sampleItems[0]!.answer);
    expect(html).toContain(sampleItems[1]!.answer);
    expect(html).toContain('What is Seedance 2.5?');
  });

  test('Faq block does not forceMount accordion content (collapse stays intact)', () => {
    const faqSource = readFileSync(join(import.meta.dir, 'faq.tsx'), 'utf8');

    // forceMount keeps Radix isPresent true and breaks closed height.
    expect(faqSource).not.toMatch(/<AccordionContent[^>]*forceMount/);
    expect(faqSource).not.toMatch(/forceMount\s*[=/{]/);
    expect(faqSource).toContain('FaqCrawlableAnswers');
    expect(faqSource).toContain('<AccordionContent>');
  });

  test('closed accordion content CSS path still collapses via Radix defaults', () => {
    const accordionSource = readFileSync(
      join(import.meta.dir, '../../../components/ui/accordion.tsx'),
      'utf8'
    );
    // Interactive path relies on overflow-hidden + open/closed animations,
    // not forceMount, so closed items can fully unmount/collapse.
    expect(accordionSource).toContain('overflow-hidden');
    expect(accordionSource).toContain(
      'data-[state=closed]:animate-accordion-up'
    );
    expect(accordionSource).toContain(
      'data-[state=open]:animate-accordion-down'
    );
  });
});
