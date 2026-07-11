import Bot from 'lucide-react/dist/esm/icons/bot';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import Clapperboard from 'lucide-react/dist/esm/icons/clapperboard';
import Clock from 'lucide-react/dist/esm/icons/clock';
import CopyPlus from 'lucide-react/dist/esm/icons/copy-plus';
import Eraser from 'lucide-react/dist/esm/icons/eraser';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import FileVideo from 'lucide-react/dist/esm/icons/file-video';
import GalleryHorizontalEnd from 'lucide-react/dist/esm/icons/gallery-horizontal-end';
import ImageIcon from 'lucide-react/dist/esm/icons/image';
import ImagePlus from 'lucide-react/dist/esm/icons/image-plus';
import Images from 'lucide-react/dist/esm/icons/images';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import Minimize2 from 'lucide-react/dist/esm/icons/minimize-2';
import Monitor from 'lucide-react/dist/esm/icons/monitor';
import PanelsTopLeft from 'lucide-react/dist/esm/icons/panels-top-left';
import Plus from 'lucide-react/dist/esm/icons/plus';
import RectangleHorizontal from 'lucide-react/dist/esm/icons/rectangle-horizontal';
import SendHorizontal from 'lucide-react/dist/esm/icons/send-horizontal';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Video from 'lucide-react/dist/esm/icons/video';
import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ComponentType,
  type RefObject,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { useCurrentLocale, useRouter } from '@/core/i18n/navigation';

import {
  DEFAULT_IMAGE_MODEL_CATALOG,
  getDefaultImageModelForScene,
  getImageModelCreditCost,
  getImageModelIconSrc,
  getImageModelProviderModel,
  groupImageModelsByFamily,
  KIE_GPT_IMAGE_15_MODELS,
  KIE_GPT_IMAGE_2_IMAGE_MODEL,
  KIE_GPT_IMAGE_2_TEXT_MODEL,
} from '@/config/ai-models';
import type { ImageGeneratorScene, ImageModelConfig } from '@/config/ai-models';
import {
  DEFAULT_VIDEO_MODEL_CATALOG,
  getVideoModelCreditCost,
  getVideoModelIconSrc,
} from '@/config/ai-video-models';
import type {
  VideoGeneratorScene,
  VideoModelConfig,
} from '@/config/ai-video-models';

import {
  DEFAULT_VIDEO_MODEL_ID,
  formatVideoSettingValue,
  videoWorkflowToScene,
  VideoAspectRatioOptions,
  VideoDurationOptions,
  VideoModeOptions,
  VideoModelPicker,
  VideoOptionGroup,
  VideoResolutionOptions,
} from '@/components/features/ai-generator/components/video-model-controls';
import { useMedia } from '@/hooks/use-media';
import { cn } from '@/lib/utils';
import { useCreationQueueStore } from '@/store/creation-queue';

import { getFloatingPanelPlacement } from './floating-panel-placement';
import {
  type GenerationMode,
  type ModelOption,
  type WorkflowOption,
  generationSettings,
  modeOptions,
  modelsByMode,
  workflowsByMode,
} from './hero-creation-form-data';
import {
  type HeroCreationFormCopy,
  getHeroCreationFormCopy,
} from './hero-creation-form-i18n';
import {
  getNextHeroCreationModeState,
  hasHeroCreationInputContent,
  shouldAutoExpandComposerAtPageBottom,
} from './hero-creation-state';
import { formatPublicModelMeta } from './model-display';
import { focusTextareaAtEnd } from './textarea-caret';

type OpenPanel = 'workflow' | 'model' | 'settings' | null;
type IconComponent = ComponentType<{ className?: string }>;
type FloatingPlacement = {
  left: number;
  top: number;
  maxHeight: number;
  origin: string;
};
type VideoSettingSegment = {
  label: string;
  value: string;
  icon: IconComponent;
};
type ImageSettingSegment = VideoSettingSegment;
type UploadSlot = {
  label: string;
  ariaLabel: string;
  icon: IconComponent;
  accept: string;
  mediaType: 'image' | 'video' | 'media';
};
export type HeroLocalAsset = {
  id: string;
  slotIndex: number;
  slotLabel: string;
  mediaType: 'image' | 'video';
  file?: File;
  previewUrl: string;
  sourceUrl?: string;
};
type ImageSettingOptions = {
  aspectRatios: string[];
  resolutions: string[];
  qualities: string[];
  outputFormats: string[];
};
export type HeroGenerationPayload = {
  mode: Exclude<GenerationMode, 'agent'>;
  prompt: string;
  tab: ImageGeneratorScene | VideoGeneratorScene;
  modelKey?: string;
  settings?: Record<string, string | boolean | number | string[]>;
  localAssets?: HeroLocalAsset[];
};
export type HeroCreationDraft = {
  mode: GenerationMode;
  workflowId: string;
  modelId: string;
  videoModelKey: string;
  imageModelKey: string;
  duration: string;
  resolution: string;
  ratio: string;
  videoMode: string;
  imageAspectRatio: string;
  imageResolution: string;
  imageQuality: string;
  imageOutputFormat: string;
  imageOutputCount: string;
  prompt: string;
  localAssets?: HeroLocalAsset[];
};
type HeroCreationFormProps = {
  className?: string;
  variant?: 'hero' | 'composer';
  videoOnly?: boolean;
  defaultCollapsed?: boolean;
  expandOnPageBottom?: boolean;
  expandSignal?: number;
  resetCollapsedSignal?: number;
  initialPrompt?: string;
  draft?: HeroCreationDraft | null;
  onDraftChange?: (draft: HeroCreationDraft) => void;
  submitTarget?: 'create' | 'generator';
  onGenerate?: (payload: HeroGenerationPayload) => void;
};

const modeIcons: Record<GenerationMode, IconComponent> = {
  video: Video,
  image: ImageIcon,
  agent: Bot,
};

const workflowIcons: Record<string, IconComponent> = {
  'text-image-video': FileVideo,
  'reference-video': GalleryHorizontalEnd,
  'frames-video': PanelsTopLeft,
  'video-edit': Clapperboard,
  'text-image': ImagePlus,
  'image-edit': Images,
  'style-reference': GalleryHorizontalEnd,
  'creative-agent': Bot,
  'campaign-agent': Sparkles,
};

const visibleModeOptions = modeOptions.filter((item) => item.id !== 'agent');

const controlButtonClass =
  'inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-card/82 px-2.5 text-[13px] font-semibold text-foreground shadow-sm shadow-slate-900/5 transition-colors hover:border-primary/35 hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none dark:bg-white/[0.07] dark:shadow-none dark:hover:bg-white/[0.1]';
const COMPOSER_UPLOAD_SLOT_WIDTH = 72;
const COMPOSER_UPLOAD_SLOT_GAP = 8;

const IMAGE_ASPECT_RATIO_OPTIONS = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const IMAGE_RESOLUTION_OPTIONS = ['1K', '2K', '4K'];
const IMAGE_OUTPUT_FORMAT_OPTIONS = ['PNG', 'JPG'];
const IMAGE_GPT_QUALITY_OPTIONS = ['medium', 'high'];
const IMAGE_SEEDREAM_QUALITY_OPTIONS = ['basic', 'high'];
const IMAGE_OUTPUT_COUNT_OPTIONS = ['1', '2', '3', '4'];
const MOBILE_STEPPER_SCROLL_DURATION = 420;
export const CREATE_PROMPT_STORAGE_KEY = 'lusee-create:selected-prompt';
export const CREATE_PROMPT_EVENT_NAME = 'lusee-create:generate';
const HERO_IMAGE_PROMPT_STORAGE_KEY = 'gpt-image2:selected-prompt';
const HERO_VIDEO_PROMPT_STORAGE_KEY = 'lusee-video:selected-prompt';
const HERO_IMAGE_PROMPT_EVENT_NAME = 'gpt-image2:prompt-selected';
const HERO_VIDEO_PROMPT_EVENT_NAME = 'lusee-video:prompt-selected';

const EMPTY_IMAGE_SETTING_OPTIONS: ImageSettingOptions = {
  aspectRatios: [],
  resolutions: [],
  qualities: [],
  outputFormats: [],
};

function getDefaultImageModelIdForScene(
  scene: ImageGeneratorScene,
  models: ImageModelConfig[] = DEFAULT_IMAGE_MODEL_CATALOG
) {
  return getDefaultImageModelForScene(scene, models)?.id ?? models[0]?.id ?? '';
}

function imageWorkflowToScene(workflowId: string): ImageGeneratorScene {
  if (workflowId === 'text-image') {
    return 'text-to-image';
  }

  return 'image-to-image';
}

function getWorkflowIcon(workflowId: string) {
  return workflowIcons[workflowId] ?? MessageSquare;
}

function getPromptPlaceholder(
  mode: GenerationMode,
  workflowId: string,
  copy: HeroCreationFormCopy
) {
  if (mode === 'image') {
    if (workflowId === 'text-image') {
      return copy.placeholders.textImage;
    }

    return copy.placeholders.referenceImage;
  }

  if (mode === 'agent') {
    return copy.placeholders.agent;
  }

  if (workflowId === 'reference-video') {
    return copy.placeholders.referenceVideo;
  }

  if (workflowId === 'frames-video') {
    return copy.placeholders.framesVideo;
  }

  if (workflowId === 'video-edit') {
    return copy.placeholders.videoEdit;
  }

  return copy.placeholders.default;
}

function getUploadSlots(
  mode: GenerationMode,
  workflowId: string,
  copy: HeroCreationFormCopy
): UploadSlot[] {
  if (mode === 'image') {
    return [
      {
        label: workflowId === 'text-image' ? '' : copy.upload.reference,
        ariaLabel: copy.upload.referenceImage,
        icon: ImagePlus,
        accept: 'image/*',
        mediaType: 'image',
      },
    ];
  }

  if (workflowId === 'reference-video') {
    return [
      {
        label: copy.upload.image,
        ariaLabel: copy.upload.referenceImage,
        icon: ImagePlus,
        accept: 'image/*',
        mediaType: 'image',
      },
      {
        label: copy.upload.video,
        ariaLabel: copy.upload.referenceVideo,
        icon: FileVideo,
        accept: 'video/*',
        mediaType: 'video',
      },
    ];
  }

  if (workflowId === 'frames-video') {
    return [
      {
        label: copy.upload.start,
        ariaLabel: copy.upload.startFrame,
        icon: ImagePlus,
        accept: 'image/*',
        mediaType: 'image',
      },
      {
        label: copy.upload.end,
        ariaLabel: copy.upload.endFrame,
        icon: ImagePlus,
        accept: 'image/*',
        mediaType: 'image',
      },
    ];
  }

  if (workflowId === 'video-edit') {
    return [
      {
        label: copy.upload.video,
        ariaLabel: copy.upload.sourceVideo,
        icon: FileVideo,
        accept: 'video/*',
        mediaType: 'video',
      },
    ];
  }

  return [
    {
      label: '',
      ariaLabel: copy.upload.media,
      icon: Plus,
      accept: 'image/*,video/*',
      mediaType: 'media',
    },
  ];
}

