export type ImageGeneratorScene = 'text-to-image' | 'image-to-image';

export type ModelBadgeTone = 'quality' | 'multi' | 'speed' | 'neutral';

export interface ImageModelCreditConfig {
  textToImage?: number;
  imageToImage?: number;
  ultra4K?: number;
}

export interface ImageModelConfig {
  id: string;
  sortOrder?: number;
  enabled: boolean;
  provider: string;
  model: string;
  sceneModels?: Partial<Record<ImageGeneratorScene, string>>;
  label: string;
  scenes: ImageGeneratorScene[];
  description?: string;
  icon?: string;
  iconSrc?: string;
  iconBg?: string;
  badge?: string;
  badges?: string[];
  badgeTone?: ModelBadgeTone;
  credits: ImageModelCreditConfig;
}

export const AI_IMAGE_MODEL_CATALOG_SETTING = 'ai_image_model_catalog';

export const AI_MODEL_PROVIDERS = ['kie', 'replicate', 'fal', 'gemini'];
export const MODEL_FAVICON_BASE_URL = 'https://a.favicon.im';

export const KIE_GPT_IMAGE_2_TEXT_MODEL = 'gpt-image-2-text-to-image';
export const KIE_GPT_IMAGE_2_IMAGE_MODEL = 'gpt-image-2-image-to-image';
export const KIE_GPT_IMAGE_15_TEXT_MODEL = 'gpt-image/1.5-text-to-image';
export const KIE_GPT_IMAGE_15_IMAGE_MODEL = 'gpt-image/1.5-image-to-image';

export function getModelFaviconSrc(domain: string) {
  return `${MODEL_FAVICON_BASE_URL}/${domain}?larger=true`;
}

export const GPT_IMAGE_MODEL_ICON_SRC = getModelFaviconSrc('openai.com');
export const NANO_BANANA_MODEL_ICON_SRC = getModelFaviconSrc('google.com');

type ImageModelFamily = {
  id: string;
  label: string;
  icon?: string;
  iconSrc?: string;
  models: ImageModelConfig[];
};

const IMAGE_MODEL_FAMILY_META: Array<{
  id: string;
  label: string;
  icon: string;
  domain: string;
  iconSrc?: string;
  match: (model: ImageModelConfig, source: string) => boolean;
}> = [
  {
    id: 'nano-banana',
    label: 'Nano Banana',
    icon: 'NB',
    domain: 'google.com',
    match: (_model, source) => source.includes('nano-banana'),
  },
  {
    id: 'gpt-image',
    label: 'GPT Image',
    icon: 'GP',
    domain: 'openai.com',
    match: (_model, source) => source.includes('gpt-image'),
  },
  {
    id: 'seedream',
    label: 'Seedream',
    icon: 'SD',
    domain: 'seed.bytedance.com',
    match: (_model, source) => source.includes('seedream'),
  },
  {
    id: 'imagen',
    label: 'Imagen',
    icon: 'G4',
    domain: 'deepmind.google',
    match: (_model, source) => source.includes('imagen'),
  },
  {
    id: 'gemini',
    label: 'Gemini',
    icon: 'G3',
    domain: 'gemini.google.com',
    match: (_model, source) => source.includes('gemini'),
  },
  {
    id: 'flux',
    label: 'Flux',
    icon: 'FX',
    domain: 'blackforestlabs.ai',
    match: (_model, source) => source.includes('flux'),
  },
  {
    id: 'z-image',
    label: 'Z-Image',
    icon: 'ZT',
    domain: 'z.ai',
    match: (_model, source) => source.includes('z-image'),
  },
  {
    id: 'grok',
    label: 'Grok Imagine',
    icon: 'GX',
    domain: 'x.ai',
    iconSrc: '/ai-model-icons/grok.png',
    match: (_model, source) => source.includes('grok'),
  },
  {
    id: 'ideogram',
    label: 'Ideogram',
    icon: 'ID',
    domain: 'ideogram.ai',
    match: (_model, source) => source.includes('ideogram'),
  },
  {
    id: 'qwen',
    label: 'Qwen',
    icon: 'QW',
    domain: 'qwen.ai',
    match: (_model, source) => source.includes('qwen'),
  },
  {
    id: 'wan',
    label: 'Wan',
    icon: 'WN',
    domain: 'tongyi.aliyun.com',
    match: (_model, source) => source.includes('wan/'),
  },
];

