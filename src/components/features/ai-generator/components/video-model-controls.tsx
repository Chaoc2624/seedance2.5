import Clock from 'lucide-react/dist/esm/icons/clock';
import Monitor from 'lucide-react/dist/esm/icons/monitor';
import Ratio from 'lucide-react/dist/esm/icons/ratio';
import SlidersHorizontal from 'lucide-react/dist/esm/icons/sliders-horizontal';
import Video from 'lucide-react/dist/esm/icons/video';
import { type ReactNode, useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_VIDEO_MODEL_CATALOG,
  getDefaultVideoModelForScene,
  getVideoModelIconSrc,
  groupVideoModelsByFamily,
} from '@/config/ai-video-models';
import type {
  VideoGeneratorScene,
  VideoModelConfig,
  VideoModelDurationRange,
} from '@/config/ai-video-models';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export const DEFAULT_VIDEO_MODEL_ID =
  getDefaultVideoModelForScene('text-to-video')?.id ?? '';

export function getDefaultVideoModelIdForScene(
  scene: VideoGeneratorScene,
  models: VideoModelConfig[] = DEFAULT_VIDEO_MODEL_CATALOG
) {
  return getDefaultVideoModelForScene(scene, models)?.id ?? models[0]?.id ?? '';
}

export function videoWorkflowToScene(workflowId: string): VideoGeneratorScene {
  if (workflowId === 'video-edit') {
    return 'video-to-video';
  }

  if (workflowId === 'reference-video' || workflowId === 'frames-video') {
    return 'image-to-video';
  }

  return 'text-to-video';
}

export function formatVideoSettingValue(value?: string, suffix?: string) {
  if (!value) {
    return '';
  }

  if (suffix && /^\d+$/.test(value)) {
    return `${value}${suffix}`;
  }

  return value;
}

