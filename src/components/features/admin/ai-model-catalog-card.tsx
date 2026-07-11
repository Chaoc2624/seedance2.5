import {
  DragDropContext,
  Draggable,
  Droppable,
  type DraggableProvided,
  type DraggableStateSnapshot,
  type DroppableProvided,
  type DropResult,
} from '@hello-pangea/dnd';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import GripVertical from 'lucide-react/dist/esm/icons/grip-vertical';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Plus from 'lucide-react/dist/esm/icons/plus';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import Save from 'lucide-react/dist/esm/icons/save';
import SlidersHorizontal from 'lucide-react/dist/esm/icons/sliders-horizontal';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Upload from 'lucide-react/dist/esm/icons/upload';
import type { ChangeEvent, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useTranslations } from '@/core/i18n/hooks';

import {
  AI_IMAGE_MODEL_CATALOG_SETTING,
  AI_MODEL_PROVIDERS,
  DEFAULT_IMAGE_MODEL_CATALOG,
  getImageModelProviderModel,
  parseImageModelCatalog,
  serializeImageModelCatalog,
} from '@/config/ai-models';
import type { ImageGeneratorScene, ImageModelConfig } from '@/config/ai-models';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const sceneOptions: ImageGeneratorScene[] = ['text-to-image', 'image-to-image'];

const defaultTagOptions = ['Multi-modal', 'High quality'];

function createBlankModel(label: string): ImageModelConfig {
  return {
    id: `custom:${Date.now()}`,
    enabled: true,
    provider: 'kie',
    model: '',
    sceneModels: {
      'text-to-image': '',
    },
    label,
    scenes: ['text-to-image'],
    description: '',
    icon: 'AI',
    credits: {
      textToImage: 2,
      imageToImage: 4,
      ultra4K: 2,
    },
  };
}

function parseCreditInput(value: string) {
  if (value.trim() === '') {
    return undefined;
  }

  const nextValue = Number(value);
  return Number.isFinite(nextValue) && nextValue >= 0
    ? Math.round(nextValue)
    : undefined;
}

function reorderModels(
  models: ImageModelConfig[],
  sourceIndex: number,
  destinationIndex: number
) {
  const nextModels = Array.from(models);
  const [movedModel] = nextModels.splice(sourceIndex, 1);
  nextModels.splice(destinationIndex, 0, movedModel);
  return nextModels;
}

