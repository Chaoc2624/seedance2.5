import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import ImageIcon from 'lucide-react/dist/esm/icons/image';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import XIcon from 'lucide-react/dist/esm/icons/x';
import ZoomIn from 'lucide-react/dist/esm/icons/zoom-in';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Link } from '@/core/i18n/navigation';

import { showcasePrompts, type ShowcasePrompt } from '@/config/showcase-data';

import AppImage from '@/components/blocks/common/media/app-image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  getCloudflareImageUrl,
  normalizeCloudflareImageSource,
} from '@/lib/cloudflare-image';
import { cn } from '@/lib/utils';
import { Section } from '@/types/blocks/landing';

const PROMPT_EVENT_NAME = 'gpt-image2:prompt-selected';
const ALL_GROUP = 'All';

type PromptShowcaseLabels = {
  eyebrow?: string;
  preview?: string;
  preview_aria?: string;
  dialog_description?: string;
  prompt?: string;
  use_prompt?: string;
  view_more?: string;
  load_more?: string;
  loading_more?: string;
  load_error?: string;
  all?: string;
  use_cases?: Record<string, string>;
  styles?: Record<string, string>;
};

type PromptCardTranslation = {
  title?: string;
  description?: string;
};

function getLabel(
  labels: Record<string, string> | undefined,
  value: string
): string {
  return labels?.[value] ?? value;
}

function getUseCaseGroups(
  labels: Record<string, string> | undefined,
  items: ShowcasePrompt[]
) {
  const labelGroups = labels ? Object.keys(labels) : [];
  if (labelGroups.length > 0) {
    return [ALL_GROUP, ...labelGroups];
  }

  return new Set(items.map((item) => item.useCase)).size > 0
    ? useCaseGroupsValue(items)
    : [ALL_GROUP];
}

function useCaseGroupsValue(items: ShowcasePrompt[]) {
  const groups = Array.from(new Set(items.map((item) => item.useCase)));
  return [ALL_GROUP, ...groups.slice(0, 8)];
}

function mergeShowcasePrompts(
  currentItems: ShowcasePrompt[],
  nextItems: ShowcasePrompt[]
) {
  const merged = new Map<string, ShowcasePrompt>();
  for (const item of currentItems) merged.set(item.id, item);
  for (const item of nextItems) merged.set(item.id, item);
  return Array.from(merged.values());
}

function selectPrompt(prompt: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem('gpt-image2:selected-prompt', prompt);
  window.dispatchEvent(
    new CustomEvent(PROMPT_EVENT_NAME, { detail: { prompt } })
  );
}