export const KIE_DOCUMENTED_MODELS = new Set<string>([
  KIE_GPT_IMAGE_2_TEXT_MODEL,
  KIE_GPT_IMAGE_2_IMAGE_MODEL,
  KIE_GPT_IMAGE_15_TEXT_MODEL,
  KIE_GPT_IMAGE_15_IMAGE_MODEL,
  'bytedance/seedream',
  'bytedance/seedream-v4-text-to-image',
  'bytedance/seedream-v4-edit',
  'seedream/4.5-text-to-image',
  'seedream/4.5-edit',
  'seedream/5-lite-text-to-image',
  'seedream/5-lite-image-to-image',
  'z-image',
  'nano-banana-2',
  'google/imagen4-fast',
  'google/imagen4-ultra',
  'google/imagen4',
  'google/nano-banana-edit',
  'google/nano-banana',
  'nano-banana-pro',
  'flux-2/pro-image-to-image',
  'flux-2/pro-text-to-image',
  'flux-2/flex-image-to-image',
  'flux-2/flex-text-to-image',
  'grok-imagine/text-to-image',
  'grok-imagine/image-to-image',
  'ideogram/character',
  'ideogram/character-edit',
  'ideogram/character-remix',
  'ideogram/v3-text-to-image',
  'ideogram/v3-edit',
  'ideogram/v3-remix',
  'qwen/text-to-image',
  'qwen/image-to-image',
  'qwen/image-edit',
  'qwen2/image-edit',
  'qwen2/text-to-image',
  'wan/2-7-image',
  'wan/2-7-image-pro',
]);

export const KIE_GPT_IMAGE_15_MODELS = new Set<string>([
  KIE_GPT_IMAGE_15_TEXT_MODEL,
  KIE_GPT_IMAGE_15_IMAGE_MODEL,
]);

