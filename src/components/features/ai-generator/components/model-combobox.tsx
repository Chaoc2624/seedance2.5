import Check from 'lucide-react/dist/esm/icons/check';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Layers from 'lucide-react/dist/esm/icons/layers';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import { useMemo, useRef } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type ModelBadgeTone = 'quality' | 'multi' | 'speed' | 'neutral';

export interface ModelComboboxOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  iconSrc?: string;
  iconBg?: string;
  credits?: number;
  badge?: string;
  badges?: string[];
  badgeTone?: ModelBadgeTone;
}

interface ModelComboboxProps {
  label?: string;
  options: ModelComboboxOption[];
  selectedOption?: ModelComboboxOption | null;
  value: string;
  onChange: (value: string) => void;
  creditsSuffix?: string;
  placeholder?: string;
  className?: string;
  compact?: boolean;
}

const badgeToneClass: Record<ModelBadgeTone, string> = {
  quality: 'border-primary/40 bg-primary/10 text-primary',
  multi: 'border-primary/40 bg-primary/10 text-primary',
  speed: 'border-primary/40 bg-primary/10 text-primary',
  neutral: 'border-border bg-muted/60 text-muted-foreground',
};

function ModelIcon({
  option,
  size = 'md',
}: {
  option: ModelComboboxOption;
  size?: 'sm' | 'md';
}) {
  const dims = size === 'sm' ? 'h-9 w-9 text-[11px]' : 'h-10 w-10 text-xs';
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/55 font-bold tracking-normal text-primary',
        dims
      )}
      style={option.iconBg ? { background: option.iconBg } : undefined}
      aria-hidden
    >
      {option.iconSrc ? (
        <img
          src={option.iconSrc}
          alt=""
          className="h-5 w-5 object-contain"
          loading="lazy"
          decoding="async"
        />
      ) : option.icon ? (
        <span className="leading-none">{option.icon}</span>
      ) : (
        <Sparkles className="h-4 w-4 opacity-70" />
      )}
    </div>
  );
}

export function ModelCombobox({
  label,
  options,
  selectedOption,
  value,
  onChange,
  creditsSuffix = 'credits',
  placeholder = 'Select model',
  className,
  compact = false,
}: ModelComboboxProps) {
  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );
  const activeOption = selected ?? selectedOption ?? null;
  const restoreTriggerFocusRef = useRef(true);
  const triggerLayoutClass = compact ? 'min-h-16' : 'min-h-[68px]';
  const itemLayoutClass = 'min-h-[72px]';
  const getBadges = (option: ModelComboboxOption) =>
    option.badges && option.badges.length > 0
      ? option.badges
      : option.badge
        ? [option.badge]
        : [];

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Layers className="h-4 w-4" />
          <span>{label}</span>
        </Label>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            'group flex w-full items-center gap-3 rounded-lg border border-input bg-background text-left transition-colors',
            triggerLayoutClass,
            compact ? 'rounded-md px-3 py-2.5' : 'px-4 py-2.5',
            'hover:border-primary/30 hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
            'data-[state=open]:border-primary/40 data-[state=open]:bg-accent/40'
          )}
          aria-label={label || placeholder}
        >
          {activeOption ? (
            <>
              <ModelIcon option={activeOption} size={compact ? 'sm' : 'md'} />
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="truncate pr-2 text-sm font-semibold text-foreground">
                  {activeOption.label}
                </div>
                {activeOption.description && (
                  <div className="line-clamp-1 text-xs text-muted-foreground">
                    {activeOption.description}
                  </div>
                )}
              </div>
            </>
          ) : (
            <span className="flex-1 text-sm text-muted-foreground">
              {placeholder}
            </span>
          )}
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={8}
          onInteractOutside={() => {
            restoreTriggerFocusRef.current = false;
          }}
          onCloseAutoFocus={(event) => {
            if (!restoreTriggerFocusRef.current) {
              event.preventDefault();
            }
            restoreTriggerFocusRef.current = true;
          }}
          className="w-(--radix-dropdown-menu-trigger-width) max-w-[calc(100vw-2rem)] rounded-md border-border bg-popover p-2 shadow-sm"
        >
          {options.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              {placeholder}
            </div>
          ) : (
            options.map((option) => {
              const active = option.value === value;
              const badges = getBadges(option);
              return (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={() => onChange(option.value)}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-4 py-3 focus:bg-accent/60',
                    itemLayoutClass,
                    active && 'bg-primary/10 text-primary'
                  )}
                >
                  <ModelIcon option={option} />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate pr-2 text-sm font-semibold text-foreground">
                        {option.label}
                      </span>
                      {(badges.length > 0 ||
                        typeof option.credits === 'number') && (
                        <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2">
                          {badges.map((badge) => (
                            <Badge
                              key={badge}
                              variant="outline"
                              className={cn(
                                'border px-2 py-0 text-[10px] font-semibold',
                                badgeToneClass[option.badgeTone ?? 'neutral']
                              )}
                            >
                              {badge}
                            </Badge>
                          ))}
                          {typeof option.credits === 'number' && (
                            <Badge
                              variant="outline"
                              className="border-primary/40 bg-primary/10 px-2 py-0 text-[10px] font-semibold text-primary"
                            >
                              {option.credits} {creditsSuffix}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    {option.description && (
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    )}
                  </div>
                  {active && (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  )}
                </DropdownMenuItem>
              );
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
