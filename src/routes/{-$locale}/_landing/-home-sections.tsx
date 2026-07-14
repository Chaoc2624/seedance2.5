import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import Clapperboard from 'lucide-react/dist/esm/icons/clapperboard';
import Languages from 'lucide-react/dist/esm/icons/languages';
import PanelsTopLeft from 'lucide-react/dist/esm/icons/panels-top-left';
import ScanFace from 'lucide-react/dist/esm/icons/scan-face';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Video from 'lucide-react/dist/esm/icons/video';
import Volume2 from 'lucide-react/dist/esm/icons/volume-2';
import type { ComponentType } from 'react';

import { Link } from '@/core/i18n/navigation';

import { CreatorFeedbackWall } from '@/themes/default/blocks/creator-feedback-wall';
import { Faq } from '@/themes/default/blocks/faq';

import { cn } from '@/lib/utils';

import { CONTENT_FRAME_CLASS, whatsNew } from './-home-data';
import { getHomePageCopy, type HomePageCopy } from './-home-page-copy';
import { SeedanceVideoGallerySection } from './-seedance-video-gallery';

type FeatureItem = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

const capabilityIcons = [
  PanelsTopLeft,
  Sparkles,
  ScanFace,
  Video,
  Clapperboard,
  Volume2,
] as const;

const supportedSmallLanguages = [
  ['Español', 'es'],
  ['Français', 'fr'],
  ['Italiano', 'it'],
  ['العربية', 'ar'],
  ['Português', 'pt'],
  ['Norsk', 'no'],
  ['Русский', 'ru'],
  ['Polski', 'pl'],
] as const;

