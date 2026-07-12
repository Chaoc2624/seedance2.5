import FileAudio from 'lucide-react/dist/esm/icons/file-audio';
import ImagePlus from 'lucide-react/dist/esm/icons/image-plus';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Video from 'lucide-react/dist/esm/icons/video';
import X from 'lucide-react/dist/esm/icons/x';
import { useState } from 'react';

import {
  formatSeedanceDuration,
  formatSeedanceFileSize,
} from './seedance-reference-media';
import type {
  SeedanceReferenceItem,
  SeedanceReferenceKind,
} from './seedance-reference-media';

function deckItemStyle(index: number, expanded: boolean) {
  return {
    transform: `translateX(${index * (expanded ? 54 : 13)}px) rotate(${index % 2 === 0 ? -5 : 5}deg)`,
    zIndex: index + 1,
  };
}

export function SeedanceReferenceDeck({
  title,
  kind,
  items,
  onAdd,
  onPreview,
  onRemove,
  disabled,
}: {
  title: string;
  kind: SeedanceReferenceKind;
  items: SeedanceReferenceItem[];
  onAdd: () => void;
  onPreview: (id: string) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const Icon =
    kind === 'image' ? ImagePlus : kind === 'video' ? Video : FileAudio;

  if (!items.length) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onAdd}
        className="group relative flex h-28 w-24 -rotate-6 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-500 transition-colors hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700 disabled:opacity-50"
      >
        <Icon className="size-5" />
        <span className="text-center text-xs font-semibold">{title}</span>
        <Plus className="absolute -right-2 -bottom-2 size-7 rounded-full border border-white bg-slate-900 p-1 text-white shadow-lg" />
      </button>
    );
  }

  return (
    <div
      className="group relative h-32 min-w-28"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => {
        setExpanded(false);
        setHoveredItemId(null);
      }}
    >
      <div className="absolute top-0 left-0 h-28 w-[min(15rem,calc(100vw-5rem))]">
        {items.map((item, index) => (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredItemId(item.id)}
            style={{
              ...deckItemStyle(index, expanded),
              zIndex: hoveredItemId === item.id ? items.length + 1 : index + 1,
            }}
            className="group/card absolute top-0 left-0 h-28 w-22 overflow-hidden rounded-lg border border-white/80 bg-slate-900 text-left shadow-[0_12px_30px_rgba(15,23,42,0.2)] transition-transform duration-200 ease-out"
          >
            {item.kind === 'image' ? (
              <img
                src={item.preview}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <span className="flex size-full flex-col items-center justify-center gap-2 bg-slate-900 text-white">
                <Icon className="size-6" />
                <span className="max-w-16 truncate text-[10px] font-semibold">
                  {item.name}
                </span>
              </span>
            )}
            {item.status === 'uploading' && (
              <span className="absolute inset-0 grid place-items-center bg-slate-950/65 text-[10px] font-semibold text-white">
                Uploading
              </span>
            )}
            <span className="absolute bottom-1 left-1 rounded bg-black/55 px-1 text-[9px] text-white">
              {formatSeedanceDuration(item.duration) ||
                formatSeedanceFileSize(item.size)}
            </span>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-black/65 text-white opacity-0 transition-opacity group-hover/card:opacity-100 focus-visible:opacity-100"
              aria-label={`Remove ${item.name}`}
            >
              <X className="size-3" />
            </button>
            <button
              type="button"
              onClick={() => onPreview(item.id)}
              className="absolute right-1 bottom-1 grid size-6 place-items-center rounded-full bg-cyan-600 text-white opacity-0 shadow-lg transition-[opacity,background-color] group-hover/card:opacity-100 hover:bg-cyan-500 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              aria-label={`Preview ${item.name}`}
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 flex items-center gap-1.5">
        <span className="text-xs font-semibold text-slate-700">{title}</span>
        <button
          type="button"
          disabled={disabled}
          onClick={onAdd}
          aria-label={`Add ${title}`}
          className="grid size-6 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700 disabled:opacity-50"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
