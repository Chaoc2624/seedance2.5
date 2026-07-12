import { useMemo } from 'react';

import { LazyImage } from '@/components/blocks/common/media/lazy-image';
import { Marquee } from '@/components/ui/marquee';
import { ScrollAnimation } from '@/components/ui/scroll-animation';
import { cn } from '@/lib/utils';
import { Section } from '@/types/blocks/landing';

type FeedbackItem = {
  name: string;
  role: string;
  quote: string;
  image: {
    src: string;
    alt: string;
  };
};

type FeedbackWallVariant = 'default' | 'seedance';

const fallbackItems: FeedbackItem[] = [
  {
    name: 'Priya Sharma',
    role: 'Social Media Manager',
    quote:
      'I can test three campaign directions before lunch and still hand over videos that feel client-ready.',
    image: {
      src: '/imgs/avatars/gpt-image2-priya-sharma.svg',
      alt: 'Priya Sharma avatar',
    },
  },
  {
    name: 'Jessica Liu',
    role: 'Animation Director',
    quote:
      'Reference-led clips come out coherent enough that we can discuss camera rhythm before production begins.',
    image: {
      src: '/imgs/avatars/gpt-image2-jessica-liu.svg',
      alt: 'Jessica Liu avatar',
    },
  },
  {
    name: 'Maya Okonkwo',
    role: 'Music Artist',
    quote:
      'The visual polish is strong enough to explore performance moods, lyric worlds, and music visuals in one sitting.',
    image: {
      src: '/imgs/avatars/gpt-image2-maya-okonkwo.svg',
      alt: 'Maya Okonkwo avatar',
    },
  },
  {
    name: 'Daniel Yamamoto',
    role: 'VFX Artist',
    quote:
      'Previs clips hold lighting, composition, and camera movement better than most fast video tools I have tried.',
    image: {
      src: '/imgs/avatars/gpt-image2-daniel-yamamoto.svg',
      alt: 'Daniel Yamamoto avatar',
    },
  },
  {
    name: 'Sarah Chen',
    role: 'Content Creator',
    quote:
      'I move from idea to polished social cut in minutes, which changes how often I publish and test.',
    image: {
      src: '/imgs/avatars/gpt-image2-sarah-chen.svg',
      alt: 'Sarah Chen avatar',
    },
  },
  {
    name: 'Tom Brennan',
    role: 'Creative Director',
    quote:
      'The workflow feels practical instead of experimental: brief, generate, review, refine, and send.',
    image: {
      src: '/imgs/avatars/gpt-image2-tom-brennan.svg',
      alt: 'Tom Brennan avatar',
    },
  },
  {
    name: 'Dr. Linda Park',
    role: 'Film Professor',
    quote:
      'It is a useful teaching tool because students can compare how the same shot direction changes across languages.',
    image: {
      src: '/imgs/avatars/gpt-image2-linda-park.svg',
      alt: 'Dr. Linda Park avatar',
    },
  },
  {
    name: 'Amanda Foster',
    role: 'Fitness Creator',
    quote:
      'Product styling, set design, and editorial pacing come together fast enough for weekly content planning.',
    image: {
      src: '/imgs/avatars/gpt-image2-amanda-foster.svg',
      alt: 'Amanda Foster avatar',
    },
  },
];

function splitIntoColumns<T>(items: T[], columnsCount: number) {
  return Array.from({ length: columnsCount }, (_, columnIndex) =>
    items.filter((_, itemIndex) => itemIndex % columnsCount === columnIndex)
  );
}

function FeedbackCard({
  item,
  index,
  variant,
}: {
  item: FeedbackItem;
  index: number;
  variant: FeedbackWallVariant;
}) {
  const isSeedance = variant === 'seedance';

  return (
    <article
      className={cn(
        'p-5 transition-[background-color,border-color,box-shadow] duration-300',
        isSeedance
          ? 'rounded-lg border border-[#f4f2df12] bg-[#0c0f0b] shadow-[0_14px_36px_rgba(0,0,0,0.14)] hover:border-[#d8f269]/40 hover:bg-[#151a10]'
          : 'rounded-md border border-border/70 bg-card shadow-sm shadow-black/5 hover:border-primary/25 hover:shadow-md hover:shadow-black/5',
        index % 3 === 0 ? 'min-h-[15.5rem]' : 'min-h-[13rem]'
      )}
    >
      <p
        className={cn(
          'text-[15px] leading-8',
          isSeedance ? 'text-[#c9cbb8]' : 'text-muted-foreground'
        )}
      >
        {item.quote}
      </p>
      <div className="mt-7 flex items-center gap-3">
        <div
          className={cn(
            'size-12 overflow-hidden rounded-full border p-0.5',
            isSeedance
              ? 'border-[#f4f2df1f] bg-[#151a10]'
              : 'border-border bg-muted'
          )}
        >
          <LazyImage
            src={item.image.src}
            alt={item.image.alt}
            className="h-full w-full rounded-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p
            className={cn(
              'truncate text-base font-semibold',
              isSeedance ? 'text-[#f4f2e6]' : 'text-foreground'
            )}
          >
            {item.name}
          </p>
          <p
            className={cn(
              'truncate text-sm',
              isSeedance ? 'text-[#a9ac96]' : 'text-muted-foreground'
            )}
          >
            {item.role}
          </p>
        </div>
      </div>
    </article>
  );
}

