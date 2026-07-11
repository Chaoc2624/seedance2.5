import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import { useCurrentLocale } from '@/core/i18n/navigation';

import { setGlobalCreationComposerHomeHeroVisible } from '@/components/features/ai-generator/components/global-creation-composer-events';
import {
  type HeroCreationDraft,
  HeroCreationForm,
} from '@/components/features/ai-generator/components/hero-creation-form';
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
    eyebrow: 'Multilingual AI video creation',
    title: 'Seedance 2.5 AI Video Generator',
    description:
      'Create cinematic videos from prompts and references, with multilingual direction built for global stories.',
  },
  de: {
    eyebrow: 'Mehrsprachige KI-Videoproduktion',
    title: 'Seedance 2.5 KI-Videogenerator',
    description:
      'Erstelle filmische Videos aus Prompts und Referenzen fuer Geschichten in vielen Sprachen.',
  },
  fr: {
    eyebrow: 'Creation video IA multilingue',
    title: 'Generateur video IA Seedance 2.5',
    description:
      'Creez des videos cinematographiques avec des prompts et references adaptes aux audiences mondiales.',
  },
  es: {
    eyebrow: 'Creacion de video con IA multilingue',
    title: 'Generador de video IA Seedance 2.5',
    description:
      'Crea videos cinematograficos con prompts y referencias para historias dirigidas a audiencias globales.',
  },
  it: {
    eyebrow: 'Creazione video IA multilingue',
    title: 'Generatore video IA Seedance 2.5',
    description:
      'Crea video cinematografici da prompt e riferimenti per storie rivolte a un pubblico globale.',
  },
  pl: {
    eyebrow: 'Wielojezyczne tworzenie wideo AI',
    title: 'Generator wideo AI Seedance 2.5',
    description:
      'Tworz filmowe wideo z promptow i materialow referencyjnych dla odbiorcow na calym swiecie.',
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
  const [creationDraft, setCreationDraft] = useState<HeroCreationDraft | null>(
    null
  );
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
    <section className="relative isolate flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden border-b border-blue-100 bg-white px-4 pt-16 pb-12 sm:px-6 lg:px-8">
      <video
        aria-hidden
        src={heroVideo.src}
        poster={heroVideo.poster}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-20"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.92)_42%,rgba(239,246,255,0.72)_72%,rgba(255,255,255,0.88)_100%)]"
      />
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold text-blue-700">{copy.eyebrow}</p>
          <h1 className="mt-5 max-w-4xl font-display text-4xl leading-[1.05] font-semibold text-slate-950 sm:text-5xl lg:text-7xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            {copy.description}
          </p>
        </div>
        <div ref={formVisibilityRef} className="mt-10 w-full">
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
