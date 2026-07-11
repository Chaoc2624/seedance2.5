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

import { localeOptions } from '@/config/locale';

import { cn } from '@/lib/utils';

import { CONTENT_FRAME_CLASS } from './-home-data';
import { SeedanceVideoGallerySection } from './-seedance-video-gallery';

type FeatureItem = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

const capabilities: FeatureItem[] = [
  {
    title: 'Multimodal direction',
    description:
      'Combine prompts, reference images, clips, and audio cues in one video workflow.',
    icon: PanelsTopLeft,
  },
  {
    title: 'Reference anything',
    description:
      'Guide characters, camera language, rhythm, composition, and atmosphere with references.',
    icon: Sparkles,
  },
  {
    title: 'Character consistency',
    description:
      'Keep faces, wardrobe, proportions, and visual identity coherent across a sequence.',
    icon: ScanFace,
  },
  {
    title: 'Camera and motion control',
    description:
      'Describe precise movement, shot scale, lens behavior, and transitions in natural language.',
    icon: Video,
  },
  {
    title: 'Video extension and editing',
    description:
      'Extend an existing clip, reshape a scene, or connect shots while preserving continuity.',
    icon: Clapperboard,
  },
  {
    title: 'Synchronized sound',
    description:
      'Plan dialogue, ambience, music, and action beats as part of the same creative brief.',
    icon: Volume2,
  },
];

const useCases = [
  [
    'Advertising',
    'Campaign films, product stories, and localized creative variants.',
  ],
  [
    'Education',
    "Explain difficult ideas with visual lessons in a learner's own language.",
  ],
  [
    'Storytelling',
    'Develop characters, worlds, and cinematic sequences from a single brief.',
  ],
  [
    'Social content',
    'Create vertical clips and regional versions for global communities.',
  ],
  [
    'Previsualization',
    'Test framing, movement, lighting, and scene rhythm before production.',
  ],
  [
    'Music and performance',
    'Build visual performances around lyrics, beats, and choreography.',
  ],
] as const;

const plans = [
  {
    name: 'Free',
    description: 'Explore prompts and test the Seedance video workflow.',
    features: [
      'Starter credits',
      'Core video controls',
      'Public showcase access',
    ],
  },
  {
    name: 'Creator',
    description:
      'More generations and higher-quality output for regular publishing.',
    features: [
      'More monthly credits',
      'Priority generation',
      'Commercial workflows',
    ],
    featured: true,
  },
  {
    name: 'Studio',
    description: 'Capacity and collaboration for teams producing at scale.',
    features: [
      'Highest credit allowance',
      'Team-ready workflow',
      'Priority support',
    ],
  },
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

function CapabilitySection() {
  return (
    <section className={cn(CONTENT_FRAME_CLASS, 'mt-24')}>
      <SectionHeading
        title="Direct every part of the shot"
        description="Seedance 2.5 brings references, performance, motion, editing, and sound into one focused video workflow."
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

function MultilingualSection() {
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
            Create for the languages your audience speaks
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
            Seedance 2.5 is designed for multilingual prompting and localized
            storytelling, including languages that receive less support in
            mainstream creative tools.
          </p>
        </div>
        <div className="self-end">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {localeOptions.map((option) => (
              <Link
                key={option.code}
                href="/"
                locale={option.code}
                className="flex min-h-14 items-center justify-between rounded-lg border border-blue-100 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-blue-300 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
              >
                {option.label}
                <ArrowUpRight className="size-4 text-blue-500" />
              </Link>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Prompt in the language that carries the right cultural detail, then
            adapt the result for another market without changing tools.
          </p>
        </div>
      </div>
    </section>
  );
}

function UseCasesSection() {
  return (
    <section className={cn(CONTENT_FRAME_CLASS, 'mt-24')}>
      <SectionHeading
        title="One model, many production contexts"
        description="From a fast social cut to a full cinematic concept, start with the same compact video composer."
      />
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {useCases.map(([title, description], index) => (
          <article
            key={title}
            className={cn(
              'grid min-h-40 grid-cols-[auto_1fr] gap-5 rounded-lg border border-slate-200 bg-white p-6',
              index === 2 && 'bg-slate-950 text-white md:row-span-2',
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

function WorkflowSection() {
  const steps = [
    [
      'Add references',
      'Upload an image, a clip, or the first and last frames.',
    ],
    [
      'Describe the scene',
      'Write the action, camera, sound, and language direction.',
    ],
    [
      'Generate and refine',
      'Create the video, review motion, and iterate from the result.',
    ],
  ] as const;

  return (
    <section className="mt-24 bg-blue-600 py-20 text-white">
      <div className={CONTENT_FRAME_CLASS}>
        <SectionHeading
          className="[&_h2]:text-white [&_p]:text-blue-100"
          title="From reference to finished motion"
          description="A direct three-part workflow keeps the creative decision in view from prompt to final video."
        />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map(([title, description], index) => (
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

function PaywallSection() {
  return (
    <section className={cn(CONTENT_FRAME_CLASS, 'mt-24')}>
      <div className="rounded-lg border border-blue-100 bg-slate-950 px-5 py-14 text-white md:px-10">
        <SectionHeading
          className="[&_h2]:text-white [&_p]:text-slate-300"
          title="Choose the pace of your production"
          description="Start free, then unlock more generation capacity when Seedance becomes part of your regular workflow."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
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
          Compare plans <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

export function HomePageSections({ locale: _locale }: { locale: string }) {
  return (
    <>
      <SeedanceVideoGallerySection />
      <CapabilitySection />
      <MultilingualSection />
      <UseCasesSection />
      <WorkflowSection />
      <PaywallSection />
    </>
  );
}
