import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import type { VideoModelReferenceMedia } from '@/config/ai-video-models';

import type { HeroLocalAsset } from './hero-creation-form';
import type { HeroCreationFormCopy } from './hero-creation-form-i18n';
import { HomepageSeedanceEmptyCards } from './homepage-seedance-empty-cards';
import {
  canAddHomepageReferenceCard,
  getHomepageReferenceKind,
  getHomepageReferenceLabel,
  getHomepageReferenceMediaDeckLayout,
  getHomepageReferenceStaticMediaDeckLayout,
  HOMEPAGE_REFERENCE_GROUP_GAP_REM,
  HomepageSeedanceReferenceDeck,
  type HomepageSeedancePickerTarget,
} from './homepage-seedance-reference-deck';
import {
  formatSeedanceFileSize,
  getSeedanceReferenceLimits,
  getSeedanceReferenceVideoDimensionError,
  hasValidSeedanceVideoDimensions,
  hasValidSeedanceVisualDimensions,
  SEEDANCE_REFERENCE_LIMITS,
  type SeedanceReferenceItem,
} from './seedance-reference-media';
import { SeedanceReferencePreviewDialog } from './seedance-reference-preview-dialog';
import {
  ACCEPT_BY_KIND,
  getSeedanceFileKind,
  getSeedanceImageDimensions,
  getSeedanceMediaDuration,
  getSeedanceVideoFirstFrame,
  getSeedanceVideoMetadata,
} from './seedance-reference-upload';

type PickerTarget = HomepageSeedancePickerTarget;

function assetToPreviewItem(asset: HeroLocalAsset): SeedanceReferenceItem {
  return {
    id: asset.id,
    kind: asset.mediaType,
    name: asset.file?.name ?? asset.slotLabel,
    preview: asset.previewUrl,
    poster: asset.posterUrl,
    url: asset.sourceUrl,
    size: asset.file?.size ?? 0,
    duration: asset.duration,
    status: 'uploaded',
  };
}