function getBezierScrollProgress(progress: number) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const inverse = 1 - clamped;
  return (
    3 * inverse * inverse * clamped +
    3 * inverse * clamped * clamped +
    clamped * clamped * clamped
  );
}

function getImageSettingOptions(
  model: ImageModelConfig | null,
  scene: ImageGeneratorScene
): ImageSettingOptions {
  if (!model) {
    return EMPTY_IMAGE_SETTING_OPTIONS;
  }

  const providerModel = getImageModelProviderModel(model, scene);

  if (model.provider === 'kie') {
    if (KIE_GPT_IMAGE_15_MODELS.has(providerModel)) {
      return {
        aspectRatios: IMAGE_ASPECT_RATIO_OPTIONS,
        resolutions: [],
        qualities: IMAGE_GPT_QUALITY_OPTIONS,
        outputFormats: [],
      };
    }

    if (
      providerModel.includes('seedream') ||
      providerModel.includes('bytedance/seedream')
    ) {
      return {
        aspectRatios: IMAGE_ASPECT_RATIO_OPTIONS,
        resolutions: [],
        qualities: IMAGE_SEEDREAM_QUALITY_OPTIONS,
        outputFormats: [],
      };
    }

    if (
      providerModel === KIE_GPT_IMAGE_2_TEXT_MODEL ||
      providerModel === KIE_GPT_IMAGE_2_IMAGE_MODEL
    ) {
      return {
        aspectRatios: ['auto', ...IMAGE_ASPECT_RATIO_OPTIONS],
        resolutions: IMAGE_RESOLUTION_OPTIONS,
        qualities: [],
        outputFormats: [],
      };
    }

    if (providerModel.includes('wan/2-7-image')) {
      return {
        aspectRatios: [],
        resolutions: IMAGE_RESOLUTION_OPTIONS,
        qualities: [],
        outputFormats: [],
      };
    }
  }

  return {
    aspectRatios: IMAGE_ASPECT_RATIO_OPTIONS,
    resolutions: IMAGE_RESOLUTION_OPTIONS,
    qualities: [],
    outputFormats: IMAGE_OUTPUT_FORMAT_OPTIONS,
  };
}

function getSerializableHeroGenerationPayload(
  payload: HeroGenerationPayload
): HeroGenerationPayload {
  if (!payload.localAssets?.length) return payload;
  const { localAssets: _localAssets, ...serializablePayload } = payload;
  return serializablePayload;
}

