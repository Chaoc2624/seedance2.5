import { createFileRoute, redirect } from '@tanstack/react-router';

import { useTranslations } from '@/core/i18n/hooks';

import type { ImageModelConfig } from '@/config/ai-models';
import { modules } from '@/config/preset';

import ThemeDynamicPage from '@/themes/default/pages/dynamic-page';

import { ImageGenerator } from '@/components/features/ai-generator';
import { GPTImageCanvasBackground } from '@/components/features/ai-generator/components/gpt-image-canvas-background';
import { getHeadMeta } from '@/lib/seo';
import { DynamicPage, Section } from '@/types/blocks/landing';

const AI_IMAGE_SURFACE_CLASS_NAME = [
  'relative isolate min-h-screen overflow-hidden bg-background text-foreground',
  '[--background:#f8fbfb]',
  '[--foreground:#102033]',
  '[--card:#ffffff]',
  '[--card-foreground:#102033]',
  '[--popover:#ffffff]',
  '[--popover-foreground:#102033]',
  '[--primary:#0f8fa3]',
  '[--primary-foreground:#f7fdff]',
  '[--secondary:#e5f5ef]',
  '[--secondary-foreground:#0f766e]',
  '[--muted:#eef5f4]',
  '[--muted-foreground:#526173]',
  '[--placeholder-foreground:#7b879780]',
  '[--accent:#e7f5f1]',
  '[--accent-foreground:#075985]',
  '[--border:#d8e4e2]',
  '[--input:#cbdad8]',
  '[--ring:#14b8a6]',
  '[--brand-cyan:#0ea5e9]',
  '[--brand-mint:#14b8a6]',
  '[--brand-lime:#f59e0b]',
  'dark:[--background:#071019]',
  'dark:[--foreground:#f6fbff]',
  'dark:[--card:#09111ec2]',
  'dark:[--card-foreground:#f6fbff]',
  'dark:[--popover:#09111e]',
  'dark:[--popover-foreground:#f6fbff]',
  'dark:[--primary:#70e7ff]',
  'dark:[--primary-foreground:#03121a]',
  'dark:[--secondary:#153025]',
  'dark:[--secondary-foreground:#c7f9d4]',
  'dark:[--muted:#1d2939]',
  'dark:[--muted-foreground:#b8c4d6]',
  'dark:[--placeholder-foreground:#b8c4d675]',
  'dark:[--accent:#123143]',
  'dark:[--accent-foreground:#b9f3ff]',
  'dark:[--border:#b8c4d62e]',
  'dark:[--input:#b8c4d633]',
  'dark:[--ring:#70e7ff]',
  'dark:[--brand-cyan:#70e7ff]',
  'dark:[--brand-mint:#86efac]',
  'dark:[--brand-lime:#fde68a]',
].join(' ');

const AI_IMAGE_HERO_SURFACE_CLASS_NAME = [
  'relative isolate overflow-hidden border-b border-white/[0.08] bg-background text-foreground',
  '[--background:#071019]',
  '[--foreground:#f6fbff]',
  '[--card:#091523d9]',
  '[--card-foreground:#f6fbff]',
  '[--popover:#09111e]',
  '[--popover-foreground:#f6fbff]',
  '[--primary:#70e7ff]',
  '[--primary-foreground:#03121a]',
  '[--secondary:#153025]',
  '[--secondary-foreground:#c7f9d4]',
  '[--muted:#1d2939]',
  '[--muted-foreground:#b8c4d6]',
  '[--placeholder-foreground:#b8c4d675]',
  '[--accent:#123143]',
  '[--accent-foreground:#b9f3ff]',
  '[--border:#c5d7e52e]',
  '[--input:#c5d7e533]',
  '[--ring:#70e7ff]',
  '[--brand-cyan:#70e7ff]',
  '[--brand-mint:#86efac]',
  '[--brand-lime:#fde68a]',
].join(' ');

export const Route = createFileRoute('/{-$locale}/_landing/image-generator')({
  beforeLoad: () => {
    if (!modules.ai) {
      throw redirect({ to: '/' as any });
    }
  },
  loader: async () => {
    const { getImageModelCatalogFn } = await import('@/server/ai.functions');
    const catalog = await getImageModelCatalogFn();
    return { initialImageModels: catalog.models as ImageModelConfig[] };
  },
  component: AiImageGeneratorPage,
  head: ({ params }) =>
    getHeadMeta({
      metadataKey: 'ai.image.metadata',
      canonicalUrl: '/image-generator',
      locale: params.locale,
    }),
});

