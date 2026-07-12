import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

import { useCurrentLocale } from '@/core/i18n/navigation';

import { setGlobalCreationComposerHomeHeroVisible } from '@/components/features/ai-generator/components/global-creation-composer-events';
import { useGlobalCreationDraft } from '@/components/features/ai-generator/components/global-creation-draft-context';
import { HeroCreationForm } from '@/components/features/ai-generator/components/hero-creation-form';
import { getHeadMeta } from '@/lib/seo';

import { seedanceVideos } from './-home-data';
import { HomePageSections } from './-home-sections';

export const Route = createFileRoute('/{-$locale}/_landing/')({
  component: LandingPage,
  head: ({ params }) =>
    getHeadMeta({
      title: 'Seedance 2.5 AI Video Generator | Multilingual Video Creation',
      description:
        'Create cinematic AI videos with Seedance 2.5 using prompts, images, clips, camera direction, synchronized sound, and multilingual creative briefs.',
      canonicalUrl: '/',
      imageUrl: '/preview.png',
      locale: params.locale,
    }),
});

const heroCopyByLocale: Record<
  string,
  { eyebrow: string; title: string; description: string }
> = {
  en: {
    eyebrow: 'Seedance 2.5 video generation',
    title: 'Create sharper AI videos in every language',
    description:
      'Turn prompts, images, clips, camera direction, and sound cues into cinematic videos. Seedance 2.5 is built for global teams, including small-language creative briefs.',
  },
  de: {
    eyebrow: 'Mehrsprachige KI-Videoproduktion',
    title: 'Schaerfere KI-Videos fuer jede Sprache',
    description:
      'Erstelle filmische Videos aus Prompts, Referenzen, Kameraanweisungen und Soundideen fuer globale Teams.',
  },
  fr: {
    eyebrow: 'Creation video IA multilingue',
    title: 'Des videos IA plus nettes dans chaque langue',
    description:
      'Creez des videos cinematographiques avec prompts, references, direction camera et indications sonores pour des audiences mondiales.',
  },
  es: {
    eyebrow: 'Creacion de video con IA multilingue',
    title: 'Videos IA mas claros para cada idioma',
    description:
      'Crea videos cinematograficos con prompts, referencias, camara y sonido para historias globales.',
  },
  it: {
    eyebrow: 'Creazione video IA multilingue',
    title: 'Video IA piu nitidi in ogni lingua',
    description:
      'Crea video cinematografici con prompt, riferimenti, regia camera e indicazioni sonore per storie globali.',
  },
  pl: {
    eyebrow: 'Wielojezyczne tworzenie wideo AI',
    title: 'Wyrazniejsze wideo AI w kazdym jezyku',
    description:
      'Tworz filmowe wideo z promptow, referencji, ruchu kamery i wskazowek dzwiekowych dla globalnych odbiorcow.',
  },
  ja: {
    eyebrow: '多言語対応 AI 動画制作',
    title: 'Seedance 2.5 AI 動画ジェネレーター',
    description:
      'プロンプトと参照素材から、世界の視聴者に届くシネマティックな動画を制作できます。',
  },
  ko: {
    eyebrow: '다국어 AI 영상 제작',
    title: 'Seedance 2.5 AI 영상 생성기',
    description:
      '프롬프트와 레퍼런스로 전 세계 시청자를 위한 시네마틱 영상을 제작하세요.',
  },
  'zh-hant': {
    eyebrow: '多語言 AI 影片創作',
    title: 'Seedance 2.5 AI 影片生成器',
    description:
      '使用提示詞與參考素材建立電影級影片，並以多語言創作面向全球觀眾。',
  },
};

function HeroSection() {
  const locale = useCurrentLocale();
  const copy = heroCopyByLocale[locale] ?? heroCopyByLocale.en;
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
              {[
                'Video only',
                'Reference to video',
                'Small-language prompts',
                'Sound-aware scenes',
              ].map((item) => (
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
