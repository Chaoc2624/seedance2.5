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

const creatorFeedbackSection = {
  id: 'creator-feedback',
  title: 'Loved by creators',
  description:
    'Directors, marketers, educators, and content teams use Seedance 2.5 to move from a creative brief to finished motion faster.',
};

const faqSection = {
  id: 'faq',
  title: 'Frequently asked questions',
  description:
    'Clear answers about multimodal video creation with Seedance 2.5.',
  items: [
    {
      question: 'What is Seedance 2.5?',
      answer:
        'Seedance 2.5 is a video-first AI creation workflow for turning prompts, reference media, camera direction, and sound cues into cinematic videos.',
    },
    {
      question: 'Which inputs can I use?',
      answer:
        'You can start with a text prompt, reference images, video clips, or audio cues. Combine them to describe the subject, motion, composition, atmosphere, and pacing you want.',
    },
    {
      question: 'Can I generate a video from an image or an existing clip?',
      answer:
        'Yes. Use the text/image-to-video workflow for a reference image, or use a video reference when you want to extend or reshape an existing visual direction.',
    },
    {
      question: 'Can I control camera movement and character consistency?',
      answer:
        'Yes. Describe shot scale, camera movement, lens behavior, transitions, and performance in natural language. Reference images and clips can also help preserve characters, wardrobe, and visual identity across a sequence.',
    },
    {
      question: 'Can I extend or edit an existing video?',
      answer:
        'Yes. The workflow supports video extension and targeted editing so you can continue a shot, reshape a scene, or connect shots while keeping the creative direction consistent.',
    },
    {
      question: 'Which output settings are available?',
      answer:
        'The generator exposes controls for duration, resolution, and aspect ratio. The homepage composer starts with a 5-second, 1080p, 16:9 video setup, and you can adjust those settings in the generator.',
    },
    {
      question: 'Does Seedance 2.5 support multilingual prompts?',
      answer:
        'Yes. You can write creative briefs in supported languages and use the same workflow for localized stories, regional variants, and culturally specific direction.',
    },
  ],
};

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

function WhatsNewSection() {
  return (
    <section className="border-b border-blue-100 bg-white py-10">
      <div className={CONTENT_FRAME_CLASS}>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              Seedance 2.5 updates
            </p>
            <h2 className="mt-2 font-display text-3xl leading-tight font-semibold tracking-[-0.035em] text-slate-950 md:text-5xl">
              What's new
            </h2>
          </div>
          <p className="hidden max-w-md text-sm leading-6 text-slate-500 md:block">
            New video-first workflows for cleaner motion, multilingual prompts,
            references, and sound-aware creative direction.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {whatsNew.map((item, index) => (
            <article
              key={item.title}
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
                  {item.label}
                </span>
                <h3 className="mt-4 text-2xl leading-tight font-semibold tracking-[-0.025em]">
                  {item.title}
                </h3>
              </div>
            </article>
          ))}
        </div>
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
      <WhatsNewSection />
      <SeedanceVideoGallerySection />
      <CapabilitySection />
      <MultilingualSection />
      <UseCasesSection />
      <WorkflowSection />
      <CreatorFeedbackWall section={creatorFeedbackSection} />
      <Faq section={faqSection} />
      <PaywallSection />
    </>
  );
}
