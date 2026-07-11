import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import {
  type ButtonHTMLAttributes,
  type ReactNode,
  type WheelEvent,
} from 'react';

import { cn } from '@/lib/utils';

import {
  type ModelOption,
  type WorkflowOption,
} from './hero-creation-form-data';

export const controlButtonClass =
  'inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card/92 px-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none dark:bg-white/[0.07] dark:hover:bg-white/[0.1]';

export function ControlButton({
  children,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={controlButtonClass}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownPanel({
  children,
  className,
  onWheel,
}: {
  children: ReactNode;
  className?: string;
  onWheel: (event: WheelEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className={cn(
        'absolute top-[calc(100%-0.5rem)] z-30 rounded-2xl border border-border bg-popover/98 p-3 text-popover-foreground shadow-2xl shadow-slate-950/12 backdrop-blur-xl dark:shadow-black/40',
        className
      )}
      onWheel={onWheel}
    >
      {children}
    </div>
  );
}

export function OptionList({
  options,
  selectedId,
  onSelect,
}: {
  options: WorkflowOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onSelect(option.id)}
          className={cn(
            'flex items-start gap-3 rounded-xl p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
            option.id === selectedId
              ? 'bg-primary/12 text-primary'
              : 'hover:bg-muted'
          )}
        >
          <MessageSquare className="mt-0.5 size-4 shrink-0" />
          <span>
            <span className="block text-sm font-semibold text-foreground">
              {option.title}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              {option.description}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

export function SettingsGroup({
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
      <p className="text-xs font-semibold text-muted-foreground">{title}</p>
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/70 p-1 sm:grid-cols-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              'min-h-10 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
              option === value
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ModelMark({ model }: { model: ModelOption }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-[11px] font-black text-cyan-300 ring-1 ring-white/10 dark:bg-black">
      {model.provider.charAt(0)}
    </span>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-primary/14 px-1.5 py-0.5 text-[10px] font-bold text-primary">
      {children}
    </span>
  );
}
