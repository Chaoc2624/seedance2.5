import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

import { useCurrentLocale } from '@/core/i18n/navigation';

import { setGlobalCreationComposerHomeHeroVisible } from '@/components/features/ai-generator/components/global-creation-composer-events';
import { useGlobalCreationDraft } from '@/components/features/ai-generator/components/global-creation-draft-context';
import { HeroCreationForm } from '@/components/features/ai-generator/components/hero-creation-form';
import { getHeadMeta } from '@/lib/seo';

import { seedanceVideos } from './-home-data';
import { getHomePageCopy } from './-home-page-copy';
import { HomePageSections } from './-home-sections';

export const Route = createFileRoute('/{-$locale}/_landing/')({
  component: LandingPage,
  head: ({ params }) => {
    const copy = getHomePageCopy(params.locale);
    return getHeadMeta({
      title: copy.meta.title,
      description: copy.meta.description,
      canonicalUrl: '/',
      imageUrl: '/preview.png',
      locale: params.locale,
    });
  },
});

function HeroSection() {
  const locale = useCurrentLocale();
  const pageCopy = getHomePageCopy(locale);
  const copy = pageCopy.hero;
  const formVisibilityRef = useRef<HTMLDivElement>(null);
  const { draft: creationDraft, setDraft: setCreationDraft } =
    useGlobalCreationDraft();
  const heroVideo = seedanceVideos[0];

  useEffect(() => {
    const target = formVisibilityRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) =>
        setGlobalCreationComposerHomeHeroVisible(
          Boolean(entry?.isIntersecting)
        ),
      { threshold: 0.08, rootMargin: '0px 0px -12% 0px' }
    );
    observer.observe(target);

    return () => {
      observer.disconnect();
      setGlobalCreationComposerHomeHeroVisible(false);
    };
  }, []);

  return (
    <section className="relative isolate overflow-hidden border-b border-blue-100 bg-white px-4 pt-16 pb-8 sm:px-6 lg:px-8">
      <video
        aria-hidden
        src={heroVideo.src}
        poster={heroVideo.poster}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-55 saturate-125"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_30%,rgba(37,99,235,0.10)_0,rgba(37,99,235,0.02)_32%,transparent_56%),linear-gradient(90deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.88)_42%,rgba(239,246,255,0.45)_72%,rgba(255,255,255,0.76)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-64 bg-linear-to-t from-white via-white/72 to-transparent"
      />
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(320px,0.48fr)]">
          <div className="max-w-5xl">
            <p className="inline-flex min-h-9 items-center rounded-full border border-blue-100 bg-white/82 px-4 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-900/5 backdrop-blur-xl">
              {copy.eyebrow}
            </p>
            <h1 className="mt-6 max-w-5xl font-display text-5xl leading-[0.98] font-semibold tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-8xl">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              {copy.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {copy.chips.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-blue-100 bg-white/78 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm shadow-blue-900/5 backdrop-blur-xl"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden rounded-[2rem] border border-white/70 bg-white/28 p-3 shadow-[0_30px_100px_rgba(37,99,235,0.18)] backdrop-blur-xl lg:block">
            <video
              aria-hidden
              src={heroVideo.src}
              poster={heroVideo.poster}
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
              className="aspect-video w-full rounded-[1.45rem] object-cover shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
            />
          </div>
        </div>
        <div
          id="create"
          ref={formVisibilityRef}
          className="mt-10 w-full scroll-mt-20 lg:mt-12"
        >
          <HeroCreationForm
            videoOnly
            draft={creationDraft}
            onDraftChange={setCreationDraft}
          />
        </div>
      </div>
    </section>
  );
}

function LandingPage() {
  const locale = useCurrentLocale();

  return (
    <>
      <HeroSection />
      <HomePageSections locale={locale} />
    </>
  );
}