function parseTagsInput(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function formatTagsInput(model: ImageModelConfig) {
  const badges = model.badges && model.badges.length > 0 ? model.badges : [];
  return badges.join(', ');
}

function sceneLabelKey(scene: ImageGeneratorScene) {
  return scene === 'text-to-image'
    ? 'ai_model_catalog.scenes.text_to_image'
    : 'ai_model_catalog.scenes.image_to_image';
}

async function uploadModelLogo(file: File) {
  const formData = new FormData();
  formData.append('files', file);

  const { uploadImageFn } = await import('@/server/storage.functions');
  const result = await uploadImageFn({ data: formData });
  const url = result?.urls?.[0];

  if (!url) {
    throw new Error('Upload failed');
  }

  return url;
}

function getModelValidationError(
  models: ImageModelConfig[],
  t: (key: string, interpolation?: Record<string, unknown>) => string
) {
  const seenRoutes = new Set<string>();

  for (const [index, model] of models.entries()) {
    const row = index + 1;
    const rowInterpolation = { row };
    if (!model.provider.trim())
      return t(
        'ai_model_catalog.validation.provider_required',
        rowInterpolation
      );
    if (!model.label.trim())
      return t('ai_model_catalog.validation.label_required', rowInterpolation);
    if (model.scenes.length === 0)
      return t('ai_model_catalog.validation.scene_required', rowInterpolation);
    if (
      model.scenes.includes('text-to-image') &&
      typeof model.credits.textToImage !== 'number'
    ) {
      return t(
        'ai_model_catalog.validation.text_credits_required',
        rowInterpolation
      );
    }
    if (
      model.scenes.includes('image-to-image') &&
      typeof model.credits.imageToImage !== 'number'
    ) {
      return t(
        'ai_model_catalog.validation.image_credits_required',
        rowInterpolation
      );
    }
    for (const scene of model.scenes) {
      if (!getImageModelProviderModel(model, scene).trim()) {
        return t(
          'ai_model_catalog.validation.model_required',
          rowInterpolation
        );
      }
    }

    for (const scene of model.scenes) {
      const routeKey = `${model.provider}:${getImageModelProviderModel(
        model,
        scene
      )}:${scene}`;
      if (seenRoutes.has(routeKey)) {
        return t(
          'ai_model_catalog.validation.unique_required',
          rowInterpolation
        );
      }
      seenRoutes.add(routeKey);
    }
  }

  return null;
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-xs font-semibold text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function ModelPreview({
  model,
  t,
}: {
  model: ImageModelConfig;
  t: (key: string, interpolation?: Record<string, unknown>) => string;
}) {
  const sceneModels = model.scenes
    .map((scene) => getImageModelProviderModel(model, scene))
    .filter(Boolean)
    .join(' / ');

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border/70 bg-muted/60 text-xs font-bold text-primary"
        style={model.iconBg ? { background: model.iconBg } : undefined}
      >
        {model.iconSrc ? (
          <img
            src={model.iconSrc}
            alt=""
            className="h-6 w-6 object-contain"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span>{model.icon || 'AI'}</span>
        )}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-foreground">
          {model.label || t('ai_model_catalog.placeholders.untitled')}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {model.provider ||
            t('ai_model_catalog.placeholders.provider_fallback')}{' '}
          / {sceneModels || t('ai_model_catalog.placeholders.model_fallback')}
        </div>
      </div>
    </div>
  );
}

export function AIModelCatalogCard({
  initialValue,
}: {
  initialValue?: string;
}) {
  const t = useTranslations('admin.settings');
  const [models, setModels] = useState<ImageModelConfig[]>(() =>
    parseImageModelCatalog(initialValue)
  );
  const [saving, setSaving] = useState(false);
  const [uploadingLogoKey, setUploadingLogoKey] = useState<string | null>(null);
  const [expandedModels, setExpandedModels] = useState<Set<string>>(
    () => new Set()
  );

  useEffect(() => {
    setModels(parseImageModelCatalog(initialValue));
    setExpandedModels(new Set());
  }, [initialValue]);

  const enabledCount = models.filter((model) => model.enabled).length;
  const providerCount = useMemo(
    () => new Set(models.map((model) => model.provider).filter(Boolean)).size,
    [models]
  );

  const updateModel = (
    index: number,
    updater: (model: ImageModelConfig) => ImageModelConfig
  ) => {
    setModels((current) =>
      current.map((model, modelIndex) =>
        modelIndex === index ? updater(model) : model
      )
    );
  };

  const toggleScene = (index: number, scene: ImageGeneratorScene) => {
    updateModel(index, (model) => {
      const hasScene = model.scenes.includes(scene);
      const scenes = hasScene
        ? model.scenes.filter((item) => item !== scene)
        : [...model.scenes, scene];
      const sceneModels = { ...model.sceneModels };
      if (!hasScene && !sceneModels[scene]) {
        sceneModels[scene] = model.model;
      }
      const nextScenes = scenes.length > 0 ? scenes : model.scenes;

      return {
        ...model,
        scenes: nextScenes,
        sceneModels,
        model:
          sceneModels['text-to-image'] ||
          sceneModels['image-to-image'] ||
          model.model,
      };
    });
  };

  const updateSceneModel = (
    index: number,
    scene: ImageGeneratorScene,
    value: string
  ) => {
    updateModel(index, (model) => {
      const sceneModels = {
        ...model.sceneModels,
        [scene]: value,
      };

      return {
        ...model,
        sceneModels,
        model:
          sceneModels['text-to-image'] ||
          sceneModels['image-to-image'] ||
          value,
      };
    });
  };

  const removeModel = (index: number) => {
    setModels((current) =>
      current.filter((_, modelIndex) => modelIndex !== index)
    );
  };

  const toggleExpanded = (key: string) => {
    setExpandedModels((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const onDragEnd = (result: DropResult) => {
    const destinationIndex = result.destination?.index;
    if (
      typeof destinationIndex !== 'number' ||
      destinationIndex === result.source.index
    ) {
      return;
    }

    setModels((current) =>
      reorderModels(current, result.source.index, destinationIndex)
    );
  };

  const uploadLogo = async (
    index: number,
    modelKey: string,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error(t('ai_model_catalog.messages.logo_upload_invalid'));
      return;
    }

    try {
      setUploadingLogoKey(modelKey);
      const url = await uploadModelLogo(file);
      updateModel(index, (item) => ({ ...item, iconSrc: url }));
      toast.success(t('ai_model_catalog.messages.logo_uploaded'));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('ai_model_catalog.messages.logo_upload_failed')
      );
    } finally {
      setUploadingLogoKey(null);
    }
  };

  const saveModels = async () => {
    const validationError = getModelValidationError(models, t);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setSaving(true);
      const { saveAdminSettingsFn } = await import('@/server/config.functions');
      const value = serializeImageModelCatalog(models);
      const result = await saveAdminSettingsFn({
        data: { [AI_IMAGE_MODEL_CATALOG_SETTING]: value },
      });

      if (result?.status === 'success') {
        toast.success(t('ai_model_catalog.messages.saved'));
      } else {
        toast.error(
          result?.message || t('ai_model_catalog.messages.save_failed')
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('ai_model_catalog.messages.save_failed')
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="overflow-hidden border-primary/15 bg-card/95">
      <CardHeader className="border-b bg-muted/25">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-primary" />
              {t('ai_model_catalog.title')}
            </CardTitle>
            <CardDescription>
              {t('ai_model_catalog.description')}
            </CardDescription>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Badge variant="outline">
              {t('ai_model_catalog.enabled_count', { count: enabledCount })}
            </Badge>
            <Badge variant="outline">
              {t('ai_model_catalog.provider_count', { count: providerCount })}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {t('ai_model_catalog.runtime_notice')}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModels(DEFAULT_IMAGE_MODEL_CATALOG)}
            >
              <RotateCcw className="mr-2 size-4" />
              {t('ai_model_catalog.defaults')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setModels((current) => [
                  ...current,
                  createBlankModel(
                    t('ai_model_catalog.placeholders.new_model')
                  ),
                ])
              }
            >
              <Plus className="mr-2 size-4" />
              {t('ai_model_catalog.add_model')}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={saveModels}
              disabled={saving}
            >
              <Save className="mr-2 size-4" />
              {saving
                ? t('ai_model_catalog.saving')
                : t('ai_model_catalog.save_catalog')}
            </Button>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="ai-model-catalog">
            {(dropProvided: DroppableProvided) => (
              <div
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
                className="grid gap-3"
              >
                {models.map((model, index) => {
                  const modelKey = `${model.id}-${index}`;
                  const isExpanded = expandedModels.has(modelKey);
                  const providerOptions = [
                    ...new Set(
                      [...AI_MODEL_PROVIDERS, model.provider].filter(Boolean)
                    ),
                  ];

                  return (
                    <Draggable
                      key={modelKey}
                      draggableId={modelKey}
                      index={index}
                    >
                      {(
                        dragProvided: DraggableProvided,
                        snapshot: DraggableStateSnapshot
                      ) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className={cn(
                            'overflow-hidden rounded-md border bg-background/80 transition-colors',
                            !model.enabled && 'bg-muted/30 opacity-75',
                            snapshot.isDragging &&
                              'z-50 shadow-xl ring-2 ring-primary/35'
                          )}
                          style={dragProvided.draggableProps.style}
                        >
                          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <button
                              type="button"
                              {...dragProvided.dragHandleProps}
                              className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
                              aria-label={t('ai_model_catalog.drag_to_sort')}
                            >
                              <GripVertical className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleExpanded(modelKey)}
                              className="flex min-w-0 flex-1 items-center gap-3 text-left"
                              aria-expanded={isExpanded}
                            >
                              {isExpanded ? (
                                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                              )}
                              <ModelPreview model={model} t={t} />
                            </button>
                            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                              <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                                {model.provider ||
                                  t(
                                    'ai_model_catalog.placeholders.provider_fallback'
                                  )}
                              </Badge>
                              {model.scenes.map((scene) => (
                                <Badge key={scene} variant="outline">
                                  {t(sceneLabelKey(scene))}
                                </Badge>
                              ))}
                              {index === 0 && (
                                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-200">
                                  {t('ai_model_catalog.default_model')}
                                </Badge>
                              )}
                              {model.badges?.map((badge) => (
                                <Badge
                                  key={badge}
                                  variant="outline"
                                  className="border-primary/30 bg-primary/5 text-primary"
                                >
                                  {badge}
                                </Badge>
                              ))}
                              <Badge
                                variant={
                                  model.enabled ? 'default' : 'secondary'
                                }
                                className={cn(
                                  model.enabled &&
                                    'bg-emerald-600 hover:bg-emerald-600'
                                )}
                              >
                                {model.enabled
                                  ? t('ai_model_catalog.enabled')
                                  : t('ai_model_catalog.disabled')}
                              </Badge>
                              <div className="flex items-center gap-2">
                                <Label className="text-xs text-muted-foreground">
                                  {t('ai_model_catalog.enabled')}
                                </Label>
                                <Switch
                                  checked={model.enabled}
                                  onCheckedChange={(checked) =>
                                    updateModel(index, (item) => ({
                                      ...item,
                                      enabled: checked,
                                    }))
                                  }
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => removeModel(index)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpanded(modelKey)}
                              >
                                {isExpanded
                                  ? t('ai_model_catalog.collapse')
                                  : t('ai_model_catalog.expand')}
                              </Button>
                            </div>
                          </div>

                          <div
                            className={cn(
                              'grid gap-4 border-t p-4 xl:grid-cols-[1fr_1.15fr]',
                              !isExpanded && 'hidden'
                            )}
                          >
                            <div className="grid gap-4 sm:grid-cols-2">
                              <Field
                                label={t(
                                  'ai_model_catalog.fields.display_name'
                                )}
                              >
                                <Input
                                  value={model.label}
                                  onChange={(event) =>
                                    updateModel(index, (item) => ({
                                      ...item,
                                      label: event.target.value,
                                    }))
                                  }
                                />
                              </Field>
                              <Field
                                label={t('ai_model_catalog.fields.provider')}
                              >
                                <Select
                                  value={model.provider}
                                  onValueChange={(provider) =>
                                    updateModel(index, (item) => ({
                                      ...item,
                                      provider,
                                    }))
                                  }
                                >
                                  <SelectTrigger className="h-11 w-full">
                                    <SelectValue
                                      placeholder={t(
                                        'ai_model_catalog.placeholders.provider'
                                      )}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {providerOptions.map((provider) => (
                                      <SelectItem
                                        key={provider}
                                        value={provider}
                                      >
                                        {provider}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </Field>
                              <Field
                                label={t('ai_model_catalog.fields.description')}
                                className="sm:col-span-2"
                              >
                                <Textarea
                                  value={model.description ?? ''}
                                  onChange={(event) =>
                                    updateModel(index, (item) => ({
                                      ...item,
                                      description: event.target.value,
                                    }))
                                  }
                                  rows={2}
                                />
                              </Field>
                              <Field
                                label={t(
                                  'ai_model_catalog.fields.display_tags'
                                )}
                                className="sm:col-span-2"
                              >
                                <div className="space-y-2">
                                  <Input
                                    value={formatTagsInput(model)}
                                    onChange={(event) => {
                                      const badges = parseTagsInput(
                                        event.target.value
                                      );
                                      updateModel(index, (item) => ({
                                        ...item,
                                        badge: badges[0],
                                        badges,
                                      }));
                                    }}
                                    placeholder={t(
                                      'ai_model_catalog.placeholders.display_tags'
                                    )}
                                  />
                                  <div className="flex flex-wrap gap-2">
                                    {defaultTagOptions.map((tag) => {
                                      const active =
                                        model.badges?.includes(tag);
                                      return (
                                        <button
                                          key={tag}
                                          type="button"
                                          onClick={() =>
                                            updateModel(index, (item) => {
                                              const current = item.badges ?? [];
                                              const badges = current.includes(
                                                tag
                                              )
                                                ? current.filter(
                                                    (value) => value !== tag
                                                  )
                                                : [...current, tag];
                                              return {
                                                ...item,
                                                badge: badges[0],
                                                badges,
                                              };
                                            })
                                          }
                                          className={cn(
                                            'rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors',
                                            active
                                              ? 'border-primary/50 bg-primary/10 text-primary'
                                              : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
                                          )}
                                        >
                                          {tag}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </Field>
                            </div>

                            <div className="grid gap-4">
                              <Field
                                label={t('ai_model_catalog.fields.modes')}
                                className="sm:col-span-2"
                              >
                                <div className="grid gap-3">
                                  {sceneOptions.map((scene) => {
                                    const active = model.scenes.includes(scene);
                                    return (
                                      <div
                                        key={scene}
                                        className={cn(
                                          'rounded-md border p-3 transition-colors',
                                          active
                                            ? 'border-primary/30 bg-primary/5'
                                            : 'border-border bg-muted/25 opacity-75'
                                        )}
                                      >
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                          <div>
                                            <div className="text-sm font-semibold text-foreground">
                                              {t(sceneLabelKey(scene))}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              {t(
                                                'ai_model_catalog.fields.mode_model_hint'
                                              )}
                                            </div>
                                          </div>
                                          <Switch
                                            checked={active}
                                            onCheckedChange={() =>
                                              toggleScene(index, scene)
                                            }
                                          />
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                          <Field
                                            label={t(
                                              'ai_model_catalog.fields.mode_model_id'
                                            )}
                                          >
                                            <Input
                                              value={
                                                model.sceneModels?.[scene] ??
                                                model.model
                                              }
                                              onChange={(event) =>
                                                updateSceneModel(
                                                  index,
                                                  scene,
                                                  event.target.value
                                                )
                                              }
                                              disabled={!active}
                                              placeholder={t(
                                                'ai_model_catalog.placeholders.provider_model_id'
                                              )}
                                            />
                                          </Field>
                                          <Field
                                            label={
                                              scene === 'text-to-image'
                                                ? t(
                                                    'ai_model_catalog.fields.text_to_image_credits'
                                                  )
                                                : t(
                                                    'ai_model_catalog.fields.image_to_image_credits'
                                                  )
                                            }
                                          >
                                            <Input
                                              type="number"
                                              min={0}
                                              disabled={!active}
                                              value={
                                                scene === 'text-to-image'
                                                  ? (model.credits
                                                      .textToImage ?? '')
                                                  : (model.credits
                                                      .imageToImage ?? '')
                                              }
                                              onChange={(event) =>
                                                updateModel(index, (item) => ({
                                                  ...item,
                                                  credits: {
                                                    ...item.credits,
                                                    [scene === 'text-to-image'
                                                      ? 'textToImage'
                                                      : 'imageToImage']:
                                                      parseCreditInput(
                                                        event.target.value
                                                      ),
                                                  },
                                                }))
                                              }
                                            />
                                          </Field>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </Field>
                              <Field
                                label={t(
                                  'ai_model_catalog.fields.ultra4k_credits'
                                )}
                              >
                                <Input
                                  type="number"
                                  min={0}
                                  value={model.credits.ultra4K ?? ''}
                                  onChange={(event) =>
                                    updateModel(index, (item) => ({
                                      ...item,
                                      credits: {
                                        ...item.credits,
                                        ultra4K: parseCreditInput(
                                          event.target.value
                                        ),
                                      },
                                    }))
                                  }
                                  placeholder={t(
                                    'ai_model_catalog.placeholders.uses_mode_cost'
                                  )}
                                />
                              </Field>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <Field
                                  label={t('ai_model_catalog.fields.icon_text')}
                                >
                                  <Input
                                    value={model.icon ?? ''}
                                    onChange={(event) =>
                                      updateModel(index, (item) => ({
                                        ...item,
                                        icon: event.target.value,
                                      }))
                                    }
                                    placeholder={t(
                                      'ai_model_catalog.placeholders.icon_text'
                                    )}
                                  />
                                </Field>
                                <Field
                                  label={t('ai_model_catalog.fields.logo_url')}
                                >
                                  <div className="flex gap-2">
                                    <Input
                                      value={model.iconSrc ?? ''}
                                      onChange={(event) =>
                                        updateModel(index, (item) => ({
                                          ...item,
                                          iconSrc: event.target.value,
                                        }))
                                      }
                                      placeholder={t(
                                        'ai_model_catalog.placeholders.logo_url'
                                      )}
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="h-11 shrink-0"
                                      disabled={uploadingLogoKey === modelKey}
                                      aria-label={t(
                                        'ai_model_catalog.actions.upload_logo'
                                      )}
                                      onClick={() => {
                                        document
                                          .getElementById(
                                            `model-logo-upload-${modelKey}`
                                          )
                                          ?.click();
                                      }}
                                    >
                                      {uploadingLogoKey === modelKey ? (
                                        <Loader2 className="size-4 animate-spin" />
                                      ) : (
                                        <Upload className="size-4" />
                                      )}
                                    </Button>
                                    <input
                                      id={`model-logo-upload-${modelKey}`}
                                      type="file"
                                      accept="image/*"
                                      className="sr-only"
                                      disabled={uploadingLogoKey === modelKey}
                                      onChange={(event) =>
                                        uploadLogo(index, modelKey, event)
                                      }
                                    />
                                  </div>
                                </Field>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {dropProvided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}