function ShowcaseCard({
  item,
  index,
  compact = false,
  featured = false,
  labels,
  cardTranslations,
}: {
  item: ShowcasePrompt;
  index: number;
  compact?: boolean;
  featured?: boolean;
  labels: PromptShowcaseLabels;
  cardTranslations: Record<string, PromptCardTranslation>;
}) {
  const localizedCard = cardTranslations[item.id];
  const title = localizedCard?.title ?? item.title;
  const description = localizedCard?.description ?? item.description;
  const promptPreview = item.prompt.replace(/\s+/g, ' ').trim();
  const originalImage = normalizeCloudflareImageSource(item.image);
  const cardImage = getCloudflareImageUrl(originalImage, {
    width: featured ? 900 : compact ? 720 : 560,
    quality: 78,
    format: 'auto',
    fit: 'cover',
  });
  const previewLabel = labels.preview ?? 'Preview';
  const previewAria =
    labels.preview_aria?.replace('{title}', title) ?? `Preview ${title}`;
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <article
      className={cn(
        'group break-inside-avoid overflow-hidden rounded-lg border border-border bg-background shadow-sm shadow-black/5 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md dark:bg-card',
        featured
          ? 'grid gap-0 md:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.1fr)] md:items-stretch'
          : compact
            ? 'h-full'
            : 'h-full'
      )}
    >
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className={cn(
              'relative block w-full cursor-pointer overflow-hidden bg-muted text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
              featured && index % 2 === 1 ? 'md:order-2' : ''
            )}
            aria-label={previewAria}
          >
            <AppImage
              src={cardImage}
              alt={title}
              sizes={
                featured
                  ? '(max-width: 768px) 100vw, 42vw'
                  : compact
                    ? '(max-width: 768px) 100vw, 33vw'
                    : '(max-width: 389px) calc(100vw - 2rem), (max-width: 768px) 50vw, (max-width: 1280px) 50vw, 33vw'
              }
              className={cn(
                'w-full object-cover',
                featured
                  ? 'aspect-[4/3] h-full md:min-h-72'
                  : compact
                    ? 'aspect-[4/3]'
                    : 'aspect-[4/3] min-[390px]:aspect-square md:aspect-[4/3]'
              )}
              loading="lazy"
              onError={(event) => {
                if (event.currentTarget.dataset.fallbackApplied !== 'true') {
                  event.currentTarget.dataset.fallbackApplied = 'true';
                  event.currentTarget.src = originalImage;
                }
              }}
            />
            {(compact || featured) && (
              <div className="absolute top-2 left-2 rounded-md bg-background/90 px-2 py-1 text-[10px] font-semibold text-primary shadow-sm backdrop-blur">
                {String(index + 1).padStart(2, '0')}
              </div>
            )}
            <div className="absolute right-2 bottom-2 inline-flex items-center gap-1.5 rounded-md bg-background/90 px-2.5 py-1.5 text-[10px] font-semibold text-foreground opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100 group-focus-visible:opacity-100">
              <ZoomIn className="h-3.5 w-3.5 text-primary" />
              {previewLabel}
            </div>
          </button>
        </DialogTrigger>
        <DialogContent
          showCloseButton={false}
          className="flex h-dvh w-screen max-w-none items-center justify-center overflow-hidden border-0 bg-[#050604] p-4 shadow-none sm:max-w-none md:p-6"
          onPointerDown={() => setPreviewOpen(false)}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            {labels.dialog_description ??
              'Full size preview of the generated showcase image.'}
          </DialogDescription>
          <AppImage
            src={originalImage}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-3xl"
            loading="eager"
          />
          <div className="pointer-events-none absolute inset-0 bg-black/56" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_42%_38%,transparent_0,rgba(0,0,0,0.12)_36%,rgba(0,0,0,0.72)_86%)]" />
          <div className="relative flex h-full w-full items-center justify-center">
            <DialogClose className="absolute top-0 right-0 z-10 flex size-11 items-center justify-center rounded-full border border-white/20 bg-background/85 text-foreground shadow-lg shadow-black/20 backdrop-blur-md transition hover:scale-105 hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-black/60 focus-visible:outline-none">
              <XIcon className="size-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
            <div onPointerDown={(event) => event.stopPropagation()}>
              <AppImage
                src={originalImage}
                alt={title}
                className="max-h-[calc(100dvh-2.5rem)] max-w-[calc(100vw-2.5rem)] rounded-xl object-contain shadow-[0_34px_140px_rgba(0,0,0,0.5)] md:max-h-[calc(100dvh-4rem)] md:max-w-[calc(100vw-4rem)]"
                loading="eager"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div
        className={cn(
          'flex flex-col space-y-3',
          featured ? 'p-4 md:p-5' : compact ? 'p-4' : 'p-3 md:p-5'
        )}
      >
        <div className="flex flex-wrap gap-1.5">
          {[
            getLabel(labels.use_cases, item.useCase),
            getLabel(labels.styles, item.style),
          ].map((tag) => (
            <span
              key={tag}
              className={cn(
                'rounded-md border border-primary/20 bg-primary/10 font-semibold text-primary',
                featured || compact
                  ? 'px-2 py-1 text-[10px]'
                  : 'max-w-full truncate px-1.5 py-0.5 text-[9px] md:px-2 md:py-1 md:text-[10px]'
              )}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="space-y-1.5">
          <h3
            className={cn(
              'font-bold tracking-normal text-balance',
              featured
                ? 'text-xl md:text-2xl'
                : compact
                  ? 'line-clamp-2 text-base'
                  : 'line-clamp-2 text-sm leading-snug md:text-lg'
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              'text-muted-foreground',
              featured
                ? 'line-clamp-3 text-sm leading-relaxed md:text-base'
                : compact
                  ? 'line-clamp-2 text-xs leading-relaxed'
                  : 'hidden text-sm leading-relaxed md:block'
            )}
          >
            {description}
          </p>
        </div>

        <div
          className={cn(
            'rounded-md border border-border bg-muted/35 p-3',
            !featured && !compact ? 'hidden md:block' : ''
          )}
        >
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold text-muted-foreground uppercase">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {labels.prompt ?? 'Prompt'}
          </div>
          <p
            className={cn(
              'font-mono text-[11px] leading-relaxed text-foreground/85',
              featured
                ? 'line-clamp-4'
                : compact
                  ? 'line-clamp-4'
                  : 'line-clamp-6'
            )}
          >
            {promptPreview}
          </p>
        </div>

        <Button
          asChild
          variant="ghost"
          className={cn(
            'mt-auto justify-between px-0 font-semibold text-primary hover:bg-transparent hover:text-primary',
            featured || compact
              ? 'h-9 text-xs'
              : 'h-8 text-[11px] md:h-9 md:text-xs'
          )}
        >
          <Link href="/#generator" onClick={() => selectPrompt(item.prompt)}>
            <span className="line-clamp-1">
              {labels.use_prompt ?? 'Use this prompt'}
            </span>
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

export function PromptShowcase({
  section,
  items: itemsProp,
  initialDatabaseItems = [],
  initialDatabaseTotal = 0,
  initialDatabasePage = 1,
  pageSize = 24,
  enablePagination = false,
  className,
}: {
  section: Section;
  items?: ShowcasePrompt[];
  initialDatabaseItems?: ShowcasePrompt[];
  initialDatabaseTotal?: number;
  initialDatabasePage?: number;
  pageSize?: number;
  enablePagination?: boolean;
  className?: string;
}) {
  const limit = typeof section.limit === 'number' ? section.limit : undefined;
  const showFilters = section.show_filters === true;
  const showViewMore = section.show_view_more === true;
  const labels = (section.labels ?? {}) as PromptShowcaseLabels;
  const cardTranslations = (section.card_translations ?? {}) as Record<
    string,
    PromptCardTranslation
  >;
  const paginationEnabled = enablePagination && !limit;
  const staticItems = itemsProp ?? showcasePrompts;
  const [databaseItems, setDatabaseItems] = useState(initialDatabaseItems);
  const [databaseTotal, setDatabaseTotal] = useState(initialDatabaseTotal);
  const [databasePage, setDatabasePage] = useState(initialDatabasePage);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(ALL_GROUP);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const autoLoadLockRef = useRef(false);

  useEffect(() => {
    setDatabaseItems(initialDatabaseItems);
    setDatabaseTotal(initialDatabaseTotal);
    setDatabasePage(initialDatabasePage);
  }, [initialDatabaseItems, initialDatabasePage, initialDatabaseTotal]);

  const combinedItems = paginationEnabled
    ? [...staticItems, ...databaseItems]
    : staticItems;
  const allItems = limit ? combinedItems.slice(0, limit) : combinedItems;
  const groups = useMemo(
    () => getUseCaseGroups(labels.use_cases, combinedItems),
    [combinedItems, labels.use_cases]
  );

  const loadDatabasePage = useCallback(
    async ({
      page,
      group,
      replace,
    }: {
      page: number;
      group: string;
      replace: boolean;
    }) => {
      if (!paginationEnabled) return;

      setLoadError(false);
      if (replace) {
        setIsRefreshing(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const { getPublicShowcasePromptsPageFn } =
          await import('@/server/showcase.functions');
        const result = await getPublicShowcasePromptsPageFn({
          data: {
            page,
            limit: pageSize,
            useCase: group === ALL_GROUP ? undefined : group,
          },
        });

        setDatabaseItems((currentItems) =>
          replace
            ? result.items
            : mergeShowcasePrompts(currentItems, result.items)
        );
        setDatabaseTotal(result.total);
        setDatabasePage(result.page);
      } catch (error) {
        console.error('Failed to load showcase prompts:', error);
        setLoadError(true);
      } finally {
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [pageSize, paginationEnabled]
  );

  const hasMoreDatabaseItems =
    paginationEnabled && databaseItems.length < databaseTotal;

  const loadNextPage = useCallback(() => {
    if (!hasMoreDatabaseItems || isLoadingMore || isRefreshing) {
      return;
    }

    void loadDatabasePage({
      page: databasePage + 1,
      group: selectedGroup,
      replace: false,
    });
  }, [
    databasePage,
    hasMoreDatabaseItems,
    isLoadingMore,
    isRefreshing,
    loadDatabasePage,
    selectedGroup,
  ]);

  useEffect(() => {
    if (!paginationEnabled || !hasMoreDatabaseItems) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((entry) => entry.isIntersecting);
        if (!isIntersecting) {
          autoLoadLockRef.current = false;
          return;
        }

        if (autoLoadLockRef.current) return;

        autoLoadLockRef.current = true;
        loadNextPage();
      },
      { rootMargin: '240px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreDatabaseItems, loadNextPage, paginationEnabled]);

  const handleGroupChange = (group: string) => {
    setSelectedGroup(group);
    autoLoadLockRef.current = false;
    if (paginationEnabled) {
      void loadDatabasePage({ page: 1, group, replace: true });
    }
  };

  const handleLoadMoreClick = () => {
    autoLoadLockRef.current = true;
    loadNextPage();
  };

  const filteredItems = useMemo(() => {
    if (!showFilters || selectedGroup === ALL_GROUP) {
      return allItems;
    }

    return allItems.filter((item) => item.useCase === selectedGroup);
  }, [allItems, selectedGroup, showFilters]);

  const isCompact = !!limit;

  return (
    <section
      id={section.id || 'showcase'}
      className={cn(
        'relative overflow-hidden py-12 md:py-16',
        section.className,
        className
      )}
    >
      <div className="container">
        {(section.title || section.description) && (
          <div
            className={cn(
              'mx-auto text-center',
              isCompact ? 'mb-8 max-w-3xl' : 'mb-9 max-w-4xl'
            )}
          >
            <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <ImageIcon className="h-3.5 w-3.5" />
              {labels.eyebrow ?? 'GPT Image 2 Showcase'}
            </div>
            {section.title && (
              <h2
                className={cn(
                  'font-bold tracking-normal text-balance',
                  isCompact
                    ? 'text-3xl leading-tight md:text-4xl'
                    : 'text-4xl leading-tight md:text-5xl'
                )}
              >
                {section.title}
              </h2>
            )}
            {section.description && (
              <p
                className={cn(
                  'mx-auto mt-3 text-muted-foreground',
                  isCompact
                    ? 'max-w-2xl text-base leading-relaxed'
                    : 'max-w-3xl text-lg leading-relaxed'
                )}
              >
                {section.description}
              </p>
            )}
          </div>
        )}

        {showFilters && (
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {groups.map((group) => {
              const active = group === selectedGroup;
              const groupLabel =
                group === ALL_GROUP
                  ? (labels.all ?? ALL_GROUP)
                  : getLabel(labels.use_cases, group);
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => handleGroupChange(group)}
                  className={cn(
                    'min-h-9 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                    active
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-accent/50 hover:text-accent-foreground'
                  )}
                >
                  {groupLabel}
                </button>
              );
            })}
          </div>
        )}

        {isCompact ? (
          <div className="space-y-4">
            {filteredItems.map((item, index) => (
              <ShowcaseCard
                key={item.id}
                item={item}
                index={index}
                labels={labels}
                cardTranslations={cardTranslations}
                compact
                featured
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto grid max-w-[22rem] grid-cols-1 gap-4 min-[390px]:max-w-none min-[390px]:grid-cols-2 min-[390px]:gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
            {filteredItems.map((item, index) => (
              <ShowcaseCard
                key={item.id}
                item={item}
                index={index}
                labels={labels}
                cardTranslations={cardTranslations}
              />
            ))}
          </div>
        )}

        {paginationEnabled && (
          <div ref={sentinelRef} className="mt-8 flex justify-center">
            {hasMoreDatabaseItems ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleLoadMoreClick}
                disabled={isLoadingMore || isRefreshing}
                className="min-w-36"
              >
                {(isLoadingMore || isRefreshing) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {isRefreshing || isLoadingMore
                  ? (labels.loading_more ?? 'Loading more')
                  : (labels.load_more ?? 'Load more')}
              </Button>
            ) : (
              databaseTotal > 0 && (
                <div className="h-px w-24 bg-border" aria-hidden />
              )
            )}
          </div>
        )}

        {loadError && (
          <div className="mt-3 text-center text-sm text-destructive">
            {labels.load_error ?? 'Failed to load more showcases.'}
          </div>
        )}

        {showViewMore && (
          <div className="mt-7 flex justify-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/">
                {labels.view_more ?? 'View more showcase'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
