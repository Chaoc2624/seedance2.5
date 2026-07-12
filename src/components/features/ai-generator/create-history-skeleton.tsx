import ImageIcon from 'lucide-react/dist/esm/icons/image';
import Video from 'lucide-react/dist/esm/icons/video';

import { useLocale, useTranslations } from '@/core/i18n/hooks';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const SKELETON_CARDS = [
  { mediaCount: 3, width: 'max-w-[680px]' },
  { mediaCount: 2, width: 'max-w-[520px]' },
];

/**
 * Info derived from the pending payload stored in sessionStorage so the
 * skeleton can show real content instead of placeholder rectangles.
 */
export type PendingTaskInfo = {
  /** Human-readable scene label, e.g. "文生图" */
  scene: string;
  /** Model display label, e.g. "GPT Image 2" */
  modelLabel: string;
  prompt: string;
  /** Number of images/videos being generated (1–4) */
  outputCount: number;
  mediaType: 'image' | 'video';
};

export function CreateHistorySkeleton({
  pendingTask,
}: {
  pendingTask?: PendingTaskInfo;
}) {
  const t = useTranslations('pages.generate');
  return (
    <div
      className="space-y-3"
      role="status"
      aria-label={t('skeleton.history_loading')}
    >
      <span className="sr-only">{t('skeleton.history_loading')}</span>
      {pendingTask ? (
        <>
          {/* Replace the first generic skeleton with the real pending task */}
          <CreatePendingTaskSkeleton info={pendingTask} />
          <HistorySkeletonCard
            mediaCount={SKELETON_CARDS[0]!.mediaCount}
            className={SKELETON_CARDS[0]!.width}
          />
        </>
      ) : (
        SKELETON_CARDS.map((card, index) => (
          <HistorySkeletonCard
            key={index}
            mediaCount={card.mediaCount}
            className={card.width}
          />
        ))
      )}
    </div>
  );
}

export function CreateHistoryLoadMoreSkeleton() {
  const t = useTranslations('pages.generate');
  return (
    <div role="status" aria-label={t('skeleton.history_loading_more')}>
      <span className="sr-only">{t('skeleton.history_loading_more')}</span>
      <HistorySkeletonCard mediaCount={2} className="max-w-[520px]" />
    </div>
  );
}

/**
 * A task card that uses real content from the pending payload instead of
 * blank skeleton bars, giving the user immediate visual confirmation that
 * their submission is being processed.
 */
function CreatePendingTaskSkeleton({ info }: { info: PendingTaskInfo }) {
  const t = useTranslations('pages.generate');
  const locale = useLocale();
  const now = new Date();
  const timeStr = now.toLocaleString(locale, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const Icon = info.mediaType === 'video' ? Video : ImageIcon;

  return (
    <article className="w-fit max-w-full rounded-2xl border border-blue-100 bg-white/92 p-4 text-slate-950 shadow-[0_22px_70px_rgba(37,99,235,0.1)]">
      <div className="flex max-w-full items-start justify-between gap-4">
        <div className="max-w-[min(860px,72vw)] min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="rounded-md bg-blue-50 px-2 py-1 font-semibold text-blue-700">
              {info.scene}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">
              {info.modelLabel}
            </span>
            <time>{timeStr}</time>
          </div>
          {/* Show the real prompt so the user can confirm what they submitted */}
          <p className="mt-3 line-clamp-3 text-sm/[1.6] text-slate-700">
            {info.prompt}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
          {t('status.processing')}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
        <Icon className="size-4" />
        {info.mediaType === 'video'
          ? t('timeline.video')
          : t('timeline.images', { completed: 0, total: info.outputCount })}
      </div>

      <div className="mt-4 max-w-[520px] space-y-2">
        <div
          className="lusee-generation-progress"
          aria-label={t('skeleton.progress', { progress: 18 })}
        >
          <div
            className="lusee-generation-progress-fill"
            style={{ width: '18%' }}
          />
        </div>
        <p className="text-xs text-slate-500">{t('skeleton.processing')}</p>
      </div>
    </article>
  );
}

function HistorySkeletonCard({
  mediaCount,
  className,
}: {
  mediaCount: number;
  className: string;
}) {
  return (
    <article
      className={cn(
        'w-full rounded-2xl border border-blue-100 bg-white/84 p-4 shadow-[0_22px_70px_rgba(37,99,235,0.08)]',
        className
      )}
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-7 w-20 rounded-md bg-blue-100/80" />
            <Skeleton className="h-7 w-28 rounded-md bg-blue-100/60" />
            <Skeleton className="h-5 w-24 bg-blue-100/50" />
          </div>
          <Skeleton className="h-5 w-full max-w-[520px] bg-blue-100/70" />
          <Skeleton className="h-5 w-2/3 max-w-[360px] bg-blue-100/50" />
        </div>
        <Skeleton className="h-6 w-16 shrink-0 rounded-full bg-blue-100/70" />
      </div>

      <div className="mt-3 flex items-center gap-4">
        <Skeleton className="h-5 w-20 bg-blue-100/60" />
        <Skeleton className="h-5 w-16 bg-blue-100/50" />
      </div>

      <div
        className={cn(
          'mt-3 grid gap-1.5',
          mediaCount === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'
        )}
      >
        {Array.from({ length: mediaCount }).map((_, index) => (
          <Skeleton
            key={index}
            className="aspect-[4/3] min-h-28 rounded-lg bg-blue-100/60"
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Skeleton className="h-9 w-32 rounded-md bg-blue-100/60" />
        <Skeleton className="h-9 w-24 rounded-md bg-blue-100/60" />
      </div>
    </article>
  );
}
