import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import Download from 'lucide-react/dist/esm/icons/download';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import User from 'lucide-react/dist/esm/icons/user';
import Video from 'lucide-react/dist/esm/icons/video';
import Volume2 from 'lucide-react/dist/esm/icons/volume-2';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useTranslations } from '@/core/i18n/hooks';
import { Link } from '@/core/i18n/navigation';

import {
  DEFAULT_VIDEO_MODEL_CATALOG,
  getVideoModelCreditCost,
} from '@/config/ai-video-models';
import type {
  VideoGeneratorScene,
  VideoModelConfig,
} from '@/config/ai-video-models';

import { AIMediaType, AITaskStatus } from '@/extensions/ai/types';

import { UpgradePaywallDialog } from '@/components/blocks/pricing/upgrade-paywall-dialog';
import { useUpgradePaywall } from '@/components/blocks/pricing/use-upgrade-paywall';
import {
  ImageUploader,
  ImageUploaderValue,
} from '@/components/features/ai-generator/components/image-uploader';
import {
  EMPTY_SEEDANCE_REFERENCE_MEDIA,
  getSeedanceReferenceItems,
  getUploadedSeedanceReferenceOptions,
} from '@/components/features/ai-generator/components/seedance-reference-media';
import type { SeedanceReferenceMedia } from '@/components/features/ai-generator/components/seedance-reference-media';
import { SeedanceReferencePanel } from '@/components/features/ai-generator/components/seedance-reference-panel';
import {
  DEFAULT_VIDEO_MODEL_ID,
  getDefaultVideoModelIdForScene,
  VideoAspectRatioOptions,
  VideoDurationOptions,
  VideoModeOptions,
  VideoModelPicker,
  VideoResolutionOptions,
} from '@/components/features/ai-generator/components/video-model-controls';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/hooks/use-app-context';
import { getSafeDownloadFilename } from '@/lib/download-filename';
import { cn } from '@/lib/utils';

interface VideoGeneratorProps {
  maxSizeMB?: number;
  srOnlyTitle?: string;
}

interface GeneratedVideo {
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

type VideoGeneratorTab = VideoGeneratorScene;
type IncomingVideoPromptPayload = {
  prompt: string;
  tab?: VideoGeneratorTab;
  modelKey?: string;
  settings?: {
    duration?: string;
    aspectRatio?: string;
    resolution?: string;
    mode?: string;
    sound?: boolean;
  };
};

const POLL_INTERVAL = 15000;
const GENERATION_TIMEOUT = 600000; // 10 minutes for video
const MAX_PROMPT_LENGTH = 2000;
const PROMPT_EVENT_NAME = 'lusee-video:prompt-selected';
const PROMPT_STORAGE_KEY = 'lusee-video:selected-prompt';

function isVideoGeneratorTab(value: unknown): value is VideoGeneratorTab {
  return (
    value === 'text-to-video' ||
    value === 'image-to-video' ||
    value === 'video-to-video'
  );
}

function parseIncomingVideoPromptPayload(
  value: string
): IncomingVideoPromptPayload | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (parsed && typeof parsed === 'object') {
      const source = parsed as IncomingVideoPromptPayload;
      if (typeof source.prompt === 'string' && source.prompt.trim()) {
        return source;
      }
    }
  } catch {
    // Older callers may store plain text only.
  }

  return { prompt: trimmed };
}

function parseTaskResult(taskResult: string | null): any {
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

function extractVideoUrls(result: any): string[] {
  if (!result) {
    return [];
  }

  // check videos array first
  const videos = result.videos;
  if (videos && Array.isArray(videos)) {
    return videos
      .map((item: any) => {
        if (!item) return null;
        if (typeof item === 'string') return item;
        if (typeof item === 'object') {
          return (
            item.url ?? item.uri ?? item.video ?? item.src ?? item.videoUrl
          );
        }
        return null;
      })
      .filter(Boolean);
  }

  // check output
  const output = result.output ?? result.video ?? result.data;

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
        if (typeof item === 'object') {
          const candidate =
            item.url ?? item.uri ?? item.video ?? item.src ?? item.videoUrl;
          return typeof candidate === 'string' ? [candidate] : [];
        }
        return [];
      })
      .filter(Boolean);
  }

  if (typeof output === 'object') {
    const candidate =
      output.url ?? output.uri ?? output.video ?? output.src ?? output.videoUrl;
    if (typeof candidate === 'string') {
      return [candidate];
    }
  }

  return [];
}

