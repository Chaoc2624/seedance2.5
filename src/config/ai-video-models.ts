import { getModelFaviconSrc } from '@/config/ai-models';
import type { ModelBadgeTone } from '@/config/ai-models';

export type VideoGeneratorScene =
  | 'text-to-video'
  | 'image-to-video'
  | 'video-to-video';

export interface VideoModelCreditConfig {
  textToVideo?: number;
  imageToVideo?: number;
  videoToVideo?: number;
}

export interface VideoModelDurationRange {
  min: number;
  max: number;
  step?: number;
}

export interface VideoModelDefaults {
  duration?: string;
  aspectRatio?: string;
  resolution?: string;
  mode?: string;
  sound?: boolean;
}

export interface VideoModelReferenceMedia {
  imageCount: number;
  videoCount: number;
  audioCount: number;
}

export interface VideoModelCapabilities {
  durationOptions?: string[];
  durationRange?: VideoModelDurationRange;
  aspectRatios?: string[];
  resolutions?: string[];
  modes?: string[];
  sound?: boolean;
  negativePrompt?: boolean;
  referenceMedia?: VideoModelReferenceMedia;
}

export interface VideoModelConfig {
  id: string;
  familyId: string;
  familyLabel: string;
  sortOrder?: number;
  enabled: boolean;
  provider: string;
  model: string;
  label: string;
  scenes: VideoGeneratorScene[];
  description?: string;
  icon?: string;
  iconSrc?: string;
  iconBg?: string;
  badges?: string[];
  badgeTone?: ModelBadgeTone;
  credits: VideoModelCreditConfig;
  defaults?: VideoModelDefaults;
  capabilities?: VideoModelCapabilities;
}

const COMMON_RATIOS = ['16:9', '9:16', '1:1'];
const COMMON_DURATIONS = [
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
];
const KLING_3_DURATION_ANCHORS = ['4', '5', '10', '15'];
const KLING_3_DURATION_RANGE = { min: 4, max: 15, step: 1 };
const WAN_DURATIONS = ['5', '10'];
const COMMON_RESOLUTIONS = ['720p', '1080p'];
const SEEDANCE_DURATIONS = ['4', ...COMMON_DURATIONS];
const SEEDANCE_RATIOS = [
  '1:1',
  '4:3',
  '3:4',
  '16:9',
  '9:16',
  '21:9',
  'adaptive',
];
const SEEDANCE_RESOLUTIONS = ['480p', '720p', '1080p', '4k'];
const KLING_MODES = ['std', 'pro', '4K'];

const VIDEO_MODEL_FAMILY_ICON_SRCS: Record<string, string> = {
  kling: '/ai-model-icons/kling.png',
  grok: '/ai-model-icons/grok.png',
  happyhorse: '/ai-model-icons/happyhorse.png',
};

const VIDEO_MODEL_FAMILY_ICON_DOMAINS: Record<string, string> = {
  kling: 'kling.ai',
  seedance: 'seed.bytedance.com',
  wan: 'tongyi.aliyun.com',
  hailuo: 'hailuoai.video',
  grok: 'x.ai',
  happyhorse: 'happy-horse.art',
};

export function getVideoFamilyIconSrc(familyId: string) {
  const iconSrc = VIDEO_MODEL_FAMILY_ICON_SRCS[familyId];
  if (iconSrc) {
    return iconSrc;
  }

  const domain = VIDEO_MODEL_FAMILY_ICON_DOMAINS[familyId];
  return domain ? getModelFaviconSrc(domain) : undefined;
}

export function getVideoModelIconSrc(model: VideoModelConfig) {
  return model.iconSrc ?? getVideoFamilyIconSrc(model.familyId);
}

function videoModel(
  config: Omit<VideoModelConfig, 'enabled' | 'provider'> &
    Partial<Pick<VideoModelConfig, 'enabled' | 'provider'>>
): VideoModelConfig {
  return {
    enabled: true,
    provider: 'kie',
    iconSrc: getVideoFamilyIconSrc(config.familyId),
    ...config,
  };
}