export const DEFAULT_IMAGE_MODEL_CATALOG: ImageModelConfig[] = [
  {
    id: 'kie:gpt-image-2',
    enabled: true,
    provider: 'kie',
    model: KIE_GPT_IMAGE_2_TEXT_MODEL,
    sceneModels: {
      'text-to-image': KIE_GPT_IMAGE_2_TEXT_MODEL,
      'image-to-image': KIE_GPT_IMAGE_2_IMAGE_MODEL,
    },
    label: 'GPT Image 2',
    scenes: ['text-to-image', 'image-to-image'],
    description: 'Text and image workflows with aspect ratio and resolution',
    iconSrc: GPT_IMAGE_MODEL_ICON_SRC,
    credits: {
      textToImage: 2,
      imageToImage: 4,
      ultra4K: 8,
    },
    badges: ['Multi-modal', 'High quality'],
  },
  {
    id: 'kie:gpt-image-1-5',
    enabled: true,
    provider: 'kie',
    model: KIE_GPT_IMAGE_15_TEXT_MODEL,
    sceneModels: {
      'text-to-image': KIE_GPT_IMAGE_15_TEXT_MODEL,
      'image-to-image': KIE_GPT_IMAGE_15_IMAGE_MODEL,
    },
    label: 'GPT Image 1.5',
    scenes: ['text-to-image', 'image-to-image'],
    description: 'Text and image workflows with aspect ratio and quality',
    iconSrc: GPT_IMAGE_MODEL_ICON_SRC,
    credits: {
      textToImage: 2,
      imageToImage: 4,
      ultra4K: 4,
    },
    badges: ['Multi-modal', 'High quality'],
  },
  {
    id: 'replicate:bytedance-seedream-4',
    enabled: true,
    provider: 'replicate',
    model: 'bytedance/seedream-4',
    sceneModels: {
      'text-to-image': 'bytedance/seedream-4',
      'image-to-image': 'bytedance/seedream-4',
    },
    label: 'Seedream 4',
    scenes: ['text-to-image', 'image-to-image'],
    description: 'Enhanced reasoning, superior reference consistency',
    icon: 'SD',
    credits: {
      textToImage: 15,
      imageToImage: 15,
      ultra4K: 15,
    },
    badges: ['Multi-output'],
    badgeTone: 'multi',
  },
  {
    id: 'fal:seedream-v4-edit',
    enabled: true,
    provider: 'fal',
    model: 'fal-ai/bytedance/seedream/v4/edit',
    label: 'Seedream 4',
    scenes: ['image-to-image'],
    description: 'Enhanced reasoning, superior reference consistency',
    icon: 'SD',
    credits: {
      imageToImage: 15,
      ultra4K: 15,
    },
    badges: ['Multi-output'],
    badgeTone: 'multi',
  },
  {
    id: 'fal:z-image-turbo',
    enabled: true,
    provider: 'fal',
    model: 'fal-ai/z-image/turbo',
    label: 'Z-Image Turbo',
    scenes: ['text-to-image'],
    description: 'Lightning-fast image generation at lower cost',
    icon: 'ZT',
    credits: {
      textToImage: 5,
      ultra4K: 5,
    },
    badges: ['Speed'],
    badgeTone: 'speed',
  },
  {
    id: 'fal:flux-2-flex',
    enabled: true,
    provider: 'fal',
    model: 'fal-ai/flux-2-flex',
    label: 'Flux 2 Flex',
    scenes: ['text-to-image'],
    description: 'Unmatched character, text, and texture consistency',
    icon: 'FX',
    credits: {
      textToImage: 20,
      ultra4K: 20,
    },
    badges: ['High quality'],
    badgeTone: 'quality',
  },
  {
    id: 'gemini:gemini-3-pro-image-preview',
    enabled: true,
    provider: 'gemini',
    model: 'gemini-3-pro-image-preview',
    sceneModels: {
      'text-to-image': 'gemini-3-pro-image-preview',
      'image-to-image': 'gemini-3-pro-image-preview',
    },
    label: 'Gemini 3 Pro',
    scenes: ['text-to-image', 'image-to-image'],
    description: 'Google Gemini premium image generation',
    icon: 'G3',
    credits: {
      textToImage: 20,
      imageToImage: 20,
      ultra4K: 20,
    },
    badges: ['High quality'],
    badgeTone: 'quality',
  },
  {
    id: 'kie:nano-banana-pro',
    sortOrder: 1,
    enabled: true,
    provider: 'kie',
    model: 'nano-banana-pro',
    sceneModels: {
      'text-to-image': 'nano-banana-pro',
      'image-to-image': 'nano-banana-pro',
    },
    label: 'Nano Banana Pro',
    scenes: ['text-to-image', 'image-to-image'],
    description: 'Versatile style transfer & natural editing',
    icon: 'NB',
    iconSrc: NANO_BANANA_MODEL_ICON_SRC,
    credits: {
      textToImage: 20,
      imageToImage: 20,
      ultra4K: 20,
    },
    badges: ['High quality'],
    badgeTone: 'quality',
  },
  {
    id: 'kie:seedream-5-lite',
    enabled: true,
    provider: 'kie',
    model: 'seedream/5-lite-text-to-image',
    sceneModels: {
      'text-to-image': 'seedream/5-lite-text-to-image',
      'image-to-image': 'seedream/5-lite-image-to-image',
    },
    label: 'Seedream 5.0 Lite',
    scenes: ['text-to-image', 'image-to-image'],
    description: 'Fast photorealistic generation and reference editing',
    icon: 'SD',
    credits: {
      textToImage: 5,
      imageToImage: 6,
      ultra4K: 8,
    },
    badges: ['Fast'],
    badgeTone: 'speed',
  },
  {
    id: 'kie:seedream-4-5',
    enabled: true,
    provider: 'kie',
    model: 'seedream/4.5-text-to-image',
    sceneModels: {
      'text-to-image': 'seedream/4.5-text-to-image',
      'image-to-image': 'seedream/4.5-edit',
    },
    label: 'Seedream 4.5',
    scenes: ['text-to-image', 'image-to-image'],
    description: 'High-quality Seedream image generation and editing',
    icon: 'SD',
    credits: {
      textToImage: 8,
      imageToImage: 10,
      ultra4K: 12,
    },
    badges: ['Quality'],
    badgeTone: 'quality',
  },
  {
    id: 'kie:seedream-4',
    enabled: true,
    provider: 'kie',
    model: 'bytedance/seedream-v4-text-to-image',
    sceneModels: {
      'text-to-image': 'bytedance/seedream-v4-text-to-image',
      'image-to-image': 'bytedance/seedream-v4-edit',
    },
    label: 'Seedream 4',
    scenes: ['text-to-image', 'image-to-image'],
    description: 'Bytedance Seedream v4 text and edit workflows',
    icon: 'SD',
    credits: {
      textToImage: 10,
      imageToImage: 12,
      ultra4K: 14,
    },
    badges: ['Multi-output'],
    badgeTone: 'multi',
  },
  {
    id: 'kie:google-imagen-4',
    enabled: true,
    provider: 'kie',
    model: 'google/imagen4',
    sceneModels: {
      'text-to-image': 'google/imagen4',
    },
    label: 'Imagen 4',
    scenes: ['text-to-image'],
    description: 'Google Imagen 4 text-to-image generation',
    icon: 'G4',
    credits: {
      textToImage: 10,
      ultra4K: 12,
    },
    badges: ['Google'],
    badgeTone: 'quality',
  },
  {
    id: 'kie:google-imagen-4-fast',
    enabled: true,
    provider: 'kie',
    model: 'google/imagen4-fast',
    label: 'Imagen 4 Fast',
    scenes: ['text-to-image'],
    description: 'Fast Google Imagen generation',
    icon: 'G4',
    credits: {
      textToImage: 6,
      ultra4K: 8,
    },
    badges: ['Fast'],
    badgeTone: 'speed',
  },
  {
    id: 'kie:google-imagen-4-ultra',
    enabled: true,
    provider: 'kie',
    model: 'google/imagen4-ultra',
    label: 'Imagen 4 Ultra',
    scenes: ['text-to-image'],
    description: 'Ultra quality Google Imagen generation',
    icon: 'G4',
    credits: {
      textToImage: 16,
      ultra4K: 18,
    },
    badges: ['Ultra'],
    badgeTone: 'quality',
  },
  {
    id: 'kie:nano-banana-2',
    sortOrder: 2,
    enabled: true,
    provider: 'kie',
    model: 'nano-banana-2',
    sceneModels: {
      'text-to-image': 'nano-banana-2',
      'image-to-image': 'nano-banana-2',
    },
    label: 'Nano Banana 2',
    scenes: ['text-to-image', 'image-to-image'],
    description: 'Google Nano Banana 2 generation and editing',
    icon: 'NB',
    iconSrc: NANO_BANANA_MODEL_ICON_SRC,
    credits: {
      textToImage: 16,
      imageToImage: 16,
      ultra4K: 18,
    },
    badges: ['Google'],
    badgeTone: 'quality',
  },
  {
    id: 'kie:flux-2',
    enabled: true,
    provider: 'kie',
    model: 'flux-2/flex-text-to-image',
    sceneModels: {
      'text-to-image': 'flux-2/flex-text-to-image',
      'image-to-image': 'flux-2/flex-image-to-image',
    },
    label: 'Flux 2 Flex',
    scenes: ['text-to-image', 'image-to-image'],
    description: 'Flux 2 image generation with reference support',
    icon: 'F2',
    credits: {
      textToImage: 14,
      imageToImage: 16,
      ultra4K: 18,
    },
    badges: ['Quality'],
    badgeTone: 'quality',
  },
  {
    id: 'kie:flux-2-pro',
    enabled: true,
    provider: 'kie',
    model: 'flux-2/pro-text-to-image',
    sceneModels: {
      'text-to-image': 'flux-2/pro-text-to-image',
      'image-to-image': 'flux-2/pro-image-to-image',
    },
    label: 'Flux 2 Pro',
    scenes: ['text-to-image', 'image-to-image'],
    description: 'Flux 2 Pro image generation and editing',
    icon: 'F2',
    credits: {
      textToImage: 20,
      imageToImage: 22,
      ultra4K: 24,
    },
    badges: ['Pro'],
    badgeTone: 'quality',
  },
  {
    id: 'kie:grok-imagine',
    enabled: true,
    provider: 'kie',
    model: 'grok-imagine/text-to-image',
    sceneModels: {
      'text-to-image': 'grok-imagine/text-to-image',
      'image-to-image': 'grok-imagine/image-to-image',
    },
    label: 'Grok Imagine',
    scenes: ['text-to-image', 'image-to-image'],
    description: 'Grok Imagine text and image workflows',
    icon: 'GX',
    credits: {
      textToImage: 8,
      imageToImage: 10,
      ultra4K: 12,
    },
    badges: ['Creative'],
    badgeTone: 'multi',
  },
  {
    id: 'kie:ideogram-v3',
    enabled: true,
    provider: 'kie',
    model: 'ideogram/v3-text-to-image',
    sceneModels: {
      'text-to-image': 'ideogram/v3-text-to-image',
      'image-to-image': 'ideogram/v3-remix',
    },
    label: 'Ideogram V3',
    scenes: ['text-to-image', 'image-to-image'],
    description: 'Typography-friendly generation and remix',
    icon: 'ID',
    credits: {
      textToImage: 10,
      imageToImage: 12,
      ultra4K: 14,
    },
    badges: ['Text'],
    badgeTone: 'quality',
  },
  {
    id: 'kie:qwen2-image',
    enabled: true,
    provider: 'kie',
    model: 'qwen2/text-to-image',
    sceneModels: {
      'text-to-image': 'qwen2/text-to-image',
      'image-to-image': 'qwen2/image-edit',
    },
    label: 'Qwen2 Image',
    scenes: ['text-to-image', 'image-to-image'],
    description: 'Qwen2 text generation and image editing',
    icon: 'Q2',
    credits: {
      textToImage: 8,
      imageToImage: 10,
      ultra4K: 12,
    },
    badges: ['Fast'],
    badgeTone: 'speed',
  },
  {
    id: 'kie:wan-2-7-image',
    enabled: true,
    provider: 'kie',
    model: 'wan/2-7-image',
    sceneModels: {
      'text-to-image': 'wan/2-7-image',
      'image-to-image': 'wan/2-7-image-pro',
    },
    label: 'Wan 2.7 Image',
    scenes: ['text-to-image', 'image-to-image'],
    description: 'Wan 2.7 image generation with reference support',
    icon: 'WN',
    credits: {
      textToImage: 12,
      imageToImage: 16,
      ultra4K: 18,
    },
    badges: ['Latest'],
    badgeTone: 'quality',
  },
];