function AiImageGeneratorPage() {
  const { locale } = Route.useParams();
  const { initialImageModels } = Route.useLoaderData();
  const t = useTranslations('pages.ai-image-generator');
  const tAi = useTranslations('ai.image');

  const rawPage = t.raw('page') as DynamicPage;
  const baseSections = (rawPage?.sections ?? {}) as Record<string, Section>;

  const generatorSection: Section = {
    id: 'generator',
    component: (
      <section id="generator" className="relative pt-4 pb-10 md:pt-5 md:pb-16">
        <div className="container">
          <div className="mx-auto max-w-7xl">
            <ImageGenerator
              variant="split"
              defaultTab="image-to-image"
              initialModels={initialImageModels}
              srOnlyTitle={tAi('generator.title')}
            />
          </div>
        </div>
      </section>
    ),
  };

  const creatorFeedbackSection: Section = (baseSections.creatorFeedback as
    | Section
    | undefined) ?? {
    id: 'creator-feedback',
    block: 'creator-feedback-wall',
    title: 'Loved by Creators',
    description:
      'Art directors, marketers, founders, and content teams use GPT Image 2 to move from concept to campaign faster.',
  };

  const showcaseSection =
    (baseSections.showcase as Section | undefined) ??
    (baseSections.examples as Section | undefined) ??
    null;

  const mergedSections: Record<string, Section> = {
    hero: {
      ...baseSections.hero,
      variant: 'compact',
    } as Section,
    generator: generatorSection,
    ...(showcaseSection ? { showcase: showcaseSection } : {}),
    creatorFeedback: creatorFeedbackSection,
    ...Object.fromEntries(
      Object.entries(baseSections).filter(
        ([key]) =>
          key !== 'hero' &&
          key !== 'benefits' &&
          key !== 'testimonials' &&
          key !== 'examples' &&
          key !== 'showcase' &&
          key !== 'generator' &&
          key !== 'whyChoose' &&
          key !== 'creatorFeedback'
      )
    ),
  };

  const showSections = rawPage?.show_sections ?? [];
  const mergedShowSections = [
    'hero',
    'generator',
    ...(showcaseSection ? ['showcase'] : []),
    'creatorFeedback',
    ...showSections.filter(
      (key) =>
        key !== 'hero' &&
        key !== 'benefits' &&
        key !== 'testimonials' &&
        key !== 'examples' &&
        key !== 'showcase' &&
        key !== 'generator' &&
        key !== 'whyChoose' &&
        key !== 'creatorFeedback'
    ),
  ];

  const page: DynamicPage = {
    ...rawPage,
    sections: mergedSections,
    show_sections: mergedShowSections,
  };

  const topSections: Record<string, Section> = {
    hero: mergedSections.hero,
    generator: mergedSections.generator,
  };
  const lowerShowSections = mergedShowSections.filter(
    (key) => key !== 'hero' && key !== 'generator'
  );
  const lowerSections = Object.fromEntries(
    Object.entries(mergedSections).filter(
      ([key]) => key !== 'hero' && key !== 'generator'
    )
  ) as Record<string, Section>;

  const topPage: DynamicPage = {
    ...page,
    sections: topSections,
    show_sections: Object.keys(topSections),
  };
  const lowerPage: DynamicPage = {
    ...page,
    title: undefined,
    sections: lowerSections,
    show_sections: lowerShowSections,
  };

  return (
    <div className={AI_IMAGE_SURFACE_CLASS_NAME}>
      <div className={AI_IMAGE_HERO_SURFACE_CLASS_NAME}>
        <GPTImageCanvasBackground themeMode="dark" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-80 bg-linear-to-b from-white/[0.08] via-transparent to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40 bg-linear-to-t from-[#071019] via-[#071019]/72 to-transparent"
        />
        <div className="relative z-10">
          <ThemeDynamicPage locale={locale} page={topPage} />
        </div>
      </div>

      <div className="relative z-10">
        <ThemeDynamicPage locale={locale} page={lowerPage} />
      </div>
    </div>
  );
}
