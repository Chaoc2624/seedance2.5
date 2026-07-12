import FileAudio from 'lucide-react/dist/esm/icons/file-audio';
import ImagePlus from 'lucide-react/dist/esm/icons/image-plus';
import Upload from 'lucide-react/dist/esm/icons/upload';
import Video from 'lucide-react/dist/esm/icons/video';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { SeedanceReferenceDeck } from './seedance-reference-deck';
import {
  EMPTY_SEEDANCE_REFERENCE_MEDIA,
  formatSeedanceFileSize,
  getSeedanceReferenceItems,
  getSeedanceReferenceVideoDimensionError,
  hasValidSeedanceVideoDimensions,
  SEEDANCE_REFERENCE_LIMITS,
} from './seedance-reference-media';
import type {
  SeedanceReferenceItem,
  SeedanceReferenceMedia,
} from './seedance-reference-media';
import { SeedanceReferencePreviewDialog } from './seedance-reference-preview-dialog';
import {
  ACCEPT_BY_KIND,
  createSeedanceReferenceItem,
  getSeedanceFileKind,
  getSeedanceMediaDuration,
  getSeedanceVideoMetadata,
  TARGET_META,
} from './seedance-reference-upload';
import type { SeedanceUploadTarget } from './seedance-reference-upload';

