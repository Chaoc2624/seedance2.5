import AudioLines from 'lucide-react/dist/esm/icons/audio-lines';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Copy from 'lucide-react/dist/esm/icons/copy';
import Download from 'lucide-react/dist/esm/icons/download';
import Eraser from 'lucide-react/dist/esm/icons/eraser';
import Expand from 'lucide-react/dist/esm/icons/expand';
import Film from 'lucide-react/dist/esm/icons/film';
import Heart from 'lucide-react/dist/esm/icons/heart';
import ImageIcon from 'lucide-react/dist/esm/icons/image';
import ImageOff from 'lucide-react/dist/esm/icons/image-off';
import ImagePlus from 'lucide-react/dist/esm/icons/image-plus';
import ImageUp from 'lucide-react/dist/esm/icons/image-up';
import Link2 from 'lucide-react/dist/esm/icons/link-2';
import MoreHorizontal from 'lucide-react/dist/esm/icons/more-horizontal';
import Paintbrush from 'lucide-react/dist/esm/icons/paintbrush';
import Pencil from 'lucide-react/dist/esm/icons/pencil';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Scissors from 'lucide-react/dist/esm/icons/scissors';
import Share2 from 'lucide-react/dist/esm/icons/share-2';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Star from 'lucide-react/dist/esm/icons/star';
import Video from 'lucide-react/dist/esm/icons/video';
import X from 'lucide-react/dist/esm/icons/x';
import type { ComponentType, MouseEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useLocale, useTranslations } from '@/core/i18n/hooks';

import {
  DEFAULT_IMAGE_MODEL_CATALOG,
  getDefaultImageModelForScene,
  getImageModelProviderModel,
} from '@/config/ai-models';
import type { ImageGeneratorScene } from '@/config/ai-models';
import {
  DEFAULT_VIDEO_MODEL_CATALOG,
  getDefaultVideoModelForScene,
} from '@/config/ai-video-models';
import type { VideoGeneratorScene } from '@/config/ai-video-models';

import { AIMediaType, AITaskStatus } from '@/extensions/ai/types';

import { LazyImage } from '@/components/blocks/common/media/lazy-image';
import { UpgradePaywallDialog } from '@/components/blocks/pricing/upgrade-paywall-dialog';
import { useUpgradePaywall } from '@/components/blocks/pricing/use-upgrade-paywall';
import { CollapsiblePrompt } from '@/components/features/ai-generator/components/collapsible-prompt';
import { requestGlobalCreationComposerDraft } from '@/components/features/ai-generator/components/global-creation-composer-events';
import {
  CREATE_PROMPT_EVENT_NAME,
  type HeroCreationDraft,
  type HeroGenerationPayload,
  type HeroLocalAsset,
} from '@/components/features/ai-generator/components/hero-creation-form';
import { modelsByMode } from '@/components/features/ai-generator/components/hero-creation-form-data';
import {
  CreateHistoryLoadMoreSkeleton,
  CreateHistorySkeleton,
  type PendingTaskInfo,
} from '@/components/features/ai-generator/create-history-skeleton';
import {
  getTimelineEntryUrls,
  getTimelineMediaSlots,
} from '@/components/features/ai-generator/create-workspace-media';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppContext } from '@/hooks/use-app-context';
import { cn } from '@/lib/utils';
import {
  getBatchOutputCount,
  sortBatchTasksForDisplay,
} from '@/services/ai-batch';
import { useCreationQueueStore } from '@/store/creation-queue';

type TimelineMediaType = 'image' | 'video';
type TimelineTaskResult = {
  status: string;
  resultUrls: string[];
  error?: string;
};
type TimelineEntry = {
  id: string;
  batchId?: string;
  taskId?: string;
  taskIds?: string[];
  taskResults?: Record<string, TimelineTaskResult>;
  expectedResults?: number;
  mediaType: TimelineMediaType;
  status: string;
  prompt: string;
  provider?: string;
  model?: string;
  modelLabel: string;
  scene: string;
  createdAt: Date;
  resultUrls: string[];
  progress: number;
  error?: string;
  payload?: HeroGenerationPayload;
  draft?: HeroCreationDraft;
};
type TimelineFilter = 'all' | 'image' | 'video' | 'audio' | 'favorites';
type Translate = (
  key: string,
  interpolation?: Record<string, unknown>
) => string;
type PreviewMedia = {
  entry: TimelineEntry;
  url: string;
};
type BackendTask = {
  id: string;
  status: string;
  provider: string;
  model: string;
  prompt: string | null;
  scene: string | null;
  mediaType: string;
  taskInfo: string | null;
  taskResult: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  options?: string | null;
  batchId?: string | null;
};

const POLL_INTERVAL = 5000;
const INITIAL_SAMPLES = [
  '/imgs/features/reference-showcase-1.webp',
  '/imgs/features/gpt-image-2-character-sheet.jpg',
  '/imgs/features/gpt-image-2-product-ad.jpg',
  '/imgs/cases/2.png',
];
const FILTER_OPTIONS: Array<{
  value: TimelineFilter;
  icon: ComponentType<{ className?: string }>;
}> = [
  { value: 'all', icon: Sparkles },
  { value: 'image', icon: ImageIcon },
  { value: 'video', icon: Video },
  { value: 'audio', icon: AudioLines },
  { value: 'favorites', icon: Star },
];