export const DEFAULT_VIDEO_MODEL_CATALOG: VideoModelConfig[] = [
  videoModel({
    id: 'kie:kling-3-0',
    familyId: 'kling',
    familyLabel: 'Kling',
    sortOrder: 10,
    model: 'kling-3.0/video',
    label: 'Kling 3.0',
    scenes: ['text-to-video', 'image-to-video'],
    description: 'Multi-shot cinematic video with optional sound',
    icon: 'KL',
    badges: ['Flagship', 'Audio'],
    badgeTone: 'quality',
    credits: { textToVideo: 22, imageToVideo: 22 },
    defaults: {
      duration: '10',
      aspectRatio: '16:9',
      mode: 'pro',
      sound: true,
    },
    capabilities: {
      durationOptions: KLING_3_DURATION_ANCHORS,
      durationRange: KLING_3_DURATION_RANGE,
      aspectRatios: COMMON_RATIOS,
      modes: KLING_MODES,
      sound: true,
    },
  }),
  videoModel({
    id: 'kie:kling-2-6-text',
    familyId: 'kling',
    familyLabel: 'Kling',
    sortOrder: 11,
    model: 'kling-2.6/text-to-video',
    label: 'Kling 2.6 Text',
    scenes: ['text-to-video'],
    description: 'Text-to-video with sound and flexible ratios',
    icon: 'KL',
    badges: ['Audio'],
    credits: { textToVideo: 18 },
    defaults: { duration: '5', aspectRatio: '16:9', sound: true },
    capabilities: {
      durationOptions: COMMON_DURATIONS,
      aspectRatios: COMMON_RATIOS,
      sound: true,
    },
  }),
  videoModel({
    id: 'kie:kling-2-6-image',
    familyId: 'kling',
    familyLabel: 'Kling',
    sortOrder: 12,
    model: 'kling-2.6/image-to-video',
    label: 'Kling 2.6 Image',
    scenes: ['image-to-video'],
    description: 'Animate first or first/last reference frames',
    icon: 'KL',
    badges: ['Audio'],
    credits: { imageToVideo: 20 },
    defaults: { duration: '5', sound: true },
    capabilities: {
      durationOptions: COMMON_DURATIONS,
      sound: true,
    },
  }),
  videoModel({
    id: 'kie:kling-2-5-turbo',
    familyId: 'kling',
    familyLabel: 'Kling',
    sortOrder: 13,
    model: 'kling/v2-5-turbo-text-to-video-pro',
    label: 'Kling 2.5 Turbo Text',
    scenes: ['text-to-video'],
    description: 'Fast pro text-to-video generation',
    icon: 'KL',
    badges: ['Turbo'],
    badgeTone: 'speed',
    credits: { textToVideo: 16 },
    defaults: { duration: '5', aspectRatio: '16:9' },
    capabilities: {
      durationOptions: COMMON_DURATIONS,
      aspectRatios: COMMON_RATIOS,
      negativePrompt: true,
    },
  }),
  videoModel({
    id: 'kie:kling-2-5-turbo-image',
    familyId: 'kling',
    familyLabel: 'Kling',
    sortOrder: 14,
    model: 'kling/v2-5-turbo-image-to-video-pro',
    label: 'Kling 2.5 Turbo Image',
    scenes: ['image-to-video'],
    description: 'Fast pro image-to-video generation',
    icon: 'KL',
    badges: ['Turbo'],
    badgeTone: 'speed',
    credits: { imageToVideo: 18 },
    defaults: { duration: '5' },
    capabilities: {
      durationOptions: COMMON_DURATIONS,
      negativePrompt: true,
    },
  }),
  videoModel({
    id: 'kie:seedance-2',
    familyId: 'seedance',
    familyLabel: 'Seedance',
    sortOrder: 0,
    model: 'bytedance/seedance-2',
    label: 'Seedance 2.5',
    scenes: ['text-to-video', 'image-to-video', 'video-to-video'],
    description: 'Text/image/video references with optional audio',
    icon: 'SD',
    badges: ['Audio', 'Reference'],
    badgeTone: 'quality',
    credits: { textToVideo: 18, imageToVideo: 20, videoToVideo: 20 },
    defaults: {
      duration: '5',
      aspectRatio: '16:9',
      resolution: '1080p',
      sound: true,
    },
    capabilities: {
      durationOptions: SEEDANCE_DURATIONS,
      aspectRatios: SEEDANCE_RATIOS,
      resolutions: SEEDANCE_RESOLUTIONS,
      sound: true,
      referenceMedia: {
        imageCount: 9,
        videoCount: 3,
        audioCount: 3,
      },
    },
  }),
  videoModel({
    id: 'kie:seedance-2-fast',
    familyId: 'seedance',
    familyLabel: 'Seedance',
    sortOrder: 1,
    model: 'bytedance/seedance-2-fast',
    label: 'Seedance 2.5 Fast',
    scenes: ['text-to-video', 'image-to-video'],
    description: 'Lower-latency Seedance generation',
    icon: 'SD',
    badges: ['Fast'],
    badgeTone: 'speed',
    credits: { textToVideo: 14, imageToVideo: 16 },
    defaults: { duration: '5', aspectRatio: '16:9', resolution: '720p' },
    capabilities: {
      durationOptions: COMMON_DURATIONS,
      aspectRatios: COMMON_RATIOS,
      resolutions: SEEDANCE_RESOLUTIONS,
    },
  }),
  videoModel({
    id: 'kie:seedance-1-5-pro',
    familyId: 'seedance',
    familyLabel: 'Seedance',
    sortOrder: 2,
    model: 'bytedance/seedance-1.5-pro',
    label: 'Seedance 1.5 Pro',
    scenes: ['text-to-video', 'image-to-video'],
    description: 'Pro Seedance workflow with lens control',
    icon: 'SD',
    badges: ['Pro'],
    credits: { textToVideo: 16, imageToVideo: 18 },
    defaults: { duration: '5', aspectRatio: '16:9', resolution: '1080p' },
    capabilities: {
      durationOptions: COMMON_DURATIONS,
      aspectRatios: COMMON_RATIOS,
      resolutions: SEEDANCE_RESOLUTIONS,
      sound: true,
    },
  }),
  videoModel({
    id: 'kie:wan-2-7-text',
    familyId: 'wan',
    familyLabel: 'Wan',
    sortOrder: 30,
    model: 'wan/2-7-text-to-video',
    label: 'Wan 2.7 Text',
    scenes: ['text-to-video'],
    description: 'Latest Wan text-to-video with ratio and resolution',
    icon: 'WN',
    badges: ['Latest'],
    badgeTone: 'quality',
    credits: { textToVideo: 18 },
    defaults: { duration: '5', aspectRatio: '16:9', resolution: '1080p' },
    capabilities: {
      durationOptions: WAN_DURATIONS,
      aspectRatios: COMMON_RATIOS,
      resolutions: COMMON_RESOLUTIONS,
      negativePrompt: true,
    },
  }),
  videoModel({
    id: 'kie:wan-2-7-image',
    familyId: 'wan',
    familyLabel: 'Wan',
    sortOrder: 31,
    model: 'wan/2-7-image-to-video',
    label: 'Wan 2.7 Image',
    scenes: ['image-to-video', 'video-to-video'],
    description: 'First-frame, first/last-frame, or clip continuation',
    icon: 'WN',
    badges: ['Latest'],
    badgeTone: 'quality',
    credits: { imageToVideo: 20, videoToVideo: 22 },
    defaults: { duration: '5', resolution: '1080p' },
    capabilities: {
      durationOptions: WAN_DURATIONS,
      resolutions: COMMON_RESOLUTIONS,
      negativePrompt: true,
    },
  }),
  videoModel({
    id: 'kie:wan-2-6-text',
    familyId: 'wan',
    familyLabel: 'Wan',
    sortOrder: 32,
    model: 'wan/2-6-text-to-video',
    label: 'Wan 2.6 Text',
    scenes: ['text-to-video'],
    description: 'Wan 2.6 text-to-video',
    icon: 'WN',
    credits: { textToVideo: 12 },
    defaults: { duration: '5', resolution: '720p' },
    capabilities: {
      durationOptions: COMMON_DURATIONS,
      resolutions: COMMON_RESOLUTIONS,
    },
  }),
  videoModel({
    id: 'kie:wan-2-6-image',
    familyId: 'wan',
    familyLabel: 'Wan',
    sortOrder: 33,
    model: 'wan/2-6-image-to-video',
    label: 'Wan 2.6 Image',
    scenes: ['image-to-video'],
    description: 'Wan 2.6 image-to-video',
    icon: 'WN',
    credits: { imageToVideo: 14 },
    defaults: { duration: '5', resolution: '720p' },
    capabilities: {
      durationOptions: COMMON_DURATIONS,
      resolutions: COMMON_RESOLUTIONS,
    },
  }),
  videoModel({
    id: 'kie:wan-2-6-video',
    familyId: 'wan',
    familyLabel: 'Wan',
    sortOrder: 34,
    model: 'wan/2-6-video-to-video',
    label: 'Wan 2.6 Video',
    scenes: ['video-to-video'],
    description: 'Wan 2.6 video-to-video',
    icon: 'WN',
    credits: { videoToVideo: 16 },
    defaults: { duration: '5', resolution: '720p' },
    capabilities: {
      durationOptions: COMMON_DURATIONS,
      resolutions: COMMON_RESOLUTIONS,
    },
  }),
  videoModel({
    id: 'kie:hailuo-2-3-pro-image',
    familyId: 'hailuo',
    familyLabel: 'Hailuo',
    sortOrder: 40,
    model: 'hailuo/2-3-image-to-video-pro',
    label: 'Hailuo 2.3 Pro',
    scenes: ['image-to-video'],
    description: 'High-quality Hailuo image animation',
    icon: 'HL',
    badges: ['Pro'],
    credits: { imageToVideo: 16 },
    defaults: { duration: '6', resolution: '1080p' },
    capabilities: {
      durationOptions: ['6', '10'],
      resolutions: COMMON_RESOLUTIONS,
    },
  }),
  videoModel({
    id: 'kie:hailuo-standard-text',
    familyId: 'hailuo',
    familyLabel: 'Hailuo',
    sortOrder: 41,
    model: 'hailuo/02-text-to-video-standard',
    label: 'Hailuo Standard Text',
    scenes: ['text-to-video'],
    description: 'Standard Hailuo text-to-video',
    icon: 'HL',
    credits: { textToVideo: 10 },
    defaults: { duration: '6' },
    capabilities: {
      durationOptions: ['6', '10'],
    },
  }),
  videoModel({
    id: 'kie:hailuo-pro-text',
    familyId: 'hailuo',
    familyLabel: 'Hailuo',
    sortOrder: 42,
    model: 'hailuo/02-text-to-video-pro',
    label: 'Hailuo Pro Text',
    scenes: ['text-to-video'],
    description: 'Pro Hailuo text-to-video',
    icon: 'HL',
    badges: ['Pro'],
    credits: { textToVideo: 14 },
    defaults: { duration: '6' },
    capabilities: {
      durationOptions: ['6', '10'],
    },
  }),
  videoModel({
    id: 'kie:grok-text',
    familyId: 'grok',
    familyLabel: 'Grok Imagine',
    sortOrder: 50,
    model: 'grok-imagine/text-to-video',
    label: 'Grok Text',
    scenes: ['text-to-video'],
    description: 'Grok Imagine text-to-video',
    icon: 'GX',
    credits: { textToVideo: 12 },
    defaults: { duration: '6', aspectRatio: '16:9', resolution: '720p' },
    capabilities: {
      durationOptions: ['6', '15'],
      aspectRatios: COMMON_RATIOS,
      resolutions: COMMON_RESOLUTIONS,
      modes: ['normal', 'fast'],
    },
  }),
  videoModel({
    id: 'kie:grok-image',
    familyId: 'grok',
    familyLabel: 'Grok Imagine',
    sortOrder: 51,
    model: 'grok-imagine/image-to-video',
    label: 'Grok Image',
    scenes: ['image-to-video'],
    description: 'Grok Imagine image-to-video',
    icon: 'GX',
    credits: { imageToVideo: 14 },
    defaults: { duration: '6', aspectRatio: '16:9', resolution: '720p' },
    capabilities: {
      durationOptions: ['6', '15'],
      aspectRatios: COMMON_RATIOS,
      resolutions: COMMON_RESOLUTIONS,
      modes: ['normal', 'fast'],
    },
  }),
  videoModel({
    id: 'kie:happyhorse-text',
    familyId: 'happyhorse',
    familyLabel: 'HappyHorse',
    sortOrder: 60,
    model: 'happyhorse/text-to-video',
    label: 'HappyHorse Text',
    scenes: ['text-to-video'],
    description: 'HappyHorse text-to-video',
    icon: 'HH',
    credits: { textToVideo: 12 },
    defaults: { duration: '5', aspectRatio: '16:9' },
    capabilities: {
      durationOptions: COMMON_DURATIONS,
      aspectRatios: COMMON_RATIOS,
    },
  }),
  videoModel({
    id: 'kie:happyhorse-image',
    familyId: 'happyhorse',
    familyLabel: 'HappyHorse',
    sortOrder: 61,
    model: 'happyhorse/image-to-video',
    label: 'HappyHorse Image',
    scenes: ['image-to-video'],
    description: 'HappyHorse image-to-video',
    icon: 'HH',
    credits: { imageToVideo: 14 },
    defaults: { duration: '5', aspectRatio: '16:9' },
    capabilities: {
      durationOptions: COMMON_DURATIONS,
      aspectRatios: COMMON_RATIOS,
    },
  }),
];