function revokeLocalPreviewUrl(url: string) {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

export function HeroCreationForm({
  className,
  variant = 'hero',
  videoOnly = false,
  defaultCollapsed = false,
  expandOnPageBottom = false,
  expandSignal = 0,
  resetCollapsedSignal = 0,
  initialPrompt = '',
  draft,
  onDraftChange,
  submitTarget = 'create',
  onGenerate,
}: HeroCreationFormProps = {}) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const copy = getHeroCreationFormCopy(locale);
  const isLargeControls = useMedia('(min-width: 64rem)');
  const rootRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const floatingPanelRef = useRef<HTMLDivElement>(null);
  const applyingDraftRef = useRef(false);
  const appliedIncomingDraftRef = useRef('');
  const notifiedDraftSignatureRef = useRef('');
  const draftAssetTimerRef = useRef<number | null>(null);
  const focusPromptAfterExpandRef = useRef(false);
  const collapseContentTimerRef = useRef<number | null>(null);
  const userCollapsedComposerRef = useRef(false);
  const workflowTriggerRef = useRef<HTMLSpanElement>(null);
  const modelTriggerRef = useRef<HTMLDivElement>(null);
  const settingsTriggerRef = useRef<HTMLDivElement>(null);
  const compactWorkflowTriggerRef = useRef<HTMLSpanElement>(null);
  const compactModelTriggerRef = useRef<HTMLDivElement>(null);
  const compactSettingsTriggerRef = useRef<HTMLDivElement>(null);
  const mobileStepperTrackRef = useRef<HTMLDivElement>(null);
  const mobileStepperScrollAnimationRef = useRef<number | null>(null);
  const uploadInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [mode, setMode] = useState<GenerationMode>('video');
  const [workflowId, setWorkflowId] = useState(workflowsByMode.video[0].id);
  const [modelId, setModelId] = useState(modelsByMode.video[0].id);
  const [videoModelKey, setVideoModelKey] = useState(DEFAULT_VIDEO_MODEL_ID);
  const [imageModelKey, setImageModelKey] = useState(
    getDefaultImageModelIdForScene('text-to-image')
  );
  const [duration, setDuration] = useState('5');
  const [resolution, setResolution] = useState('1080p');
  const [ratio, setRatio] = useState('16:9');
  const [videoMode, setVideoMode] = useState('pro');
  const [imageAspectRatio, setImageAspectRatio] = useState('1:1');
  const [imageResolution, setImageResolution] = useState('2K');
  const [imageQuality, setImageQuality] = useState('medium');
  const [imageOutputFormat, setImageOutputFormat] = useState('PNG');
  const [imageOutputCount, setImageOutputCount] = useState('1');
  const [localAssetsBySlot, setLocalAssetsBySlot] = useState<
    Record<number, HeroLocalAsset>
  >({});
  const [prompt, setPrompt] = useState(initialPrompt);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [expandedContentMounted, setExpandedContentMounted] =
    useState(!defaultCollapsed);
  const [expandedChromeVisible, setExpandedChromeVisible] =
    useState(!defaultCollapsed);
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [renderedPanel, setRenderedPanel] = useState<OpenPanel>(null);
  const [mobileStepperScrollState, setMobileStepperScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
    hasOverflow: false,
  });
  const isComposer = variant === 'composer';
  const controlsExpanded = !isComposer || expandedContentMounted;
  const expandedChromeReady = !isComposer || expandedChromeVisible;
  const showComposerMini = isComposer && collapsed && !expandedContentMounted;
  const composerChromeVisible = !isComposer || expandedChromeReady;
  const activeWorkflowTriggerRef = isLargeControls
    ? workflowTriggerRef
    : compactWorkflowTriggerRef;
  const activeModelTriggerRef = isLargeControls
    ? modelTriggerRef
    : compactModelTriggerRef;
  const activeSettingsTriggerRef = isLargeControls
    ? settingsTriggerRef
    : compactSettingsTriggerRef;

  const workflows = workflowsByMode[mode];
  const models = modelsByMode[mode];
  const videoScene = useMemo(
    () => videoWorkflowToScene(workflowId),
    [workflowId]
  );
  const availableVideoModels = useMemo(
    () =>
      DEFAULT_VIDEO_MODEL_CATALOG.filter(
        (item) => item.enabled && item.scenes.includes(videoScene)
      ),
    [videoScene]
  );
  const imageScene = useMemo(
    () => imageWorkflowToScene(workflowId),
    [workflowId]
  );
  const availableImageModels = useMemo(
    () =>
      DEFAULT_IMAGE_MODEL_CATALOG.filter(
        (item) => item.enabled && item.scenes.includes(imageScene)
      ),
    [imageScene]
  );
  const selectedVideoModel =
    availableVideoModels.find((item) => item.id === videoModelKey) ??
    availableVideoModels[0] ??
    null;
  const selectedImageModel =
    availableImageModels.find((item) => item.id === imageModelKey) ??
    availableImageModels[0] ??
    null;
  const videoCapabilities = selectedVideoModel?.capabilities;
  const imageSettingOptions = useMemo(
    () => getImageSettingOptions(selectedImageModel, imageScene),
    [imageScene, selectedImageModel]
  );
  const videoCreditCost = selectedVideoModel
    ? getVideoModelCreditCost({
        model: selectedVideoModel,
        scene: videoScene,
        duration,
      })
    : 0;
  const imageCreditCost = selectedImageModel
    ? getImageModelCreditCost({
        model: selectedImageModel,
        scene: imageScene,
        options: { resolution: imageResolution },
      })
    : 0;
  const imageOutputCountValue = Math.max(
    1,
    Number.parseInt(imageOutputCount, 10) || 1
  );
  const selectedWorkflow =
    workflows.find((item) => item.id === workflowId) || workflows[0];
  const SelectedWorkflowIcon = getWorkflowIcon(selectedWorkflow.id);
  const selectedModel = models.find((item) => item.id === modelId) || models[0];
  const selectedModelLabel =
    mode === 'video'
      ? selectedVideoModel?.label || copy.selectModel
      : mode === 'image'
        ? selectedImageModel?.label || copy.selectModel
        : selectedModel.title;
  const selectedModelSummary =
    mode === 'video'
      ? selectedVideoModel?.familyLabel
        ? `${selectedVideoModel.familyLabel} · ${selectedModelLabel}`
        : selectedModelLabel
      : selectedModelLabel;
  const selectedModelBadge =
    mode === 'video'
      ? selectedVideoModel?.badges?.[0]
      : mode === 'image'
        ? selectedImageModel?.badges?.[0] || selectedImageModel?.badge || ''
        : selectedModel.badge || (selectedModel.premium ? 'Pro' : '');
  const selectedCredits =
    mode === 'video'
      ? videoCreditCost
      : mode === 'image'
        ? imageCreditCost * imageOutputCountValue
        : Number.parseInt(selectedModel.credits);
  const localAssets = useMemo(
    () =>
      Object.values(localAssetsBySlot).sort(
        (first, second) => first.slotIndex - second.slotIndex
      ),
    [localAssetsBySlot]
  );
  const currentDraft = useMemo<HeroCreationDraft>(
    () => ({
      mode,
      workflowId,
      modelId,
      videoModelKey,
      imageModelKey,
      duration,
      resolution,
      ratio,
      videoMode,
      imageAspectRatio,
      imageResolution,
      imageQuality,
      imageOutputFormat,
      imageOutputCount,
      prompt,
      localAssets: localAssets.length > 0 ? localAssets : undefined,
    }),
    [
      duration,
      imageAspectRatio,
      imageModelKey,
      imageOutputCount,
      imageOutputFormat,
      imageQuality,
      imageResolution,
      localAssets,
      mode,
      modelId,
      prompt,
      ratio,
      resolution,
      videoMode,
      videoModelKey,
      workflowId,
    ]
  );
  const currentDraftSignature = useMemo(
    () => JSON.stringify(currentDraft),
    [currentDraft]
  );
  const incomingDraftSignature = useMemo(
    () => (draft ? JSON.stringify(draft) : ''),
    [draft]
  );
  const videoSettingSegments: VideoSettingSegment[] = [];
  if (videoCapabilities?.durationOptions?.length) {
    videoSettingSegments.push({
      label: copy.settings.videoLength,
      value: formatVideoSettingValue(duration, 's'),
      icon: Clock,
    });
  }
  if (videoCapabilities?.resolutions?.length) {
    videoSettingSegments.push({
      label: copy.settings.resolution,
      value: resolution,
      icon: Monitor,
    });
  }
  if (videoCapabilities?.aspectRatios?.length) {
    videoSettingSegments.push({
      label: copy.settings.aspectRatio,
      value: ratio,
      icon: RectangleHorizontal,
    });
  }
  if (videoCapabilities?.modes?.length) {
    videoSettingSegments.push({
      label: copy.settings.mode,
      value: videoMode,
      icon: Sparkles,
    });
  }
  const imageSettingSegments: ImageSettingSegment[] = [];
  if (imageSettingOptions.aspectRatios.length) {
    imageSettingSegments.push({
      label: copy.settings.aspectRatio,
      value: imageAspectRatio,
      icon: RectangleHorizontal,
    });
  }
  if (imageSettingOptions.resolutions.length) {
    imageSettingSegments.push({
      label: copy.settings.resolution,
      value: imageResolution,
      icon: Monitor,
    });
  }
  if (imageSettingOptions.qualities.length) {
    imageSettingSegments.push({
      label: copy.settings.quality,
      value: imageQuality,
      icon: Sparkles,
    });
  }
  if (imageSettingOptions.outputFormats.length) {
    imageSettingSegments.push({
      label: copy.settings.format,
      value: imageOutputFormat,
      icon: FileText,
    });
  }
  imageSettingSegments.push({
    label: copy.settings.images,
    value: imageOutputCount,
    icon: CopyPlus,
  });
  const promptPlaceholder = useMemo(
    () => getPromptPlaceholder(mode, workflowId, copy),
    [copy, mode, workflowId]
  );
  const uploadSlots = useMemo(
    () => getUploadSlots(mode, workflowId, copy),
    [copy, mode, workflowId]
  );
  const uploadSlotSignature = useMemo(
    () =>
      uploadSlots
        .map((slot, index) => `${index}:${slot.ariaLabel}:${slot.mediaType}`)
        .join('|'),
    [uploadSlots]
  );
  const composerUploadWidth =
    uploadSlots.length > 0
      ? uploadSlots.length * COMPOSER_UPLOAD_SLOT_WIDTH +
        Math.max(0, uploadSlots.length - 1) * COMPOSER_UPLOAD_SLOT_GAP
      : 0;
  const composerUploadOffset =
    isComposer && uploadSlots.length > 0 ? composerUploadWidth + 16 : 0;
  const promptPreviewVisible =
    isComposer && collapsed && Boolean(prompt.trim());
  const hasCreationInputContent = hasHeroCreationInputContent({
    prompt,
    assetCount: localAssets.length,
  });

  const switchMode = (nextMode: GenerationMode) => {
    if (videoOnly && nextMode !== 'video') return;

    const nextState = getNextHeroCreationModeState(nextMode, {
      workflowId,
      modelId,
      videoModelKey,
      imageModelKey,
    });
    setMode(nextMode);
    setWorkflowId(nextState.workflowId);
    setModelId(nextState.modelId);
    setVideoModelKey(nextState.videoModelKey);
    setImageModelKey(nextState.imageModelKey);
    setOpenPanel(null);
  };

  const toggleOpenPanel = (panel: Exclude<OpenPanel, null>) => {
    setOpenPanel((current) => (current === panel ? null : panel));
  };

  const closeOpenPanel = () => setOpenPanel(null);

  const updateMobileStepperScrollState = useCallback(() => {
    const track = mobileStepperTrackRef.current;
    if (!track) {
      setMobileStepperScrollState({
        canScrollLeft: false,
        canScrollRight: false,
        hasOverflow: false,
      });
      return;
    }

    const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
    setMobileStepperScrollState({
      canScrollLeft: track.scrollLeft > 1,
      canScrollRight: track.scrollLeft < maxScrollLeft - 1,
      hasOverflow: maxScrollLeft > 1,
    });
  }, []);

  const scrollMobileStepperTrack = (direction: -1 | 1) => {
    const track = mobileStepperTrackRef.current;
    if (!track) return;

    if (mobileStepperScrollAnimationRef.current !== null) {
      window.cancelAnimationFrame(mobileStepperScrollAnimationRef.current);
      mobileStepperScrollAnimationRef.current = null;
    }

    const start = track.scrollLeft;
    const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
    const distance = Math.max(132, track.clientWidth * 0.62);
    const target = Math.min(
      Math.max(start + direction * distance, 0),
      maxScrollLeft
    );
    const startedAt = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startedAt;
      const progress = Math.min(elapsed / MOBILE_STEPPER_SCROLL_DURATION, 1);
      const easedProgress = getBezierScrollProgress(progress);
      track.scrollLeft = start + (target - start) * easedProgress;
      updateMobileStepperScrollState();

      if (progress < 1) {
        mobileStepperScrollAnimationRef.current =
          window.requestAnimationFrame(animate);
        return;
      }

      mobileStepperScrollAnimationRef.current = null;
      track.scrollLeft = target;
      updateMobileStepperScrollState();
    };

    mobileStepperScrollAnimationRef.current =
      window.requestAnimationFrame(animate);
  };

  const openUploadSlot = (index: number) => {
    uploadInputRefs.current[index]?.click();
  };

  const clearUploadInputs = () => {
    Object.values(uploadInputRefs.current).forEach((input) => {
      if (input) input.value = '';
    });
  };

  const clearLocalAssets = () => {
    setLocalAssetsBySlot((current) => {
      Object.values(current).forEach((asset) =>
        revokeLocalPreviewUrl(asset.previewUrl)
      );
      return {};
    });
    clearUploadInputs();
  };

  const resetCreationInput = () => {
    closeOpenPanel();
    setPrompt('');
    clearLocalAssets();
  };

  const handleUploadAssetChange = (
    slot: UploadSlot,
    index: number,
    file: File | null
  ) => {
    const input = uploadInputRefs.current[index];
    if (!file) return;
    if (
      (slot.mediaType === 'image' && !file.type.startsWith('image/')) ||
      (slot.mediaType === 'video' && !file.type.startsWith('video/'))
    ) {
      if (input) input.value = '';
      return;
    }
    const assetMediaType = file.type.startsWith('video/') ? 'video' : 'image';

    const previewUrl = URL.createObjectURL(file);
    setLocalAssetsBySlot((current) => {
      const previous = current[index];
      if (previous) revokeLocalPreviewUrl(previous.previewUrl);
      return {
        ...current,
        [index]: {
          id: `${slot.ariaLabel}-${file.name}-${file.lastModified}`,
          slotIndex: index,
          slotLabel: slot.label || slot.ariaLabel,
          mediaType: assetMediaType,
          file,
          previewUrl,
        },
      };
    });
    if (input) input.value = '';
  };

  const expandComposer = () => {
    if (isComposer && collapsed) {
      userCollapsedComposerRef.current = false;
      if (collapseContentTimerRef.current !== null) {
        window.clearTimeout(collapseContentTimerRef.current);
        collapseContentTimerRef.current = null;
      }
      setExpandedContentMounted(true);
      focusPromptAfterExpandRef.current = true;
      setCollapsed(false);
    }
  };

  const collapseComposer = () => {
    if (isComposer && defaultCollapsed) {
      userCollapsedComposerRef.current = true;
      if (collapseContentTimerRef.current !== null) {
        window.clearTimeout(collapseContentTimerRef.current);
      }
      formRef.current
        ?.querySelector<HTMLTextAreaElement>('#homepage-prompt')
        ?.blur();
      setExpandedChromeVisible(false);
      setCollapsed(true);
      setOpenPanel(null);
      collapseContentTimerRef.current = window.setTimeout(() => {
        collapseContentTimerRef.current = null;
        setExpandedContentMounted(false);
      }, 300);
    }
  };

  const createGenerationPayload = (): HeroGenerationPayload | null => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      closeOpenPanel();
      const promptField =
        formRef.current?.querySelector<HTMLTextAreaElement>('#homepage-prompt');
      promptField?.focus();
      return null;
    }

    if (mode === 'image') {
      const referenceImageUrls = localAssets
        .map((asset) => asset.sourceUrl)
        .filter((url): url is string => Boolean(url));

      return {
        mode: 'image',
        prompt: trimmedPrompt,
        tab: imageScene,
        modelKey: selectedImageModel?.id,
        localAssets,
        settings: {
          aspectRatio: imageAspectRatio,
          resolution: imageResolution,
          quality: imageQuality,
          outputFormat: imageOutputFormat,
          outputCount: imageOutputCountValue,
          ...(referenceImageUrls.length > 0
            ? { image_input: referenceImageUrls }
            : {}),
        },
      };
    }

    return {
      mode: 'video',
      prompt: trimmedPrompt,
      tab: videoScene,
      modelKey: selectedVideoModel?.id,
      localAssets,
      settings: {
        duration,
        aspectRatio: ratio,
        resolution,
        mode: videoMode,
      },
    };
  };

  const submitHeroGeneration = () => {
    const payload = createGenerationPayload();
    if (!payload) {
      return;
    }

    closeOpenPanel();
    setPrompt('');
    clearLocalAssets();

    if (onGenerate) {
      onGenerate(payload);
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    if (submitTarget === 'create') {
      useCreationQueueStore.getState().setPayload(payload);
      window.dispatchEvent(
        new CustomEvent(CREATE_PROMPT_EVENT_NAME, { detail: payload })
      );
      router.push('/generate');
      return;
    }

    if (payload.mode === 'image') {
      const serializablePayload = getSerializableHeroGenerationPayload(payload);
      window.sessionStorage.setItem(
        HERO_IMAGE_PROMPT_STORAGE_KEY,
        JSON.stringify(serializablePayload)
      );
      window.dispatchEvent(
        new CustomEvent(HERO_IMAGE_PROMPT_EVENT_NAME, { detail: payload })
      );
      router.push('/image-generator');
      return;
    }

    const serializablePayload = getSerializableHeroGenerationPayload(payload);
    window.sessionStorage.setItem(
      HERO_VIDEO_PROMPT_STORAGE_KEY,
      JSON.stringify(serializablePayload)
    );
    window.dispatchEvent(
      new CustomEvent(HERO_VIDEO_PROMPT_EVENT_NAME, { detail: payload })
    );
    router.push('/video-generator');
  };

  useEffect(() => {
    return () => {
      if (collapseContentTimerRef.current !== null) {
        window.clearTimeout(collapseContentTimerRef.current);
      }
      if (draftAssetTimerRef.current !== null) {
        window.clearTimeout(draftAssetTimerRef.current);
      }
      if (mobileStepperScrollAnimationRef.current !== null) {
        window.cancelAnimationFrame(mobileStepperScrollAnimationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isComposer || !defaultCollapsed) {
      return;
    }

    if (collapseContentTimerRef.current !== null) {
      window.clearTimeout(collapseContentTimerRef.current);
      collapseContentTimerRef.current = null;
    }

    userCollapsedComposerRef.current = false;
    setCollapsed(true);
    setExpandedChromeVisible(false);
    setExpandedContentMounted(false);
    setOpenPanel(null);
  }, [defaultCollapsed, isComposer, resetCollapsedSignal]);

  useEffect(() => {
    if (!isComposer || expandSignal === 0) {
      return;
    }

    if (collapseContentTimerRef.current !== null) {
      window.clearTimeout(collapseContentTimerRef.current);
      collapseContentTimerRef.current = null;
    }

    userCollapsedComposerRef.current = false;
    setExpandedContentMounted(true);
    focusPromptAfterExpandRef.current = true;
    setCollapsed(false);
  }, [expandSignal, isComposer]);

  useEffect(() => {
    if (!isComposer || collapsed || !focusPromptAfterExpandRef.current) {
      return;
    }

    focusPromptAfterExpandRef.current = false;
    const frameId = window.requestAnimationFrame(() => {
      focusTextareaAtEnd(
        formRef.current?.querySelector<HTMLTextAreaElement>(
          '#homepage-prompt'
        ) ?? null
      );
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [collapsed, isComposer]);

  useEffect(() => {
    if (!isComposer) {
      return;
    }

    if (collapsed) {
      setExpandedChromeVisible(false);
      return;
    }

    const frameId = window.requestAnimationFrame(() =>
      setExpandedChromeVisible(true)
    );
    return () => window.cancelAnimationFrame(frameId);
  }, [collapsed, isComposer]);

  useEffect(() => {
    if (draft) {
      return;
    }
    setPrompt(initialPrompt);
  }, [draft, initialPrompt]);

  useEffect(() => {
    if (
      !draft ||
      (videoOnly && draft.mode !== 'video') ||
      incomingDraftSignature === appliedIncomingDraftRef.current
    ) {
      return;
    }

    appliedIncomingDraftRef.current = incomingDraftSignature;
    if (incomingDraftSignature === currentDraftSignature) {
      return;
    }

    applyingDraftRef.current = true;
    setMode(draft.mode);
    setWorkflowId(draft.workflowId);
    setModelId(draft.modelId);
    setVideoModelKey(draft.videoModelKey);
    setImageModelKey(draft.imageModelKey);
    setDuration(draft.duration);
    setResolution(draft.resolution);
    setRatio(draft.ratio);
    setVideoMode(draft.videoMode);
    setImageAspectRatio(draft.imageAspectRatio);
    setImageResolution(draft.imageResolution);
    setImageQuality(draft.imageQuality);
    setImageOutputFormat(draft.imageOutputFormat);
    setImageOutputCount(draft.imageOutputCount ?? '1');
    setPrompt(draft.prompt);
    if (draftAssetTimerRef.current !== null) {
      window.clearTimeout(draftAssetTimerRef.current);
    }
    draftAssetTimerRef.current = window.setTimeout(() => {
      draftAssetTimerRef.current = null;
      const incomingAssets = draft.localAssets ?? [];
      setLocalAssetsBySlot((current) => {
        Object.values(current).forEach((asset) =>
          revokeLocalPreviewUrl(asset.previewUrl)
        );
        return Object.fromEntries(
          incomingAssets.map((asset) => [asset.slotIndex, asset])
        ) as Record<number, HeroLocalAsset>;
      });
    }, 0);
  }, [currentDraftSignature, draft, incomingDraftSignature]);

  useEffect(() => {
    if (!onDraftChange) {
      return;
    }

    if (applyingDraftRef.current) {
      applyingDraftRef.current = false;
      return;
    }

    if (currentDraftSignature === notifiedDraftSignatureRef.current) {
      return;
    }

    notifiedDraftSignatureRef.current = currentDraftSignature;
    onDraftChange(currentDraft);
  }, [currentDraft, currentDraftSignature, onDraftChange]);

  useEffect(() => {
    setLocalAssetsBySlot((current) => {
      Object.values(current).forEach((asset) =>
        URL.revokeObjectURL(asset.previewUrl)
      );
      return {};
    });
    clearUploadInputs();
  }, [uploadSlotSignature]);

  useEffect(() => {
    return () => {
      Object.values(localAssetsBySlot).forEach((asset) =>
        revokeLocalPreviewUrl(asset.previewUrl)
      );
    };
  }, [localAssetsBySlot]);

  useEffect(() => {
    if (!expandOnPageBottom || !isComposer || typeof window === 'undefined') {
      return;
    }

    const updateExpandedAtBottom = () => {
      const documentElement = document.documentElement;
      const hasScrollablePage =
        documentElement.scrollHeight > window.innerHeight + 120;
      if (!hasScrollablePage) {
        return;
      }

      const distanceToBottom =
        documentElement.scrollHeight - window.innerHeight - window.scrollY;
      if (
        shouldAutoExpandComposerAtPageBottom({
          hasScrollablePage,
          distanceToBottom,
          userCollapsed: userCollapsedComposerRef.current,
        })
      ) {
        if (collapseContentTimerRef.current !== null) {
          window.clearTimeout(collapseContentTimerRef.current);
          collapseContentTimerRef.current = null;
        }
        setExpandedContentMounted(true);
        setCollapsed(false);
      }
    };

    window.addEventListener('scroll', updateExpandedAtBottom, {
      passive: true,
    });
    window.addEventListener('resize', updateExpandedAtBottom);
    return () => {
      window.removeEventListener('scroll', updateExpandedAtBottom);
      window.removeEventListener('resize', updateExpandedAtBottom);
    };
  }, [expandOnPageBottom, isComposer]);

  useEffect(() => {
    if (openPanel) {
      setRenderedPanel(openPanel);
      return;
    }

    const timeoutId = window.setTimeout(() => setRenderedPanel(null), 160);
    return () => window.clearTimeout(timeoutId);
  }, [openPanel]);

  useEffect(() => {
    if (mode !== 'video' || availableVideoModels.length === 0) {
      return;
    }

    if (!availableVideoModels.some((item) => item.id === videoModelKey)) {
      setVideoModelKey(availableVideoModels[0].id);
    }
  }, [availableVideoModels, mode, videoModelKey]);

  useEffect(() => {
    if (mode !== 'image' || availableImageModels.length === 0) {
      return;
    }

    if (!availableImageModels.some((item) => item.id === imageModelKey)) {
      setImageModelKey(availableImageModels[0].id);
    }
  }, [availableImageModels, imageModelKey, mode]);

  useEffect(() => {
    if (!selectedVideoModel?.defaults) {
      return;
    }

    const defaults = selectedVideoModel.defaults;
    if (defaults.duration) setDuration(defaults.duration);
    if (defaults.aspectRatio) setRatio(defaults.aspectRatio);
    if (defaults.resolution) setResolution(defaults.resolution);
    if (defaults.mode) setVideoMode(defaults.mode);
  }, [selectedVideoModel?.id]);

  useEffect(() => {
    const firstAspectRatio = imageSettingOptions.aspectRatios[0];
    const firstResolution = imageSettingOptions.resolutions[0];
    const firstQuality = imageSettingOptions.qualities[0];
    const firstOutputFormat = imageSettingOptions.outputFormats[0];

    if (
      firstAspectRatio &&
      !imageSettingOptions.aspectRatios.includes(imageAspectRatio)
    ) {
      setImageAspectRatio(firstAspectRatio);
    }
    if (
      firstResolution &&
      !imageSettingOptions.resolutions.includes(imageResolution)
    ) {
      setImageResolution(firstResolution);
    }
    if (firstQuality && !imageSettingOptions.qualities.includes(imageQuality)) {
      setImageQuality(firstQuality);
    }
    if (
      firstOutputFormat &&
      !imageSettingOptions.outputFormats.includes(imageOutputFormat)
    ) {
      setImageOutputFormat(firstOutputFormat);
    }
  }, [
    imageAspectRatio,
    imageOutputFormat,
    imageQuality,
    imageResolution,
    imageSettingOptions,
  ]);

  useEffect(() => {
    if (!openPanel) return;

    const closeFromOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        (formRef.current?.contains(target) ||
          floatingPanelRef.current?.contains(target))
      ) {
        return;
      }
      setOpenPanel(null);
    };

    const closeFromEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenPanel(null);
    };

    window.addEventListener('pointerdown', closeFromOutsidePointer, true);
    window.addEventListener('keydown', closeFromEscape);
    return () => {
      window.removeEventListener('pointerdown', closeFromOutsidePointer, true);
      window.removeEventListener('keydown', closeFromEscape);
    };
  }, [openPanel]);

  useEffect(() => {
    if (!controlsExpanded) {
      setMobileStepperScrollState({
        canScrollLeft: false,
        canScrollRight: false,
        hasOverflow: false,
      });
      return;
    }

    const track = mobileStepperTrackRef.current;
    if (!track) return;

    const updateOnNextFrame = () => {
      window.requestAnimationFrame(updateMobileStepperScrollState);
    };

    updateOnNextFrame();
    track.addEventListener('scroll', updateMobileStepperScrollState, {
      passive: true,
    });
    window.addEventListener('resize', updateOnNextFrame);

    const resizeObserver = new ResizeObserver(updateOnNextFrame);
    resizeObserver.observe(track);

    return () => {
      track.removeEventListener('scroll', updateMobileStepperScrollState);
      window.removeEventListener('resize', updateOnNextFrame);
      resizeObserver.disconnect();
    };
  }, [
    controlsExpanded,
    mode,
    selectedModelLabel,
    selectedWorkflow.title,
    updateMobileStepperScrollState,
  ]);

  return (
    <div
      ref={rootRef}
      className={cn(
        'mx-auto w-full text-left transition-[max-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        'relative',
        isComposer
          ? collapsed
            ? 'max-w-[720px]'
            : 'max-w-[1180px]'
          : 'mt-5 max-w-[1040px]',
        className
      )}
    >
      {!isComposer && !videoOnly && (
        <div className="hidden lg:block">
          <ModeSwitch mode={mode} onChange={switchMode} copy={copy} />
        </div>
      )}
      <div className={cn(isComposer && 'relative flex items-stretch')}>
        {isComposer && !videoOnly && (
          <ModeRail
            mode={mode}
            onChange={switchMode}
            copy={copy}
            collapsed={false}
            visible={expandedChromeReady}
            className="absolute top-0 -left-[66px] hidden lg:flex"
          />
        )}
        <form
          ref={formRef}
          onSubmit={(event) => {
            event.preventDefault();
            submitHeroGeneration();
          }}
          onPointerDown={(event) => {
            const target = event.target;
            if (
              target instanceof Element &&
              target.closest('[data-mini-submit],[data-reset-control]')
            ) {
              return;
            }
            expandComposer();
          }}
          onFocusCapture={expandComposer}
          className={cn(
            'relative flex-1 rounded-2xl border border-primary/25 bg-card/76 p-3 shadow-[0_18px_80px_rgba(111,127,31,0.14)] backdrop-blur-xl transition-[height,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-primary/30 dark:bg-card/80 dark:shadow-[0_0_44px_rgba(216,242,105,0.14)]',
            isComposer &&
              'lusee-composer-glass overflow-hidden border-white/12 bg-[#11130f]/90 shadow-[0_26px_90px_rgba(0,0,0,0.46)] backdrop-blur-2xl backdrop-saturate-125 dark:border-white/12 dark:bg-[#11130f]/90 dark:shadow-[0_26px_90px_rgba(0,0,0,0.46)]',
            isComposer &&
              (collapsed
                ? 'h-[68px] shadow-[0_18px_70px_rgba(0,0,0,0.44)] dark:shadow-[0_18px_70px_rgba(0,0,0,0.44)]'
                : 'h-[224px] lg:h-[184px]')
          )}
        >
          {isComposer && controlsExpanded && (
            <button
              type="button"
              aria-label={copy.minimizeComposer}
              onClick={collapseComposer}
              className={cn(
                'absolute top-3 right-3 z-20 inline-flex size-8 items-center justify-center rounded-lg border border-white/12 bg-white/[0.06] text-[#c6c9bc] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-opacity hover:bg-white/[0.1] hover:text-[#f4f2e6] focus-visible:ring-2 focus-visible:ring-[#3b82f6]/60 focus-visible:outline-none dark:border-white/12 dark:bg-white/[0.06] dark:shadow-none dark:hover:bg-white/[0.1]',
                expandedChromeReady
                  ? 'opacity-100 delay-100 duration-200'
                  : 'pointer-events-none opacity-0 delay-0 duration-100'
              )}
            >
              <Minimize2 className="size-4" />
            </button>
          )}
          {showComposerMini ? (
            <label
              className="block min-h-11 pr-[152px] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:pr-[180px]"
              htmlFor="homepage-prompt"
            >
              <span className="sr-only">{copy.describePrompt}</span>
              <textarea
                id="homepage-prompt"
                rows={1}
                wrap="off"
                onFocus={closeOpenPanel}
                onPointerDown={closeOpenPanel}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={promptPlaceholder}
                className={cn(
                  'h-11 min-h-11 w-full resize-none overflow-hidden !border-0 !bg-transparent py-2.5 text-base leading-6 whitespace-nowrap text-[#f4f2e6] placeholder:text-[#9da291] focus:ring-0 focus:outline-none [&::placeholder]:whitespace-nowrap',
                  promptPreviewVisible && 'truncate'
                )}
              />
            </label>
          ) : (
            <div
              className={cn(
                'transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                isComposer
                  ? 'relative min-h-[7.6rem] pt-1 lg:min-h-[5.75rem] lg:pt-0'
                  : 'grid min-h-[7rem] gap-3 sm:grid-cols-[max-content_1fr]'
              )}
            >
              <div
                aria-hidden={isComposer && !expandedChromeReady}
                className={cn(
                  'flex shrink-0 items-start gap-2 transition-opacity',
                  isComposer && 'absolute top-1 left-0 z-10 overflow-hidden',
                  isComposer &&
                    !composerChromeVisible &&
                    'pointer-events-none opacity-0 delay-0 duration-100',
                  isComposer &&
                    composerChromeVisible &&
                    'opacity-100 delay-100 duration-200'
                )}
                style={
                  isComposer
                    ? {
                        width: composerUploadWidth,
                        maxWidth: composerUploadWidth,
                      }
                    : undefined
                }
              >
                {uploadSlots.map((slot, index) => {
                  const Icon = slot.icon;
                  const asset = localAssetsBySlot[index];
                  return (
                    <div
                      key={`${slot.ariaLabel}-${index}`}
                      className="shrink-0"
                    >
                      <input
                        ref={(node) => {
                          uploadInputRefs.current[index] = node;
                        }}
                        type="file"
                        accept={slot.accept}
                        className="hidden"
                        onChange={(event) =>
                          handleUploadAssetChange(
                            slot,
                            index,
                            event.currentTarget.files?.[0] ?? null
                          )
                        }
                      />
                      <button
                        type="button"
                        aria-label={slot.ariaLabel}
                        onClick={() => openUploadSlot(index)}
                        className={cn(
                          'group flex shrink-0 flex-col items-center gap-1 text-[11px] font-semibold text-[#aeb3a4] transition-colors hover:text-[#3b82f6] focus-visible:ring-2 focus-visible:ring-[#3b82f6]/60 focus-visible:outline-none',
                          !slot.label && 'gap-0'
                        )}
                      >
                        <span
                          className={cn(
                            'relative flex items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-card/42 text-muted-foreground transition-colors group-hover:border-[#3b82f6]/55 group-hover:text-[#3b82f6] dark:border-white/14 dark:bg-white/[0.055]',
                            isComposer ? 'h-[5.25rem] w-[4.5rem]' : 'size-14'
                          )}
                        >
                          {asset ? (
                            asset.mediaType === 'image' ? (
                              <img
                                src={asset.previewUrl}
                                alt=""
                                className={cn(
                                  'absolute inset-0 h-full w-full',
                                  isComposer
                                    ? 'bg-black/28 object-contain p-1'
                                    : 'object-cover'
                                )}
                              />
                            ) : (
                              <video
                                src={asset.previewUrl}
                                muted
                                playsInline
                                className={cn(
                                  'absolute inset-0 h-full w-full',
                                  isComposer
                                    ? 'bg-black/28 object-contain p-1'
                                    : 'object-cover'
                                )}
                              />
                            )
                          ) : null}
                          <span
                            className={cn(
                              'relative z-10 flex size-8 items-center justify-center rounded-lg transition-colors',
                              asset &&
                                'absolute right-1.5 bottom-1.5 size-7 bg-black/58 text-[#3b82f6] backdrop-blur-sm'
                            )}
                          >
                            <Icon className="size-5" />
                          </span>
                        </span>
                        {slot.label && (
                          <span className="max-w-[4.5rem] truncate">
                            {slot.label}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
              <label
                className={cn(
                  'block',
                  isComposer
                    ? 'transition-[padding-left,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'
                    : 'transition-opacity duration-100',
                  isComposer && collapsed && 'opacity-0',
                  isComposer && composerChromeVisible && 'pl-0'
                )}
                style={
                  isComposer && composerChromeVisible
                    ? { paddingLeft: composerUploadOffset }
                    : undefined
                }
                htmlFor="homepage-prompt"
              >
                <span className="sr-only">{copy.describePrompt}</span>
                <textarea
                  id="homepage-prompt"
                  rows={4}
                  onFocus={closeOpenPanel}
                  onPointerDown={closeOpenPanel}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder={promptPlaceholder}
                  className="min-h-[4.75rem] w-full resize-none !border-0 !bg-transparent py-1 text-base text-[#f4f2e6] placeholder:text-[#9da291] focus:ring-0 focus:outline-none"
                />
              </label>
            </div>
          )}

          {controlsExpanded && (
            <div
              aria-hidden={!expandedChromeReady}
              className={cn(
                'scrollbar-hide flex flex-nowrap items-center gap-1.5 overflow-x-auto transition-opacity',
                isComposer
                  ? hasCreationInputContent
                    ? 'absolute right-[288px] bottom-3 left-3 hidden lg:flex'
                    : 'absolute right-[220px] bottom-3 left-3 hidden lg:flex'
                  : 'mt-1 hidden flex-wrap overflow-visible pt-1.5 pr-0 lg:flex lg:w-full',
                expandedChromeReady
                  ? 'opacity-100 delay-100 duration-200'
                  : 'pointer-events-none opacity-0 delay-0 duration-100'
              )}
            >
              <div className="relative shrink-0">
                <span ref={workflowTriggerRef} className="inline-flex w-fit">
                  <ControlButton
                    aria-expanded={openPanel === 'workflow'}
                    aria-haspopup="dialog"
                    onClick={() => toggleOpenPanel('workflow')}
                    className="max-w-[9.5rem] overflow-hidden whitespace-nowrap sm:max-w-none"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <SelectedWorkflowIcon className="hidden size-4 shrink-0 text-muted-foreground lg:block" />
                      <span className="truncate">{selectedWorkflow.title}</span>
                    </span>
                    <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                  </ControlButton>
                </span>
                {renderedPanel === 'workflow' && (
                  <DropdownPanel
                    open={openPanel === 'workflow'}
                    panelRef={floatingPanelRef}
                    portalRootRef={rootRef}
                    triggerRef={activeWorkflowTriggerRef}
                    className="w-[min(360px,calc(100vw-2rem))]"
                  >
                    <p className="px-2 pb-2 text-xs font-semibold text-muted-foreground">
                      {copy.features}
                    </p>
                    <OptionList
                      options={workflows}
                      selectedId={selectedWorkflow.id}
                      getIcon={getWorkflowIcon}
                      onSelect={(id) => {
                        setWorkflowId(id);
                        setOpenPanel(null);
                      }}
                    />
                  </DropdownPanel>
                )}
              </div>
              <div ref={modelTriggerRef} className="relative shrink-0">
                <ControlButton
                  aria-expanded={openPanel === 'model'}
                  aria-haspopup="dialog"
                  onClick={() => toggleOpenPanel('model')}
                  className="max-w-[min(22rem,calc(100vw-12rem))] whitespace-nowrap sm:max-w-[24rem]"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="hidden shrink-0 lg:inline-flex">
                      {mode === 'video' && selectedVideoModel ? (
                        <VideoModelMark model={selectedVideoModel} />
                      ) : mode === 'image' && selectedImageModel ? (
                        <ImageModelMark model={selectedImageModel} />
                      ) : (
                        <ModelMark model={selectedModel} />
                      )}
                    </span>
                    <span className="truncate">{selectedModelSummary}</span>
                    {selectedModelBadge && (
                      <span className="hidden shrink-0 lg:inline-flex">
                        <Badge>{selectedModelBadge}</Badge>
                      </span>
                    )}
                  </span>
                  <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                </ControlButton>
                {renderedPanel === 'model' && (
                  <DropdownPanel
                    open={openPanel === 'model'}
                    panelRef={floatingPanelRef}
                    portalRootRef={rootRef}
                    triggerRef={activeModelTriggerRef}
                    className={cn(
                      'overflow-hidden',
                      mode === 'video'
                        ? 'max-h-[min(560px,calc(100vh-7rem))] w-[min(760px,calc(100vw-3rem))]'
                        : mode === 'image'
                          ? 'max-h-[min(520px,calc(100vh-7rem))] w-[min(680px,calc(100vw-3rem))]'
                          : 'left-0 w-[min(520px,calc(100vw-2rem))]'
                    )}
                  >
                    {mode === 'video' ? (
                      <VideoModelPicker
                        models={availableVideoModels}
                        value={videoModelKey}
                        scene={videoScene}
                        onChange={setVideoModelKey}
                        labels={{
                          model: copy.model,
                          versions: copy.versions,
                        }}
                        className="px-0"
                        panelClassName="max-h-[min(380px,calc(100dvh-10rem))]"
                      />
                    ) : mode === 'image' ? (
                      <ImageModelPicker
                        models={availableImageModels}
                        value={imageModelKey}
                        scene={imageScene}
                        onChange={(id) => {
                          setImageModelKey(id);
                          setOpenPanel(null);
                        }}
                        copy={copy}
                      />
                    ) : (
                      <div className="grid max-h-72 gap-2 overflow-y-auto pr-1 md:grid-cols-2">
                        {models.map((model) => (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => {
                              setModelId(model.id);
                              setOpenPanel(null);
                            }}
                            className={cn(
                              'flex items-start gap-3 rounded-xl p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
                              model.id === selectedModel.id
                                ? 'bg-[#2563eb]/12 text-primary'
                                : 'hover:bg-[#2563eb]/7'
                            )}
                          >
                            <ModelMark model={model} />
                            <span className="min-w-0">
                              <span className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-foreground">
                                {model.title}
                                {model.badge && <Badge>{model.badge}</Badge>}
                              </span>
                              <span className="mt-1 block text-xs text-muted-foreground">
                                {model.description}
                              </span>
                              <span className="mt-2 block text-[11px] text-muted-foreground">
                                {model.credits}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </DropdownPanel>
                )}
              </div>
              <div ref={settingsTriggerRef} className="relative shrink-0">
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={copy.openSettings}
                  aria-expanded={openPanel === 'settings'}
                  aria-haspopup="dialog"
                  onClick={() => toggleOpenPanel('settings')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      toggleOpenPanel('settings');
                    }
                  }}
                  className={cn(
                    controlButtonClass,
                    'w-fit shrink-0 cursor-pointer gap-0 overflow-hidden p-0 whitespace-nowrap hover:border-primary/35 hover:bg-card/82 dark:hover:bg-white/[0.07]'
                  )}
                >
                  {mode === 'video' ? (
                    videoSettingSegments.map((segment, index) => (
                      <span key={segment.label} className="contents">
                        {index > 0 && <span className="h-5 w-px bg-border" />}
                        <SettingsSegment
                          label={segment.label}
                          value={segment.value}
                          icon={segment.icon}
                        />
                      </span>
                    ))
                  ) : mode === 'image' ? (
                    imageSettingSegments.map((segment, index) => (
                      <span key={segment.label} className="contents">
                        {index > 0 && <span className="h-5 w-px bg-border" />}
                        <SettingsSegment
                          label={segment.label}
                          value={segment.value}
                          icon={segment.icon}
                        />
                      </span>
                    ))
                  ) : (
                    <>
                      <SettingsSegment
                        label={copy.settings.videoLength}
                        value={formatVideoSettingValue(duration, 's')}
                        icon={Clock}
                      />
                      <span className="h-5 w-px bg-border" />
                      <SettingsSegment
                        label={copy.settings.resolution}
                        value={resolution}
                        icon={Monitor}
                      />
                      <span className="h-5 w-px bg-border" />
                      <SettingsSegment
                        label={copy.settings.aspectRatio}
                        value={ratio}
                        icon={RectangleHorizontal}
                      />
                    </>
                  )}
                </div>
                {renderedPanel === 'settings' && (
                  <DropdownPanel
                    open={openPanel === 'settings'}
                    panelRef={floatingPanelRef}
                    portalRootRef={rootRef}
                    triggerRef={activeSettingsTriggerRef}
                    className="w-fit max-w-[calc(100vw-2rem)]"
                  >
                    {mode === 'video' ? (
                      <>
                        <VideoDurationOptions
                          options={videoCapabilities?.durationOptions ?? []}
                          range={videoCapabilities?.durationRange}
                          value={duration}
                          onChange={setDuration}
                          label={copy.settings.chooseDuration}
                          compact
                        />
                        <VideoResolutionOptions
                          options={videoCapabilities?.resolutions ?? []}
                          value={resolution}
                          onChange={setResolution}
                          label={copy.settings.resolution}
                          compact
                        />
                        <VideoAspectRatioOptions
                          options={videoCapabilities?.aspectRatios ?? []}
                          value={ratio}
                          onChange={setRatio}
                          label={copy.settings.aspectRatio}
                          compact
                        />
                        <VideoModeOptions
                          options={videoCapabilities?.modes ?? []}
                          value={videoMode}
                          onChange={setVideoMode}
                          label={copy.settings.mode}
                          compact
                        />
                      </>
                    ) : mode === 'image' ? (
                      <ImageSettingControls
                        options={imageSettingOptions}
                        aspectRatio={imageAspectRatio}
                        resolution={imageResolution}
                        quality={imageQuality}
                        outputFormat={imageOutputFormat}
                        outputCount={imageOutputCount}
                        onAspectRatioChange={setImageAspectRatio}
                        onResolutionChange={setImageResolution}
                        onQualityChange={setImageQuality}
                        onOutputFormatChange={setImageOutputFormat}
                        onOutputCountChange={setImageOutputCount}
                        copy={copy}
                      />
                    ) : (
                      <>
                        <SettingsGroup
                          title={copy.settings.videoLength}
                          options={generationSettings.durations}
                          value={duration}
                          onChange={setDuration}
                        />
                        <SettingsGroup
                          title={copy.settings.resolution}
                          options={generationSettings.resolutions}
                          value={resolution}
                          onChange={setResolution}
                        />
                        <SettingsGroup
                          title={copy.settings.aspectRatio}
                          options={generationSettings.ratios}
                          value={ratio}
                          onChange={setRatio}
                        />
                      </>
                    )}
                  </DropdownPanel>
                )}
              </div>
              {!isComposer && hasCreationInputContent && (
                <button
                  data-reset-control
                  type="button"
                  aria-label={copy.clearInput}
                  onClick={resetCreationInput}
                  className="ml-auto hidden size-11 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/[0.06] text-[#d7dcc7] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-[background-color,color,transform] hover:bg-white/[0.1] hover:text-[#3b82f6] focus-visible:ring-2 focus-visible:ring-[#3b82f6]/60 focus-visible:outline-none sm:inline-flex"
                >
                  <Eraser className="size-4" />
                </button>
              )}
              {!isComposer && (
                <button
                  type="submit"
                  aria-label={copy.generateForCredits(
                    Number.isFinite(selectedCredits) ? selectedCredits : 20
                  )}
                  className={cn(
                    'hidden min-h-11 max-w-[164px] min-w-[140px] flex-[0_1_auto] items-center justify-center gap-1.5 rounded-xl border border-[#3b82f6]/42 bg-[#3b82f6] px-3.5 text-[13px] font-bold text-[#111407] shadow-[0_14px_36px_-22px_rgba(234,255,79,0.58)] transition-transform hover:scale-[1.02] hover:bg-[#60a5fa] focus-visible:ring-2 focus-visible:ring-[#3b82f6]/70 focus-visible:outline-none sm:inline-flex dark:shadow-[0_14px_36px_-22px_rgba(234,255,79,0.5)]',
                    !hasCreationInputContent && 'ml-auto'
                  )}
                >
                  <Sparkles className="size-4" />
                  <span>{copy.generate}</span>
                  <span className="text-primary-foreground/75">
                    {Number.isFinite(selectedCredits) ? selectedCredits : 20}
                  </span>
                  <SendHorizontal className="size-4" />
                </button>
              )}
            </div>
          )}
          {controlsExpanded && (
            <div className="absolute inset-x-3 bottom-3 z-20 flex items-center gap-3 lg:hidden">
              <div className="relative flex w-fit max-w-[calc(100%-5.75rem)] min-w-0 shrink items-center overflow-visible rounded-xl">
                <div
                  ref={mobileStepperTrackRef}
                  className={cn(
                    'scrollbar-hide flex w-fit max-w-full min-w-0 items-center gap-1 overflow-x-auto rounded-xl',
                    mobileStepperScrollState.hasOverflow && 'px-7 sm:px-0'
                  )}
                >
                  {!videoOnly && (
                    <button
                      type="button"
                      data-mobile-step="0"
                      onClick={() => {
                        const nextMode = mode === 'video' ? 'image' : 'video';
                        switchMode(nextMode);
                      }}
                      className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg bg-[#2563eb]/16 px-2.5 text-sm font-bold text-[#3b82f6] transition-colors hover:bg-[#2563eb]/20 focus-visible:ring-2 focus-visible:ring-[#3b82f6]/60 focus-visible:outline-none"
                    >
                      <span>{mode === 'video' ? 'Video' : 'Image'}</span>
                      <ChevronDown className="size-3.5" />
                    </button>
                  )}
                  <span
                    ref={compactWorkflowTriggerRef}
                    data-mobile-step="1"
                    className="inline-flex min-w-0 shrink-0"
                  >
                    <button
                      type="button"
                      aria-expanded={openPanel === 'workflow'}
                      aria-haspopup="dialog"
                      onClick={() => {
                        toggleOpenPanel('workflow');
                      }}
                      className={cn(
                        'inline-flex min-h-10 max-w-[11.5rem] items-center gap-1.5 rounded-lg bg-white/[0.045] px-2.5 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-[#3b82f6]/60 focus-visible:outline-none',
                        openPanel === 'workflow'
                          ? 'bg-white/[0.1] text-[#f4f2e6]'
                          : 'text-[#f4f2e6]/82 hover:bg-white/[0.07] hover:text-[#f4f2e6]'
                      )}
                    >
                      <span className="truncate">{selectedWorkflow.title}</span>
                      <ChevronDown className="size-3.5 shrink-0" />
                    </button>
                  </span>
                  <div
                    ref={compactModelTriggerRef}
                    data-mobile-step="2"
                    className="inline-flex min-w-0 shrink-0"
                  >
                    <button
                      type="button"
                      aria-expanded={openPanel === 'model'}
                      aria-haspopup="dialog"
                      onClick={() => {
                        toggleOpenPanel('model');
                      }}
                      className={cn(
                        'inline-flex min-h-10 max-w-[11.5rem] items-center gap-1.5 rounded-lg bg-white/[0.045] px-2.5 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-[#3b82f6]/60 focus-visible:outline-none',
                        openPanel === 'model'
                          ? 'bg-white/[0.1] text-[#f4f2e6]'
                          : 'text-[#f4f2e6]/82 hover:bg-white/[0.07] hover:text-[#f4f2e6]'
                      )}
                    >
                      <span className="truncate">{selectedModelLabel}</span>
                    </button>
                  </div>
                  <div
                    ref={compactSettingsTriggerRef}
                    data-mobile-step="3"
                    className="inline-flex min-w-0 shrink-0"
                  >
                    <button
                      type="button"
                      aria-label={copy.openSettings}
                      aria-expanded={openPanel === 'settings'}
                      aria-haspopup="dialog"
                      onClick={() => {
                        toggleOpenPanel('settings');
                      }}
                      className={cn(
                        'inline-flex min-h-10 max-w-[14rem] items-center gap-0 overflow-hidden rounded-lg bg-white/[0.045] px-2 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-[#3b82f6]/60 focus-visible:outline-none',
                        openPanel === 'settings'
                          ? 'bg-white/[0.1] text-[#f4f2e6]'
                          : 'text-[#f4f2e6]/82 hover:bg-white/[0.07] hover:text-[#f4f2e6]'
                      )}
                    >
                      {mode === 'video'
                        ? videoSettingSegments.map((segment, index) => (
                            <span key={segment.label} className="contents">
                              {index > 0 && (
                                <span className="h-5 w-px bg-white/10" />
                              )}
                              <SettingsSegment
                                label={segment.label}
                                value={segment.value}
                                icon={segment.icon}
                              />
                            </span>
                          ))
                        : imageSettingSegments.map((segment, index) => (
                            <span key={segment.label} className="contents">
                              {index > 0 && (
                                <span className="h-5 w-px bg-white/10" />
                              )}
                              <SettingsSegment
                                label={segment.label}
                                value={segment.value}
                                icon={segment.icon}
                              />
                            </span>
                          ))}
                    </button>
                  </div>
                </div>
                {mobileStepperScrollState.canScrollLeft && (
                  <button
                    type="button"
                    aria-label="Scroll settings left"
                    onClick={() => scrollMobileStepperTrack(-1)}
                    className="absolute top-1/2 left-0 z-10 inline-flex h-10 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border border-white/8 bg-[#2a2d29]/88 text-[#f4f2e6]/82 shadow-[0_10px_22px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-colors hover:bg-[#343832]/92 hover:text-[#f4f2e6] focus-visible:ring-2 focus-visible:ring-[#3b82f6]/60 focus-visible:outline-none sm:hidden"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                )}
                {mobileStepperScrollState.canScrollRight && (
                  <button
                    type="button"
                    aria-label="Scroll settings right"
                    onClick={() => scrollMobileStepperTrack(1)}
                    className="absolute top-1/2 right-0 z-10 inline-flex h-10 w-6 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border border-white/8 bg-[#2a2d29]/88 text-[#f4f2e6]/82 shadow-[0_10px_22px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-colors hover:bg-[#343832]/92 hover:text-[#f4f2e6] focus-visible:ring-2 focus-visible:ring-[#3b82f6]/60 focus-visible:outline-none sm:hidden"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                aria-label={copy.generateForCredits(
                  Number.isFinite(selectedCredits) ? selectedCredits : 20
                )}
                className="ml-auto inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#3b82f6]/42 bg-[#3b82f6] px-3.5 text-[13px] font-black text-[#111407] shadow-[0_14px_36px_-22px_rgba(234,255,79,0.58)] transition-transform hover:scale-[1.02] hover:bg-[#60a5fa] focus-visible:ring-2 focus-visible:ring-[#3b82f6]/70 focus-visible:outline-none"
              >
                <span>
                  {Number.isFinite(selectedCredits) ? selectedCredits : 20}
                </span>
                <Sparkles className="size-4" />
              </button>
            </div>
          )}
          {!isComposer && hasCreationInputContent && (
            <button
              data-reset-control
              type="button"
              aria-label={copy.clearInput}
              onClick={resetCreationInput}
              className="absolute right-[160px] bottom-4 hidden size-11 items-center justify-center rounded-xl border border-white/12 bg-white/[0.06] text-[#d7dcc7] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-[background-color,color,transform] hover:bg-white/[0.1] hover:text-[#3b82f6] focus-visible:ring-2 focus-visible:ring-[#3b82f6]/60 focus-visible:outline-none"
            >
              <Eraser className="size-4" />
            </button>
          )}
          <button
            data-mini-submit={isComposer ? true : undefined}
            type="submit"
            aria-label={
              isComposer && collapsed
                ? copy.generate
                : copy.generateForCredits(
                    Number.isFinite(selectedCredits) ? selectedCredits : 20
                  )
            }
            className={cn(
              'absolute inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[#3b82f6]/42 bg-[#3b82f6] px-4 text-[13px] font-bold text-[#111407] shadow-[0_14px_36px_-22px_rgba(234,255,79,0.58)] hover:scale-[1.02] hover:bg-[#60a5fa] focus-visible:ring-2 focus-visible:ring-[#3b82f6]/70 focus-visible:outline-none dark:shadow-[0_14px_36px_-22px_rgba(234,255,79,0.5)]',
              isComposer
                ? cn(
                    'bottom-3 z-20 justify-center transition-[right,min-width,transform]',
                    'right-3',
                    collapsed
                      ? 'min-w-[136px] sm:min-w-[164px]'
                      : 'hidden w-[140px] lg:inline-flex lg:w-[212px]'
                  )
                : 'right-4 bottom-4 transition-[opacity,transform]',
              !isComposer &&
                (expandedChromeReady || showComposerMini) &&
                'sm:pointer-events-none sm:opacity-0',
              !isComposer &&
                'pointer-events-none opacity-0 sm:pointer-events-auto',
              !isComposer && showComposerMini && 'pointer-events-none opacity-0'
            )}
          >
            <Sparkles className="size-4" />
            {copy.generate}
            <span
              className={cn(
                'overflow-hidden text-[#111407]/72 transition-[max-width,opacity] duration-200',
                isComposer && collapsed
                  ? 'max-w-0 opacity-0'
                  : 'max-w-8 opacity-100'
              )}
            >
              {Number.isFinite(selectedCredits) ? selectedCredits : 20}
            </span>
            {(!isComposer || !collapsed) && (
              <SendHorizontal className="size-4" />
            )}
          </button>
          {isComposer && controlsExpanded && hasCreationInputContent && (
            <button
              data-reset-control
              type="button"
              aria-label={copy.clearInput}
              onClick={resetCreationInput}
              className={cn(
                'absolute right-[232px] bottom-3 z-20 hidden size-11 items-center justify-center rounded-xl border border-white/12 bg-white/[0.06] text-[#d7dcc7] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-[opacity,background-color,color,transform] hover:bg-white/[0.1] hover:text-[#3b82f6] focus-visible:ring-2 focus-visible:ring-[#3b82f6]/60 focus-visible:outline-none lg:inline-flex',
                expandedChromeReady
                  ? 'opacity-100 delay-100 duration-200'
                  : 'pointer-events-none opacity-0 delay-0 duration-100'
              )}
            >
              <Eraser className="size-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

function ModeSwitch({
  mode,
  onChange,
  copy,
}: {
  mode: GenerationMode;
  onChange: (mode: GenerationMode) => void;
  copy: HeroCreationFormCopy;
}) {
  return (
    <div
      role="group"
      aria-label={copy.modeAriaLabel}
      className="relative mx-auto mb-4 flex w-full max-w-[520px] items-end justify-center gap-2.5 text-muted-foreground sm:gap-3"
    >
      {visibleModeOptions.map((item) => {
        const active = item.id === mode;
        const Icon = modeIcons[item.id];
        const primary = item.id === 'video';
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative z-10 inline-flex shrink-0 items-center justify-start overflow-hidden border font-bold whitespace-nowrap backdrop-blur-xl transition-[background-color,border-color,box-shadow,color,opacity] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
              primary
                ? 'h-[62px] min-w-[146px] gap-2 rounded-[1.75rem_1.15rem_1.15rem_1.75rem] px-5 pr-7 text-base sm:h-[74px] sm:min-w-[252px] sm:gap-4 sm:px-6 sm:pr-9'
                : 'h-11 min-w-[94px] gap-2 rounded-[1.05rem_1.6rem_1.6rem_1.05rem] px-4 text-sm sm:h-14 sm:min-w-[156px] sm:px-5',
              active
                ? 'border-[#3b82f6] bg-[#2563eb] text-[#0f1308] shadow-[inset_0_0_0_1px_rgba(17,20,7,0.14),0_18px_48px_rgba(216,242,105,0.18)]'
                : 'border-white/14 bg-[#151811]/86 text-[#d4dac5] shadow-[inset_0_1px_0_rgba(255,255,255,0.09)] hover:border-[#2563eb]/48 hover:bg-[#222719]/90 hover:text-[#3b82f6]'
            )}
          >
            <span
              className={cn(
                'relative z-10 hidden shrink-0 place-items-center border sm:inline-grid',
                primary
                  ? 'size-9 rounded-[0.9rem] sm:size-10'
                  : 'size-7 rounded-[0.7rem] sm:size-8',
                active
                  ? 'border-[#0f1308]/16 bg-[#0f1308] text-[#3b82f6]'
                  : 'border-white/14 bg-white/[0.055] text-current'
              )}
            >
              <Icon className={cn(primary ? 'size-5' : 'size-4')} />
            </span>
            <span className="relative z-10">{item.title}</span>
            {active && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-2 right-2 w-7 rounded-[0.85rem] bg-[#0f1308]/10 opacity-80 [clip-path:polygon(38%_0,100%_0,62%_100%,0_100%)]"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function ModeRail({
  mode,
  onChange,
  copy,
  collapsed = false,
  visible = true,
  className,
}: {
  mode: GenerationMode;
  onChange: (mode: GenerationMode) => void;
  copy: HeroCreationFormCopy;
  collapsed?: boolean;
  visible?: boolean;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={copy.modeAriaLabel}
      aria-hidden={!visible}
      className={cn(
        'relative flex shrink-0 flex-col items-center gap-2 overflow-hidden text-muted-foreground transition-opacity',
        collapsed ? 'w-0 sm:w-0' : 'w-[52px] sm:w-[58px]',
        visible
          ? 'opacity-100 delay-100 duration-200'
          : 'pointer-events-none opacity-0 delay-0 duration-100',
        className
      )}
    >
      {visibleModeOptions.map((item) => {
        const active = item.id === mode;
        const Icon = modeIcons[item.id];
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative z-10 inline-flex min-h-12 w-full items-center justify-center overflow-hidden rounded-2xl border text-base font-bold backdrop-blur-2xl transition-[background-color,color,border-color,box-shadow] focus-visible:ring-2 focus-visible:ring-[#3b82f6]/70 focus-visible:outline-none',
              active
                ? 'border-[#3b82f6]/72 bg-[#2563eb] text-[#111407] shadow-[0_0_0_1px_rgba(234,255,79,0.24),0_14px_34px_rgba(216,242,105,0.24)]'
                : 'border-[#2563eb]/22 bg-[#11130f]/82 text-[#c8cbb9] shadow-[0_10px_28px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-[#2563eb]/42 hover:bg-[#1b1f15]/92 hover:text-[#3b82f6]'
            )}
          >
            <Icon className="size-5" />
            <span className="sr-only">{item.title}</span>
          </button>
        );
      })}
    </div>
  );
}

function ControlButton({
  children,
  onClick,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(controlButtonClass, className)}
      {...props}
    >
      {children}
    </button>
  );
}

function DropdownPanel({
  children,
  className,
  open,
  panelRef,
  portalRootRef,
  triggerRef,
}: {
  children: ReactNode;
  className?: string;
  open: boolean;
  panelRef?: RefObject<HTMLDivElement | null>;
  portalRootRef: RefObject<HTMLElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
}) {
  const internalPanelRef = useRef<HTMLDivElement | null>(null);
  const [placement, setPlacement] = useState<FloatingPlacement | null>(null);

  const setPanelRefs = (node: HTMLDivElement | null) => {
    internalPanelRef.current = node;
    if (panelRef) panelRef.current = node;
  };

  useLayoutEffect(() => {
    if (!open || typeof window === 'undefined') return;

    const updatePlacement = () => {
      const trigger = triggerRef.current;
      const panel = internalPanelRef.current;
      const portalRoot = portalRootRef.current;
      if (!trigger || !panel || !portalRoot) return;

      const rootRect = portalRoot.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();

      setPlacement(
        getFloatingPanelPlacement({
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          rootRect,
          triggerRect,
          panelRect,
        })
      );
    };

    updatePlacement();
    const rafId = window.requestAnimationFrame(updatePlacement);
    window.addEventListener('resize', updatePlacement);
    window.addEventListener('scroll', updatePlacement, true);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updatePlacement);
      window.removeEventListener('scroll', updatePlacement, true);
    };
  }, [open, portalRootRef, triggerRef]);

  const panelStyle: CSSProperties = placement
    ? {
        left: placement.left,
        top: placement.top,
        maxHeight: placement.maxHeight,
        transformOrigin: placement.origin,
      }
    : {
        left: -9999,
        top: -9999,
      };

  const panel = (
    <div
      ref={setPanelRefs}
      role="dialog"
      aria-hidden={!open}
      data-open={open}
      style={panelStyle}
      onWheel={(event) => event.stopPropagation()}
      className={cn(
        'absolute z-[90] max-h-[min(560px,calc(100vh-7rem))] overflow-x-hidden overflow-y-auto overscroll-contain rounded-2xl border border-[#2563eb]/18 bg-[#10120d]/96 p-3 text-[#f4f2e6] shadow-[0_30px_110px_rgba(0,0,0,0.58),0_0_42px_rgba(216,242,105,0.08)] backdrop-blur-xl backdrop-saturate-125 transition-[opacity,transform] duration-200 ease-out data-[open=false]:pointer-events-none data-[open=false]:translate-y-1 data-[open=false]:scale-[0.98] data-[open=false]:opacity-0 data-[open=true]:translate-y-0 data-[open=true]:scale-100 data-[open=true]:opacity-100',
        className
      )}
    >
      {children}
    </div>
  );

  if (typeof document !== 'undefined' && portalRootRef.current) {
    return createPortal(panel, portalRootRef.current);
  }

  return null;
}

function OptionList({
  options,
  selectedId,
  getIcon,
  onSelect,
}: {
  options: WorkflowOption[];
  selectedId: string;
  getIcon: (id: string) => IconComponent;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-1">
      {options.map((option) => {
        const Icon = getIcon(option.id);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={cn(
              'flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
              option.id === selectedId
                ? 'bg-[#2563eb]/12 text-primary'
                : 'hover:bg-[#2563eb]/7'
            )}
          >
            <Icon className="hidden size-4 shrink-0 sm:block" />
            <span className="truncate text-sm font-semibold text-foreground">
              {option.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ImageModelPicker({
  models,
  value,
  scene,
  onChange,
  copy,
}: {
  models: ImageModelConfig[];
  value: string;
  scene: ImageGeneratorScene;
  onChange: (id: string) => void;
  copy: HeroCreationFormCopy;
}) {
  const families = useMemo(() => groupImageModelsByFamily(models), [models]);
  const selectedModel = models.find((model) => model.id === value) ?? null;
  const selectedFamilyId =
    selectedModel && groupImageModelsByFamily([selectedModel])[0]?.id;
  const fallbackFamilyId = families[0]?.id ?? '';
  const [viewedFamilyId, setViewedFamilyId] = useState(
    selectedFamilyId ?? fallbackFamilyId
  );
  const activeFamilyId =
    families.find((family) => family.id === viewedFamilyId)?.id ??
    selectedFamilyId ??
    fallbackFamilyId;
  const selectedFamily =
    families.find((family) => family.id === activeFamilyId) ?? families[0];

  useEffect(() => {
    setViewedFamilyId(selectedFamilyId ?? fallbackFamilyId);
  }, [fallbackFamilyId, selectedFamilyId]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-2 text-sm font-semibold text-[#c8cbb9]">
        <ImageIcon className="hidden h-4 w-4 sm:block" />
        <span>{copy.model}</span>
      </div>
      <div className="grid min-h-[240px] grid-cols-[minmax(108px,0.82fr)_minmax(0,1.55fr)] overflow-hidden bg-transparent">
        <div className="max-h-[min(360px,calc(100dvh-12rem))] overflow-y-auto border-r border-[#2563eb]/14 p-1 pr-1.5">
          {families.map((family) => {
            const active = family.id === selectedFamilyId;
            const availableCount = family.models.filter((model) =>
              model.scenes.includes(scene)
            ).length;

            return (
              <button
                key={family.id}
                type="button"
                onClick={() => setViewedFamilyId(family.id)}
                disabled={availableCount === 0}
                className={cn(
                  'mb-0.5 flex min-h-10 w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none sm:gap-2 sm:px-2.5',
                  family.id === activeFamilyId
                    ? 'bg-[#2563eb]/10 text-[#f4f2e6]'
                    : 'text-[#c8cbb9]/80 hover:bg-[#2563eb]/7 hover:text-[#f4f2e6]',
                  active &&
                    'text-primary shadow-[inset_3px_0_0_var(--primary)]',
                  availableCount === 0 && 'cursor-not-allowed opacity-40'
                )}
              >
                <ImageModelLogo
                  icon={family.icon}
                  iconSrc={family.iconSrc}
                  label={family.label}
                  className="hidden h-7 w-7 sm:flex"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] leading-tight font-semibold">
                    {family.label}
                  </span>
                  <span className="block text-[11px] leading-tight text-muted-foreground">
                    {copy.versions(availableCount)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="max-h-[min(360px,calc(100dvh-12rem))] overflow-y-auto p-1.5">
          {selectedFamily?.models
            .filter((model) => model.scenes.includes(scene))
            .map((model) => {
              const active = model.id === value;
              const credits = getImageModelCreditCost({ model, scene });
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    setViewedFamilyId(
                      groupImageModelsByFamily([model])[0]?.id ?? activeFamilyId
                    );
                    onChange(model.id);
                  }}
                  className={cn(
                    'mb-1 flex min-h-16 w-full gap-2 rounded-lg border p-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none sm:gap-2.5',
                    active
                      ? 'border-[#2563eb]/34 bg-[#2563eb]/10'
                      : 'border-[#2563eb]/10 bg-transparent hover:bg-[#2563eb]/7'
                  )}
                >
                  <ImageModelMark
                    model={model}
                    className="hidden h-8 w-8 text-xs sm:flex"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-semibold text-foreground">
                        {model.label}
                      </span>
                      {(model.badges ?? (model.badge ? [model.badge] : []))
                        .slice(0, 2)
                        .map((badge) => (
                          <Badge key={badge}>{badge}</Badge>
                        ))}
                    </span>
                    {model.description && (
                      <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">
                        {model.description}
                      </span>
                    )}
                    <span className="mt-1 block text-[11px] font-semibold text-[#2563eb]/82">
                      {formatPublicModelMeta({
                        credits,
                        provider: model.provider,
                      })}
                    </span>
                  </span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function ImageSettingControls({
  options,
  aspectRatio,
  resolution,
  quality,
  outputFormat,
  outputCount,
  onAspectRatioChange,
  onResolutionChange,
  onQualityChange,
  onOutputFormatChange,
  onOutputCountChange,
  copy,
}: {
  options: ImageSettingOptions;
  aspectRatio: string;
  resolution: string;
  quality: string;
  outputFormat: string;
  outputCount: string;
  onAspectRatioChange: (value: string) => void;
  onResolutionChange: (value: string) => void;
  onQualityChange: (value: string) => void;
  onOutputFormatChange: (value: string) => void;
  onOutputCountChange: (value: string) => void;
  copy: HeroCreationFormCopy;
}) {
  return (
    <>
      <VideoOptionGroup
        label={copy.settings.aspectRatio}
        icon={<RectangleHorizontal className="h-4 w-4" />}
        options={options.aspectRatios}
        value={aspectRatio}
        onChange={onAspectRatioChange}
        compact
      />
      <VideoOptionGroup
        label={copy.settings.resolution}
        icon={<Monitor className="h-4 w-4" />}
        options={options.resolutions}
        value={resolution}
        onChange={onResolutionChange}
        compact
      />
      <VideoOptionGroup
        label={copy.settings.quality}
        icon={<Sparkles className="h-4 w-4" />}
        options={options.qualities}
        value={quality}
        onChange={onQualityChange}
        compact
      />
      <VideoOptionGroup
        label={copy.settings.format}
        icon={<FileText className="h-4 w-4" />}
        options={options.outputFormats}
        value={outputFormat}
        onChange={onOutputFormatChange}
        compact
      />
      <VideoOptionGroup
        label={copy.settings.outputCount}
        icon={<CopyPlus className="h-4 w-4" />}
        options={IMAGE_OUTPUT_COUNT_OPTIONS}
        value={outputCount}
        onChange={onOutputCountChange}
        compact
      />
    </>
  );
}

function SettingsGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2 py-2 first:pt-0 last:pb-0">
      <p className="text-xs font-semibold text-[#c8cbb9]">{title}</p>
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-[#2563eb]/12 bg-[#2563eb]/7 p-1 sm:grid-cols-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              'min-h-10 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
              option === value
                ? 'bg-[#2563eb] text-[#10120d] shadow-sm shadow-[#2563eb]/20'
                : 'text-[#c8cbb9]/80 hover:bg-[#2563eb]/8 hover:text-[#f4f2e6]'
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function ModelMark({ model }: { model: ModelOption }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#030502] text-[11px] font-black text-[#2563eb] ring-1 ring-white/10">
      {model.provider.charAt(0)}
    </span>
  );
}

function ModelLogo({
  icon,
  iconSrc,
  label,
  className,
}: {
  icon?: string;
  iconSrc?: string;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#030502] text-[10px] font-black text-[#2563eb] ring-1 ring-white/10',
        className
      )}
    >
      {iconSrc ? (
        <img
          src={iconSrc}
          alt=""
          className="h-5 w-5 object-contain"
          loading="lazy"
          decoding="async"
        />
      ) : (
        icon || label.slice(0, 2)
      )}
    </span>
  );
}

function VideoModelMark({ model }: { model: VideoModelConfig }) {
  return (
    <ModelLogo
      icon={model.icon}
      iconSrc={getVideoModelIconSrc(model)}
      label={model.familyLabel}
    />
  );
}

function ImageModelLogo({
  icon,
  iconSrc,
  label,
  className,
}: {
  icon?: string;
  iconSrc?: string;
  label: string;
  className?: string;
}) {
  return (
    <ModelLogo
      icon={icon}
      iconSrc={iconSrc}
      label={label}
      className={className}
    />
  );
}

function ImageModelMark({
  model,
  className,
}: {
  model: ImageModelConfig;
  className?: string;
}) {
  return (
    <ImageModelLogo
      icon={model.icon}
      iconSrc={getImageModelIconSrc(model)}
      label={model.label}
      className={className}
    />
  );
}

function SettingsSegment({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: IconComponent;
}) {
  return (
    <span
      aria-label={label}
      className="inline-flex min-h-11 shrink-0 items-center gap-1 px-2 text-[13px] font-semibold text-foreground"
    >
      <Icon className="hidden size-4 text-muted-foreground lg:block" />
      <span>{value}</span>
    </span>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-primary/14 px-1.5 py-0.5 text-[10px] font-bold text-primary">
      {children}
    </span>
  );
}