export function VideoOptionGroup({
  label,
  icon,
  options,
  value,
  onChange,
  compact = false,
}: {
  label: string;
  icon: ReactNode;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', compact && 'w-full')}>
      <Label className="flex items-center gap-2 text-sm font-medium text-[#c8cbb9]">
        {icon}
        <span>{label}</span>
      </Label>
      <div
        className={cn(
          compact
            ? 'scrollbar-hide grid w-full auto-cols-fr grid-flow-col items-center gap-1 overflow-x-auto'
            : 'flex flex-wrap gap-2',
          compact && 'rounded-xl border border-[#d8f269]/12 bg-[#d8f269]/7 p-1'
        )}
      >
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                compact
                  ? 'min-h-9 min-w-16 rounded-lg px-3 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none'
                  : 'min-h-10 rounded-md border px-3 text-sm font-medium transition-colors',
                compact
                  ? active
                    ? 'bg-[#d8f269] text-[#10120d] shadow-sm shadow-[#d8f269]/20'
                    : 'text-[#c8cbb9]/80 hover:bg-[#d8f269]/8 hover:text-[#f4f2e6]'
                  : active
                    ? 'border-primary/60 bg-primary/10 text-primary'
                    : 'border-border bg-background text-foreground/75 hover:border-primary/35 hover:bg-accent/45'
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function parseVideoDuration(value: string) {
  const duration = Number.parseFloat(value);
  return Number.isFinite(duration) && duration > 0 ? duration : null;
}

function formatDurationValue(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : String(Number(value.toFixed(2)));
}

function clampDuration(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getNearestDurationOption(value: number, options: number[]) {
  return options.reduce((nearest, option) =>
    Math.abs(option - value) < Math.abs(nearest - value) ? option : nearest
  );
}

function getNormalizedDurationValue({
  value,
  min,
  max,
  step,
  range,
  options,
}: {
  value: string;
  min: number;
  max: number;
  step: number;
  range?: VideoModelDurationRange;
  options: number[];
}) {
  const parsed = parseVideoDuration(value) ?? min;
  const clamped = clampDuration(parsed, min, max);

  if (!range && options.length > 0) {
    return getNearestDurationOption(clamped, options);
  }

  return clampDuration(
    min + Math.round((clamped - min) / step) * step,
    min,
    max
  );
}

function buildDurationTicks({
  min,
  max,
  step,
}: {
  min: number;
  max: number;
  step: number;
}) {
  const count = Math.floor((max - min) / step) + 1;
  if (count > 16) {
    return [min, max];
  }

  return Array.from({ length: count }, (_, index) => min + index * step);
}

export function VideoDurationOptions(props: {
  options: string[];
  range?: VideoModelDurationRange;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  compact?: boolean;
}) {
  const {
    options,
    range,
    value,
    onChange,
    label = 'Choose duration',
    compact = false,
  } = props;
  const numericOptions = useMemo(
    () =>
      options
        .map(parseVideoDuration)
        .filter((item): item is number => item !== null)
        .sort((a, b) => a - b),
    [options]
  );

  if (numericOptions.length === 0 && !range) {
    return null;
  }

  const min = range?.min ?? numericOptions[0] ?? 0;
  const max = range?.max ?? numericOptions[numericOptions.length - 1] ?? min;
  const step = range?.step && range.step > 0 ? range.step : 1;
  const normalizedValue = getNormalizedDurationValue({
    value,
    min,
    max,
    step,
    range,
    options: numericOptions,
  });
  const percent =
    max > min ? ((normalizedValue - min) / (max - min)) * 100 : 100;
  const activePillPosition = `clamp(3rem, ${percent}%, calc(100% - 3rem))`;
  const tickValues =
    numericOptions.length > 0
      ? numericOptions
      : buildDurationTicks({ min, max, step });
  const formattedValue = `${formatDurationValue(normalizedValue)}s`;

  const commitDuration = (nextValue: number) => {
    const nextDuration = getNormalizedDurationValue({
      value: String(nextValue),
      min,
      max,
      step,
      range,
      options: numericOptions,
    });
    onChange(formatDurationValue(nextDuration));
  };

  return (
    <div className={cn('space-y-2', compact && 'w-full min-w-[280px]')}>
      <Label className="flex items-center gap-2 text-sm font-medium text-[#c8cbb9]">
        <Clock className="h-4 w-4" />
        <span>{label}</span>
      </Label>
      <div
        className={cn(
          compact
            ? 'relative h-11 overflow-hidden rounded-xl border border-[#d8f269]/12 bg-[#d8f269]/7 p-1'
            : 'relative h-12 overflow-hidden rounded-md border bg-background p-1',
          compact
            ? 'focus-within:ring-2 focus-within:ring-[#d8f269]/45'
            : 'focus-within:ring-2 focus-within:ring-primary/45'
        )}
      >
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-y-1 z-40 flex w-24 -translate-x-1/2 items-center justify-center rounded-lg font-semibold tabular-nums shadow-sm',
            compact
              ? 'bg-[#d8f269] text-[#10120d] shadow-[#d8f269]/20'
              : 'bg-primary text-primary-foreground shadow-primary/20'
          )}
          style={{ left: activePillPosition }}
        >
          <span className={compact ? 'text-sm' : 'text-base'}>
            {formattedValue}
          </span>
        </div>
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-y-1 right-4 left-4 z-10',
            compact ? 'text-[#c8cbb9]/70' : 'text-muted-foreground'
          )}
        >
          <span className="absolute top-1/2 left-0 -translate-y-1/2 text-sm font-semibold tabular-nums">
            {formatDurationValue(min)}s
          </span>
          <span className="absolute top-1/2 right-0 -translate-y-1/2 text-sm font-semibold tabular-nums">
            {formatDurationValue(max)}s
          </span>
          {tickValues.map((tick) => {
            const tickPercent =
              max > min ? ((tick - min) / (max - min)) * 100 : 0;
            const endpoint = tick === min || tick === max;
            return (
              <span
                key={tick}
                className={cn(
                  'absolute top-1/2 block h-1.5 w-px -translate-x-1/2 -translate-y-1/2 rounded-full',
                  endpoint && 'opacity-0',
                  compact ? 'bg-[#f4f2e6]/26' : 'bg-muted-foreground/35'
                )}
                style={{ left: `${tickPercent}%` }}
              />
            );
          })}
        </div>
        <input
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={normalizedValue}
          aria-valuetext={formattedValue}
          onChange={(event) =>
            commitDuration(Number.parseFloat(event.currentTarget.value))
          }
          className={cn(
            'absolute inset-1 z-30 h-9 w-[calc(100%-0.5rem)] cursor-grab touch-manipulation appearance-none bg-transparent active:cursor-grabbing',
            '[&::-webkit-slider-runnable-track]:h-9 [&::-webkit-slider-runnable-track]:appearance-none [&::-webkit-slider-runnable-track]:bg-transparent',
            '[&::-webkit-slider-thumb]:h-9 [&::-webkit-slider-thumb]:w-24 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-lg [&::-webkit-slider-thumb]:bg-transparent',
            '[&::-moz-range-track]:h-9 [&::-moz-range-track]:bg-transparent',
            '[&::-moz-range-thumb]:h-9 [&::-moz-range-thumb]:w-24 [&::-moz-range-thumb]:rounded-lg [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-transparent'
          )}
        />
      </div>
    </div>
  );
}

