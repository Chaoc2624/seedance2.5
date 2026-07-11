import { cn } from '@/lib/utils';

export type AccentStyle = {
  glow: string;
  icon: string;
  line: string;
};

export const ACCENT_STYLES: readonly AccentStyle[] = [
  {
    glow: 'from-cyan-100/90 via-white to-lime-50/80 dark:from-cyan-500/20 dark:via-slate-950 dark:to-lime-400/10',
    icon: 'bg-cyan-500/10 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-200',
    line: 'from-cyan-500 to-lime-400',
  },
  {
    glow: 'from-sky-100/90 via-white to-cyan-50/80 dark:from-sky-500/20 dark:via-slate-950 dark:to-cyan-400/10',
    icon: 'bg-sky-500/10 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200',
    line: 'from-sky-500 to-cyan-400',
  },
  {
    glow: 'from-slate-100/90 via-white to-cyan-50/80 dark:from-slate-600/20 dark:via-slate-950 dark:to-cyan-400/10',
    icon: 'bg-slate-900/5 text-slate-800 dark:bg-white/10 dark:text-slate-100',
    line: 'from-slate-800 to-cyan-500',
  },
  {
    glow: 'from-lime-50/90 via-white to-cyan-50/80 dark:from-lime-400/10 dark:via-slate-950 dark:to-cyan-400/10',
    icon: 'bg-lime-500/10 text-lime-800 dark:bg-lime-400/15 dark:text-lime-200',
    line: 'from-lime-500 to-cyan-500',
  },
];

export const pickAccent = (i: number): AccentStyle =>
  ACCENT_STYLES[
    ((i % ACCENT_STYLES.length) + ACCENT_STYLES.length) % ACCENT_STYLES.length
  ];

const GRID_CLASS =
  'pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:80px_80px] opacity-[0.08]';

const WASH_CLASS =
  'pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-muted/40 to-transparent';

export function SectionDecorations({
  variant = 'both',
  className,
}: {
  variant?: 'grid' | 'wash' | 'both';
  className?: string;
}) {
  return (
    <>
      {(variant === 'grid' || variant === 'both') && (
        <div aria-hidden className={cn(GRID_CLASS, className)} />
      )}
      {(variant === 'wash' || variant === 'both') && (
        <div aria-hidden className={WASH_CLASS} />
      )}
    </>
  );
}