export const DEFAULT_IMAGE_MODEL_CATALOG_JSON = JSON.stringify(
  DEFAULT_IMAGE_MODEL_CATALOG,
  null,
  2
);

function toScene(value: unknown): ImageGeneratorScene | null {
  if (value === 'text-to-image' || value === 'image-to-image') {
    return value;
  }

  return null;
}

function toCredits(value: unknown): ImageModelCreditConfig {
  const source =
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : {};

  return {
    textToImage: toPositiveInteger(source.textToImage),
    imageToImage: toPositiveInteger(source.imageToImage),
    ultra4K: toPositiveInteger(source.ultra4K),
  };
}

function toSceneModels(
  value: unknown
): Partial<Record<ImageGeneratorScene, string>> {
  const source =
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : {};
  const sceneModels: Partial<Record<ImageGeneratorScene, string>> = {};

  for (const scene of ['text-to-image', 'image-to-image'] as const) {
    const sceneModel = String(source[scene] || '').trim();
    if (sceneModel) {
      sceneModels[scene] = sceneModel;
    }
  }

  return sceneModels;
}

function toBadges(value: unknown, fallback: unknown) {
  const rawBadges = Array.isArray(value)
    ? value
    : typeof fallback === 'string' && fallback.trim()
      ? [fallback]
      : [];

  return rawBadges
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 4);
}

