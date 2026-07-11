import FileText from 'lucide-react/dist/esm/icons/file-text';
import ImageIcon from 'lucide-react/dist/esm/icons/image';
import Monitor from 'lucide-react/dist/esm/icons/monitor';
import Palette from 'lucide-react/dist/esm/icons/palette';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Zap from 'lucide-react/dist/esm/icons/zap';

import { ScrollAnimation } from '@/components/ui/scroll-animation';
import { cn } from '@/lib/utils';
import { Section } from '@/types/blocks/landing';

type BenefitIconKey =
  | 'monitor'
  | 'sparkles'
  | 'image'
  | 'file'
  | 'palette'
  | 'zap';

type BenefitItem = {
  eyebrow: string;
  title: string;
  description: string;
  icon: BenefitIconKey;
};

const iconMap = {
  monitor: Monitor,
  sparkles: Sparkles,
  image: ImageIcon,
  file: FileText,
  palette: Palette,
  zap: Zap,
} satisfies Record<BenefitIconKey, typeof Monitor>;

const fallbackItems: BenefitItem[] = [
  {
    eyebrow: '4K Control',
    title: 'Choose output resolution inside the same workflow',
    description:
      'Move from 1K drafts to 4K finals without leaving the landing page or swapping tools mid-iteration.',
    icon: 'monitor',
  },
  {
    eyebrow: 'Prompt Fidelity',
    title: 'Photoreal detail lands faster with less prompt padding',
    description:
      'Lighting, skin texture, packaging, and surfaces hold together with fewer corrective passes.',
    icon: 'sparkles',
  },
  {
    eyebrow: 'Reference Safe',
    title: 'Image edits keep composition and subject feel intact',
    description:
      'Reference-driven changes stay closer to the original framing, styling, and facial identity.',
    icon: 'image',
  },
  {
    eyebrow: 'Cleaner Type',
    title: 'Text-heavy outputs are easier to review and ship',
    description:
      'Posters, UI mockups, ads, and infographics stay readable enough for serious production drafts.',
    icon: 'file',
  },
  {
    eyebrow: 'Brand Consistency',
    title: 'Visual direction stays steadier across multiple looks',
    description:
      'You can explore campaign moods, art direction, and product styling without the result drifting too far.',
    icon: 'palette',
  },
  {
    eyebrow: 'Fast Loop',
    title: 'Teams can go from idea to approval in one place',
    description:
      'Text-to-image and image-to-image live together, so concepting, revision, and export stay compact.',
    icon: 'zap',
  },
];

export function GptImageBenefits({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const items = (
    (section.items as BenefitItem[] | undefined) ?? fallbackItems
  ).slice(0, 6);

  return (
    <section
      id={section.id}
      className={cn('relative overflow-hidden py-16 md:py-20', className)}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.12),transparent_38%),radial-gradient(circle_at_82%_18%,rgba(14,165,233,0.10),transparent_28%),linear-gradient(180deg,rgba(248,250,252,0.75),rgba(248,250,252,0.98))]"
      />
      <div className="relative container">
        <ScrollAnimation>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
              GPT Image 2 Advantages
            </div>
            {section.title && (
              <h2 className="mt-5 text-3xl leading-tight font-bold text-balance md:text-4xl">
                {section.title}
              </h2>
            )}
            {section.description && (
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                {section.description}
              </p>
            )}
          </div>
        </ScrollAnimation>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const Icon = iconMap[item.icon];

            return (
              <ScrollAnimation
                key={item.title}
                delay={0.08 * (index + 1)}
                className="h-full"
              >
                <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-border/70 bg-background/95 p-6 shadow-[0_22px_60px_-30px_rgba(15,23,42,0.32)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_28px_80px_-36px_rgba(8,47,73,0.38)]">
                  <div
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <div className="relative flex items-start justify-between gap-4">
                    <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
                      {item.eyebrow}
                    </span>
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted/60 text-primary">
                      <Icon className="size-5" />
                    </div>
                  </div>

                  <div className="relative mt-6 space-y-3">
                    <h3 className="text-xl leading-snug font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-7 text-muted-foreground md:text-[15px]">
                      {item.description}
                    </p>
                  </div>
                </article>
              </ScrollAnimation>
            );
          })}
        </div>
      </div>
    </section>
  );
}
