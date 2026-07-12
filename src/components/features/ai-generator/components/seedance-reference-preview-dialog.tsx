import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

import type { SeedanceReferenceItem } from './seedance-reference-media';

interface SeedanceReferencePreviewDialogProps {
  items: SeedanceReferenceItem[];
  selectedId: string | null;
  onSelectedIdChange: (id: string | null) => void;
  onRemove: (id: string) => void;
}

export function SeedanceReferencePreviewDialog({
  items,
  selectedId,
  onSelectedIdChange,
  onRemove,
}: SeedanceReferencePreviewDialogProps) {
  const selectedIndex = selectedId
    ? items.findIndex((item) => item.id === selectedId)
    : -1;
  const selected = selectedIndex >= 0 ? items[selectedIndex] : undefined;
  const hasMultipleItems = items.length > 1;

  const showItem = (offset: number) => {
    if (!items.length || selectedIndex < 0) return;
    const nextIndex = (selectedIndex + offset + items.length) % items.length;
    onSelectedIdChange(items[nextIndex]?.id ?? null);
  };

  const removeSelected = () => {
    if (!selected) return;
    const nextItem = items[selectedIndex + 1] ?? items[selectedIndex - 1];
    onRemove(selected.id);
    onSelectedIdChange(nextItem?.id ?? null);
  };

  return (
    <Dialog
      open={Boolean(selectedId && selected)}
      onOpenChange={(open) => !open && onSelectedIdChange(null)}
    >
      <DialogContent
        showCloseButton
        className="grid h-[min(760px,calc(100dvh-2rem))] w-[min(960px,calc(100vw-2rem))] max-w-none grid-cols-[minmax(0,1fr)_4rem] grid-rows-[auto_minmax(0,1fr)_auto] gap-x-3 gap-y-4 overflow-hidden border-slate-200 bg-slate-950 p-3 text-white shadow-2xl sm:grid-cols-[minmax(0,1fr)_4.5rem] sm:p-5"
        onWheel={(event) => event.stopPropagation()}
      >
        <DialogTitle className="sr-only">Reference media preview</DialogTitle>
        <DialogDescription className="sr-only">
          Browse and remove uploaded Seedance reference media.
        </DialogDescription>

        {selected && (
          <>
            <div className="col-span-2 flex min-w-0 items-center pr-9 text-sm font-semibold text-slate-300 tabular-nums">
              {`${selectedIndex + 1} / ${items.length}`}
            </div>

            <div className="relative col-start-1 row-start-2 flex min-h-0 min-w-0 items-center justify-center overflow-hidden overscroll-contain rounded-lg bg-black/50">
              {selected.kind === 'image' ? (
                <img
                  src={selected.preview}
                  alt={selected.name}
                  className="h-full max-h-full w-full max-w-full object-contain"
                />
              ) : selected.kind === 'video' ? (
                <video
                  key={selected.id}
                  autoPlay
                  controls
                  muted
                  playsInline
                  poster={selected.poster}
                  preload="auto"
                  src={selected.preview}
                  className="h-full max-h-full w-full max-w-full object-contain"
                />
              ) : (
                <div className="flex w-full max-w-xl flex-col items-center gap-5 px-8 py-16 text-center">
                  <div className="grid size-24 place-items-center rounded-full border border-cyan-300/30 bg-cyan-400/10 text-3xl font-semibold text-cyan-200">
                    ~
                  </div>
                  <audio controls src={selected.preview} className="w-full" />
                </div>
              )}

              {hasMultipleItems && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    aria-label="Previous reference"
                    onClick={() => showItem(-1)}
                    className="absolute top-1/2 left-3 size-10 -translate-y-1/2 rounded-full bg-black/55 text-white hover:bg-black/80"
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    aria-label="Next reference"
                    onClick={() => showItem(1)}
                    className="absolute top-1/2 right-3 size-10 -translate-y-1/2 rounded-full bg-black/55 text-white hover:bg-black/80"
                  >
                    <ChevronRight />
                  </Button>
                </>
              )}
            </div>

            <div className="col-start-2 row-start-2 flex min-h-0 flex-col items-center gap-2 overflow-y-auto overscroll-contain py-1">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Preview ${item.name}`}
                  onClick={() => onSelectedIdChange(item.id)}
                  className={cn(
                    'grid h-16 w-12 shrink-0 place-items-center overflow-hidden rounded-md border transition-colors sm:h-[4.5rem] sm:w-[3.25rem]',
                    index === selectedIndex
                      ? 'border-blue-400 bg-blue-400/20 ring-1 ring-blue-300'
                      : 'border-white/15 bg-white/5 hover:border-white/35'
                  )}
                >
                  {item.kind === 'image' || item.poster ? (
                    <img
                      src={item.poster ?? item.preview}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold uppercase">
                      {item.kind}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="col-span-2 flex justify-center">
              <Button
                type="button"
                variant="ghost"
                onClick={removeSelected}
                className="text-red-200 hover:bg-red-500/15 hover:text-red-100"
              >
                <Trash2 className="size-4" />
                Remove reference
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