function parseTaskResult(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getEntryUrls(task: BackendTask) {
  return getTimelineEntryUrls(task);
}

function getRequestedOutputCount(payload: HeroGenerationPayload) {
  if (payload.mode !== 'image') return 1;

  const rawCount = payload.settings?.outputCount;
  const count =
    typeof rawCount === 'number'
      ? rawCount
      : typeof rawCount === 'string'
        ? Number.parseInt(rawCount, 10)
        : 1;

  return Math.min(4, Math.max(1, Number.isFinite(count) ? count : 1));
}

function flattenTaskUrls(urlGroups: string[][]) {
  return urlGroups.flat();
}

function haveSameStrings(left: string[], right: string[]) {
  return (
    left.length === right.length && left.every((value, i) => value === right[i])
  );
}

function haveSameTaskResults(
  left: Record<string, TimelineTaskResult> | undefined,
  right: Record<string, TimelineTaskResult>
) {
  if (!left) return false;
  const leftIds = Object.keys(left);
  const rightIds = Object.keys(right);
  return (
    leftIds.length === rightIds.length &&
    rightIds.every((id) => {
      const current = left[id];
      const next = right[id];
      return (
        current?.status === next?.status &&
        current?.error === next?.error &&
        haveSameStrings(current?.resultUrls ?? [], next?.resultUrls ?? [])
      );
    })
  );
}

function getAggregateProgress({
  taskResults,
  expectedResults,
}: {
  taskResults: Record<string, TimelineTaskResult>;
  expectedResults: number;
}) {
  const completedCount = Object.values(taskResults).filter(
    (result) =>
      result.status === AITaskStatus.SUCCESS ||
      result.status === AITaskStatus.FAILED ||
      result.status === AITaskStatus.CANCELED
  ).length;

  return Math.max(12, Math.round((completedCount / expectedResults) * 100));
}

function getAggregateStatus({
  taskResults,
  expectedResults,
}: {
  taskResults: Record<string, TimelineTaskResult>;
  expectedResults: number;
}) {
  const results = Object.values(taskResults);
  const completedCount = results.filter(
    (result) =>
      result.status === AITaskStatus.SUCCESS ||
      result.status === AITaskStatus.FAILED ||
      result.status === AITaskStatus.CANCELED
  ).length;

  if (completedCount < expectedResults) {
    return AITaskStatus.PROCESSING;
  }

  const successCount = results.filter(
    (result) => result.status === AITaskStatus.SUCCESS
  ).length;
  const failedCount = results.filter(
    (result) =>
      result.status === AITaskStatus.FAILED ||
      result.status === AITaskStatus.CANCELED
  ).length;

  if (successCount === expectedResults) return AITaskStatus.SUCCESS;
  if (successCount > 0 && failedCount > 0) return 'partial_failed';
  return AITaskStatus.FAILED;
}

function getAggregateError({
  taskResults,
}: {
  taskResults: Record<string, TimelineTaskResult>;
}) {
  const failedCount = Object.values(taskResults).filter(
    (result) =>
      result.status === AITaskStatus.FAILED ||
      result.status === AITaskStatus.CANCELED
  ).length;

  if (failedCount === 0) return undefined;
  return Object.values(taskResults).find((result) => result.error)?.error;
}

function buildTaskResult(task: BackendTask): TimelineTaskResult {
  const rawResult = parseTaskResult(task.taskResult);
  const errorMessage =
    rawResult && typeof rawResult === 'object'
      ? ((rawResult as { errorMessage?: unknown; error?: unknown })
          .errorMessage ?? (rawResult as { error?: unknown }).error)
      : undefined;

  return {
    status: task.status,
    resultUrls: getEntryUrls(task),
    error:
      task.status === AITaskStatus.FAILED
        ? typeof errorMessage === 'string'
          ? errorMessage
          : 'Provider returned a failed status.'
        : undefined,
  };
}

function getEntryTaskIds(entry: TimelineEntry) {
  return entry.taskIds ?? (entry.taskId ? [entry.taskId] : []);
}

function isTaskSettled(result?: TimelineTaskResult) {
  return (
    result?.status === AITaskStatus.SUCCESS ||
    result?.status === AITaskStatus.FAILED ||
    result?.status === AITaskStatus.CANCELED
  );
}

function getEntryActiveTaskIds(entry: TimelineEntry) {
  return getEntryTaskIds(entry).filter(
    (taskId) => !isTaskSettled(entry.taskResults?.[taskId])
  );
}

function isImageScene(value: unknown): value is ImageGeneratorScene {
  return value === 'text-to-image' || value === 'image-to-image';
}

function isVideoScene(value: unknown): value is VideoGeneratorScene {
  return (
    value === 'text-to-video' ||
    value === 'image-to-video' ||
    value === 'video-to-video'
  );
}

function getImageRequest(payload: HeroGenerationPayload) {
  const scene = isImageScene(payload.tab) ? payload.tab : 'text-to-image';
  const model =
    DEFAULT_IMAGE_MODEL_CATALOG.find((item) => item.id === payload.modelKey) ??
    getDefaultImageModelForScene(scene, DEFAULT_IMAGE_MODEL_CATALOG);
  if (!model) return null;

  const settings = payload.settings ?? {};
  const resolution =
    typeof settings.resolution === 'string' ? settings.resolution : '2K';
  const options: Record<string, unknown> = {
    _credit_resolution: resolution,
    aspect_ratio:
      typeof settings.aspectRatio === 'string' ? settings.aspectRatio : '1:1',
    resolution,
    output_format:
      typeof settings.outputFormat === 'string'
        ? settings.outputFormat.toLowerCase()
        : 'png',
    nsfw_checker: false,
  };
  if (typeof settings.quality === 'string') {
    options.quality = settings.quality;
  }
  if (Array.isArray(settings.image_input)) {
    options.image_input = settings.image_input;
  }

  return {
    scene,
    provider: model.provider,
    model: getImageModelProviderModel(model, scene),
    label: model.label,
    options,
  };
}

function getVideoRequest(payload: HeroGenerationPayload) {
  const scene = isVideoScene(payload.tab) ? payload.tab : 'text-to-video';
  const model =
    DEFAULT_VIDEO_MODEL_CATALOG.find((item) => item.id === payload.modelKey) ??
    getDefaultVideoModelForScene(scene, DEFAULT_VIDEO_MODEL_CATALOG);
  if (!model) return null;

  const settings = payload.settings ?? {};
  const options: Record<string, unknown> = {};
  if (typeof settings.duration === 'string')
    options.duration = settings.duration;
  if (typeof settings.aspectRatio === 'string') {
    options.aspect_ratio = settings.aspectRatio;
  }
  if (typeof settings.resolution === 'string') {
    options.resolution = settings.resolution;
  }
  if (typeof settings.mode === 'string') options.mode = settings.mode;
  if (Array.isArray(settings.image_input)) {
    options.image_input = settings.image_input;
  }
  if (Array.isArray(settings.video_input)) {
    options.video_input = settings.video_input;
  }

  return {
    scene,
    provider: model.provider,
    model: model.model,
    label: model.label,
    options,
  };
}

function getImageModelKeyFromProviderModel(model: string) {
  return DEFAULT_IMAGE_MODEL_CATALOG.find((item) =>
    Object.values({
      default: item.model,
      ...item.sceneModels,
    }).includes(model)
  )?.id;
}

function getVideoModelKeyFromProviderModel(model: string) {
  return DEFAULT_VIDEO_MODEL_CATALOG.find((item) => item.model === model)?.id;
}

function getImageWorkflowId(scene: string) {
  return scene === 'image-to-image' ? 'image-edit' : 'text-image';
}

function getVideoWorkflowId(scene: string) {
  if (scene === 'video-to-video') return 'video-edit';
  if (scene === 'image-to-video') return 'reference-video';
  return 'text-image-video';
}

function getModelOptionIdForImage(modelKey?: string) {
  const imageModel = DEFAULT_IMAGE_MODEL_CATALOG.find(
    (item) => item.id === modelKey
  );
  const byTitle = imageModel
    ? modelsByMode.image.find(
        (item) =>
          item.title === imageModel.label ||
          imageModel.label.includes(item.title)
      )
    : null;
  return byTitle?.id ?? modelsByMode.image[0].id;
}

function getTaskProviderInput(task: BackendTask) {
  const result = parseTaskResult(task.taskResult);
  if (!result || typeof result !== 'object') return {};
  const param = (result as Record<string, unknown>).param;
  if (typeof param !== 'string') return {};

  try {
    const parsedParam = JSON.parse(param) as Record<string, unknown>;
    const input = parsedParam.input;
    if (typeof input === 'string') {
      const parsedInput = JSON.parse(input);
      return parsedInput && typeof parsedInput === 'object'
        ? (parsedInput as Record<string, unknown>)
        : {};
    }
    return input && typeof input === 'object'
      ? (input as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function taskSettingsToPayloadSettings(
  task: BackendTask,
  mediaType: TimelineMediaType
) {
  const input = getTaskProviderInput(task);
  const settings: Record<string, string | boolean> = {};

  if (mediaType === 'image') {
    if (typeof input.aspect_ratio === 'string') {
      settings.aspectRatio = input.aspect_ratio;
    }
    if (typeof input.resolution === 'string') {
      settings.resolution = input.resolution;
    }
    if (typeof input.quality === 'string') {
      settings.quality = input.quality;
    }
    if (typeof input.output_format === 'string') {
      settings.outputFormat = input.output_format.toUpperCase();
    }
    return settings;
  }

  if (typeof input.duration === 'string') {
    settings.duration = input.duration;
  }
  if (typeof input.aspect_ratio === 'string') {
    settings.aspectRatio = input.aspect_ratio;
  }
  if (typeof input.resolution === 'string') {
    settings.resolution = input.resolution;
  }
  if (typeof input.mode === 'string') {
    settings.mode = input.mode;
  }
  return settings;
}

function getPayloadFromTask(task: BackendTask): HeroGenerationPayload {
  const mediaType = task.mediaType === AIMediaType.VIDEO ? 'video' : 'image';
  const scene =
    mediaType === 'image'
      ? isImageScene(task.scene)
        ? task.scene
        : 'text-to-image'
      : isVideoScene(task.scene)
        ? task.scene
        : 'text-to-video';

  return {
    mode: mediaType,
    prompt: task.prompt || '',
    tab: scene,
    modelKey:
      mediaType === 'image'
        ? getImageModelKeyFromProviderModel(task.model)
        : getVideoModelKeyFromProviderModel(task.model),
    settings: taskSettingsToPayloadSettings(task, mediaType),
  };
}

function getPayloadFromEntry(entry: TimelineEntry): HeroGenerationPayload {
  if (entry.payload) return entry.payload;

  const scene =
    entry.mediaType === 'image'
      ? isImageScene(entry.scene)
        ? entry.scene
        : 'text-to-image'
      : isVideoScene(entry.scene)
        ? entry.scene
        : 'text-to-video';

  return {
    mode: entry.mediaType,
    prompt: entry.prompt,
    tab: scene,
    modelKey:
      entry.mediaType === 'image'
        ? entry.model
          ? getImageModelKeyFromProviderModel(entry.model)
          : undefined
        : entry.model
          ? getVideoModelKeyFromProviderModel(entry.model)
          : undefined,
  };
}

function getDraftFromPayload(
  payload: HeroGenerationPayload
): HeroCreationDraft {
  const settings = payload.settings ?? {};

  if (payload.mode === 'image') {
    const scene = isImageScene(payload.tab) ? payload.tab : 'text-to-image';
    return {
      mode: 'image',
      workflowId: getImageWorkflowId(scene),
      modelId: getModelOptionIdForImage(payload.modelKey),
      videoModelKey: getDefaultVideoModelForScene('text-to-video')?.id ?? '',
      imageModelKey:
        payload.modelKey ?? getDefaultImageModelForScene(scene)?.id ?? '',
      duration: '5',
      resolution: '1080p',
      ratio: '16:9',
      videoMode: 'pro',
      imageAspectRatio:
        typeof settings.aspectRatio === 'string' ? settings.aspectRatio : '1:1',
      imageResolution:
        typeof settings.resolution === 'string' ? settings.resolution : '2K',
      imageQuality:
        typeof settings.quality === 'string' ? settings.quality : 'medium',
      imageOutputFormat:
        typeof settings.outputFormat === 'string'
          ? settings.outputFormat
          : 'PNG',
      imageOutputCount:
        typeof settings.outputCount === 'number'
          ? String(settings.outputCount)
          : typeof settings.outputCount === 'string'
            ? settings.outputCount
            : '1',
      prompt: payload.prompt,
    };
  }

  const scene = isVideoScene(payload.tab) ? payload.tab : 'text-to-video';
  const videoModelKey =
    payload.modelKey ?? getDefaultVideoModelForScene(scene)?.id ?? '';
  return {
    mode: 'video',
    workflowId: getVideoWorkflowId(scene),
    modelId: modelsByMode.video[0].id,
    videoModelKey,
    imageModelKey: getDefaultImageModelForScene('text-to-image')?.id ?? '',
    duration: typeof settings.duration === 'string' ? settings.duration : '5',
    resolution:
      typeof settings.resolution === 'string' ? settings.resolution : '1080p',
    ratio:
      typeof settings.aspectRatio === 'string' ? settings.aspectRatio : '16:9',
    videoMode: typeof settings.mode === 'string' ? settings.mode : 'pro',
    imageAspectRatio: '1:1',
    imageResolution: '2K',
    imageQuality: 'medium',
    imageOutputFormat: 'PNG',
    imageOutputCount: '1',
    prompt: payload.prompt,
  };
}

function getDraftFromEntry(entry: TimelineEntry) {
  return entry.draft ?? getDraftFromPayload(getPayloadFromEntry(entry));
}

function getModelLabel(task: BackendTask) {
  const imageModel = DEFAULT_IMAGE_MODEL_CATALOG.find((item) =>
    Object.values({
      default: item.model,
      ...item.sceneModels,
    }).includes(task.model)
  );
  if (imageModel) return imageModel.label;

  const videoModel = DEFAULT_VIDEO_MODEL_CATALOG.find(
    (item) => item.model === task.model
  );
  return videoModel?.label ?? task.model;
}

function taskToEntry(task: BackendTask): TimelineEntry {
  const mediaType = task.mediaType === AIMediaType.VIDEO ? 'video' : 'image';
  const done = task.status === AITaskStatus.SUCCESS;
  const payload = getPayloadFromTask(task);
  return {
    id: task.id,
    taskId: task.id,
    mediaType,
    status: task.status,
    prompt: task.prompt || '',
    provider: task.provider,
    model: task.model,
    modelLabel: getModelLabel(task),
    scene: task.scene || '',
    createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
    resultUrls: getEntryUrls(task),
    progress: done ? 100 : task.status === AITaskStatus.PROCESSING ? 60 : 25,
    payload,
    draft: getDraftFromPayload(payload),
  };
}

/**
 * Re-groups a flat list of DB tasks back into timeline entries.
 * Tasks that share a `batchId` are merged into a single entry so that a
 * "generate 2 images" submission appears as one card in history, exactly
 * as it did when it was first created in the current session.
 */
function groupTasksIntoEntries(tasks: BackendTask[]): TimelineEntry[] {
  const soloEntries: TimelineEntry[] = [];
  const batchMap = new Map<string, BackendTask[]>();

  for (const task of tasks) {
    if (task.batchId) {
      const group = batchMap.get(task.batchId) ?? [];
      group.push(task);
      batchMap.set(task.batchId, group);
    } else {
      soloEntries.push(taskToEntry(task));
    }
  }

  const batchEntries: TimelineEntry[] = [];
  for (const batchTasks of batchMap.values()) {
    // Keep stable order within a batch by creation time.
    const sorted = sortBatchTasksForDisplay(batchTasks);
    const first = sorted[0]!;
    const taskResults = Object.fromEntries(
      sorted.map((t) => [t.id, buildTaskResult(t)])
    );
    const expectedResults = Math.max(
      sorted.length,
      ...sorted.map((task) => getBatchOutputCount(task.options, 1))
    );
    const aggregateStatus = getAggregateStatus({
      taskResults,
      expectedResults,
    });
    const payload = getPayloadFromTask(first);
    batchEntries.push({
      // Use the shared batchId as the stable entry id so the same submission
      // keeps one identity across the in-session optimistic entry, batch
      // polling, and a history reload — no re-keying, no collapse.
      id: first.batchId ?? first.id,
      batchId: first.batchId ?? undefined,
      taskId: first.id,
      taskIds: sorted.map((t) => t.id),
      taskResults,
      expectedResults,
      mediaType: first.mediaType === AIMediaType.VIDEO ? 'video' : 'image',
      status: aggregateStatus,
      prompt: first.prompt || '',
      provider: first.provider,
      model: first.model,
      modelLabel: getModelLabel(first),
      scene: first.scene || '',
      createdAt: first.createdAt ? new Date(first.createdAt) : new Date(),
      resultUrls: flattenTaskUrls(sorted.map((t) => getEntryUrls(t))),
      progress:
        aggregateStatus === AITaskStatus.SUCCESS ||
        aggregateStatus === AITaskStatus.FAILED
          ? 100
          : 60,
      error: getAggregateError({ taskResults }),
      payload,
      draft: getDraftFromPayload(payload),
    });
  }

  // Merge and re-sort by createdAt descending so batches appear in the right
  // position among solo entries.
  return [...soloEntries, ...batchEntries].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

function statusText(t: Translate, status: string) {
  if (status === AITaskStatus.SUCCESS) return t('status.success');
  if (status === AITaskStatus.FAILED) return t('status.failed');
  if (status === 'partial_failed') return t('status.partial_failed');
  if (status === AITaskStatus.PROCESSING) return t('status.processing');
  return t('status.queued');
}

function sceneText(t: Translate, scene: string, mediaType: TimelineMediaType) {
  if (scene === 'image-to-image') return t('scene.image_to_image');
  if (scene === 'text-to-image') return t('scene.text_to_image');
  if (scene === 'image-to-video') return t('scene.image_to_video');
  if (scene === 'video-to-video') return t('scene.video_to_video');
  return mediaType === 'video'
    ? t('scene.text_to_video')
    : t('scene.text_to_image');
}

function formatEntryTime(value: Date, locale: string) {
  return value.toLocaleString(locale, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function notifyToolAction(t: Translate, label: string) {
  toast.info(t('toast.tool_coming_soon', { tool: label }));
}

async function resolvePayloadLocalAssets(payload: HeroGenerationPayload) {
  if (!payload.localAssets?.length) return payload;

  const formData = new FormData();
  const uploadCandidates = payload.localAssets.filter(
    (asset): asset is HeroLocalAsset & { file: File } => Boolean(asset.file)
  );
  uploadCandidates.forEach((asset) => {
    formData.append('files', asset.file);
  });

  const result =
    uploadCandidates.length > 0
      ? await import('@/server/storage.functions').then(({ uploadMediaFn }) =>
          uploadMediaFn({ data: formData })
        )
      : null;
  const uploadedUrls = result?.urls ?? [];
  const imageUrls: string[] = [];
  const videoUrls: string[] = [];

  uploadCandidates.forEach((asset, index) => {
    const url = uploadedUrls[index];
    if (!url) return;
    if (asset.mediaType === 'video') {
      videoUrls.push(url);
    } else {
      imageUrls.push(url);
    }
  });
  payload.localAssets.forEach((asset) => {
    if (!asset.sourceUrl) return;
    if (asset.mediaType === 'video') {
      videoUrls.push(asset.sourceUrl);
    } else {
      imageUrls.push(asset.sourceUrl);
    }
  });

  const { localAssets: _localAssets, ...restPayload } = payload;
  return {
    ...restPayload,
    settings: {
      ...payload.settings,
      ...(imageUrls.length > 0 ? { image_input: imageUrls } : {}),
      ...(videoUrls.length > 0 ? { video_input: videoUrls } : {}),
    },
  } satisfies HeroGenerationPayload;
}

async function copyShareLink(url: string, t: Translate) {
  try {
    await navigator.clipboard.writeText(url);
    toast.success(t('toast.share_copied'));
  } catch {
    toast.error(t('toast.copy_failed'));
  }
}

function TimelineFilterMenu({
  value,
  onChange,
}: {
  value: TimelineFilter;
  onChange: (value: TimelineFilter) => void;
}) {
  const t = useTranslations('pages.generate');
  const options = FILTER_OPTIONS.map((option) => ({
    ...option,
    label: t(`filter.${option.value}`),
  }));
  const selected =
    options.find((option) => option.value === value) ?? options[0];

  return (
    <div className="fixed top-[5.75rem] right-5 z-30 lg:right-16 xl:right-20">
      <DropdownMenu>
        <DropdownMenuTrigger className="lusee-liquid-control inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-[#f4f2e6] transition-colors hover:bg-white/[0.105] focus-visible:ring-2 focus-visible:ring-[#eaff4f]/60 focus-visible:outline-none">
          {selected.label}
          <ChevronDown className="size-4 text-[#d0d3c3]" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="z-[70] min-w-40 rounded-xl border-white/12 bg-[#10120d]/90 p-1.5 text-[#ecede2] shadow-2xl shadow-black/45 backdrop-blur-2xl backdrop-saturate-125"
          onWheel={(event) => event.stopPropagation()}
        >
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <DropdownMenuItem
                key={option.value}
                className={cn(
                  'min-h-10 cursor-pointer rounded-lg text-sm font-semibold text-[#d2d5c6] focus:bg-white/[0.09] focus:text-[#f4f2e6]',
                  value === option.value && 'bg-white/[0.095] text-[#f4f2e6]'
                )}
                onSelect={() => onChange(option.value)}
              >
                <Icon className="size-4 text-[#b8bcad]" />
                {option.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Derives a minimal display info object from a pending payload so the
 * history-loading skeleton can show real content immediately on navigation.
 */
function getPendingTaskInfo(
  payload: HeroGenerationPayload,
  t: Translate
): PendingTaskInfo | null {
  const request =
    payload.mode === 'image'
      ? getImageRequest(payload)
      : getVideoRequest(payload);
  if (!request) return null;

  return {
    scene: sceneText(t, request.scene, payload.mode),
    modelLabel: request.label,
    prompt: payload.prompt,
    outputCount: getRequestedOutputCount(payload),
    mediaType: payload.mode,
  };
}

export function CreateWorkspace() {
  const t = useTranslations('pages.generate');
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingMoreHistory, setLoadingMoreHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyError, setHistoryError] = useState(false);
  const [filter, setFilter] = useState<TimelineFilter>('all');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set());
  // Read the pending payload once at mount so we can show a content-aware
  // skeleton while history is loading. Consumed by the autoHandledRef effect.
  const [pendingPayload] = useState<HeroGenerationPayload | null>(
    () => useCreationQueueStore.getState().pendingPayload
  );
  const [previewMedia, setPreviewMedia] = useState<PreviewMedia | null>(null);
  const autoHandledRef = useRef(false);
  const { user, setIsShowSignModal, fetchUserCredits } = useAppContext();
  const { closeUpgradePaywall, requestUpgrade, upgradeReason } =
    useUpgradePaywall();
  const historyScrollRef = useRef<HTMLDivElement>(null);
  const historyLoadMoreRef = useRef<HTMLDivElement>(null);
  const pollInFlightRef = useRef(false);

  // Batches (new submissions) poll one backend endpoint per batch; legacy
  // history tasks without a batchId fall back to per-task polling.
  const activeBatchIds = useMemo(() => {
    const ids = new Set<string>();
    entries.forEach((entry) => {
      if (
        (entry.status === AITaskStatus.PENDING ||
          entry.status === AITaskStatus.PROCESSING) &&
        entry.batchId
      ) {
        ids.add(entry.batchId);
      }
    });
    return Array.from(ids);
  }, [entries]);
  const activeSoloTaskIds = useMemo(
    () =>
      entries.flatMap((entry) =>
        (entry.status === AITaskStatus.PENDING ||
          entry.status === AITaskStatus.PROCESSING) &&
        !entry.batchId
          ? getEntryActiveTaskIds(entry)
          : []
      ),
    [entries]
  );
  // A signature of *which* things are active (not their progress), so the poll
  // interval is only torn down/recreated when the active set changes — not on
  // every status tick, which previously caused a tight re-poll loop.
  const pollSignature = useMemo(
    () => [...activeBatchIds, ...activeSoloTaskIds].sort().join('|'),
    [activeBatchIds, activeSoloTaskIds]
  );
  const activeBatchIdsRef = useRef(activeBatchIds);
  const activeSoloTaskIdsRef = useRef(activeSoloTaskIds);
  activeBatchIdsRef.current = activeBatchIds;
  activeSoloTaskIdsRef.current = activeSoloTaskIds;
  const filteredEntries = useMemo(() => {
    if (filter === 'image') {
      return entries.filter((entry) => entry.mediaType === 'image');
    }
    if (filter === 'video') {
      return entries.filter((entry) => entry.mediaType === 'video');
    }
    if (filter === 'audio') {
      return [];
    }
    if (filter === 'favorites') {
      return entries.filter((entry) => favoriteIds.has(entry.id));
    }
    return entries;
  }, [entries, favoriteIds, filter]);

  const toggleFavorite = useCallback((entryId: string) => {
    setFavoriteIds((current) => {
      const next = new Set(current);
      if (next.has(entryId)) {
        next.delete(entryId);
      } else {
        next.add(entryId);
      }
      return next;
    });
  }, []);

  const updateEntryFromTask = useCallback((task: BackendTask) => {
    setEntries((current) =>
      current.map((entry) => {
        if (!getEntryTaskIds(entry).includes(task.id)) return entry;

        const taskResults = {
          ...entry.taskResults,
          [task.id]: buildTaskResult(task),
        };
        const expectedResults =
          entry.expectedResults ?? Math.max(1, getEntryTaskIds(entry).length);
        const status = getAggregateStatus({ taskResults, expectedResults });

        return {
          ...entry,
          status,
          taskResults,
          resultUrls: flattenTaskUrls(
            Object.values(taskResults).map((result) => result.resultUrls)
          ),
          progress:
            status === AITaskStatus.SUCCESS ||
            status === AITaskStatus.FAILED ||
            status === 'partial_failed'
              ? 100
              : Math.max(
                  entry.progress,
                  getAggregateProgress({ taskResults, expectedResults })
                ),
          error: getAggregateError({ taskResults }),
          payload: entry.payload,
          draft: entry.draft,
        };
      })
    );
  }, []);

  // Rebuild a whole entry from the authoritative task list the batch endpoint
  // returns. The backend is the single source of truth for the batch, so the
  // client just projects it — no per-task stitching that can collapse.
  const updateEntryFromBatch = useCallback(
    (batchId: string, tasks: BackendTask[]) => {
      if (tasks.length === 0) return;
      setEntries((current) => {
        let changed = false;
        const nextEntries = current.map((entry) => {
          if (entry.batchId !== batchId) return entry;

          const expectedResults = Math.max(
            entry.expectedResults ?? tasks.length,
            tasks.length
          );
          const taskResults = Object.fromEntries(
            tasks.map((task) => [task.id, buildTaskResult(task)])
          );
          const status = getAggregateStatus({ taskResults, expectedResults });
          const taskIds = tasks.map((task) => task.id);
          const resultUrls = flattenTaskUrls(
            tasks.map((task) => getEntryUrls(task))
          );
          const progress =
            status === AITaskStatus.SUCCESS ||
            status === AITaskStatus.FAILED ||
            status === 'partial_failed'
              ? 100
              : Math.max(
                  entry.progress,
                  getAggregateProgress({ taskResults, expectedResults })
                );
          const error = getAggregateError({ taskResults });

          if (
            entry.taskId === (tasks[0]?.id ?? entry.taskId) &&
            haveSameStrings(getEntryTaskIds(entry), taskIds) &&
            haveSameTaskResults(entry.taskResults, taskResults) &&
            entry.expectedResults === expectedResults &&
            entry.status === status &&
            haveSameStrings(entry.resultUrls, resultUrls) &&
            entry.progress === progress &&
            entry.error === error
          ) {
            return entry;
          }

          changed = true;

          return {
            ...entry,
            taskId: tasks[0]?.id ?? entry.taskId,
            taskIds,
            taskResults,
            expectedResults,
            status,
            resultUrls,
            progress,
            error,
          };
        });
        return changed ? nextEntries : current;
      });
    },
    []
  );

  const runGenerate = useCallback(
    async (payload: HeroGenerationPayload) => {
      if (!user) {
        setIsShowSignModal(true);
        toast.error(t('toast.sign_in_required'));
        return;
      }

      const baseRequest =
        payload.mode === 'image'
          ? getImageRequest(payload)
          : getVideoRequest(payload);
      if (!baseRequest) {
        toast.error(t('toast.model_unavailable'));
        return;
      }

      const resolvedPayload = await resolvePayloadLocalAssets(payload);
      const request =
        resolvedPayload.mode === 'image'
          ? getImageRequest(resolvedPayload)
          : getVideoRequest(resolvedPayload);
      if (!request) {
        toast.error(t('toast.model_unavailable'));
        return;
      }

      // The server owns the batch ID. This temporary ID only keeps the
      // optimistic card stable until the single batch submission returns.
      const submissionId = crypto.randomUUID();
      const mediaType =
        resolvedPayload.mode === 'image'
          ? AIMediaType.IMAGE
          : AIMediaType.VIDEO;
      const expectedResults = getRequestedOutputCount(resolvedPayload);
      const optimisticEntry: TimelineEntry = {
        id: submissionId,
        mediaType: resolvedPayload.mode,
        status: AITaskStatus.PENDING,
        prompt: resolvedPayload.prompt,
        provider: request.provider,
        model: request.model,
        modelLabel: request.label,
        scene: request.scene,
        createdAt: new Date(),
        resultUrls: [],
        progress: 12,
        expectedResults,
        payload: resolvedPayload,
        draft: getDraftFromPayload(resolvedPayload),
      };
      setEntries((current) => [optimisticEntry, ...current]);

      try {
        const { aiGenerateBatchFn } = await import('@/server/ai.functions');
        const result = (await aiGenerateBatchFn({
          data: {
            mediaType,
            scene: request.scene,
            provider: request.provider,
            model: request.model,
            prompt: resolvedPayload.prompt.trim(),
            options: request.options,
            count: expectedResults,
          },
        })) as { batchId: string; tasks: BackendTask[] };
        const tasks = result.tasks;
        const taskResults = Object.fromEntries(
          tasks.map((task) => [task.id, buildTaskResult(task)])
        );
        const aggregateStatus = getAggregateStatus({
          taskResults,
          expectedResults,
        });

        setEntries((current) =>
          current.map((entry) =>
            entry.id === submissionId
              ? {
                  ...entry,
                  id: result.batchId,
                  batchId: result.batchId,
                  taskId: tasks[0]?.id,
                  taskIds: tasks.map((task) => task.id),
                  taskResults,
                  expectedResults,
                  status: aggregateStatus,
                  resultUrls: flattenTaskUrls(
                    Object.values(taskResults).map(
                      (result) => result.resultUrls
                    )
                  ),
                  progress:
                    aggregateStatus === AITaskStatus.SUCCESS ||
                    aggregateStatus === AITaskStatus.FAILED ||
                    aggregateStatus === 'partial_failed'
                      ? 100
                      : Math.max(
                          25,
                          getAggregateProgress({
                            taskResults,
                            expectedResults,
                          })
                        ),
                  error: getAggregateError({ taskResults }),
                  payload: resolvedPayload,
                  draft: getDraftFromPayload(resolvedPayload),
                }
              : entry
          )
        );
        void fetchUserCredits();
        const failedCount = tasks.filter(
          (task) =>
            task.status === AITaskStatus.FAILED ||
            task.status === AITaskStatus.CANCELED
        ).length;
        if (failedCount === expectedResults) {
          toast.error(t('toast.all_failed'));
        } else if (failedCount > 0) {
          toast.error(
            t('toast.partial_submission_failed', { count: failedCount })
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (
          message.includes('available for Pro') ||
          message.includes('supports up to') ||
          message.includes('active generation')
        ) {
          void requestUpgrade(
            message.includes('4K')
              ? '4k'
              : message.includes('Video')
                ? 'video'
                : 'capacity'
          );
        }
        setEntries((current) =>
          current.map((entry) =>
            entry.id === submissionId
              ? {
                  ...entry,
                  status: AITaskStatus.FAILED,
                  error: message,
                  progress: 100,
                }
              : entry
          )
        );
        toast.error(t('toast.generation_failed', { message }));
      }
    },
    [fetchUserCredits, requestUpgrade, setIsShowSignModal, t, user]
  );

  const refillComposerFromEntry = useCallback((entry: TimelineEntry) => {
    const draft = getDraftFromEntry(entry);
    requestGlobalCreationComposerDraft(draft);
  }, []);

  const regenerateFromEntry = useCallback(
    (entry: TimelineEntry) => {
      if (
        entry.status === AITaskStatus.PENDING ||
        entry.status === AITaskStatus.PROCESSING
      ) {
        return;
      }
      // Remove the failed/partial-failed card immediately so the timeline only
      // shows the new pending task — no stale failure sitting above or below it.
      if (
        entry.status === AITaskStatus.FAILED ||
        entry.status === 'partial_failed'
      ) {
        setEntries((current) => current.filter((e) => e.id !== entry.id));
      }
      const payload = getPayloadFromEntry(entry);
      void runGenerate(payload);
    },
    [runGenerate, setEntries]
  );

  const loadHistoryPage = useCallback(async (page: number) => {
    if (page > 1) setLoadingMoreHistory(true);
    setHistoryError(false);
    try {
      const { getUserAITasksPageDataFn } =
        await import('@/server/ai-task.functions');
      const pageData = await getUserAITasksPageDataFn({
        data: { page, limit: 20, type: 'all' },
      });
      const dbEntries = groupTasksIntoEntries(
        pageData.aiTasks as BackendTask[]
      );
      setHistoryTotal(pageData.total);
      setHistoryPage(page);
      setEntries((current) => {
        const incomingIds = new Set<string>();
        dbEntries.forEach((entry) => {
          incomingIds.add(entry.id);
          entry.taskIds?.forEach((id) => incomingIds.add(id));
        });
        const activeNotInDb = current.filter(
          (entry) =>
            (entry.status === AITaskStatus.PENDING ||
              entry.status === AITaskStatus.PROCESSING) &&
            !incomingIds.has(entry.id) &&
            !entry.taskIds?.some((id) => incomingIds.has(id))
        );
        const merged = [...current, ...dbEntries].reduce<TimelineEntry[]>(
          (result, entry) => {
            const existingIndex = result.findIndex(
              (item) => item.id === entry.id
            );
            if (existingIndex < 0) {
              result.push(entry);
            } else {
              result[existingIndex] = entry;
            }
            return result;
          },
          activeNotInDb
        );
        return merged.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
      });
    } catch (error) {
      console.error('Failed to load generation history:', error);
      setHistoryError(true);
    } finally {
      setLoadingHistory(false);
      setLoadingMoreHistory(false);
    }
  }, []);

  useEffect(() => {
    void loadHistoryPage(1);
  }, [loadHistoryPage]);

  const hasMoreHistory = historyPage * 20 < historyTotal;
  const historyLoadTriggerIndex = Math.max(0, filteredEntries.length - 3);

  useEffect(() => {
    const target = historyLoadMoreRef.current;
    const root = historyScrollRef.current;
    if (!target || !root || !hasMoreHistory || loadingMoreHistory) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !loadingMoreHistory) {
          void loadHistoryPage(historyPage + 1);
        }
      },
      { root }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [
    filteredEntries.length,
    hasMoreHistory,
    historyLoadTriggerIndex,
    historyPage,
    loadHistoryPage,
    loadingMoreHistory,
  ]);

  useEffect(() => {
    if (autoHandledRef.current || loadingHistory) return;
    autoHandledRef.current = true;

    const { pendingPayload: queuedPayload, setPayload } =
      useCreationQueueStore.getState();
    if (queuedPayload) {
      setPayload(null);
      void runGenerate(queuedPayload);
    }
  }, [loadingHistory, runGenerate]);

  useEffect(() => {
    const handleGenerate = (event: Event) => {
      const detail = (event as CustomEvent<HeroGenerationPayload>).detail;
      if (detail?.prompt) {
        // Clear the store so a potential route remount doesn't double-fire.
        useCreationQueueStore.getState().setPayload(null);
        void runGenerate(detail);
      }
    };
    window.addEventListener(CREATE_PROMPT_EVENT_NAME, handleGenerate);
    return () => {
      window.removeEventListener(CREATE_PROMPT_EVENT_NAME, handleGenerate);
    };
  }, [runGenerate]);

  useEffect(() => {
    if (!pollSignature) return;
    let cancelled = false;

    const poll = async () => {
      if (pollInFlightRef.current) return;
      pollInFlightRef.current = true;
      try {
        const batchIds = activeBatchIdsRef.current;
        const soloTaskIds = activeSoloTaskIdsRef.current;
        const { aiQueryBatchFn, aiQueryFn } =
          await import('@/server/ai.functions');
        await Promise.all([
          ...batchIds.map(async (batchId) => {
            try {
              const result = (await aiQueryBatchFn({ data: { batchId } })) as
                | { batchId: string; tasks: BackendTask[] }
                | undefined
                | null;
              if (!cancelled && result?.tasks) {
                updateEntryFromBatch(result.batchId, result.tasks);
              }
            } catch (error) {
              console.error('Failed to poll batch:', batchId, error);
            }
          }),
          ...soloTaskIds.map(async (taskId) => {
            try {
              const task = (await aiQueryFn({
                data: { taskId },
              })) as BackendTask | undefined | null;
              if (!cancelled && task != null) updateEntryFromTask(task);
            } catch (error) {
              console.error('Failed to poll task:', taskId, error);
            }
          }),
        ]);
      } finally {
        pollInFlightRef.current = false;
      }
    };

    void poll();
    const interval = window.setInterval(poll, POLL_INTERVAL);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [pollSignature, updateEntryFromBatch, updateEntryFromTask]);

  return (
    <div className="create-workspace-shell relative h-[calc(100dvh-4rem)] overflow-hidden bg-[#030502] text-white">
      <UpgradePaywallDialog
        onClose={closeUpgradePaywall}
        open={upgradeReason !== null}
        reason={upgradeReason || 'capacity'}
      />
      <TimelineFilterMenu value={filter} onChange={setFilter} />

      <div
        ref={historyScrollRef}
        className={cn(
          'create-workspace-scroll h-full px-4 pt-20 pr-24 pb-64 sm:px-6 sm:pr-28 lg:px-8 lg:pr-32',
          loadingHistory ? 'overflow-hidden' : 'overflow-y-auto'
        )}
      >
        <div className="mx-auto w-full max-w-[1460px]">
          {loadingHistory ? (
            <CreateHistorySkeleton
              pendingTask={
                pendingPayload
                  ? (getPendingTaskInfo(pendingPayload, t) ?? undefined)
                  : undefined
              }
            />
          ) : filteredEntries.length > 0 ? (
            <div className="space-y-3">
              {filteredEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  ref={
                    index === historyLoadTriggerIndex
                      ? historyLoadMoreRef
                      : undefined
                  }
                >
                  <TimelineCard
                    entry={entry}
                    favorite={favoriteIds.has(entry.id)}
                    onToggleFavorite={() => toggleFavorite(entry.id)}
                    onPreview={(url) => setPreviewMedia({ entry, url })}
                    onEditPrompt={() => refillComposerFromEntry(entry)}
                    onRegenerate={() => regenerateFromEntry(entry)}
                  />
                </div>
              ))}
              {loadingMoreHistory ? (
                <CreateHistoryLoadMoreSkeleton />
              ) : historyError ? (
                <div className="flex min-h-14 items-center justify-center">
                  <button
                    type="button"
                    className="text-sm text-white/55 underline underline-offset-4 hover:text-white"
                    onClick={() => void loadHistoryPage(historyPage + 1)}
                  >
                    {t('timeline.retry_load')}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <EmptyCreateState filter={filter} />
              {historyError && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    className="text-sm text-white/55 underline underline-offset-4 hover:text-white"
                    onClick={() => void loadHistoryPage(historyPage)}
                  >
                    {t('timeline.retry_load')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <PreviewDialog
        preview={previewMedia}
        favorite={previewMedia ? favoriteIds.has(previewMedia.entry.id) : false}
        onOpenChange={(open) => {
          if (!open) setPreviewMedia(null);
        }}
        onToggleFavorite={() => {
          if (previewMedia) toggleFavorite(previewMedia.entry.id);
        }}
        onEditPrompt={() => {
          if (previewMedia) refillComposerFromEntry(previewMedia.entry);
        }}
        onRegenerate={() => {
          if (previewMedia) regenerateFromEntry(previewMedia.entry);
        }}
      />
    </div>
  );
}

function TimelineCard({
  entry,
  favorite,
  onToggleFavorite,
  onPreview,
  onEditPrompt,
  onRegenerate,
}: {
  entry: TimelineEntry;
  favorite: boolean;
  onToggleFavorite: () => void;
  onPreview: (url: string) => void;
  onEditPrompt: () => void;
  onRegenerate: () => void;
}) {
  const t = useTranslations('pages.generate');
  const locale = useLocale();
  const Icon = entry.mediaType === 'video' ? Video : ImageIcon;
  const pending =
    entry.status === AITaskStatus.PENDING ||
    entry.status === AITaskStatus.PROCESSING;
  const expectedCount = entry.expectedResults ?? 1;
  const payloadAspectRatio = entry.payload?.settings?.aspectRatio;
  const aspectRatioRaw =
    typeof payloadAspectRatio === 'string'
      ? payloadAspectRatio
      : (entry.draft?.imageAspectRatio ?? '1:1');
  const aspectRatioCss: Record<string, string> = {
    '1:1': '1 / 1',
    '16:9': '16 / 9',
    '9:16': '9 / 16',
    '4:3': '4 / 3',
    '3:4': '3 / 4',
    auto: '1 / 1',
  };
  const mediaAspectRatio = aspectRatioCss[aspectRatioRaw] ?? '1 / 1';

  const slots = getTimelineMediaSlots(entry);
  const visibleSlots = slots.slice(0, 4);
  const hiddenCount = Math.max(0, slots.length - visibleSlots.length);

  return (
    <article className="w-fit max-w-full rounded-xl bg-white/[0.018] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.18)]">
      <div className="flex max-w-full items-start justify-between gap-4">
        <div className="max-w-[min(860px,72vw)] min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            <span className="rounded-md bg-white/[0.055] px-2 py-1 text-zinc-300">
              {sceneText(t, entry.scene, entry.mediaType)}
            </span>
            <span className="rounded-md bg-white/[0.04] px-2 py-1">
              {entry.modelLabel}
            </span>
            <time>{formatEntryTime(entry.createdAt, locale)}</time>
          </div>
          <CollapsiblePrompt
            prompt={entry.prompt}
            className="mt-3"
            collapsedClassName="max-h-[4.25rem]"
            expandedClassName="max-h-52 overflow-y-auto"
          />
        </div>

        <span
          className={cn(
            'shrink-0 rounded-full px-3 py-1 text-xs font-bold',
            entry.status === AITaskStatus.SUCCESS
              ? 'bg-emerald-500/14 text-emerald-300'
              : entry.status === AITaskStatus.FAILED
                ? 'bg-rose-500/14 text-rose-300'
                : entry.status === 'partial_failed'
                  ? 'bg-amber-500/14 text-amber-300'
                  : 'bg-pink-500/14 text-pink-300'
          )}
        >
          {statusText(t, entry.status)}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm text-zinc-500">
        <span className="inline-flex items-center gap-1.5">
          <Icon className="size-4" />
          {entry.mediaType === 'video'
            ? t('timeline.video')
            : t('timeline.images', {
                completed: entry.resultUrls.length,
                total: entry.expectedResults ?? 1,
              })}
        </span>
      </div>

      {/* Every slot shares a fixed display height; its requested ratio defines
          the width for pending, finished, and failed states alike. */}
      <div className="mt-3 min-w-0">
        <>
          <div className="flex flex-wrap gap-1.5">
            {visibleSlots.map((slot) =>
              slot.url ? (
                <MediaTile
                  key={`${entry.id}-${slot.key}-${slot.url}`}
                  entry={entry}
                  url={slot.url}
                  favorite={favorite}
                  aspectRatio={mediaAspectRatio}
                  onToggleFavorite={onToggleFavorite}
                  onPreview={() => onPreview(slot.url!)}
                />
              ) : slot.status === AITaskStatus.FAILED ||
                slot.status === AITaskStatus.CANCELED ? (
                <div
                  key={`${entry.id}-${slot.key}-failed`}
                  className="flex h-40 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-rose-400/18 bg-rose-500/[0.055] px-3 text-center text-xs text-rose-200/75 sm:h-64"
                  style={{ aspectRatio: mediaAspectRatio }}
                >
                  <ImageOff className="size-5 text-rose-300/80" />
                  <span>{slot.error || t('timeline.slot_failed')}</span>
                </div>
              ) : (
                <div
                  key={`${entry.id}-${slot.key}-skeleton`}
                  aria-hidden
                  className="lusee-skeleton-shimmer h-40 shrink-0 rounded-xl bg-white/[0.06] sm:h-64"
                  style={{ aspectRatio: mediaAspectRatio }}
                />
              )
            )}
            {!pending && hiddenCount > 0 && (
              <div
                className="flex h-40 shrink-0 items-center justify-center rounded-xl bg-white/[0.035] text-lg font-semibold text-zinc-400 sm:h-64"
                style={{ aspectRatio: mediaAspectRatio }}
              >
                +{hiddenCount}
              </div>
            )}
          </div>
          {pending && (
            <p className="mt-2 inline-flex items-center gap-2 text-xs text-zinc-400">
              <span className="size-1.5 animate-pulse rounded-full bg-pink-400" />
              {entry.status === AITaskStatus.PENDING
                ? t('timeline.queued_waiting')
                : t('timeline.generating', {
                    completed: entry.resultUrls.length,
                    total: expectedCount,
                  })}
            </p>
          )}
        </>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          className="h-9 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white"
          onClick={onEditPrompt}
        >
          <Pencil className="size-4" />
          {t('timeline.edit_prompt')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          className="h-9 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
          onClick={onRegenerate}
        >
          <RefreshCw className="size-4" />
          {t('timeline.regenerate')}
        </Button>
      </div>
    </article>
  );
}

function MediaTile({
  entry,
  url,
  favorite,
  aspectRatio,
  onToggleFavorite,
  onPreview,
}: {
  entry: TimelineEntry;
  url: string;
  favorite: boolean;
  aspectRatio: string;
  onToggleFavorite: () => void;
  onPreview: () => void;
}) {
  const t = useTranslations('pages.generate');
  const [moreToolsOpen, setMoreToolsOpen] = useState(false);
  const activeChromeClass = 'opacity-100';
  const inactiveChromeClass =
    'opacity-0 group-focus-within/media:opacity-100 group-hover/media:opacity-100';
  const mediaClass = cn(
    'h-full w-full object-cover transition duration-300 group-hover/media:scale-[1.02]',
    moreToolsOpen && 'scale-[1.02]'
  );

  return (
    <div
      className="group/media relative h-40 shrink-0 overflow-hidden rounded-xl bg-white/[0.04] sm:h-64"
      style={{ aspectRatio }}
    >
      <button
        type="button"
        onClick={onPreview}
        className="relative flex h-full w-full cursor-pointer overflow-hidden rounded-xl text-left focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        aria-label={t('actions.fullscreen')}
      >
        {entry.mediaType === 'video' ? (
          <video
            src={url}
            muted
            playsInline
            className={cn('block', mediaClass)}
          />
        ) : (
          <LazyImage
            src={url}
            alt={entry.prompt}
            className={cn('block', mediaClass)}
            fallbackClassName="h-full w-full"
          />
        )}
      </button>
      <div
        className={cn(
          'pointer-events-none absolute inset-0 rounded-xl bg-linear-to-b from-black/45 via-black/0 to-black/55 transition-opacity duration-200',
          moreToolsOpen ? activeChromeClass : inactiveChromeClass
        )}
      />
      <div
        className={cn(
          'absolute top-2 right-2 flex gap-1 transition-opacity duration-200',
          moreToolsOpen ? activeChromeClass : inactiveChromeClass
        )}
      >
        <a
          href={url}
          download
          aria-label={t('actions.download')}
          title={t('actions.download')}
          className={iconActionClass()}
          onClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <Download className="size-4" />
        </a>
        <IconAction
          label={t('actions.share')}
          onClick={(event) => {
            event.stopPropagation();
            void copyShareLink(url, t);
          }}
        >
          <Share2 className="size-4" />
        </IconAction>
        <IconAction
          label={favorite ? t('actions.unfavorite') : t('actions.favorite')}
          active={favorite}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite();
          }}
        >
          <Heart className={cn('size-4', favorite && 'fill-current')} />
        </IconAction>
      </div>
      <div
        className={cn(
          'absolute right-2 bottom-2 left-2 flex items-center justify-center gap-1 rounded-lg bg-black/42 p-1 shadow-xl backdrop-blur-md transition-opacity duration-200',
          moreToolsOpen ? activeChromeClass : inactiveChromeClass
        )}
      >
        <IconAction
          label={t('actions.image_to_video')}
          onClick={(event) => {
            event.stopPropagation();
            notifyToolAction(t, t('actions.image_to_video'));
          }}
        >
          <Film className="size-4" />
        </IconAction>
        <IconAction
          label={t('actions.image_to_image')}
          onClick={(event) => {
            event.stopPropagation();
            notifyToolAction(t, t('actions.image_to_image'));
          }}
        >
          <ImagePlus className="size-4" />
        </IconAction>
        <IconAction
          label={t('actions.ai_restore')}
          onClick={(event) => {
            event.stopPropagation();
            notifyToolAction(t, t('actions.ai_restore'));
          }}
        >
          <Sparkles className="size-4" />
        </IconAction>
        <IconAction
          label={t('actions.enhance')}
          onClick={(event) => {
            event.stopPropagation();
            notifyToolAction(t, t('actions.enhance'));
          }}
        >
          <ImageUp className="size-4" />
        </IconAction>
        <MoreToolsMenu onOpenChange={setMoreToolsOpen} />
      </div>
    </div>
  );
}

function iconActionClass(active?: boolean) {
  return cn(
    'inline-flex size-9 shrink-0 items-center justify-center rounded-md text-white transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
    active
      ? 'bg-white text-black hover:bg-white'
      : 'bg-black/42 hover:bg-white/[0.18]'
  );
}

function IconAction({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={iconActionClass(active)}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {children}
    </button>
  );
}

const MORE_TOOLS: Array<{
  labelKey: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { labelKey: 'actions.remove_background', icon: Scissors },
  { labelKey: 'actions.erase_object', icon: Eraser },
  { labelKey: 'actions.outpaint', icon: Expand },
  { labelKey: 'actions.ai_background', icon: Paintbrush },
];

function MoreToolsMenu({
  onOpenChange,
}: {
  onOpenChange?: (open: boolean) => void;
}) {
  const t = useTranslations('pages.generate');
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const setMenuOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  const clearCloseTimer = () => {
    if (!closeTimerRef.current) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };
  const openMenu = () => {
    clearCloseTimer();
    setMenuOpen(true);
  };
  const closeMenuSoon = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => setMenuOpen(false), 90);
  };

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  return (
    <DropdownMenu open={open} onOpenChange={setMenuOpen}>
      <span
        className="inline-flex"
        onPointerEnter={openMenu}
        onPointerLeave={closeMenuSoon}
      >
        <DropdownMenuTrigger
          aria-label={t('actions.more')}
          title={t('actions.more')}
          className={iconActionClass()}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen(!open);
          }}
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
      </span>
      <DropdownMenuContent
        align="end"
        side="right"
        sideOffset={8}
        className="z-[70] w-36 border-white/10 bg-[#11130e]/96 p-1.5 text-zinc-200 shadow-2xl shadow-black/35 backdrop-blur-xl"
        onPointerEnter={openMenu}
        onPointerLeave={closeMenuSoon}
        onPointerDownOutside={() => setMenuOpen(false)}
        onFocusOutside={() => setMenuOpen(false)}
        onEscapeKeyDown={() => setMenuOpen(false)}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
      >
        {MORE_TOOLS.map((tool) => {
          const Icon = tool.icon;
          const label = t(tool.labelKey);
          return (
            <DropdownMenuItem
              key={tool.labelKey}
              className="h-10 rounded-md text-zinc-300 focus:bg-white/[0.08] focus:text-white"
              onSelect={() => notifyToolAction(t, label)}
            >
              <Icon className="size-4 text-zinc-400" />
              {label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PreviewDialog({
  preview,
  favorite,
  onOpenChange,
  onToggleFavorite,
  onEditPrompt,
  onRegenerate,
}: {
  preview: PreviewMedia | null;
  favorite: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleFavorite: () => void;
  onEditPrompt: () => void;
  onRegenerate: () => void;
}) {
  const t = useTranslations('pages.generate');
  const locale = useLocale();
  const entry = preview?.entry;
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const prompt = entry?.prompt.trim() || t('prompt.fallback');

  useEffect(() => {
    setCopiedPrompt(false);
  }, [preview?.url]);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(true);
      window.setTimeout(() => setCopiedPrompt(false), 1400);
    } catch {
      toast.error(t('toast.copy_failed'));
    }
  };

  return (
    <Dialog open={!!preview} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/48 backdrop-blur-[1px]"
        className="top-0 left-0 h-dvh max-h-dvh w-screen max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-0 bg-[#050604] p-0 text-white shadow-none sm:max-w-none"
        onWheel={(event) => event.stopPropagation()}
      >
        <DialogTitle className="sr-only">{t('preview.title')}</DialogTitle>
        <DialogDescription className="sr-only">
          {t('preview.description')}
        </DialogDescription>

        {preview && entry && (
          <div className="relative z-10 h-full min-h-0 w-full overflow-hidden [--preview-panel-width:410px]">
            <div
              className="absolute inset-x-0 top-0 bottom-[min(48dvh,26rem)] isolate flex min-h-0 cursor-pointer items-center justify-center overflow-hidden bg-[#050604] p-7 sm:p-10 md:p-12 lg:inset-y-0 lg:right-[var(--preview-panel-width)] lg:bottom-0 lg:p-14 xl:p-16"
              onClick={() => onOpenChange(false)}
            >
              {entry.mediaType === 'video' ? (
                <video
                  src={preview.url}
                  controls
                  autoPlay
                  muted
                  playsInline
                  className="max-h-full max-w-full rounded-lg object-contain"
                  onClick={(event) => event.stopPropagation()}
                />
              ) : (
                <>
                  <LazyImage
                    src={preview.url}
                    alt=""
                    className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-72 blur-xl brightness-110 saturate-125"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-black/24" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_40%,rgba(255,255,255,0.08)_0,rgba(0,0,0,0.02)_34%,rgba(0,0,0,0.34)_92%)]" />
                  <img
                    src={preview.url}
                    alt={entry.prompt}
                    className="relative z-10 h-auto max-h-full w-auto max-w-full cursor-zoom-out rounded-xl object-contain shadow-[0_30px_140px_rgba(0,0,0,0.52)]"
                    loading="eager"
                    decoding="async"
                  />
                </>
              )}
            </div>

            <aside
              onWheel={(event) => event.stopPropagation()}
              className="absolute inset-x-0 bottom-0 z-20 flex max-h-[48dvh] min-h-0 flex-col border-t border-white/[0.08] bg-[#101112]/92 p-4 pt-16 backdrop-blur-2xl lg:inset-y-0 lg:right-0 lg:left-auto lg:h-full lg:max-h-none lg:w-[var(--preview-panel-width)] lg:border-t-0 lg:border-l lg:p-5 lg:pt-16"
            >
              <button
                type="button"
                aria-label={t('preview.close')}
                title={t('preview.close')}
                className="absolute top-4 right-4 inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/72 transition-colors hover:bg-white/[0.09] hover:text-white focus-visible:ring-2 focus-visible:ring-[#d8f269]/70 focus-visible:outline-none"
                onClick={() => onOpenChange(false)}
              >
                <X className="size-5" />
              </button>

              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                  <span className="rounded-md bg-white/[0.055] px-2 py-1 text-zinc-200">
                    {sceneText(t, entry.scene, entry.mediaType)}
                  </span>
                  <span className="rounded-md bg-white/[0.04] px-2 py-1">
                    {entry.modelLabel}
                  </span>
                  <time>{formatEntryTime(entry.createdAt, locale)}</time>
                </div>

                <section className="mt-4 rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/[0.07]">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-xs font-bold tracking-normal text-white/46">
                      {t('preview.prompt')}
                    </h3>
                    <button
                      type="button"
                      onClick={() => void copyPrompt()}
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-white/[0.1] px-2.5 text-xs font-semibold text-white/82 transition-colors hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-[#d8f269]/70 focus-visible:outline-none"
                    >
                      <Copy className="size-3.5" />
                      {copiedPrompt ? t('preview.copied') : t('preview.copy')}
                    </button>
                  </div>
                  <p className="max-h-48 overflow-y-auto text-sm leading-6 whitespace-pre-wrap text-white/64">
                    {prompt}
                  </p>
                </section>

                <section className="mt-4 rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/[0.07]">
                  <h3 className="mb-2 text-xs font-bold tracking-normal text-white/46">
                    {t('preview.information')}
                  </h3>
                  <PreviewInfoRow
                    label={t('preview.type')}
                    value={
                      entry.mediaType === 'video'
                        ? t('preview.video')
                        : t('preview.image')
                    }
                  />
                  <PreviewInfoRow
                    label={t('preview.status')}
                    value={statusText(t, entry.status)}
                  />
                </section>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onRegenerate();
                    onOpenChange(false);
                  }}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#d8f269] text-sm font-bold text-[#111407] transition-colors hover:bg-[#e6ff4f] focus-visible:ring-2 focus-visible:ring-[#d8f269]/70 focus-visible:outline-none"
                >
                  <RefreshCw className="size-4" />
                  {t('preview.recreate')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onEditPrompt();
                    onOpenChange(false);
                  }}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-semibold text-white/86 transition-colors hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-[#d8f269]/70 focus-visible:outline-none"
                >
                  <Pencil className="size-4" />
                  {t('preview.edit')}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    notifyToolAction(t, t('actions.image_to_video'))
                  }
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-semibold text-white/86 transition-colors hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-[#d8f269]/70 focus-visible:outline-none"
                >
                  <Film className="size-4" />
                  {t('actions.image_to_video')}
                </button>
                <a
                  href={preview.url}
                  download
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-semibold text-white/86 transition-colors hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-[#d8f269]/70 focus-visible:outline-none"
                >
                  <Download className="size-4" />
                  {t('actions.download')}
                </a>
                <button
                  type="button"
                  onClick={() => void copyShareLink(preview.url, t)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-semibold text-white/86 transition-colors hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-[#d8f269]/70 focus-visible:outline-none"
                >
                  <Link2 className="size-4" />
                  {t('actions.share')}
                </button>
                <button
                  type="button"
                  onClick={onToggleFavorite}
                  className={cn(
                    'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#d8f269]/70 focus-visible:outline-none',
                    favorite
                      ? 'border-[#d8f269]/35 bg-[#d8f269] text-[#111407] hover:bg-[#e6ff4f]'
                      : 'border-white/[0.08] bg-white/[0.04] text-white/86 hover:bg-white/[0.08]'
                  )}
                >
                  <Heart className={cn('size-4', favorite && 'fill-current')} />
                  {favorite ? t('actions.unfavorite') : t('actions.favorite')}
                </button>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { label: t('actions.image_to_image'), icon: ImagePlus },
                  { label: t('actions.ai_restore'), icon: Sparkles },
                  { label: t('actions.enhance'), icon: ImageUp },
                ].map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.label}
                      type="button"
                      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-2 text-xs font-semibold text-white/78 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:ring-2 focus-visible:ring-[#d8f269]/70 focus-visible:outline-none"
                      onClick={() => notifyToolAction(t, tool.label)}
                    >
                      <Icon className="size-3.5" />
                      <span className="truncate">{tool.label}</span>
                    </button>
                  );
                })}
              </div>
            </aside>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PreviewInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] py-3 text-sm last:border-b-0">
      <span className="text-white/45">{label}</span>
      <span className="text-right font-semibold text-white/86">{value}</span>
    </div>
  );
}

function EmptyCreateState({ filter }: { filter: TimelineFilter }) {
  const t = useTranslations('pages.generate');
  const isFavorites = filter === 'favorites';
  return (
    <div className="mx-auto flex min-h-[56vh] max-w-4xl flex-col items-center justify-center text-center">
      <div className="grid w-full grid-cols-2 gap-2 opacity-80 sm:grid-cols-4">
        {INITIAL_SAMPLES.map((src) => (
          <LazyImage
            key={src}
            src={src}
            alt=""
            className="aspect-video rounded-sm object-cover"
          />
        ))}
      </div>
      <h1 className="mt-8 text-3xl font-semibold tracking-normal text-white">
        {isFavorites ? t('empty.favorites_title') : t('empty.default_title')}
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
        {isFavorites
          ? t('empty.favorites_description')
          : t('empty.default_description')}
      </p>
    </div>
  );
}