export function VideoAspectRatioOptions(props: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  compact?: boolean;
}) {
  const { label = 'Aspect ratio', ...restProps } = props;
  return (
    <VideoOptionGroup
      label={label}
      icon={<Ratio className="h-4 w-4" />}
      {...restProps}
    />
  );
}

export function VideoResolutionOptions(props: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  compact?: boolean;
}) {
  const { label = 'Resolution', ...restProps } = props;
  return (
    <VideoOptionGroup
      label={label}
      icon={<Monitor className="h-4 w-4" />}
      {...restProps}
    />
  );
}

export function VideoModeOptions(props: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  compact?: boolean;
}) {
  const { label = 'Mode', ...restProps } = props;
  return (
    <VideoOptionGroup
      label={label}
      icon={<SlidersHorizontal className="h-4 w-4" />}
      {...restProps}
    />
  );
}

function VideoModelLogo({
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
        'flex shrink-0 items-center justify-center rounded-md border border-[#d8f269]/16 bg-[#030502] text-[11px] font-bold',
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

export function VideoModelPicker({
  models,
  value,
  scene,
  onChange,
  className,
  panelClassName,
  labels,
}: {
  models: VideoModelConfig[];
  value: string;
  scene: VideoGeneratorScene;
  onChange: (value: string) => void;
  className?: string;
  panelClassName?: string;
  labels?: {
    model?: string;
    versions?: (count: number) => string;
  };
}) {
  const families = useMemo(() => groupVideoModelsByFamily(models), [models]);
  const selectedModel = models.find((model) => model.id === value) ?? null;
  const selectedFamilyId = selectedModel?.familyId ?? families[0]?.id ?? '';
  const [viewedFamilyId, setViewedFamilyId] = useState(selectedFamilyId);
  const activeFamilyId =
    families.find((family) => family.id === viewedFamilyId)?.id ??
    selectedFamilyId;
  const selectedFamily =
    families.find((family) => family.id === activeFamilyId) ?? families[0];

  useEffect(() => {
    setViewedFamilyId(selectedFamilyId);
  }, [selectedFamilyId]);

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="flex items-center gap-2 px-2 text-sm font-semibold text-[#c8cbb9]">
        <Video className="hidden h-4 w-4 sm:block" />
        <span>{labels?.model ?? 'Model'}</span>
      </Label>
      <div
        className={cn(
          'grid min-h-[240px] grid-cols-[minmax(108px,0.82fr)_minmax(0,1.55fr)] overflow-hidden bg-transparent',
          panelClassName
        )}
      >
        <div className="max-h-[min(360px,calc(100dvh-12rem))] overflow-y-auto border-r border-[#d8f269]/14 p-1 pr-1.5">
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
                  'mb-0.5 flex min-h-10 w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors sm:gap-2 sm:px-2.5',
                  family.id === activeFamilyId
                    ? 'bg-[#d8f269]/10 text-[#f4f2e6]'
                    : 'text-[#c8cbb9]/80 hover:bg-[#d8f269]/7 hover:text-[#f4f2e6]',
                  active &&
                    'text-primary shadow-[inset_3px_0_0_var(--primary)]',
                  availableCount === 0 && 'cursor-not-allowed opacity-40'
                )}
              >
                <VideoModelLogo
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
                    {labels?.versions?.(availableCount) ??
                      `${availableCount} versions`}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="max-h-[min(380px,calc(100dvh-12rem))] overflow-y-auto p-2">
          {selectedFamily?.models
            .filter((model) => model.scenes.includes(scene))
            .map((model) => {
              const active = model.id === value;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    setViewedFamilyId(model.familyId);
                    onChange(model.id);
                  }}
                  className={cn(
                    'mb-1.5 flex min-h-[74px] w-full gap-2 rounded-md border p-2.5 text-left transition-colors sm:gap-3 sm:p-3',
                    active
                      ? 'border-[#d8f269]/34 bg-[#d8f269]/10'
                      : 'border-[#d8f269]/10 bg-transparent hover:bg-[#d8f269]/7'
                  )}
                >
                  <VideoModelLogo
                    icon={model.icon}
                    iconSrc={getVideoModelIconSrc(model)}
                    label={model.label}
                    className="hidden h-9 w-9 bg-[#d8f269]/9 text-xs text-primary sm:flex"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {model.label}
                      </span>
                      {model.badges?.map((badge) => (
                        <span
                          key={badge}
                          className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"
                        >
                          {badge}
                        </span>
                      ))}
                    </span>
                    {model.description && (
                      <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">
                        {model.description}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