export function SeedanceReferencePanel({
  value = EMPTY_SEEDANCE_REFERENCE_MEDIA,
  onChange,
  disabled,
}: {
  value?: SeedanceReferenceMedia;
  onChange: (value: SeedanceReferenceMedia) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const valueRef = useRef(value);
  const [target, setTarget] = useState<SeedanceUploadTarget>('images');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const allItems = useMemo(() => getSeedanceReferenceItems(value), [value]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const updateValue = (next: SeedanceReferenceMedia) => {
    valueRef.current = next;
    onChange(next);
  };

  const openPicker = (nextTarget: SeedanceUploadTarget) => {
    setTarget(nextTarget);
    requestAnimationFrame(() => inputRef.current?.click());
  };

  const removeItem = (id: string) => {
    const current = valueRef.current;
    const removed = getSeedanceReferenceItems(current).find(
      (item) => item.id === id
    );
    if (removed?.preview.startsWith('blob:'))
      URL.revokeObjectURL(removed.preview);
    updateValue({
      firstFrame:
        current.firstFrame?.id === id ? undefined : current.firstFrame,
      lastFrame: current.lastFrame?.id === id ? undefined : current.lastFrame,
      images: current.images.filter((item) => item.id !== id),
      videos: current.videos.filter((item) => item.id !== id),
      audio: current.audio.filter((item) => item.id !== id),
    });
  };

  const uploadItems = async (items: SeedanceReferenceItem[], files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    try {
      const { uploadMediaFn } = await import('@/server/storage.functions');
      const result = await uploadMediaFn({ data: formData });
      const urls = result?.urls ?? [];
      const current = valueRef.current;
      const resolveItems = (collection: SeedanceReferenceItem[]) =>
        collection.map((item) => {
          const index = items.findIndex(
            (candidate) => candidate.id === item.id
          );
          if (index < 0) return item;
          if (item.preview.startsWith('blob:'))
            URL.revokeObjectURL(item.preview);
          const url = urls[index];
          return url
            ? { ...item, preview: url, url, status: 'uploaded' as const }
            : { ...item, status: 'error' as const };
        });
      updateValue({
        firstFrame: current.firstFrame
          ? resolveItems([current.firstFrame])[0]
          : undefined,
        lastFrame: current.lastFrame
          ? resolveItems([current.lastFrame])[0]
          : undefined,
        images: resolveItems(current.images),
        videos: resolveItems(current.videos),
        audio: resolveItems(current.audio),
      });
    } catch (error) {
      console.error('Seedance reference upload failed:', error);
      toast.error('Reference upload failed. Please try again.');
      const current = valueRef.current;
      const failItems = (collection: SeedanceReferenceItem[]) =>
        collection.map((item) =>
          items.some((candidate) => candidate.id === item.id)
            ? { ...item, status: 'error' as const }
            : item
        );
      updateValue({
        firstFrame: current.firstFrame
          ? failItems([current.firstFrame])[0]
          : undefined,
        lastFrame: current.lastFrame
          ? failItems([current.lastFrame])[0]
          : undefined,
        images: failItems(current.images),
        videos: failItems(current.videos),
        audio: failItems(current.audio),
      });
    }
  };

  const handleFiles = async (files: File[]) => {
    const meta = TARGET_META[target];
    const typedFiles = files.filter(
      (file) => getSeedanceFileKind(file) === meta.kind
    );
    if (!typedFiles.length) {
      toast.error(
        meta.kind === 'video'
          ? 'Reference videos must be MP4 or MOV files.'
          : `Select a ${meta.kind} file supported by Seedance 2.`
      );
      return;
    }
    if (typedFiles.length !== files.length)
      toast.error('Unsupported files were skipped.');

    const maxBytes =
      meta.kind === 'image'
        ? SEEDANCE_REFERENCE_LIMITS.imageSizeBytes
        : meta.kind === 'video'
          ? SEEDANCE_REFERENCE_LIMITS.videoSizeBytes
          : SEEDANCE_REFERENCE_LIMITS.audioSizeBytes;
    if (typedFiles.some((file) => file.size >= maxBytes)) {
      toast.error(
        `${meta.label} exceed the ${formatSeedanceFileSize(maxBytes)} limit.`
      );
      return;
    }

    let durations: Array<number | undefined> = typedFiles.map(() => undefined);
    if (meta.kind !== 'image') {
      try {
        if (meta.kind === 'video') {
          const metadata = await Promise.all(
            typedFiles.map(getSeedanceVideoMetadata)
          );
          if (
            metadata.some((value) => !hasValidSeedanceVideoDimensions(value))
          ) {
            toast.error(getSeedanceReferenceVideoDimensionError());
            return;
          }
          durations = metadata.map((value) => value.duration);
        } else {
          durations = await Promise.all(
            typedFiles.map((file) => getSeedanceMediaDuration(file, 'audio'))
          );
        }
      } catch {
        toast.error('Could not read the selected media duration.');
        return;
      }
      if (
        durations.some(
          (duration) =>
            !duration ||
            duration < SEEDANCE_REFERENCE_LIMITS.minDurationSeconds ||
            duration > SEEDANCE_REFERENCE_LIMITS.maxDurationSeconds
        )
      ) {
        toast.error(
          'Audio and video references must each be 2 to 15 seconds long.'
        );
        return;
      }
    }

    const current = valueRef.current;
    const frameCount =
      Number(Boolean(current.firstFrame)) + Number(Boolean(current.lastFrame));
    const nextImageCount =
      frameCount +
      current.images.length +
      (meta.kind === 'image' && target === 'images'
        ? typedFiles.length
        : target === 'firstFrame' || target === 'lastFrame'
          ? 1 - Number(Boolean(current[target]))
          : 0);
    if (nextImageCount > SEEDANCE_REFERENCE_LIMITS.imageCount) {
      toast.error(
        'Reference images and first/last frames are limited to 9 files total.'
      );
      return;
    }

    const collection =
      meta.kind === 'video'
        ? current.videos
        : meta.kind === 'audio'
          ? current.audio
          : current.images;
    const maxCount =
      meta.kind === 'video'
        ? SEEDANCE_REFERENCE_LIMITS.videoCount
        : meta.kind === 'audio'
          ? SEEDANCE_REFERENCE_LIMITS.audioCount
          : SEEDANCE_REFERENCE_LIMITS.imageCount;
    if (
      (target === 'videos' || target === 'audio') &&
      collection.length + typedFiles.length > maxCount
    ) {
      toast.error(
        `Seedance 2 accepts up to ${maxCount} ${meta.kind} references.`
      );
      return;
    }

    if (meta.kind !== 'image') {
      const currentDuration = collection.reduce(
        (total, item) => total + (item.duration ?? 0),
        0
      );
      const nextDuration = durations.reduce<number>(
        (total, duration) => total + (duration ?? 0),
        currentDuration
      );
      if (nextDuration > SEEDANCE_REFERENCE_LIMITS.maxTotalDurationSeconds) {
        toast.error(`${meta.label} cannot exceed 15 seconds in total.`);
        return;
      }
    }

    const items = typedFiles.map((file, index) =>
      createSeedanceReferenceItem(file, meta.kind, durations[index])
    );
    const next: SeedanceReferenceMedia = {
      ...current,
      images:
        target === 'images' ? [...current.images, ...items] : current.images,
      videos:
        target === 'videos' ? [...current.videos, ...items] : current.videos,
      audio: target === 'audio' ? [...current.audio, ...items] : current.audio,
      firstFrame: target === 'firstFrame' ? items[0] : current.firstFrame,
      lastFrame: target === 'lastFrame' ? items[0] : current.lastFrame,
    };
    updateValue(next);
    await uploadItems(items, typedFiles);
  };

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_48%,#f0fdfa_100%)] p-4 shadow-sm">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={ACCEPT_BY_KIND[TARGET_META[target].kind]}
        multiple={
          target === 'images' || target === 'videos' || target === 'audio'
        }
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.currentTarget.value = '';
          if (files.length) void handleFiles(files);
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            Seedance 2 references
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Frames, images, video, and audio stay in one prompt context.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {(['images', 'videos', 'audio'] as const).map((item) => {
            const Icon =
              TARGET_META[item].kind === 'image'
                ? ImagePlus
                : TARGET_META[item].kind === 'video'
                  ? Video
                  : FileAudio;
            return (
              <button
                key={item}
                type="button"
                onClick={() => openPicker(item)}
                disabled={disabled}
                className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-50"
              >
                <Icon className="size-3.5" />
                {item === 'audio'
                  ? 'Audio'
                  : item === 'videos'
                    ? 'Video'
                    : 'Image'}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-x-5 gap-y-3 pt-2">
        <SeedanceReferenceDeck
          title="First frame"
          kind="image"
          items={value.firstFrame ? [value.firstFrame] : []}
          onAdd={() => openPicker('firstFrame')}
          onPreview={setSelectedId}
          onRemove={removeItem}
          disabled={disabled}
        />
        <SeedanceReferenceDeck
          title="Last frame"
          kind="image"
          items={value.lastFrame ? [value.lastFrame] : []}
          onAdd={() => openPicker('lastFrame')}
          onPreview={setSelectedId}
          onRemove={removeItem}
          disabled={disabled}
        />
        <SeedanceReferenceDeck
          title="Images"
          kind="image"
          items={value.images}
          onAdd={() => openPicker('images')}
          onPreview={setSelectedId}
          onRemove={removeItem}
          disabled={disabled}
        />
        <SeedanceReferenceDeck
          title="Videos"
          kind="video"
          items={value.videos}
          onAdd={() => openPicker('videos')}
          onPreview={setSelectedId}
          onRemove={removeItem}
          disabled={disabled}
        />
        <SeedanceReferenceDeck
          title="Audio"
          kind="audio"
          items={value.audio}
          onAdd={() => openPicker('audio')}
          onPreview={setSelectedId}
          onRemove={removeItem}
          disabled={disabled}
        />
      </div>

      <div className="flex items-center gap-2 border-t border-slate-200 pt-3 text-xs text-slate-500">
        <Upload className="size-3.5 text-cyan-700" />
        <span>
          Images + frames: 9 total, under 30 MB each. Video/audio: 3 each, 2-15s
          per clip, 15s total.
        </span>
      </div>

      <SeedanceReferencePreviewDialog
        items={allItems}
        selectedId={selectedId}
        onSelectedIdChange={setSelectedId}
        onRemove={removeItem}
      />
    </section>
  );
}
