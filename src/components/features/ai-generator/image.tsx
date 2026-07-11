import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import Download from 'lucide-react/dist/esm/icons/download';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import ImageIcon from 'lucide-react/dist/esm/icons/image';
import Layers from 'lucide-react/dist/esm/icons/layers';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Monitor from 'lucide-react/dist/esm/icons/monitor';
import Palette from 'lucide-react/dist/esm/icons/palette';
import Ratio from 'lucide-react/dist/esm/icons/ratio';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import User from 'lucide-react/dist/esm/icons/user';
import Zap from 'lucide-react/dist/esm/icons/zap';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';

import { useTranslations } from '@/core/i18n/hooks';
import { Link } from '@/core/i18n/navigation';

import {
  DEFAULT_IMAGE_MODEL_CATALOG,
  getDefaultImageModelForScene,
  getImageModelCreditCost,
  getImageModelIconSrc,
  getImageModelProviderModel,
  KIE_GPT_IMAGE_15_MODELS,
  KIE_GPT_IMAGE_2_IMAGE_MODEL,
  KIE_GPT_IMAGE_2_TEXT_MODEL,
  parseImageModelCatalog,
} from '@/config/ai-models';
import type { ImageGeneratorScene, ImageModelConfig } from '@/config/ai-models';

import { AIMediaType, AITaskStatus } from '@/extensions/ai/types';

import { LazyImage } from '@/components/blocks/common/media/lazy-image';
import { UpgradePaywallDialog } from '@/components/blocks/pricing/upgrade-paywall-dialog';
import { useUpgradePaywall } from '@/components/blocks/pricing/use-upgrade-paywall';
import {
  ImageUploader,
  ImageUploaderValue,
} from '@/components/features/ai-generator/components/image-uploader';
import {
  ModelCombobox,
  ModelComboboxOption,
} from '@/components/features/ai-generator/components/model-combobox';
import { SegmentedToggle } from '@/components/features/ai-generator/components/segmented-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/hooks/use-app-context';
import { getSafeDownloadFilename } from '@/lib/download-filename';
import { cn } from '@/lib/utils';

type ImageGeneratorVariant = 'card' | 'split';

interface ImageGeneratorProps {
  allowMultipleImages?: boolean;
  maxImages?: number;
  maxSizeMB?: number;
  srOnlyTitle?: string;
  className?: string;
  variant?: ImageGeneratorVariant;
  defaultTab?: ImageGeneratorTab;
  initialModels?: ImageModelConfig[];
}

interface GeneratedImage {
  id: string;
  url: string;
  provider?: string;
  model?: string;
  prompt?: string;
}

interface BackendTask {
  id: string;
  status: string;
  provider: string;
  model: string;
  prompt: string | null;
  taskInfo: string | null;
  taskResult: string | null;
}

type ImageGeneratorTab = ImageGeneratorScene;
type Resolution = '1K' | '2K' | '4K';
type OutputFormat = 'PNG' | 'JPG';
type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
type ImageQuality = 'medium' | 'high';
type IncomingImagePromptPayload = {
  prompt: string;
  tab?: ImageGeneratorTab;
  modelKey?: string;
  settings?: {
    aspectRatio?: string;
    resolution?: string;
    quality?: string;
    outputFormat?: string;
    image_input?: unknown;
  };
};
type ValidationState = {
  prompt: boolean;
  referenceImages: boolean;
};

const POLL_INTERVAL = 5000;
const GENERATION_TIMEOUT = 180000;
const MAX_PROMPT_LENGTH = 8000;
const PROMPT_EVENT_NAME = 'gpt-image2:prompt-selected';
const PROMPT_STORAGE_KEY = 'gpt-image2:selected-prompt';
const DEV_MOCK_STORAGE_KEY = 'gpt-image2:dev-image-mock-enabled';

const RESOLUTION_OPTIONS: { value: Resolution; label: string }[] = [
  { value: '1K', label: '1K' },
  { value: '2K', label: '2K' },
  { value: '4K', label: '4K' },
];

const OUTPUT_FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: 'PNG', label: 'PNG' },
  { value: 'JPG', label: 'JPG' },
];

const QUALITY_OPTIONS: { value: ImageQuality; label: string }[] = [
  { value: 'medium', label: 'Standard' },
  { value: 'high', label: 'High' },
];

const ASPECT_RATIO_OPTIONS: { value: AspectRatio; label: string }[] = [
  { value: '1:1', label: '1:1' },
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
  { value: '4:3', label: '4:3' },
  { value: '3:4', label: '3:4' },
];

const ASPECT_RATIO_BOX_STYLES: Record<
  AspectRatio,
  { width: string; height: string }
> = {
  '1:1': { width: '14px', height: '14px' },
  '16:9': { width: '22px', height: '12px' },
  '9:16': { width: '12px', height: '22px' },
  '4:3': { width: '18px', height: '14px' },
  '3:4': { width: '14px', height: '18px' },
};

const generatorOptionBaseClass =
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none';

function isImageGeneratorTab(value: unknown): value is ImageGeneratorTab {
  return value === 'text-to-image' || value === 'image-to-image';
}

function isResolution(value: unknown): value is Resolution {
  return value === '1K' || value === '2K' || value === '4K';
}

function isOutputFormat(value: unknown): value is OutputFormat {
  return value === 'PNG' || value === 'JPG';
}

function isAspectRatio(value: unknown): value is AspectRatio {
  return (
    value === '1:1' ||
    value === '16:9' ||
    value === '9:16' ||
    value === '4:3' ||
    value === '3:4'
  );
}

function isImageQuality(value: unknown): value is ImageQuality {
  return value === 'medium' || value === 'high';
}

function parseIncomingImagePromptPayload(
  value: string
): IncomingImagePromptPayload | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (parsed && typeof parsed === 'object') {
      const source = parsed as IncomingImagePromptPayload;
      if (typeof source.prompt === 'string' && source.prompt.trim()) {
        return source;
      }
    }
  } catch {
    // Older callers stored the prompt as plain text.
  }

  return { prompt: trimmed };
}

function getIncomingReferenceImageUrls(settings?: { image_input?: unknown }) {
  const imageInput = settings?.image_input;
  if (!Array.isArray(imageInput)) {
    return [];
  }

  return imageInput.filter(
    (url): url is string => typeof url === 'string' && url.trim().length > 0
  );
}