function toPositiveInteger(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return Math.round(parsed);
}

function makeModelId(provider: string, model: string, index: number) {
  const safeModel = model
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${provider || 'provider'}:${safeModel || `model-${index + 1}`}`;
}

function normalizeImageModel(
  value: unknown,
  index: number
): ImageModelConfig | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const item = value as Record<string, unknown>;
  const provider = String(item.provider || '').trim();
  const model = String(item.model || '').trim();
  const label = String(item.label || '').trim();

  if (!provider || !model || !label) {
    return null;
  }

  const scenes = Array.isArray(item.scenes)
    ? item.scenes
        .map(toScene)
        .filter((scene): scene is ImageGeneratorScene => Boolean(scene))
    : [];

  if (scenes.length === 0) {
    return null;
  }

  const credits = toCredits(item.credits);
  const sceneModels = toSceneModels(item.sceneModels);
  for (const scene of scenes) {
    if (!sceneModels[scene]) {
      sceneModels[scene] = model;
    }
  }
  const badges = toBadges(item.badges, item.badge);

  return {
    id: String(item.id || makeModelId(provider, model, index)),
    sortOrder:
      typeof item.sortOrder === 'number' && Number.isFinite(item.sortOrder)
        ? item.sortOrder
        : index,
    enabled: item.enabled !== false,
    provider,
    model,
    sceneModels,
    label,
    scenes: [...new Set(scenes)] as ImageGeneratorScene[],
    description:
      typeof item.description === 'string' ? item.description : undefined,
    icon: typeof item.icon === 'string' ? item.icon : undefined,
    iconSrc: typeof item.iconSrc === 'string' ? item.iconSrc : undefined,
    iconBg: typeof item.iconBg === 'string' ? item.iconBg : undefined,
    badge: badges[0],
    badges,
    badgeTone: isBadgeTone(item.badgeTone) ? item.badgeTone : undefined,
    credits,
  };
}

function getMergeKey(model: ImageModelConfig) {
  return [
    model.provider,
    model.label,
    model.description || '',
    model.iconSrc || '',
    model.icon || '',
  ].join('::');
}

function mergeImageModelVariants(models: ImageModelConfig[]) {
  const merged = new Map<string, ImageModelConfig>();

  for (const model of models) {
    const mergeKey = getMergeKey(model);
    const existing = merged.get(mergeKey);
    if (!existing) {
      merged.set(mergeKey, model);
      continue;
    }

    const scenes = [...new Set([...existing.scenes, ...model.scenes])];
    const sceneModels = {
      ...existing.sceneModels,
      ...model.sceneModels,
    };
    for (const scene of model.scenes) {
      sceneModels[scene] = model.sceneModels?.[scene] || model.model;
    }

    merged.set(mergeKey, {
      ...existing,
      id: existing.id.replace(/-(text|image)-to-image$/, ''),
      sortOrder: Math.min(existing.sortOrder ?? 0, model.sortOrder ?? 0),
      enabled: existing.enabled || model.enabled,
      model:
        sceneModels['text-to-image'] ||
        sceneModels['image-to-image'] ||
        existing.model,
      sceneModels,
      scenes: scenes as ImageGeneratorScene[],
      credits: {
        textToImage: existing.credits.textToImage ?? model.credits.textToImage,
        imageToImage:
          existing.credits.imageToImage ?? model.credits.imageToImage,
        ultra4K: Math.max(
          existing.credits.ultra4K ?? 0,
          model.credits.ultra4K ?? 0
        ),
      },
      badges:
        existing.badges && existing.badges.length > 0
          ? existing.badges
          : model.badges,
      badge: existing.badge || model.badge,
      badgeTone: existing.badgeTone || model.badgeTone,
    });
  }

  return [...merged.values()];
}

function isBadgeTone(value: unknown): value is ModelBadgeTone {
  return (
    value === 'quality' ||
    value === 'multi' ||
    value === 'speed' ||
    value === 'neutral'
  );
}

export function parseImageModelCatalog(value?: string | null) {
  if (!value || !value.trim()) {
    return DEFAULT_IMAGE_MODEL_CATALOG;
  }

  try {
    const parsed = JSON.parse(value);
    const rawModels: unknown[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.models)
        ? parsed.models
        : [];
    const models = rawModels
      .map(normalizeImageModel)
      .filter((item): item is ImageModelConfig => Boolean(item))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    return models.length > 0
      ? mergeImageModelVariants(models)
      : DEFAULT_IMAGE_MODEL_CATALOG;
  } catch {
    return DEFAULT_IMAGE_MODEL_CATALOG;
  }
}

export function serializeImageModelCatalog(models: ImageModelConfig[]) {
  const normalized = mergeImageModelVariants(
    models
      .map(normalizeImageModel)
      .filter((item): item is ImageModelConfig => Boolean(item))
  ).map((model, index) => ({
    ...model,
    sortOrder: index,
  }));

  return JSON.stringify(normalized, null, 2);
}

export function getEnabledImageModels(models: ImageModelConfig[]) {
  return models
    .filter((model) => model.enabled)
    .sort((a, b) => {
      const aOrder =
        typeof a.sortOrder === 'number' && Number.isFinite(a.sortOrder)
          ? a.sortOrder
          : Number.MAX_SAFE_INTEGER;
      const bOrder =
        typeof b.sortOrder === 'number' && Number.isFinite(b.sortOrder)
          ? b.sortOrder
          : Number.MAX_SAFE_INTEGER;

      return aOrder - bOrder;
    });
}

export function getImageModelFamilyMeta(model: ImageModelConfig) {
  const source = [
    model.id,
    model.provider,
    model.model,
    model.label,
    model.description || '',
    ...Object.values(model.sceneModels ?? {}),
  ]
    .join(' ')
    .toLowerCase();

  const matched = IMAGE_MODEL_FAMILY_META.find((item) =>
    item.match(model, source)
  );
  if (matched) {
    return {
      id: matched.id,
      label: matched.label,
      icon: matched.icon,
      iconSrc: matched.iconSrc ?? getModelFaviconSrc(matched.domain),
    };
  }

  const provider = model.provider || 'model';
  return {
    id: provider.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    label: provider,
    icon: model.icon || provider.slice(0, 2).toUpperCase(),
    iconSrc: model.iconSrc,
  };
}

export function getImageModelIconSrc(model: ImageModelConfig) {
  return getImageModelFamilyMeta(model).iconSrc ?? model.iconSrc;
}

export function groupImageModelsByFamily(
  models: ImageModelConfig[]
): ImageModelFamily[] {
  const families = new Map<string, ImageModelFamily>();

  for (const model of getEnabledImageModels(models)) {
    const familyMeta = getImageModelFamilyMeta(model);
    const family = families.get(familyMeta.id);
    if (family) {
      family.models.push(model);
      continue;
    }

    families.set(familyMeta.id, {
      id: familyMeta.id,
      label: familyMeta.label,
      icon: familyMeta.icon,
      iconSrc: familyMeta.iconSrc,
      models: [model],
    });
  }

  return [...families.values()];
}

export function getDefaultImageModelForScene(
  scene: ImageGeneratorScene,
  models: ImageModelConfig[] = DEFAULT_IMAGE_MODEL_CATALOG
) {
  return getEnabledImageModels(models).find((model) =>
    model.scenes.includes(scene)
  );
}

export function findImageModelForRequest({
  models,
  provider,
  model,
  scene,
}: {
  models: ImageModelConfig[];
  provider: string;
  model: string;
  scene: string;
}) {
  return models.find(
    (item) =>
      item.enabled &&
      item.provider === provider &&
      getImageModelProviderModel(item, scene as ImageGeneratorScene) ===
        model &&
      item.scenes.includes(scene as ImageGeneratorScene)
  );
}

export function getImageModelProviderModel(
  model: ImageModelConfig,
  scene: ImageGeneratorScene
) {
  return model.sceneModels?.[scene] || model.model;
}

export function getImageModelCreditCost({
  model,
  scene,
  options,
}: {
  model: ImageModelConfig;
  scene: ImageGeneratorScene;
  options?: Record<string, unknown>;
}) {
  const is4K =
    String(
      options?.resolution || options?._credit_resolution || ''
    ).toUpperCase() === '4K';

  if (is4K && typeof model.credits.ultra4K === 'number') {
    return model.credits.ultra4K;
  }

  if (
    scene === 'image-to-image' &&
    typeof model.credits.imageToImage === 'number'
  ) {
    return model.credits.imageToImage;
  }

  if (
    scene === 'text-to-image' &&
    typeof model.credits.textToImage === 'number'
  ) {
    return model.credits.textToImage;
  }

  return scene === 'image-to-image' ? 4 : 2;
}