export function HomepageSeedanceReferences({
  assets,
  workflowId,
  copy,
  referenceMedia,
  compact = false,
  audioPickSignal = 0,
  onChange,
  onHoverChange,
}: {
  assets: HeroLocalAsset[];
  workflowId: string;
  copy: HeroCreationFormCopy;
  referenceMedia?: VideoModelReferenceMedia;
  compact?: boolean;
  audioPickSignal?: number;
  onChange: (assets: HeroLocalAsset[]) => void;
  onHoverChange?: (hovered: boolean) => void;
}) {
  const inputRefs = useRef<
    Partial<Record<PickerTarget, HTMLInputElement | null>>
  >({});
  const [hoveredImageAssetId, setHoveredImageAssetId] = useState<string | null>(
    null
  );
  const [hoveredVideoAssetId, setHoveredVideoAssetId] = useState<string | null>(
    null
  );
  const [isImageDeckHovered, setIsImageDeckHovered] = useState(false);
  const [isVideoDeckHovered, setIsVideoDeckHovered] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const previousAudioPickSignalRef = useRef(audioPickSignal);
  const previewItems = useMemo(() => assets.map(assetToPreviewItem), [assets]);
  const frameWorkflow = workflowId === 'frames-video';
  const limits = getSeedanceReferenceLimits(referenceMedia);
  const imageAssets = useMemo(
    () => assets.filter((asset) => asset.mediaType === 'image'),
    [assets]
  );
  const videoAssets = useMemo(
    () => assets.filter((asset) => asset.mediaType === 'video'),
    [assets]
  );
  const imageActionRoles: PickerTarget[] = frameWorkflow
    ? ['first-frame', 'last-frame']
    : ['reference-image'];
  const videoActionRoles: PickerTarget[] = frameWorkflow
    ? []
    : ['reference-video'];
  const canAddImageReference =
    !frameWorkflow &&
    canAddHomepageReferenceCard({
      cardCount: imageAssets.length,
      limit: limits.imageCount,
    });
  const canAddVideoReference = canAddHomepageReferenceCard({
    cardCount: videoAssets.length,
    limit: limits.videoCount,
  });
  const imageDeck = getHomepageReferenceMediaDeckLayout({
    cardCount: imageAssets.length,
    isAssetHovered: isImageDeckHovered,
    uploadCardCount: imageActionRoles.length,
  });
  const staticImageDeck = getHomepageReferenceStaticMediaDeckLayout({
    cardCount: imageAssets.length,
    uploadCardCount: imageActionRoles.length,
    hideUploadWhenAssetsPresent: !frameWorkflow,
  });
  const videoDeck = getHomepageReferenceMediaDeckLayout({
    cardCount: videoAssets.length,
    isAssetHovered: isVideoDeckHovered,
    uploadCardCount: videoActionRoles.length,
  });
  const staticVideoDeck = getHomepageReferenceStaticMediaDeckLayout({
    cardCount: videoAssets.length,
    uploadCardCount: videoActionRoles.length,
    hideUploadWhenAssetsPresent: true,
  });
  const videoDeckOffset =
    staticImageDeck.width + HOMEPAGE_REFERENCE_GROUP_GAP_REM;
  const deckWidth = videoActionRoles.length
    ? videoDeckOffset + staticVideoDeck.width
    : staticImageDeck.width;

  const isPickerDisabled = (role: PickerTarget) => {
    const kind = getHomepageReferenceKind(role);
    const count = assets.filter((asset) => asset.mediaType === kind).length;
    const limit =
      kind === 'image'
        ? limits.imageCount
        : kind === 'video'
          ? limits.videoCount
          : limits.audioCount;
    if (role === 'first-frame' || role === 'last-frame') {
      return (
        !assets.some((asset) => asset.referenceRole === role) && count >= limit
      );
    }
    return count >= limit;
  };

  const openPicker = (role: PickerTarget) => {
    requestAnimationFrame(() => inputRefs.current[role]?.click());
  };

  useEffect(() => {
    if (audioPickSignal === previousAudioPickSignalRef.current) return;
    previousAudioPickSignalRef.current = audioPickSignal;
    if (frameWorkflow) return;
    const frameId = requestAnimationFrame(() =>
      inputRefs.current['reference-audio']?.click()
    );
    return () => cancelAnimationFrame(frameId);
  }, [audioPickSignal, frameWorkflow]);

  useEffect(() => {
    if (
      hoveredImageAssetId &&
      !imageAssets.some((asset) => asset.id === hoveredImageAssetId)
    ) {
      setHoveredImageAssetId(null);
    }
    if (
      hoveredVideoAssetId &&
      !videoAssets.some((asset) => asset.id === hoveredVideoAssetId)
    ) {
      setHoveredVideoAssetId(null);
    }
  }, [hoveredImageAssetId, hoveredVideoAssetId, imageAssets, videoAssets]);

  useEffect(() => {
    onHoverChange?.(isImageDeckHovered || isVideoDeckHovered);
  }, [isImageDeckHovered, isVideoDeckHovered, onHoverChange]);

  useEffect(() => {
    return () => onHoverChange?.(false);
  }, [onHoverChange]);

  const removeAsset = (id: string) => {
    onChange(assets.filter((item) => item.id !== id));
  };

  const addFiles = async (role: PickerTarget, files: File[]) => {
    const frameRole = role === 'first-frame' || role === 'last-frame';
    if (frameWorkflow !== frameRole) return;

    const kind = getHomepageReferenceKind(role);
    const supported = files.filter(
      (file) => getSeedanceFileKind(file) === kind
    );
    if (!supported.length || supported.length !== files.length) {
      toast.error(
        kind === 'video'
          ? 'Reference videos must be MP4 or MOV files.'
          : `Choose supported Seedance 2 ${kind} files.`
      );
      return;
    }

    const maxBytes =
      kind === 'image'
        ? SEEDANCE_REFERENCE_LIMITS.imageSizeBytes
        : kind === 'video'
          ? SEEDANCE_REFERENCE_LIMITS.videoSizeBytes
          : SEEDANCE_REFERENCE_LIMITS.audioSizeBytes;
    if (supported.some((file) => file.size >= maxBytes)) {
      toast.error(
        `${getHomepageReferenceLabel(role, copy)} must be under ${formatSeedanceFileSize(maxBytes)}.`
      );
      return;
    }

    const existingKind = assets.filter((asset) => asset.mediaType === kind);
    const replacingFrame = role === 'first-frame' || role === 'last-frame';
    const maxCount =
      kind === 'image'
        ? limits.imageCount
        : kind === 'video'
          ? limits.videoCount
          : limits.audioCount;
    const replacedCount = replacingFrame
      ? assets.filter((asset) => asset.referenceRole === role).length
      : 0;
    if (existingKind.length - replacedCount + supported.length > maxCount) {
      toast.error(`This model accepts up to ${maxCount} ${kind} references.`);
      return;
    }

    let durations: Array<number | undefined> = supported.map(() => undefined);
    let posterUrls: Array<string | undefined> = supported.map(() => undefined);
    if (kind === 'image') {
      try {
        const dimensions = await Promise.all(
          supported.map(getSeedanceImageDimensions)
        );
        if (
          dimensions.some((value) => !hasValidSeedanceVisualDimensions(value))
        ) {
          toast.error(
            'Images must be 300-6000px with an aspect ratio between 0.4 and 2.5.'
          );
          return;
        }
      } catch {
        toast.error('Could not read the selected image dimensions.');
        return;
      }
    } else {
      try {
        if (kind === 'video') {
          const metadata = await Promise.all(
            supported.map(getSeedanceVideoMetadata)
          );
          if (
            metadata.some((value) => !hasValidSeedanceVideoDimensions(value))
          ) {
            toast.error(getSeedanceReferenceVideoDimensionError());
            return;
          }
          durations = metadata.map((value) => value.duration);
          posterUrls = await Promise.all(
            supported.map(getSeedanceVideoFirstFrame)
          );
        } else {
          durations = await Promise.all(
            supported.map((file) => getSeedanceMediaDuration(file, kind))
          );
        }
      } catch {
        toast.error(`Could not read the selected ${kind} metadata.`);
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
          `${getHomepageReferenceLabel(role, copy)} must be 2 to 15 seconds.`
        );
        return;
      }
      const currentDuration = existingKind.reduce(
        (sum, asset) => sum + (asset.duration ?? 0),
        0
      );
      const nextDuration = durations.reduce<number>(
        (sum, duration) => sum + (duration ?? 0),
        currentDuration
      );
      if (nextDuration > SEEDANCE_REFERENCE_LIMITS.maxTotalDurationSeconds) {
        toast.error(
          `${getHomepageReferenceLabel(role, copy)} cannot exceed 15s in total.`
        );
        return;
      }
    }

    const retained = replacingFrame
      ? assets.filter((asset) => asset.referenceRole !== role)
      : assets;
    const nextSlotIndex = Math.max(
      -1,
      ...retained.map((asset) => asset.slotIndex)
    );
    const additions = supported.map<HeroLocalAsset>((file, index) => ({
      id: `${role}-${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      slotIndex: nextSlotIndex + index + 1,
      slotLabel: getHomepageReferenceLabel(role, copy),
      mediaType: kind,
      referenceRole: role,
      duration: durations[index],
      file,
      previewUrl: URL.createObjectURL(file),
      posterUrl: posterUrls[index],
    }));
    onChange([...retained, ...additions]);
  };

  const pickerRoles: PickerTarget[] = [
    'reference-image',
    'reference-video',
    'reference-audio',
    'first-frame',
    'last-frame',
  ];
  return (
    <div
      data-testid="homepage-seedance-references"
      className={
        compact
          ? 'relative z-20 h-[5.55rem] shrink-0'
          : 'relative z-20 h-[6.2rem] shrink-0'
      }
      style={{ width: `${deckWidth}rem` }}
    >
      {pickerRoles.map((role) => (
        <input
          key={role}
          ref={(node) => {
            inputRefs.current[role] = node;
          }}
          type="file"
          className="hidden"
          accept={ACCEPT_BY_KIND[getHomepageReferenceKind(role)]}
          multiple={role.startsWith('reference-')}
          onChange={(event) => {
            const files = Array.from(event.currentTarget.files ?? []);
            event.currentTarget.value = '';
            if (files.length) void addFiles(role, files);
          }}
        />
      ))}

      <div
        className="absolute top-0 z-20 h-full"
        style={{
          width: `${isImageDeckHovered ? imageDeck.width : staticImageDeck.width}rem`,
        }}
        onMouseEnter={() => setIsImageDeckHovered(true)}
        onMouseLeave={() => {
          setHoveredImageAssetId(null);
          setIsImageDeckHovered(false);
        }}
      >
        {imageAssets.length > 0 && (
          <HomepageSeedanceReferenceDeck
            assets={imageAssets}
            direction="left"
            hoveredAssetId={hoveredImageAssetId}
            isExpanded={isImageDeckHovered}
            showPrimaryUploadHint={canAddImageReference}
            uploadHintAriaLabel={`Upload ${copy.upload.image}`}
            onHoveredAssetChange={setHoveredImageAssetId}
            onAdd={() => openPicker('reference-image')}
            uploadAction={
              canAddImageReference
                ? {
                    ariaLabel: `Upload ${copy.upload.image}`,
                    onPick: () => openPicker('reference-image'),
                  }
                : undefined
            }
            onPreview={setSelectedId}
            onRemove={removeAsset}
          />
        )}
        {(frameWorkflow || imageAssets.length === 0) && (
          <HomepageSeedanceEmptyCards
            frameWorkflow={frameWorkflow}
            startLabel={copy.upload.start}
            endLabel={copy.upload.end}
            imageLabel={copy.upload.image}
            videoLabel={copy.upload.video}
            roles={imageActionRoles}
            direction="left"
            offsetRem={imageDeck.uploadDeckOffset}
            isPickerDisabled={isPickerDisabled}
            onPick={openPicker}
          />
        )}
      </div>
      {videoActionRoles.length > 0 && (
        <div
          className="absolute top-0 z-10 h-full"
          style={{
            left: `${videoDeckOffset}rem`,
            width: `${isVideoDeckHovered ? videoDeck.width : staticVideoDeck.width}rem`,
          }}
          onMouseEnter={() => setIsVideoDeckHovered(true)}
          onMouseLeave={() => {
            setHoveredVideoAssetId(null);
            setIsVideoDeckHovered(false);
          }}
        >
          {videoAssets.length > 0 && (
            <HomepageSeedanceReferenceDeck
              assets={videoAssets}
              direction="right"
              hoveredAssetId={hoveredVideoAssetId}
              isExpanded={isVideoDeckHovered}
              showPrimaryUploadHint={canAddVideoReference}
              uploadHintAriaLabel={`Upload ${copy.upload.video}`}
              onHoveredAssetChange={setHoveredVideoAssetId}
              onAdd={() => openPicker('reference-video')}
              uploadAction={
                canAddVideoReference
                  ? {
                      ariaLabel: `Upload ${copy.upload.video}`,
                      onPick: () => openPicker('reference-video'),
                    }
                  : undefined
              }
              onPreview={setSelectedId}
              onRemove={removeAsset}
            />
          )}
          {videoAssets.length === 0 && (
            <HomepageSeedanceEmptyCards
              frameWorkflow={frameWorkflow}
              startLabel={copy.upload.start}
              endLabel={copy.upload.end}
              imageLabel={copy.upload.image}
              videoLabel={copy.upload.video}
              roles={videoActionRoles}
              direction="right"
              offsetRem={videoDeck.uploadDeckOffset}
              isPickerDisabled={isPickerDisabled}
              onPick={openPicker}
            />
          )}
        </div>
      )}

      <SeedanceReferencePreviewDialog
        items={previewItems}
        selectedId={selectedId}
        onSelectedIdChange={setSelectedId}
        onRemove={removeAsset}
      />
    </div>
  );
}