function getDefaultModelKeyForTab(
  tab: ImageGeneratorTab,
  models: ImageModelConfig[] = DEFAULT_IMAGE_MODEL_CATALOG
) {
  return getDefaultImageModelForScene(tab, models)?.id ?? models[0]?.id ?? '';
}

function GeneratorFieldHeading({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <Label className="flex items-center gap-2.5 text-sm font-semibold tracking-[-0.02em] text-foreground/80">
      <span className="text-muted-foreground">{icon}</span>
      <span>{label}</span>
    </Label>
  );
}

function ResolutionSelector({
  label,
  value,
  onChange,
  canUse4K = true,
  onProRequired,
}: {
  label: string;
  value: Resolution;
  onChange: (value: Resolution) => void;
  canUse4K?: boolean;
  onProRequired?: () => void;
}) {
  return (
    <div className="space-y-2">
      <GeneratorFieldHeading
        label={label}
        icon={<Monitor className="h-4 w-4" />}
      />
      <div
        role="radiogroup"
        aria-label={label}
        className="grid grid-cols-3 gap-2"
      >
        {RESOLUTION_OPTIONS.map((option) => {
          const active = option.value === value;
          const requiresPro = option.value === '4K';
          const disabled = requiresPro && !canUse4K;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-disabled={disabled}
              onClick={() => {
                if (disabled) {
                  onProRequired?.();
                  return;
                }

                onChange(option.value);
              }}
              className={cn(
                'group relative flex h-12 min-w-0 items-center justify-center overflow-visible rounded-md border px-3 text-[0.98rem] font-semibold transition-[border-color,background-color,color,box-shadow] duration-200',
                generatorOptionBaseClass,
                active
                  ? 'border-primary/70 bg-primary text-primary-foreground shadow-[0_16px_30px_-24px_rgba(112,231,255,0.95)]'
                  : 'border-border/75 bg-background/55 text-foreground/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] hover:border-primary/40 hover:bg-accent/45 hover:text-foreground/90',
                disabled &&
                  'cursor-not-allowed opacity-55 hover:text-foreground/55'
              )}
            >
              <span>{option.label}</span>
              {requiresPro && !active && (
                <span className="pointer-events-none absolute -top-1.5 -right-1 z-10 inline-flex rounded-full border border-[#d4a63f] bg-[linear-gradient(180deg,#f8de8f_0%,#e2b84c_55%,#c99524_100%)] px-1.5 py-0.5 text-[7px] font-black tracking-[0.16em] text-[#5f4300] uppercase shadow-[0_8px_16px_-12px_rgba(173,118,0,0.9)] ring-1 ring-white/80">
                  Pro
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AspectRatioSelector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: AspectRatio;
  onChange: (value: AspectRatio) => void;
}) {
  return (
    <div className="space-y-2">
      <GeneratorFieldHeading
        label={label}
        icon={<Ratio className="h-4 w-4" />}
      />
      <div
        role="radiogroup"
        aria-label={label}
        className="grid auto-rows-[54px] grid-cols-3 gap-2 sm:grid-cols-5"
      >
        {ASPECT_RATIO_OPTIONS.map((option) => {
          const active = option.value === value;
          const previewStyle = ASPECT_RATIO_BOX_STYLES[option.value];

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={cn(
                'group relative flex h-[54px] flex-col items-center justify-center gap-1 overflow-hidden rounded-md border px-1.5 py-1.5 text-center transition-[border-color,background-color,color,box-shadow] duration-200',
                generatorOptionBaseClass,
                active
                  ? 'border-primary/60 bg-primary/10 shadow-[0_12px_24px_-22px_rgba(112,231,255,0.9)]'
                  : 'border-border/70 bg-background/55 text-foreground/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] hover:border-primary/35 hover:bg-accent/40 hover:text-foreground'
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'flex h-6 w-8 items-center justify-center rounded-[8px] transition-all duration-200 sm:h-7 sm:w-9',
                  active ? 'bg-transparent shadow-none' : 'bg-transparent'
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'rounded-[6px] transition-all duration-200',
                    active
                      ? 'bg-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
                      : 'bg-foreground/25'
                  )}
                  style={previewStyle}
                />
              </span>
              <span
                className={cn(
                  'text-[10px] font-semibold tracking-[-0.02em]',
                  active ? 'text-foreground' : 'text-foreground/55'
                )}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function parseTaskResult(taskResult: string | null): unknown {
  if (!taskResult) {
    return null;
  }

  try {
    return JSON.parse(taskResult);
  } catch (error) {
    console.warn('Failed to parse taskResult:', error);
    return null;
  }
}

function extractImageUrls(result: unknown): string[] {
  if (!result || typeof result !== 'object') {
    return [];
  }

  const resObj = result as Record<string, unknown>;
  const output = resObj.output ?? resObj.images ?? resObj.data;

  if (!output) {
    return [];
  }

  if (typeof output === 'string') {
    return [output];
  }

  if (Array.isArray(output)) {
    return output
      .flatMap((item) => {
        if (!item) return [];
        if (typeof item === 'string') return [item];
        if (typeof item === 'object' && item !== null) {
          const itemObj = item as Record<string, unknown>;
          const candidate =
            itemObj.url ??
            itemObj.uri ??
            itemObj.image ??
            itemObj.src ??
            itemObj.imageUrl;
          return typeof candidate === 'string' ? [candidate] : [];
        }
        return [];
      })
      .filter(Boolean);
  }

  if (typeof output === 'object' && output !== null) {
    const outputObj = output as Record<string, unknown>;
    const candidate =
      outputObj.url ??
      outputObj.uri ??
      outputObj.image ??
      outputObj.src ??
      outputObj.imageUrl;
    if (typeof candidate === 'string') {
      return [candidate];
    }
  }

  return [];
}

export function ImageGenerator({
  allowMultipleImages = true,
  maxImages = 9,
  maxSizeMB = 5,
  srOnlyTitle,
  className,
  variant = 'card',
  defaultTab,
  initialModels,
}: ImageGeneratorProps) {
  const t = useTranslations('ai.image.generator');

  const isSplit = variant === 'split';
  const initialTab: ImageGeneratorTab = defaultTab ?? 'text-to-image';
  const initialImageModels =
    initialModels && initialModels.length > 0
      ? initialModels
      : DEFAULT_IMAGE_MODEL_CATALOG;
  const initialModelKey = getDefaultModelKeyForTab(
    initialTab,
    initialImageModels
  );

  const [activeTab, setActiveTab] = useState<ImageGeneratorTab>(initialTab);
  const [imageModels, setImageModels] =
    useState<ImageModelConfig[]>(initialImageModels);
  const [modelKey, setModelKey] = useState(initialModelKey);
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState<Resolution>('2K');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('PNG');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [quality, setQuality] = useState<ImageQuality>('medium');
  const [referenceImageItems, setReferenceImageItems] = useState<
    ImageUploaderValue[]
  >([]);
  const [referenceImageUrls, setReferenceImageUrls] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(
    null
  );
  const [taskStatus, setTaskStatus] = useState<AITaskStatus | null>(null);
  const [downloadingImageId, setDownloadingImageId] = useState<string | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState>({
    prompt: false,
    referenceImages: false,
  });
  const [canUseDevMock, setCanUseDevMock] = useState(false);
  const [devMockFixtureCount, setDevMockFixtureCount] = useState(0);
  const [useDevMock, setUseDevMock] = useState(false);
  const [canUseProFeatures, setCanUseProFeatures] = useState(false);
  const { closeUpgradePaywall, requestUpgrade, upgradeReason } =
    useUpgradePaywall();
  const completionHandledTaskIdRef = useRef<string | null>(null);
  const promptFieldRef = useRef<HTMLTextAreaElement | null>(null);
  const referenceUploaderRef = useRef<HTMLDivElement | null>(null);
  const hasUserSelectedModelRef = useRef(false);
  const activeTabRef = useRef<ImageGeneratorTab>(initialTab);

  const { user, isCheckSign, setIsShowSignModal, fetchUserCredits } =
    useAppContext();
  const userId = user?.id ?? null;

  const refreshDevMockState = useCallback(async () => {
    if (typeof window === 'undefined' || !userId) {
      return;
    }

    try {
      const { getImageDevMockStateFn } = await import('@/server/ai.functions');
      const state = await getImageDevMockStateFn();

      const nextCanUseMock = !!state?.canUseMock;
      setCanUseDevMock(nextCanUseMock);
      setDevMockFixtureCount(state?.fixtureCount ?? 0);

      if (!nextCanUseMock) {
        setUseDevMock(false);
        window.localStorage.removeItem(DEV_MOCK_STORAGE_KEY);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to refresh image dev mock state:', error);
      }
    }
  }, [userId]);

  const refreshAIEntitlements = useCallback(async () => {
    if (!userId) {
      setCanUseProFeatures(false);
      return;
    }

    try {
      const { getAIEntitlementsFn } = await import('@/server/ai.functions');
      const entitlements = await getAIEntitlementsFn();
      setCanUseProFeatures(!!entitlements?.canUseProFeatures);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to refresh AI entitlements:', error);
      }
      setCanUseProFeatures(false);
    }
  }, [userId]);

  const applyIncomingPrompt = useCallback(
    (payload: IncomingImagePromptPayload) => {
      const normalizedPrompt = payload.prompt.trim();
      if (!normalizedPrompt) {
        return;
      }

      const nextTab = isImageGeneratorTab(payload.tab)
        ? payload.tab
        : 'text-to-image';
      const settings = payload.settings ?? {};
      const incomingReferenceUrls = getIncomingReferenceImageUrls(settings);

      setPrompt(normalizedPrompt);
      setActiveTab(nextTab);
      activeTabRef.current = nextTab;
      setReferenceImageUrls(incomingReferenceUrls);
      setReferenceImageItems(
        incomingReferenceUrls.map((url, index) => ({
          id: `incoming-reference-${index}-${url}`,
          preview: url,
          url,
          status: 'uploaded',
        }))
      );

      if (payload.modelKey) {
        hasUserSelectedModelRef.current = true;
        setModelKey(payload.modelKey);
      } else {
        hasUserSelectedModelRef.current = false;
        setModelKey(getDefaultModelKeyForTab(nextTab, imageModels));
      }

      if (isAspectRatio(settings.aspectRatio)) {
        setAspectRatio(settings.aspectRatio);
      }
      if (isResolution(settings.resolution)) {
        setResolution(settings.resolution);
      }
      if (isImageQuality(settings.quality)) {
        setQuality(settings.quality);
      }
      if (isOutputFormat(settings.outputFormat)) {
        setOutputFormat(settings.outputFormat);
      }
    },
    [imageModels]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    import('@/server/ai.functions')
      .then(({ getImageModelCatalogFn }) => getImageModelCatalogFn())
      .then((catalog) => {
        const nextModels =
          catalog.models.length > 0
            ? parseImageModelCatalog(JSON.stringify(catalog.models))
            : [];
        setImageModels(nextModels);

        if (!hasUserSelectedModelRef.current) {
          setModelKey(
            getDefaultModelKeyForTab(activeTabRef.current, nextModels)
          );
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserCredits();
      void refreshAIEntitlements();
    } else {
      setCanUseProFeatures(false);
    }
  }, [fetchUserCredits, refreshAIEntitlements, userId]);

  useEffect(() => {
    if (!canUseProFeatures && resolution === '4K') {
      setResolution('2K');
    }
  }, [canUseProFeatures, resolution]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!userId) {
      setCanUseDevMock(false);
      setDevMockFixtureCount(0);
      setUseDevMock(false);
      window.localStorage.removeItem(DEV_MOCK_STORAGE_KEY);
      return;
    }

    let cancelled = false;
    refreshDevMockState().then(() => {
      if (cancelled) {
        return;
      }

      setUseDevMock(window.localStorage.getItem(DEV_MOCK_STORAGE_KEY) === '1');
    });

    return () => {
      cancelled = true;
    };
  }, [refreshDevMockState, userId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedPrompt = window.sessionStorage.getItem(PROMPT_STORAGE_KEY);
    const storedPayload = storedPrompt
      ? parseIncomingImagePromptPayload(storedPrompt)
      : null;
    if (storedPayload) {
      applyIncomingPrompt(storedPayload);
      window.sessionStorage.removeItem(PROMPT_STORAGE_KEY);
    }

    const handlePromptSelected = (event: Event) => {
      const detail = (event as CustomEvent<IncomingImagePromptPayload>).detail;
      const payload =
        detail && typeof detail.prompt === 'string'
          ? detail
          : detail?.prompt
            ? { prompt: detail.prompt }
            : null;
      if (payload) {
        applyIncomingPrompt(payload);
      }
    };

    window.addEventListener(PROMPT_EVENT_NAME, handlePromptSelected);
    return () => {
      window.removeEventListener(PROMPT_EVENT_NAME, handlePromptSelected);
    };
  }, [applyIncomingPrompt]);

  const availableModels = useMemo(() => {
    return imageModels.filter(
      (option) => option.enabled && option.scenes.includes(activeTab)
    );
  }, [activeTab, imageModels]);

  const modelComboboxOptions = useMemo<ModelComboboxOption[]>(
    () =>
      availableModels.map((option) => ({
        value: option.id,
        label: option.label,
        description: option.description,
        icon: option.icon,
        iconSrc: getImageModelIconSrc(option),
        iconBg: option.iconBg,
        credits: getImageModelCreditCost({
          model: option,
          scene: activeTab,
          options: { resolution },
        }),
        badge: option.badge,
        badges: option.badges,
        badgeTone: option.badgeTone,
      })),
    [activeTab, availableModels, resolution]
  );

  const hasSelectedModelAvailable = useMemo(
    () => availableModels.some((option) => option.id === modelKey),
    [availableModels, modelKey]
  );

  useEffect(() => {
    if (hasSelectedModelAvailable) {
      return;
    }

    const fallbackModelKey = getDefaultModelKeyForTab(
      activeTab,
      availableModels
    );

    if (modelKey !== fallbackModelKey) {
      setModelKey(fallbackModelKey);
    }
  }, [activeTab, availableModels, hasSelectedModelAvailable, modelKey]);

  const trimmedPrompt = prompt.trim();
  const promptLength = trimmedPrompt.length;
  const remainingCredits = user?.credits?.remainingCredits ?? 0;
  const isPromptTooLong = promptLength > MAX_PROMPT_LENGTH;
  const isTextToImageMode = activeTab === 'text-to-image';
  const selectedModelOption =
    availableModels.find((option) => option.id === modelKey) ?? null;
  const selectedProviderModel = selectedModelOption
    ? getImageModelProviderModel(selectedModelOption, activeTab)
    : '';
  const costCredits = selectedModelOption
    ? getImageModelCreditCost({
        model: selectedModelOption,
        scene: activeTab,
        options: { resolution },
      })
    : 0;
  const selectedModelComboboxOption = useMemo<ModelComboboxOption | null>(
    () =>
      selectedModelOption
        ? {
            value: selectedModelOption.id,
            label: selectedModelOption.label,
            description: selectedModelOption.description,
            icon: selectedModelOption.icon,
            iconSrc: getImageModelIconSrc(selectedModelOption),
            iconBg: selectedModelOption.iconBg,
            credits: costCredits,
            badge: selectedModelOption.badge,
            badges: selectedModelOption.badges,
            badgeTone: selectedModelOption.badgeTone,
          }
        : null,
    [costCredits, selectedModelOption]
  );
  const isSelectedKieGptImage2Model =
    selectedProviderModel === KIE_GPT_IMAGE_2_TEXT_MODEL ||
    selectedProviderModel === KIE_GPT_IMAGE_2_IMAGE_MODEL;
  const isSelectedKieGptImage15Model = KIE_GPT_IMAGE_15_MODELS.has(
    selectedProviderModel
  );

  const handleTabChange = (value: string) => {
    const tab = value as ImageGeneratorTab;
    setActiveTab(tab);
    activeTabRef.current = tab;
  };

  const taskStatusLabel = useMemo(() => {
    if (!taskStatus) {
      return '';
    }

    switch (taskStatus) {
      case AITaskStatus.PENDING:
        return 'Waiting for the model to start';
      case AITaskStatus.PROCESSING:
        return 'Generating your image...';
      case AITaskStatus.SUCCESS:
        return 'Image generation completed';
      case AITaskStatus.FAILED:
        return 'Generation failed';
      default:
        return '';
    }
  }, [taskStatus]);

  const handleReferenceImagesChange = useCallback(
    (items: ImageUploaderValue[]) => {
      setReferenceImageItems(items);
      const uploadedUrls = items
        .filter((item) => item.status === 'uploaded' && item.url)
        .map((item) => item.url as string);
      setReferenceImageUrls(uploadedUrls);
    },
    []
  );

  const handleProRequired = useCallback(() => {
    if (!user) {
      setIsShowSignModal(true);
      return;
    }

    void requestUpgrade('4k');
  }, [requestUpgrade, setIsShowSignModal, user]);

  const isReferenceUploading = useMemo(
    () => referenceImageItems.some((item) => item.status === 'uploading'),
    [referenceImageItems]
  );

  const hasReferenceUploadError = useMemo(
    () => referenceImageItems.some((item) => item.status === 'error'),
    [referenceImageItems]
  );
  const hasReferenceSelection = referenceImageItems.length > 0;

  const showPromptRequired = validationState.prompt && !trimmedPrompt;
  const showReferenceImagesRequired =
    validationState.referenceImages &&
    !isTextToImageMode &&
    !hasReferenceSelection;

  const resetTaskState = useCallback(() => {
    setIsGenerating(false);
    setProgress(0);
    setTaskId(null);
    setGenerationStartTime(null);
    setTaskStatus(null);
  }, []);

  const isFormLocked = isGenerating;

  const playValidationCue = useCallback((element: HTMLElement | null) => {
    if (!element) {
      return;
    }

    element.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-8px)' },
        { transform: 'translateX(7px)' },
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(0)' },
      ],
      {
        duration: 360,
        easing: 'ease-in-out',
      }
    );

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }, []);

  useEffect(() => {
    if (!validationState.prompt || !trimmedPrompt) {
      return;
    }

    setValidationState((prev) =>
      prev.prompt ? { ...prev, prompt: false } : prev
    );
  }, [trimmedPrompt, validationState.prompt]);

  useEffect(() => {
    if (
      !validationState.referenceImages ||
      (!hasReferenceSelection && !isTextToImageMode)
    ) {
      return;
    }

    setValidationState((prev) =>
      prev.referenceImages ? { ...prev, referenceImages: false } : prev
    );
  }, [
    hasReferenceSelection,
    isTextToImageMode,
    validationState.referenceImages,
  ]);

  useEffect(() => {
    if (!isGenerating) {
      return;
    }

    const interval = window.setInterval(() => {
      setProgress((prev) => {
        let target = 24;

        if (taskStatus === AITaskStatus.PENDING) {
          target = 32;
        } else if (taskStatus === AITaskStatus.PROCESSING) {
          target = generatedImages.length > 0 ? 90 : 78;
        }

        if (prev >= target) {
          return prev;
        }

        const step = Math.max(0.6, (target - prev) * 0.18);
        return Math.min(target, Number((prev + step).toFixed(1)));
      });
    }, 240);

    return () => {
      window.clearInterval(interval);
    };
  }, [generatedImages.length, isGenerating, taskStatus]);

  const pollTaskStatus = useCallback(
    async (id: string) => {
      try {
        if (
          generationStartTime &&
          Date.now() - generationStartTime > GENERATION_TIMEOUT
        ) {
          resetTaskState();
          toast.error('Image generation timed out. Please try again.');
          return true;
        }

        const { aiQueryFn } = await import('@/server/ai.functions');
        const resp = await aiQueryFn({ data: { taskId: id } });

        const task = resp as BackendTask;
        const currentStatus = task.status as AITaskStatus;
        setTaskStatus(currentStatus);

        const parsedResult = parseTaskResult(task.taskInfo);
        const imageUrls = extractImageUrls(parsedResult);

        if (currentStatus === AITaskStatus.PENDING) {
          setProgress((prev) => Math.max(prev, 18));
          return false;
        }

        if (currentStatus === AITaskStatus.PROCESSING) {
          if (imageUrls.length > 0) {
            setGeneratedImages(
              imageUrls.map((url, index) => ({
                id: `${task.id}-${index}`,
                url,
                provider: task.provider,
                model: task.model,
                prompt: task.prompt ?? undefined,
              }))
            );
            setProgress((prev) => Math.max(prev, 72));
          } else {
            setProgress((prev) => Math.max(prev, 45));
          }
          return false;
        }

        if (currentStatus === AITaskStatus.SUCCESS) {
          if (completionHandledTaskIdRef.current === id) {
            resetTaskState();
            return true;
          }

          completionHandledTaskIdRef.current = id;
          if (imageUrls.length === 0) {
            toast.error('The provider returned no images. Please retry.');
          } else {
            setGeneratedImages(
              imageUrls.map((url, index) => ({
                id: `${task.id}-${index}`,
                url,
                provider: task.provider,
                model: task.model,
                prompt: task.prompt ?? undefined,
              }))
            );
            toast.success('Image generated successfully');
            if (canUseDevMock && !useDevMock) {
              void refreshDevMockState();
            }
          }

          setProgress(100);
          resetTaskState();
          return true;
        }

        if (currentStatus === AITaskStatus.FAILED) {
          if (completionHandledTaskIdRef.current === id) {
            resetTaskState();
            return true;
          }

          completionHandledTaskIdRef.current = id;
          const errorMessage =
            (parsedResult as Record<string, string>)?.errorMessage ||
            'Generate image failed';
          toast.error(errorMessage);
          resetTaskState();

          fetchUserCredits();

          return true;
        }

        setProgress((prev) => Math.max(prev, 50));
        return false;
      } catch (error) {
        console.error('Error polling image task:', error);
        toast.error(
          `Query task failed: ${error instanceof Error ? error.message : String(error)}`
        );
        resetTaskState();

        fetchUserCredits();

        return true;
      }
    },
    [
      canUseDevMock,
      fetchUserCredits,
      generationStartTime,
      refreshDevMockState,
      resetTaskState,
      useDevMock,
    ]
  );

  useEffect(() => {
    if (!taskId || !isGenerating) {
      return;
    }

    let cancelled = false;

    const tick = async () => {
      if (!taskId) {
        return;
      }
      const completed = await pollTaskStatus(taskId);
      if (completed) {
        cancelled = true;
      }
    };

    tick();

    const interval = setInterval(async () => {
      if (cancelled || !taskId) {
        clearInterval(interval);
        return;
      }
      const completed = await pollTaskStatus(taskId);
      if (completed) {
        clearInterval(interval);
      }
    }, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [taskId, isGenerating, pollTaskStatus]);

  const handleGenerate = async () => {
    if (!user) {
      setIsShowSignModal(true);
      return;
    }

    if (resolution === '4K' && !canUseProFeatures) {
      handleProRequired();
      return;
    }

    if (!useDevMock && remainingCredits < costCredits) {
      void requestUpgrade('credits');
      return;
    }

    const provider = selectedModelOption?.provider;

    if (!provider || !selectedProviderModel) {
      toast.error('Provider or model is not configured correctly.');
      return;
    }

    const nextValidationState: ValidationState = {
      prompt: !trimmedPrompt,
      referenceImages: !isTextToImageMode && !hasReferenceSelection,
    };

    if (nextValidationState.prompt || nextValidationState.referenceImages) {
      setValidationState(nextValidationState);

      if (nextValidationState.referenceImages) {
        playValidationCue(referenceUploaderRef.current);
      }

      if (nextValidationState.prompt) {
        playValidationCue(promptFieldRef.current);
      }

      if (nextValidationState.referenceImages) {
        referenceUploaderRef.current?.focus();
      } else if (nextValidationState.prompt) {
        promptFieldRef.current?.focus();
      }

      return;
    }

    setValidationState({ prompt: false, referenceImages: false });
    completionHandledTaskIdRef.current = null;
    setIsGenerating(true);
    setProgress(12);
    setTaskStatus(AITaskStatus.PENDING);
    setGeneratedImages([]);
    setGenerationStartTime(Date.now());

    try {
      const { aiGenerateFn } = await import('@/server/ai.functions');
      const options: Record<string, unknown> = {};
      options._credit_resolution = resolution;

      if (!isTextToImageMode) {
        options.image_input = referenceImageUrls;
      }

      if (provider === 'kie') {
        options.aspect_ratio = aspectRatio;
        options.resolution = resolution;
        options.output_format = outputFormat.toLowerCase();
        options.nsfw_checker = false;

        if (isSelectedKieGptImage15Model) {
          options.quality = quality;
        }
      }

      const resp = await aiGenerateFn({
        data: {
          mediaType: AIMediaType.IMAGE,
          scene: isTextToImageMode ? 'text-to-image' : 'image-to-image',
          provider,
          model: selectedProviderModel,
          prompt: trimmedPrompt,
          options,
          useDevMock,
        },
      });

      const data = resp as Record<string, unknown>;

      const newTaskId = data?.id as string | undefined;
      if (!newTaskId) {
        throw new Error('Task id missing in response');
      }

      if (data.status === AITaskStatus.SUCCESS && data.taskInfo) {
        completionHandledTaskIdRef.current = newTaskId;
        const parsedResult = parseTaskResult(data.taskInfo as string);
        const imageUrls = extractImageUrls(parsedResult);

        if (imageUrls.length > 0) {
          setGeneratedImages(
            imageUrls.map((url, index) => ({
              id: `${newTaskId}-${index}`,
              url,
              provider,
              model: selectedProviderModel,
              prompt: trimmedPrompt,
            }))
          );
          toast.success('Image generated successfully');
          if (canUseDevMock && !useDevMock) {
            void refreshDevMockState();
          }
          setProgress(100);
          resetTaskState();
          await fetchUserCredits();
          return;
        }
      }

      setTaskId(newTaskId);
      setProgress((prev) => Math.max(prev, 20));

      await fetchUserCredits();
    } catch (error) {
      console.error('Failed to generate image:', error);
      const message = error instanceof Error ? error.message : String(error);
      if (
        message.includes('available for Pro') ||
        message.includes('active generation')
      ) {
        void requestUpgrade(message.includes('4K') ? '4k' : 'capacity');
      }
      toast.error(`Failed to generate image: ${message}`);
      resetTaskState();
    }
  };

  const handleDownloadImage = async (image: GeneratedImage) => {
    if (!image.url) {
      return;
    }

    try {
      setDownloadingImageId(image.id);
      // fetch image via proxy
      const resp = await fetch(
        `/api/proxy/file?url=${encodeURIComponent(image.url)}`
      );
      if (!resp.ok) {
        throw new Error('Failed to fetch image');
      }

      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = getSafeDownloadFilename(
        `${image.id}.png`,
        'generated-image.png'
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
      toast.success('Image downloaded');
    } catch (error) {
      console.error('Failed to download image:', error);
      toast.error('Failed to download image');
    } finally {
      setDownloadingImageId(null);
    }
  };

  const formCard = (
    <Card
      className={cn(
        'relative overflow-hidden',
        isSplit &&
          'gap-0 rounded-md border-border/80 bg-card/90 py-0 shadow-[0_32px_110px_-56px_rgba(2,6,23,0.95)] backdrop-blur-xl'
      )}
    >
      {!isSplit && (
        <CardHeader>
          {srOnlyTitle && <h2 className="sr-only">{srOnlyTitle}</h2>}
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            {t('title')}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent
        className={cn(
          'space-y-6 pb-8',
          isSplit && 'space-y-5 p-5 md:p-6 lg:p-6',
          isFormLocked && 'pointer-events-none select-none'
        )}
        aria-busy={isFormLocked}
      >
        {isSplit && srOnlyTitle && <h2 className="sr-only">{srOnlyTitle}</h2>}

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList
            className={cn(
              'grid w-full grid-cols-2',
              isSplit ? 'h-12 rounded-md bg-muted/60 p-1' : 'bg-primary/10'
            )}
          >
            <TabsTrigger
              value="image-to-image"
              className={cn(
                isSplit &&
                  'rounded-sm text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none'
              )}
            >
              {t('tabs.image-to-image')}
            </TabsTrigger>
            <TabsTrigger
              value="text-to-image"
              className={cn(
                isSplit &&
                  'rounded-sm text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none'
              )}
            >
              {t('tabs.text-to-image')}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <ModelCombobox
          label={t('form.model')}
          options={modelComboboxOptions}
          selectedOption={selectedModelComboboxOption}
          value={modelKey}
          onChange={(value) => {
            hasUserSelectedModelRef.current = true;
            setModelKey(value);
          }}
          placeholder={t('form.select_model')}
          creditsSuffix={t('form.credits_suffix')}
          compact={isSplit}
        />

        {!isTextToImageMode && (
          <div className="relative space-y-4">
            {showReferenceImagesRequired && (
              <div className="pointer-events-none absolute top-3 right-3 z-10 inline-flex items-center rounded-full border border-destructive/20 bg-background/92 px-2.5 py-1 text-[11px] font-medium text-destructive shadow-sm backdrop-blur-sm">
                {t('form.required_badge')}
              </div>
            )}

            <ImageUploader
              title={t('form.reference_image')}
              allowMultiple={allowMultipleImages}
              maxImages={allowMultipleImages ? maxImages : 1}
              maxSizeMB={maxSizeMB}
              defaultPreviews={referenceImageUrls}
              containerRef={referenceUploaderRef}
              onChange={handleReferenceImagesChange}
              emptyHint={t('form.reference_image_placeholder')}
              className={cn(
                'rounded-md border border-transparent p-2 transition-[border-color,background-color,box-shadow]',
                showReferenceImagesRequired &&
                  'border-destructive/50 bg-destructive/[0.04] shadow-[0_0_0_1px_rgba(220,38,38,0.08)]'
              )}
            />

            {hasReferenceUploadError && (
              <p className="text-xs text-destructive">
                {t('form.some_images_failed_to_upload')}
              </p>
            )}
          </div>
        )}

        <div className="relative space-y-2">
          <Label
            htmlFor="image-prompt"
            className={cn(showPromptRequired && 'text-destructive')}
          >
            {t('form.prompt')}
          </Label>
          {showPromptRequired && (
            <div className="pointer-events-none absolute top-0 right-0 z-10 inline-flex items-center rounded-full border border-destructive/20 bg-background/92 px-2.5 py-1 text-[11px] font-medium text-destructive shadow-sm backdrop-blur-sm">
              {t('form.required_badge')}
            </div>
          )}
          <Textarea
            ref={promptFieldRef}
            id="image-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('form.prompt_placeholder')}
            aria-invalid={showPromptRequired}
            className={cn(
              'min-h-32',
              showPromptRequired &&
                'border-destructive/60 bg-destructive/[0.03] focus-visible:ring-destructive/20',
              isSplit &&
                'min-h-32 rounded-md border-input bg-background/60 focus-visible:bg-background/70'
            )}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {promptLength} / {MAX_PROMPT_LENGTH}
            </span>
            {isPromptTooLong && (
              <span className="text-destructive">
                {t('form.prompt_too_long')}
              </span>
            )}
          </div>
        </div>

        {isSplit && (
          <>
            {isSelectedKieGptImage2Model && (
              <div className="space-y-4">
                <ResolutionSelector
                  label={t('form.resolution')}
                  value={resolution}
                  onChange={setResolution}
                  canUse4K={canUseProFeatures}
                  onProRequired={handleProRequired}
                />

                <AspectRatioSelector
                  label={t('form.aspect_ratio')}
                  value={aspectRatio}
                  onChange={setAspectRatio}
                />
              </div>
            )}

            {isSelectedKieGptImage15Model && (
              <div className="space-y-4">
                <SegmentedToggle
                  label={t('form.quality')}
                  icon={<Sparkles className="h-4 w-4" />}
                  options={QUALITY_OPTIONS}
                  value={quality}
                  onChange={setQuality}
                  ariaLabel={t('form.quality')}
                  groupClassName="gap-1.5"
                />

                <AspectRatioSelector
                  label={t('form.aspect_ratio')}
                  value={aspectRatio}
                  onChange={setAspectRatio}
                />
              </div>
            )}

            {!isSelectedKieGptImage2Model && !isSelectedKieGptImage15Model && (
              <div className="space-y-4">
                <AspectRatioSelector
                  label={t('form.aspect_ratio')}
                  value={aspectRatio}
                  onChange={setAspectRatio}
                />

                <ResolutionSelector
                  label={t('form.resolution')}
                  value={resolution}
                  onChange={setResolution}
                  canUse4K={canUseProFeatures}
                  onProRequired={handleProRequired}
                />

                <SegmentedToggle
                  label={t('form.output_format')}
                  icon={<FileText className="h-4 w-4" />}
                  options={OUTPUT_FORMAT_OPTIONS}
                  value={outputFormat}
                  onChange={setOutputFormat}
                  ariaLabel={t('form.output_format')}
                  groupClassName="gap-1.5"
                />
              </div>
            )}
          </>
        )}

        {isSplit ? (
          <div className="flex flex-col gap-3 rounded-md border border-border/80 bg-muted/30 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t('credits_cost', { credits: costCredits })}
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                <Zap className="h-3.5 w-3.5" />
                {costCredits} {t('form.credits_suffix')}
              </span>
            </div>

            {!isMounted ? (
              <Button
                className="h-12 w-full rounded-md text-sm"
                disabled
                size="lg"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('loading')}
              </Button>
            ) : isCheckSign ? (
              <Button
                className="h-12 w-full rounded-md text-sm"
                disabled
                size="lg"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('checking_account')}
              </Button>
            ) : user ? (
              <Button
                size="lg"
                className="h-12 w-full rounded-md text-sm"
                onClick={handleGenerate}
                disabled={
                  isGenerating ||
                  isPromptTooLong ||
                  isReferenceUploading ||
                  hasReferenceUploadError ||
                  !selectedModelOption
                }
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('generating')}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t('generate')}
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="lg"
                className="h-12 w-full rounded-md text-sm"
                onClick={() => setIsShowSignModal(true)}
              >
                <User className="mr-2 h-4 w-4" />
                {t('sign_in_to_generate')}
              </Button>
            )}

            {isMounted && user && remainingCredits < costCredits && (
              <Link href="/pricing">
                <Button variant="outline" className="w-full" size="sm">
                  <CreditCard className="mr-2 h-4 w-4" />
                  {t('buy_credits')}
                </Button>
              </Link>
            )}

            {isMounted && user && (
              <p className="text-center text-xs text-muted-foreground">
                {t('credits_remaining', { credits: remainingCredits })}
              </p>
            )}
          </div>
        ) : (
          <>
            {!isMounted ? (
              <Button className="w-full" disabled size="lg">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('loading')}
              </Button>
            ) : isCheckSign ? (
              <Button className="w-full" disabled size="lg">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('checking_account')}
              </Button>
            ) : user ? (
              <Button
                size="lg"
                className="w-full"
                onClick={handleGenerate}
                disabled={
                  isGenerating ||
                  isPromptTooLong ||
                  isReferenceUploading ||
                  hasReferenceUploadError ||
                  !selectedModelOption
                }
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('generating')}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t('generate')}
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full"
                onClick={() => setIsShowSignModal(true)}
              >
                <User className="mr-2 h-4 w-4" />
                {t('sign_in_to_generate')}
              </Button>
            )}

            {!isMounted ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-primary">
                  {t('credits_cost', { credits: costCredits })}
                </span>
                <span>{t('credits_remaining', { credits: 0 })}</span>
              </div>
            ) : user && remainingCredits > 0 ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-primary">
                  {t('credits_cost', { credits: costCredits })}
                </span>
                <span>
                  {t('credits_remaining', { credits: remainingCredits })}
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary">
                    {t('credits_cost', { credits: costCredits })}
                  </span>
                  <span>
                    {t('credits_remaining', { credits: remainingCredits })}
                  </span>
                </div>
                <Link href="/pricing">
                  <Button variant="outline" className="w-full" size="lg">
                    <CreditCard className="mr-2 h-4 w-4" />
                    {t('buy_credits')}
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}

        {isGenerating && (
          <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center justify-between text-sm">
              <span>{t('progress')}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
            {taskStatusLabel && (
              <p className="text-center text-xs text-muted-foreground">
                {taskStatusLabel}
              </p>
            )}
          </div>
        )}
      </CardContent>
      {isFormLocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/55 backdrop-blur-[1px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/95 px-4 py-2 text-sm font-medium shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>{taskStatusLabel || t('generating')}</span>
          </div>
        </div>
      )}
    </Card>
  );

  const previewCard = (
    <Card
      className={cn(
        'overflow-hidden',
        isSplit &&
          'gap-0 rounded-md border-border/80 bg-card/90 py-0 shadow-[0_32px_110px_-56px_rgba(2,6,23,0.95)] backdrop-blur-xl'
      )}
    >
      {!isSplit && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <ImageIcon className="h-5 w-5" />
            {t('generated_images')}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent
        className={cn(
          'pb-8',
          isSplit &&
            'flex min-h-[520px] flex-1 flex-col p-5 md:p-6 lg:p-6 xl:min-h-[600px]'
        )}
      >
        {generatedImages.length > 0 ? (
          <div
            className={
              isSplit
                ? generatedImages.length === 1
                  ? 'grid min-h-[520px] grid-cols-1 xl:min-h-[600px]'
                  : 'grid min-h-[520px] gap-4 sm:grid-cols-2 xl:min-h-[600px]'
                : generatedImages.length === 1
                  ? 'grid grid-cols-1 gap-6'
                  : 'grid gap-6 sm:grid-cols-2'
            }
          >
            {generatedImages.map((image) => (
              <div
                key={image.id}
                className={cn(
                  'space-y-3',
                  isSplit &&
                    generatedImages.length === 1 &&
                    'flex min-h-[520px] flex-col xl:min-h-[600px]'
                )}
              >
                <div
                  className={
                    isSplit
                      ? 'relative flex min-h-[520px] items-center justify-center overflow-hidden rounded-md border border-border/80 bg-muted/20 p-4 xl:min-h-[600px]'
                      : generatedImages.length === 1
                        ? 'relative overflow-hidden rounded-lg border'
                        : 'relative aspect-square overflow-hidden rounded-lg border'
                  }
                >
                  <LazyImage
                    src={image.url}
                    alt={image.prompt || 'Generated image'}
                    className={
                      isSplit
                        ? 'max-h-full max-w-full object-contain'
                        : generatedImages.length === 1
                          ? 'h-auto w-full'
                          : 'h-full w-full object-cover'
                    }
                  />

                  <div className="absolute right-2 bottom-2 flex justify-end text-sm">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto"
                      onClick={() => handleDownloadImage(image)}
                      disabled={downloadingImageId === image.id || isGenerating}
                    >
                      {downloadingImageId === image.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {isSplit && isGenerating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/75 text-center backdrop-blur-[1px]">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/90 shadow-sm ring-1 ring-border/70">
                        <Loader2 className="h-7 w-7 animate-spin text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-semibold text-foreground">
                          {t('preview.generating_title')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {taskStatusLabel}
                        </p>
                        <p className="text-xs font-medium text-primary">
                          {Math.round(progress)}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : isSplit ? (
          <div className="relative flex min-h-[520px] flex-1 items-center justify-center overflow-hidden rounded-md border border-border/80 bg-muted/20 p-5 text-center xl:min-h-[600px]">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted/60 ring-1 ring-border/60">
                {isGenerating ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : (
                  <Palette className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <p className="text-xl font-semibold text-foreground">
                {isGenerating
                  ? t('preview.generating_title')
                  : t('preview.ready_title')}
              </p>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                {isGenerating
                  ? taskStatusLabel
                  : isTextToImageMode
                    ? t('preview.ready_description_text')
                    : t('preview.ready_description_image')}
              </p>
              {isGenerating && (
                <p className="mt-3 text-xs font-medium text-primary">
                  {Math.round(progress)}%
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {isGenerating ? t('ready_to_generate') : t('no_images_generated')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const devMockToggle = canUseDevMock ? (
    <div className="fixed right-4 bottom-4 z-50 lg:top-1/2 lg:right-6 lg:bottom-auto lg:-translate-y-1/2">
      <button
        type="button"
        onClick={() => {
          const nextValue = !useDevMock;
          setUseDevMock(nextValue);
          if (typeof window !== 'undefined') {
            if (nextValue) {
              window.localStorage.setItem(DEV_MOCK_STORAGE_KEY, '1');
            } else {
              window.localStorage.removeItem(DEV_MOCK_STORAGE_KEY);
            }
          }
        }}
        className={cn(
          'group flex min-w-[176px] flex-col items-start gap-1 rounded-2xl border px-4 py-3 text-left shadow-[0_20px_45px_-28px_rgba(15,23,42,0.55)] backdrop-blur-sm transition-colors',
          useDevMock
            ? 'border-primary/35 bg-primary/10 text-primary'
            : 'border-border bg-background/96 text-foreground/80 hover:border-primary/25 hover:text-foreground'
        )}
      >
        <span className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] text-foreground/45 uppercase group-hover:text-foreground/55">
          <Layers className="h-3.5 w-3.5" />
          Super Admin
        </span>
        <span className="text-sm font-semibold">
          {useDevMock ? 'Mock Mode On' : 'Mock Mode Off'}
        </span>
        <span className="text-xs text-muted-foreground">
          {devMockFixtureCount > 0
            ? `${devMockFixtureCount} saved fixture${devMockFixtureCount > 1 ? 's' : ''}`
            : 'Generate once with mock off to seed local data'}
        </span>
      </button>
    </div>
  ) : null;

  const upgradePaywall = (
    <UpgradePaywallDialog
      onClose={closeUpgradePaywall}
      open={upgradeReason !== null}
      reason={upgradeReason || 'credits'}
    />
  );

  if (isSplit) {
    return (
      <div className={cn('relative', className)}>
        {devMockToggle}
        {upgradePaywall}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          {formCard}
          {previewCard}
        </div>
      </div>
    );
  }

  return (
    <section className={cn('py-16 md:py-24', className)}>
      {devMockToggle}
      {upgradePaywall}
      <div className="container">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            {formCard}
            {previewCard}
          </div>
        </div>
      </div>
    </section>
  );
}
