import type { VideoModelReferenceMedia } from '@/config/ai-video-models';

export type SeedanceReferenceKind = 'image' | 'video' | 'audio';

export type SeedanceReferenceStatus = 'uploading' | 'uploaded' | 'error';

export interface SeedanceReferenceItem {
  id: string;
  kind: SeedanceReferenceKind;
  name: string;
  preview: string;
  poster?: string;
  url?: string;
  size: number;
  duration?: number;
  status: SeedanceReferenceStatus;
}

export interface SeedanceReferenceMedia {
  firstFrame?: SeedanceReferenceItem;
  lastFrame?: SeedanceReferenceItem;
  images: SeedanceReferenceItem[];
  videos: SeedanceReferenceItem[];
  audio: SeedanceReferenceItem[];
}

export const EMPTY_SEEDANCE_REFERENCE_MEDIA: SeedanceReferenceMedia = {
  images: [],
  videos: [],
  audio: [],
};

export const SEEDANCE_REFERENCE_LIMITS = {
  imageCount: 9,
  imageSizeBytes: 30 * 1024 * 1024,
  videoCount: 3,
  videoSizeBytes: 50 * 1024 * 1024,
  videoMinPixels: 409_600,
  videoMaxPixels: 927_408,
  audioCount: 3,
  audioSizeBytes: 15 * 1024 * 1024,
  minDurationSeconds: 2,
  maxDurationSeconds: 15,
  maxTotalDurationSeconds: 15,
} as const;

export function getSeedanceReferenceLimits(
  referenceMedia?: VideoModelReferenceMedia
) {
  return {
    ...SEEDANCE_REFERENCE_LIMITS,
    imageCount:
      referenceMedia?.imageCount ?? SEEDANCE_REFERENCE_LIMITS.imageCount,
    videoCount:
      referenceMedia?.videoCount ?? SEEDANCE_REFERENCE_LIMITS.videoCount,
    audioCount:
      referenceMedia?.audioCount ?? SEEDANCE_REFERENCE_LIMITS.audioCount,
  };
}

export function hasValidSeedanceVisualDimensions({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const aspectRatio = width / height;
  return (
    width >= 300 &&
    width <= 6000 &&
    height >= 300 &&
    height <= 6000 &&
    aspectRatio > 0.4 &&
    aspectRatio < 2.5
  );
}

export function hasValidSeedanceVideoDimensions({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const pixels = width * height;
  return (
    hasValidSeedanceVisualDimensions({ width, height }) &&
    pixels >= SEEDANCE_REFERENCE_LIMITS.videoMinPixels &&
    pixels <= SEEDANCE_REFERENCE_LIMITS.videoMaxPixels
  );
}

export function getSeedanceReferenceVideoDimensionError() {
  return 'Seedance 2 reference videos must be 480p or 720p (409,600-927,408 pixels). 1080p and 4K are not supported.';
}

export function getSeedanceReferenceItems(value: SeedanceReferenceMedia) {
  return [
    value.firstFrame,
    value.lastFrame,
    ...value.images,
    ...value.videos,
    ...value.audio,
  ].filter((item): item is SeedanceReferenceItem => Boolean(item));
}

export function getUploadedSeedanceReferenceOptions(
  value: SeedanceReferenceMedia
) {
  const uploadedUrl = (item?: SeedanceReferenceItem) =>
    item?.status === 'uploaded' ? item.url : undefined;
  const uploadedUrls = (items: SeedanceReferenceItem[]) =>
    items
      .filter((item) => item.status === 'uploaded' && item.url)
      .map((item) => item.url as string);

  return {
    reference_first_frame: uploadedUrl(value.firstFrame),
    reference_last_frame: uploadedUrl(value.lastFrame),
    reference_images: uploadedUrls(value.images),
    reference_videos: uploadedUrls(value.videos),
    reference_audio: uploadedUrls(value.audio),
  };
}

export function formatSeedanceFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatSeedanceDuration(duration?: number) {
  if (!duration) return '';
  return `${duration.toFixed(duration % 1 === 0 ? 0 : 1)}s`;
}
