import type { ReactNode } from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface SegmentedOption<TValue extends string> {
  value: TValue;
  label: ReactNode;
  sublabel?: ReactNode;
}

interface SegmentedToggleProps<TValue extends string> {
  label?: ReactNode;
  icon?: ReactNode;
  options: SegmentedOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  className?: string;
  groupClassName?: string;
  itemClassName?: string;
  ariaLabel?: string;
}

export function SegmentedToggle<TValue extends string>({
  label,
  icon,
  options,
  value,
  onChange,
  className,
  groupClassName,
  itemClassName,
  ariaLabel,
}: SegmentedToggleProps<TValue>) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon}
          <span>{label}</span>
        </Label>
      )}
      <div
        role="radiogroup"
        aria-label={typeof ariaLabel === 'string' ? ariaLabel : undefined}
        className={cn('flex flex-wrap gap-2', groupClassName)}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={cn(
                'inline-flex min-h-11 min-w-16 items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
                active
                  ? 'border-primary/60 bg-primary/10 text-primary shadow-none'
                  : 'border-border bg-background text-foreground hover:border-primary/30 hover:bg-accent/50 hover:text-accent-foreground',
                itemClassName
              )}
            >
              <span className="flex flex-col items-center leading-tight">
                <span>{option.label}</span>
                {option.sublabel && (
                  <span className="text-[10px] font-normal text-muted-foreground">
                    {option.sublabel}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