export function getEnabledVideoModels(models = DEFAULT_VIDEO_MODEL_CATALOG) {
  return models
    .filter((model) => model.enabled)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function getDefaultVideoModelForScene(
  scene: VideoGeneratorScene,
  models = DEFAULT_VIDEO_MODEL_CATALOG
) {
  return getEnabledVideoModels(models).find((model) =>
    model.scenes.includes(scene)
  );
}

export function findVideoModelForRequest({
  models,
  provider,
  model,
  scene,
}: {
  models: VideoModelConfig[];
  provider: string;
  model: string;
  scene: string;
}) {
  return models.find(
    (item) =>
      item.enabled &&
      item.provider === provider &&
      item.model === model &&
      item.scenes.includes(scene as VideoGeneratorScene)
  );
}

export function getVideoModelReferenceMedia(model?: VideoModelConfig | null) {
  return model?.capabilities?.referenceMedia;
}

function getReferenceOptionCount(
  options: Record<string, unknown>,
  key: string
) {
  const value = options[key];
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string' && item.trim()).length
    : 0;
}

function hasReferenceOption(options: Record<string, unknown>, key: string) {
  const value = options[key];
  return typeof value === 'string' && Boolean(value.trim());
}

export function assertVideoModelReferenceMedia({
  model,
  options,
}: {
  model: VideoModelConfig;
  options?: Record<string, unknown>;
}) {
  const limits = getVideoModelReferenceMedia(model);
  if (!limits || !options) return;

  const imageCount =
    getReferenceOptionCount(options, 'reference_images') +
    Number(hasReferenceOption(options, 'reference_first_frame')) +
    Number(hasReferenceOption(options, 'reference_last_frame'));
  const videoCount = getReferenceOptionCount(options, 'reference_videos');
  const audioCount = getReferenceOptionCount(options, 'reference_audio');

  if (imageCount > limits.imageCount) {
    throw new Error(
      `${model.label} supports up to ${limits.imageCount} image references`
    );
  }
  if (videoCount > limits.videoCount) {
    throw new Error(
      `${model.label} supports up to ${limits.videoCount} video references`
    );
  }
  if (audioCount > limits.audioCount) {
    throw new Error(
      `${model.label} supports up to ${limits.audioCount} audio references`
    );
  }
}

function parseDurationSeconds(value?: unknown) {
  const seconds = Number.parseFloat(String(value ?? ''));
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

function formatDurationSeconds(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : String(Number(value.toFixed(2)));
}

function clampDuration(value: number, range: VideoModelDurationRange) {
  return Math.min(Math.max(value, range.min), range.max);
}

function roundDurationToStep(value: number, range: VideoModelDurationRange) {
  const step = range.step && range.step > 0 ? range.step : 1;
  const stepped = range.min + Math.round((value - range.min) / step) * step;
  return clampDuration(stepped, range);
}

function getDurationOptionSeconds(model: VideoModelConfig) {
  return (model.capabilities?.durationOptions ?? [])
    .map(parseDurationSeconds)
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b);
}

function getNearestDurationOption(value: number, options: number[]) {
  return options.reduce((nearest, option) =>
    Math.abs(option - value) < Math.abs(nearest - value) ? option : nearest
  );
}

export function normalizeVideoModelDuration({
  model,
  duration,
}: {
  model: VideoModelConfig;
  duration?: unknown;
}) {
  const range = model.capabilities?.durationRange;
  const options = getDurationOptionSeconds(model);
  const fallback =
    parseDurationSeconds(model.defaults?.duration) ?? options[0] ?? range?.min;
  const seconds = parseDurationSeconds(duration) ?? fallback;

  if (!seconds) {
    return undefined;
  }

  if (range) {
    return formatDurationSeconds(roundDurationToStep(seconds, range));
  }

  if (options.length > 0) {
    return formatDurationSeconds(getNearestDurationOption(seconds, options));
  }

  return formatDurationSeconds(seconds);
}

function getVideoSceneCreditRate({
  model,
  scene,
}: {
  model: VideoModelConfig;
  scene: VideoGeneratorScene;
}) {
  if (
    scene === 'video-to-video' &&
    typeof model.credits.videoToVideo === 'number'
  ) {
    return model.credits.videoToVideo;
  }

  if (
    scene === 'image-to-video' &&
    typeof model.credits.imageToVideo === 'number'
  ) {
    return model.credits.imageToVideo;
  }

  if (
    scene === 'text-to-video' &&
    typeof model.credits.textToVideo === 'number'
  ) {
    return model.credits.textToVideo;
  }

  if (scene === 'video-to-video') {
    return 10;
  }

  return scene === 'image-to-video' ? 8 : 6;
}

export function getVideoModelCreditCost({
  model,
  scene,
  duration,
  options,
}: {
  model: VideoModelConfig;
  scene: VideoGeneratorScene;
  duration?: unknown;
  options?: Record<string, unknown>;
}) {
  const normalizedDuration = normalizeVideoModelDuration({
    model,
    duration: duration ?? options?.duration,
  });
  const seconds = parseDurationSeconds(normalizedDuration) ?? 1;

  return Math.ceil(getVideoSceneCreditRate({ model, scene }) * seconds);
}

export function groupVideoModelsByFamily(models: VideoModelConfig[]) {
  const families = new Map<
    string,
    {
      id: string;
      label: string;
      icon?: string;
      iconSrc?: string;
      models: VideoModelConfig[];
    }
  >();

  for (const model of getEnabledVideoModels(models)) {
    const family = families.get(model.familyId);
    if (family) {
      family.models.push(model);
      continue;
    }

    families.set(model.familyId, {
      id: model.familyId,
      label: model.familyLabel,
      icon: model.icon,
      iconSrc: getVideoModelIconSrc(model),
      models: [model],
    });
  }

  return [...families.values()];
}