export function CreatorFeedbackWall({
  section,
  className,
  variant = 'default',
}: {
  section: Section;
  className?: string;
  variant?: FeedbackWallVariant;
}) {
  const items = (section.items as FeedbackItem[] | undefined) ?? fallbackItems;
  const desktopColumns = useMemo(() => splitIntoColumns(items, 4), [items]);
  const isSeedance = variant === 'seedance';
  const durationClasses = [
    '[--duration:26s]',
    '[--duration:32s]',
    '[--duration:29s]',
    '[--duration:35s]',
  ];

  return (
    <section
      id={section.id}
      className={cn(
        'relative overflow-hidden py-16 md:py-20',
        isSeedance
          ? 'rounded-xl border border-[#f4f2df12] bg-[#11140f] text-[#f4f2e6] shadow-[0_24px_90px_rgba(21,26,12,0.16)]'
          : 'border-t border-border/70 bg-muted/35 text-foreground md:py-24',
        section.className,
        className
      )}
    >
      <div
        className={cn(
          'relative container',
          isSeedance && 'max-w-[1440px] px-4 sm:px-6 md:px-8'
        )}
      >
        <ScrollAnimation>
          <div className="mx-auto max-w-3xl text-center">
            <div
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold tracking-[0.18em] uppercase',
                isSeedance
                  ? 'border-[#d8f269]/25 bg-[#d8f269]/10 text-[#d8f269]'
                  : 'border-border bg-background text-muted-foreground'
              )}
            >
              User Feedback
            </div>
            {section.title && (
              <h2
                className={cn(
                  'mt-5 text-3xl leading-tight font-bold text-balance md:text-5xl',
                  isSeedance && 'font-display font-semibold tracking-normal'
                )}
              >
                {section.title}
              </h2>
            )}
            {section.description && (
              <p
                className={cn(
                  'mx-auto mt-4 max-w-2xl text-base leading-7 md:text-lg',
                  isSeedance ? 'text-[#a9ac96]' : 'text-muted-foreground'
                )}
              >
                {section.description}
              </p>
            )}
          </div>
        </ScrollAnimation>

        <div className="mt-10 grid gap-4 md:hidden">
          {items.map((item, index) => (
            <FeedbackCard
              key={item.name}
              item={item}
              index={index}
              variant={variant}
            />
          ))}
        </div>

        <div className="relative mt-12 hidden md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-4">
          {desktopColumns.map((column, columnIndex) => (
            <div
              key={`column-${columnIndex}`}
              className={cn(
                'relative h-[34rem] overflow-hidden p-2',
                isSeedance
                  ? 'rounded-lg border border-[#f4f2df12] bg-[#0c0f0b]/80 shadow-[0_14px_36px_rgba(0,0,0,0.14)]'
                  : 'rounded-md border border-border/70 bg-background/65 shadow-sm shadow-black/5',
                columnIndex % 2 === 1 ? 'translate-y-10' : ''
              )}
            >
              <div
                className={cn(
                  'pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b to-transparent',
                  isSeedance
                    ? 'from-[#0c0f0b] via-[#0c0f0b]/85'
                    : 'from-background via-background/85'
                )}
              />
              <div
                className={cn(
                  'pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t to-transparent',
                  isSeedance
                    ? 'from-[#0c0f0b] via-[#0c0f0b]/85'
                    : 'from-background via-background/85'
                )}
              />
              <Marquee
                vertical
                pauseOnHover
                reverse={columnIndex % 2 === 1}
                className={cn(
                  'h-full px-1 py-3 [--gap:1rem]',
                  durationClasses[columnIndex]
                )}
              >
                {column.map((item, itemIndex) => (
                  <FeedbackCard
                    key={`${item.name}-${columnIndex}`}
                    item={item}
                    index={itemIndex + columnIndex * 3}
                    variant={variant}
                  />
                ))}
              </Marquee>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