function SectionHeading({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn('max-w-2xl', className)}>
      <h2 className="font-display text-3xl leading-tight font-semibold text-slate-950 md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function CapabilitySection({ copy }: { copy: HomePageCopy }) {
  const capabilities: FeatureItem[] = copy.capabilities.map((item, index) => ({
    ...item,
    icon: capabilityIcons[index] ?? Sparkles,
  }));

  return (
    <section className={cn(CONTENT_FRAME_CLASS, 'mt-24')}>
      <SectionHeading
        title={copy.capability.title}
        description={copy.capability.description}
      />
      <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-blue-100 bg-blue-100 md:grid-cols-2 lg:grid-cols-3">
        {capabilities.map((item, index) => {
          const Icon = item.icon;
          return (
            <article
              key={item.title}
              className={cn(
                'min-h-56 bg-white p-6',
                index === 0 && 'bg-blue-600 text-white',
                index === 4 && 'bg-blue-50'
              )}
            >
              <Icon
                className={cn(
                  'size-6 text-blue-600',
                  index === 0 && 'text-white'
                )}
              />
              <h3 className="mt-12 text-xl font-semibold">{item.title}</h3>
              <p
                className={cn(
                  'mt-3 text-sm leading-6 text-slate-600',
                  index === 0 && 'text-blue-50'
                )}
              >
                {item.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function WhatsNewSection({ copy }: { copy: HomePageCopy }) {
  return (
    <section className="border-b border-blue-100 bg-white py-10">
      <div className={CONTENT_FRAME_CLASS}>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              {copy.whatsNew.eyebrow}
            </p>
            <h2 className="mt-2 font-display text-3xl leading-tight font-semibold tracking-[-0.035em] text-slate-950 md:text-5xl">
              {copy.whatsNew.title}
            </h2>
          </div>
          <p className="hidden max-w-md text-sm leading-6 text-slate-500 md:block">
            {copy.whatsNew.description}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {whatsNew.map((item, index) => {
            const localized = copy.whatsNew.cards[index];
            return (
              <article
                key={localized?.title ?? item.title}
                className="group relative min-h-56 overflow-hidden rounded-2xl border border-blue-100 bg-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.14)]"
              >
                <img
                  src={item.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <div
                  className={cn(
                    'absolute inset-0 bg-linear-to-br opacity-80',
                    item.accent
                  )}
                />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <span className="inline-flex min-h-7 items-center rounded-full bg-white/14 px-3 text-[11px] font-semibold text-white backdrop-blur-md">
                    {localized?.label ?? item.label}
                  </span>
                  <h3 className="mt-4 text-2xl leading-tight font-semibold tracking-[-0.025em]">
                    {localized?.title ?? item.title}
                  </h3>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MultilingualSection({ copy }: { copy: HomePageCopy }) {
  return (
    <section className="mt-24 border-y border-blue-100 bg-blue-50/70 py-20">
      <div
        className={cn(
          CONTENT_FRAME_CLASS,
          'grid gap-12 lg:grid-cols-[0.82fr_1.18fr]'
        )}
      >
        <div>
          <Languages className="size-8 text-blue-600" />
          <h2 className="mt-6 max-w-lg font-display text-4xl leading-tight font-semibold text-slate-950 md:text-6xl">
            {copy.multilingual.title}
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
            {copy.multilingual.description}
          </p>
        </div>
        <div className="self-end">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {supportedSmallLanguages.map(([label, code]) => (
              <div
                key={code}
                className="flex min-h-14 items-center justify-between rounded-lg border border-blue-100 bg-white px-4 text-sm font-semibold text-slate-800"
              >
                {label}
                <span
                  aria-hidden
                  className="size-1.5 rounded-full bg-blue-400"
                />
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            {copy.multilingual.footer}
          </p>
        </div>
      </div>
    </section>
  );
}

function UseCasesSection({ copy }: { copy: HomePageCopy }) {
  return (
    <section className={cn(CONTENT_FRAME_CLASS, 'mt-24')}>
      <SectionHeading
        title={copy.useCases.title}
        description={copy.useCases.description}
      />
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {copy.useCases.items.map(([title, description], index) => (
          <article
            key={title}
            className={cn(
              'grid min-h-40 grid-cols-[auto_1fr] gap-5 rounded-lg border border-slate-200 bg-white p-6',
              index === 2 && 'bg-slate-950 text-white',
              index === 5 && 'border-blue-200 bg-blue-50'
            )}
          >
            <span
              className={cn(
                'font-display text-3xl font-semibold text-blue-600',
                index === 2 && 'text-blue-400'
              )}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p
                className={cn(
                  'mt-3 text-sm leading-6 text-slate-600',
                  index === 2 && 'text-slate-300'
                )}
              >
                {description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkflowSection({ copy }: { copy: HomePageCopy }) {
  return (
    <section className="mt-24 bg-blue-600 py-20 text-white">
      <div className={CONTENT_FRAME_CLASS}>
        <SectionHeading
          className="[&_h2]:text-white [&_p]:text-blue-100"
          title={copy.workflow.title}
          description={copy.workflow.description}
        />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {copy.workflow.steps.map(([title, description], index) => (
            <div key={title} className="border-t border-white/30 pt-5">
              <span className="text-sm font-semibold text-blue-100">
                0{index + 1}
              </span>
              <h3 className="mt-10 text-2xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-blue-100">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PaywallSection({ copy }: { copy: HomePageCopy }) {
  return (
    <section className={cn(CONTENT_FRAME_CLASS, 'mt-24')}>
      <div className="rounded-lg border border-blue-100 bg-slate-950 px-5 py-14 text-white md:px-10">
        <SectionHeading
          className="[&_h2]:text-white [&_p]:text-slate-300"
          title={copy.paywall.title}
          description={copy.paywall.description}
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {copy.paywall.plans.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                'rounded-lg border border-white/12 bg-white/[0.04] p-6',
                plan.featured && 'border-blue-400 bg-blue-500/15'
              )}
            >
              <h3 className="text-2xl font-semibold">{plan.name}</h3>
              <p className="mt-3 min-h-12 text-sm leading-6 text-slate-300">
                {plan.description}
              </p>
              <ul className="mt-8 space-y-3 text-sm text-slate-200">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Sparkles className="size-4 text-blue-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <Link
          href="/pricing"
          className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-blue-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-400 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          {copy.paywall.comparePlans} <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

export function HomePageSections({ locale }: { locale: string }) {
  const copy = getHomePageCopy(locale);
  const creatorFeedbackSection = {
    id: 'creator-feedback',
    title: copy.creatorFeedback.title,
    description: copy.creatorFeedback.description,
  };
  const faqSection = {
    id: copy.faq.id,
    title: copy.faq.title,
    description: copy.faq.description,
    items: copy.faq.items.map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
  };

  return (
    <>
      <WhatsNewSection copy={copy} />
      <SeedanceVideoGallerySection />
      <CapabilitySection copy={copy} />
      <MultilingualSection copy={copy} />
      <UseCasesSection copy={copy} />
      <WorkflowSection copy={copy} />
      <CreatorFeedbackWall section={creatorFeedbackSection} />
      <Faq section={faqSection} />
      <PaywallSection copy={copy} />
    </>
  );
}