export function VideoGenerator({
  maxSizeMB = 50,
  srOnlyTitle,
}: VideoGeneratorProps) {
  const t = useTranslations('ai.video.generator');

  const [activeTab, setActiveTab] =
    useState<VideoGeneratorTab>('text-to-video');

  const [videoModels, setVideoModels] = useState<VideoModelConfig[]>(
    DEFAULT_VIDEO_MODEL_CATALOG
  );
  const [modelKey, setModelKey] = useState(DEFAULT_VIDEO_MODEL_ID);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [duration, setDuration] = useState('5');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('1080p');
  const [mode, setMode] = useState('pro');
  const [sound, setSound] = useState(true);
  const [referenceImageItems, setReferenceImageItems] = useState<
    ImageUploaderValue[]
  >([]);
  const [referenceImageUrls, setReferenceImageUrls] = useState<string[]>([]);
  const [referenceVideoUrl, setReferenceVideoUrl] = useState<string>('');
  const [seedanceReferenceMedia, setSeedanceReferenceMedia] =
    useState<SeedanceReferenceMedia>(EMPTY_SEEDANCE_REFERENCE_MEDIA);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(
    null
  );
  const [taskStatus, setTaskStatus] = useState<AITaskStatus | null>(null);
  const [downloadingVideoId, setDownloadingVideoId] = useState<string | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);
  const [canUseVideo, setCanUseVideo] = useState(false);
  const { closeUpgradePaywall, requestUpgrade, upgradeReason } =
    useUpgradePaywall();
  const hasIncomingModelRef = useRef(false);
  const hasIncomingSettingsRef = useRef(false);
  const activeTabRef = useRef<VideoGeneratorTab>('text-to-video');

  const { user, isCheckSign, setIsShowSignModal, fetchUserCredits } =
    useAppContext();

  const applyIncomingPrompt = useCallback(
    (payload: IncomingVideoPromptPayload) => {
      const normalizedPrompt = payload.prompt.trim();
      if (!normalizedPrompt) {
        return;
      }

      const nextTab = isVideoGeneratorTab(payload.tab)
        ? payload.tab
        : 'text-to-video';
      const settings = payload.settings ?? {};
      hasIncomingSettingsRef.current = Object.keys(settings).length > 0;

      setPrompt(normalizedPrompt);
      setActiveTab(nextTab);
      activeTabRef.current = nextTab;

      if (payload.modelKey) {
        hasIncomingModelRef.current = true;
        setModelKey(payload.modelKey);
      } else {
        hasIncomingModelRef.current = false;
        setModelKey(getDefaultVideoModelIdForScene(nextTab, videoModels));
      }

      if (typeof settings.duration === 'string') {
        setDuration(settings.duration);
      }
      if (typeof settings.aspectRatio === 'string') {
        setAspectRatio(settings.aspectRatio);
      }
      if (typeof settings.resolution === 'string') {
        setResolution(settings.resolution);
      }
      if (typeof settings.mode === 'string') {
        setMode(settings.mode);
      }
      if (typeof settings.sound === 'boolean') {
        setSound(settings.sound);
      }
    },
    [videoModels]
  );

  useEffect(() => {
    setIsMounted(true);
    import('@/server/ai.functions')
      .then(({ getVideoModelCatalogFn }) => getVideoModelCatalogFn())
      .then((catalog) => {
        const nextModels =
          catalog.models.length > 0
            ? catalog.models
            : DEFAULT_VIDEO_MODEL_CATALOG;
        setVideoModels(nextModels);
        if (!hasIncomingModelRef.current) {
          setModelKey(
            getDefaultVideoModelIdForScene(activeTabRef.current, nextModels)
          );
        }
      })
      .catch(console.error);

    if (user) {
      fetchUserCredits();
    }
  }, [user, fetchUserCredits]);

  useEffect(() => {
    if (!user?.id) {
      setCanUseVideo(false);
      return;
    }

    let cancelled = false;
    import('@/server/ai.functions')
      .then(({ getAIEntitlementsFn }) => getAIEntitlementsFn())
      .then((entitlements) => {
        if (!cancelled) setCanUseVideo(!!entitlements.canUseVideo);
      })
      .catch((error) => {
        console.error('Failed to load video entitlements:', error);
        if (!cancelled) setCanUseVideo(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedPrompt = window.sessionStorage.getItem(PROMPT_STORAGE_KEY);
    const storedPayload = storedPrompt
      ? parseIncomingVideoPromptPayload(storedPrompt)
      : null;
    if (storedPayload) {
      applyIncomingPrompt(storedPayload);
      window.sessionStorage.removeItem(PROMPT_STORAGE_KEY);
    }

    const handlePromptSelected = (event: Event) => {
      const detail = (event as CustomEvent<IncomingVideoPromptPayload>).detail;
      if (detail && typeof detail.prompt === 'string') {
        applyIncomingPrompt(detail);
      }
    };

    window.addEventListener(PROMPT_EVENT_NAME, handlePromptSelected);
    return () => {
      window.removeEventListener(PROMPT_EVENT_NAME, handlePromptSelected);
    };
  }, [applyIncomingPrompt]);

  const availableModels = useMemo(() => {
    return videoModels.filter(
      (option) => option.enabled && option.scenes.includes(activeTab)
    );
  }, [activeTab, videoModels]);

  const selectedModelOption =
    availableModels.find((option) => option.id === modelKey) ?? null;

  const costCredits = selectedModelOption
    ? getVideoModelCreditCost({
        model: selectedModelOption,
        scene: activeTab,
        duration,
      })
    : 0;

  useEffect(() => {
    if (
      availableModels.length > 0 &&
      (!modelKey || !availableModels.find((m) => m.id === modelKey))
    ) {
      setModelKey(availableModels[0].id);
    }
  }, [availableModels, modelKey]);

  useEffect(() => {
    if (!selectedModelOption?.defaults) {
      return;
    }

    if (hasIncomingSettingsRef.current) {
      hasIncomingSettingsRef.current = false;
      return;
    }

    const defaults = selectedModelOption.defaults;
    if (defaults.duration) setDuration(defaults.duration);
    if (defaults.aspectRatio) setAspectRatio(defaults.aspectRatio);
    if (defaults.resolution) setResolution(defaults.resolution);
    if (defaults.mode) setMode(defaults.mode);
    if (typeof defaults.sound === 'boolean') setSound(defaults.sound);
  }, [selectedModelOption?.id]);

  const promptLength = prompt.trim().length;
  const remainingCredits = user?.credits?.remainingCredits ?? 0;
  const isPromptTooLong = promptLength > MAX_PROMPT_LENGTH;
  const isTextToVideoMode = activeTab === 'text-to-video';
  const isImageToVideoMode = activeTab === 'image-to-video';
  const isVideoToVideoMode = activeTab === 'video-to-video';
  const capabilities = selectedModelOption?.capabilities;
  const isSeedance2Model =
    selectedModelOption?.model === 'bytedance/seedance-2';
  const seedanceReferenceItems = useMemo(
    () => getSeedanceReferenceItems(seedanceReferenceMedia),
    [seedanceReferenceMedia]
  );
  const isSeedanceReferenceUploading = seedanceReferenceItems.some(
    (item) => item.status === 'uploading'
  );
  const hasSeedanceReferenceUploadError = seedanceReferenceItems.some(
    (item) => item.status === 'error'
  );

  const handleTabChange = (value: string) => {
    const tab = value as VideoGeneratorTab;
    setActiveTab(tab);
    activeTabRef.current = tab;
    hasIncomingModelRef.current = false;
    setModelKey(getDefaultVideoModelIdForScene(tab, videoModels));
  };

  const taskStatusLabel = useMemo(() => {
    if (!taskStatus) {
      return '';
    }

    switch (taskStatus) {
      case AITaskStatus.PENDING:
        return 'Waiting for the model to start';
      case AITaskStatus.PROCESSING:
        return 'Generating your video...';
      case AITaskStatus.SUCCESS:
        return 'Video generation completed';
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

  const isReferenceUploading = useMemo(
    () => referenceImageItems.some((item) => item.status === 'uploading'),
    [referenceImageItems]
  );

  const hasReferenceUploadError = useMemo(
    () => referenceImageItems.some((item) => item.status === 'error'),
    [referenceImageItems]
  );

  const resetTaskState = useCallback(() => {
    setIsGenerating(false);
    setProgress(0);
    setTaskId(null);
    setGenerationStartTime(null);
    setTaskStatus(null);
  }, []);

  const pollTaskStatus = useCallback(
    async (id: string) => {
      try {
        if (
          generationStartTime &&
          Date.now() - generationStartTime > GENERATION_TIMEOUT
        ) {
          resetTaskState();
          toast.error('Video generation timed out. Please try again.');
          return true;
        }

        const { aiQueryFn } = await import('@/server/ai.functions');
        const resp = await aiQueryFn({ data: { taskId: id } });

        const task = resp as BackendTask;
        const currentStatus = task.status as AITaskStatus;
        setTaskStatus(currentStatus);

        const parsedResult = parseTaskResult(task.taskInfo);
        const videoUrls = extractVideoUrls(parsedResult);

        if (currentStatus === AITaskStatus.PENDING) {
          setProgress((prev) => Math.max(prev, 20));
          return false;
        }

        if (currentStatus === AITaskStatus.PROCESSING) {
          if (videoUrls.length > 0) {
            setGeneratedVideos(
              videoUrls.map((url, index) => ({
                id: `${task.id}-${index}`,
                url,
                provider: task.provider,
                model: task.model,
                prompt: task.prompt ?? undefined,
              }))
            );
            setProgress((prev) => Math.max(prev, 85));
          } else {
            setProgress((prev) => Math.min(prev + 5, 80));
          }
          return false;
        }

        if (currentStatus === AITaskStatus.SUCCESS) {
          if (videoUrls.length === 0) {
            toast.error('The provider returned no videos. Please retry.');
          } else {
            setGeneratedVideos(
              videoUrls.map((url, index) => ({
                id: `${task.id}-${index}`,
                url,
                provider: task.provider,
                model: task.model,
                prompt: task.prompt ?? undefined,
              }))
            );
            toast.success('Video generated successfully');
          }

          setProgress(100);
          resetTaskState();
          return true;
        }

        if (currentStatus === AITaskStatus.FAILED) {
          const errorMessage =
            parsedResult?.errorMessage || 'Generate video failed';
          toast.error(errorMessage);
          resetTaskState();

          fetchUserCredits();

          return true;
        }

        setProgress((prev) => Math.min(prev + 3, 95));
        return false;
      } catch (error: any) {
        console.error('Error polling video task:', error);
        toast.error(`Query task failed: ${error.message}`);
        resetTaskState();

        fetchUserCredits();

        return true;
      }
    },
    [generationStartTime, resetTaskState]
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

    if (!canUseVideo) {
      void requestUpgrade('video');
      return;
    }

    if (remainingCredits < costCredits) {
      void requestUpgrade('credits');
      return;
    }

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt && (isTextToVideoMode || isSeedance2Model)) {
      toast.error('Please enter a prompt before generating.');
      return;
    }

    const provider = selectedModelOption?.provider;
    const model = selectedModelOption?.model;

    if (!provider || !model) {
      toast.error('Provider or model is not configured correctly.');
      return;
    }

    if (
      !isSeedance2Model &&
      isImageToVideoMode &&
      referenceImageUrls.length === 0
    ) {
      toast.error('Please upload a reference image before generating.');
      return;
    }

    if (!isSeedance2Model && isVideoToVideoMode && !referenceVideoUrl) {
      toast.error('Please provide a reference video URL before generating.');
      return;
    }

    setIsGenerating(true);
    setProgress(15);
    setTaskStatus(AITaskStatus.PENDING);
    setGeneratedVideos([]);
    setGenerationStartTime(Date.now());

    try {
      const { aiGenerateFn } = await import('@/server/ai.functions');
      const options: Record<string, unknown> = {};

      if (
        (capabilities?.durationOptions?.length ||
          capabilities?.durationRange) &&
        duration
      ) {
        options.duration = duration;
      }
      if (capabilities?.aspectRatios?.length && aspectRatio) {
        options.aspect_ratio = aspectRatio;
      }
      if (capabilities?.resolutions?.length && resolution) {
        options.resolution = resolution;
      }
      if (capabilities?.modes?.length && mode) {
        options.mode = mode;
      }
      if (capabilities?.sound) {
        options.sound = sound;
      }
      if (capabilities?.negativePrompt && negativePrompt.trim()) {
        options.negative_prompt = negativePrompt.trim();
      }

      if (isSeedance2Model) {
        Object.assign(
          options,
          getUploadedSeedanceReferenceOptions(seedanceReferenceMedia)
        );
      } else if (isImageToVideoMode) {
        options.image_input = referenceImageUrls;
      }

      if (!isSeedance2Model && isVideoToVideoMode) {
        options.video_input = [referenceVideoUrl];
      }

      const resp = await aiGenerateFn({
        data: {
          mediaType: AIMediaType.VIDEO,
          scene: activeTab,
          provider,
          model,
          prompt: trimmedPrompt,
          options,
        },
      });

      const data = resp as any;

      const newTaskId = data?.id;
      if (!newTaskId) {
        throw new Error('Task id missing in response');
      }

      if (data.status === AITaskStatus.SUCCESS && data.taskInfo) {
        const parsedResult = parseTaskResult(data.taskInfo);
        const videoUrls = extractVideoUrls(parsedResult);

        if (videoUrls.length > 0) {
          setGeneratedVideos(
            videoUrls.map((url, index) => ({
              id: `${newTaskId}-${index}`,
              url,
              provider,
              model,
              prompt: trimmedPrompt,
            }))
          );
          toast.success('Video generated successfully');
          setProgress(100);
          resetTaskState();
          await fetchUserCredits();
          return;
        }
      }

      setTaskId(newTaskId);
      setProgress(25);

      await fetchUserCredits();
    } catch (error: any) {
      console.error('Failed to generate video:', error);
      if (
        error.message?.includes('available for Pro') ||
        error.message?.includes('supports')
      ) {
        void requestUpgrade(
          error.message.includes('active generation') ? 'capacity' : 'video'
        );
      }
      toast.error(`Failed to generate video: ${error.message}`);
      resetTaskState();
    }
  };

  const handleDownloadVideo = async (video: GeneratedVideo) => {
    if (!video.url) {
      return;
    }

    try {
      setDownloadingVideoId(video.id);
      // fetch video via proxy
      const resp = await fetch(
        `/api/proxy/file?url=${encodeURIComponent(video.url)}`
      );
      if (!resp.ok) {
        throw new Error('Failed to fetch video');
      }

      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = getSafeDownloadFilename(
        `${video.id}.mp4`,
        'generated-video.mp4'
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
      toast.success('Video downloaded');
    } catch (error) {
      console.error('Failed to download video:', error);
      toast.error('Failed to download video');
    } finally {
      setDownloadingVideoId(null);
    }
  };

  return (
    <section className="py-16 md:py-24">
      <UpgradePaywallDialog
        onClose={closeUpgradePaywall}
        open={upgradeReason !== null}
        reason={upgradeReason || 'credits'}
      />
      <div className="container">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                {srOnlyTitle && <h2 className="sr-only">{srOnlyTitle}</h2>}
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  {t('title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pb-8">
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                  <TabsList className="grid w-full grid-cols-3 bg-primary/10">
                    <TabsTrigger value="text-to-video">
                      {t('tabs.text-to-video')}
                    </TabsTrigger>
                    <TabsTrigger value="image-to-video">
                      {t('tabs.image-to-video')}
                    </TabsTrigger>
                    <TabsTrigger value="video-to-video">
                      {t('tabs.video-to-video')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <VideoModelPicker
                  models={availableModels}
                  value={modelKey}
                  scene={activeTab}
                  onChange={setModelKey}
                />

                {isSeedance2Model ? (
                  <SeedanceReferencePanel
                    value={seedanceReferenceMedia}
                    onChange={setSeedanceReferenceMedia}
                    disabled={isGenerating}
                  />
                ) : isImageToVideoMode ? (
                  <div className="space-y-4">
                    <ImageUploader
                      title={t('form.reference_image')}
                      allowMultiple={true}
                      maxImages={3}
                      maxSizeMB={maxSizeMB}
                      onChange={handleReferenceImagesChange}
                      emptyHint={t('form.reference_image_placeholder')}
                    />

                    {hasReferenceUploadError && (
                      <p className="text-xs text-destructive">
                        {t('form.some_images_failed_to_upload')}
                      </p>
                    )}
                  </div>
                ) : null}

                {!isSeedance2Model && isVideoToVideoMode && (
                  <div className="space-y-2">
                    <Label htmlFor="video-url">
                      {t('form.reference_video')}
                    </Label>
                    <Textarea
                      id="video-url"
                      value={referenceVideoUrl}
                      onChange={(e) => setReferenceVideoUrl(e.target.value)}
                      placeholder={t('form.reference_video_placeholder')}
                      className="min-h-20"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="video-prompt">{t('form.prompt')}</Label>
                  <Textarea
                    id="video-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t('form.prompt_placeholder')}
                    className="min-h-32"
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

                {capabilities?.negativePrompt && (
                  <div className="space-y-2">
                    <Label htmlFor="video-negative-prompt">
                      Negative prompt
                    </Label>
                    <Textarea
                      id="video-negative-prompt"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="blurry, low quality, distorted motion"
                      className="min-h-20"
                    />
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <VideoDurationOptions
                    options={capabilities?.durationOptions ?? []}
                    range={capabilities?.durationRange}
                    value={duration}
                    onChange={setDuration}
                  />
                  <VideoAspectRatioOptions
                    options={capabilities?.aspectRatios ?? []}
                    value={aspectRatio}
                    onChange={setAspectRatio}
                  />
                  <VideoResolutionOptions
                    options={capabilities?.resolutions ?? []}
                    value={resolution}
                    onChange={setResolution}
                  />
                  <VideoModeOptions
                    options={capabilities?.modes ?? []}
                    value={mode}
                    onChange={setMode}
                  />
                </div>

                {capabilities?.sound && (
                  <button
                    type="button"
                    onClick={() => setSound((value) => !value)}
                    className={cn(
                      'flex min-h-11 w-full items-center justify-between rounded-md border px-4 text-sm font-medium transition-colors',
                      sound
                        ? 'border-primary/60 bg-primary/10 text-primary'
                        : 'border-border bg-background text-foreground/75 hover:border-primary/35 hover:bg-accent/45'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      Generate sound
                    </span>
                    <span>{sound ? 'On' : 'Off'}</span>
                  </button>
                )}

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
                      ((isTextToVideoMode || isSeedance2Model) &&
                        !prompt.trim()) ||
                      isPromptTooLong ||
                      (isSeedance2Model
                        ? isSeedanceReferenceUploading ||
                          hasSeedanceReferenceUploadError
                        : isReferenceUploading ||
                          hasReferenceUploadError ||
                          (isImageToVideoMode &&
                            referenceImageUrls.length === 0) ||
                          (isVideoToVideoMode && !referenceVideoUrl))
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

                {isGenerating && (
                  <div className="space-y-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>{t('progress')}</span>
                      <span>{progress}%</span>
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
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <Video className="h-5 w-5" />
                  {t('generated_videos')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                {generatedVideos.length > 0 ? (
                  <div className="space-y-6">
                    {generatedVideos.map((video) => (
                      <div key={video.id} className="space-y-3">
                        <div className="relative overflow-hidden rounded-lg border">
                          <video
                            src={video.url}
                            controls
                            className="h-auto w-full"
                            preload="metadata"
                          />

                          <div className="absolute right-2 bottom-2 flex justify-end text-sm">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="ml-auto"
                              onClick={() => handleDownloadVideo(video)}
                              disabled={downloadingVideoId === video.id}
                            >
                              {downloadingVideoId === video.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4" />
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Video className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      {isGenerating
                        ? t('ready_to_generate')
                        : t('no_videos_generated')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
