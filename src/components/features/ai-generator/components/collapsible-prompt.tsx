import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Copy from 'lucide-react/dist/esm/icons/copy';
import { useState } from 'react';
import { toast } from 'sonner';

import { useTranslations } from '@/core/i18n/hooks';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CollapsiblePromptProps = {
  prompt: string;
  fallback?: string;
  className?: string;
  bodyClassName?: string;
  collapsedClassName?: string;
  expandedClassName?: string;
};

export function CollapsiblePrompt({
  prompt,
  fallback,
  className,
  bodyClassName,
  collapsedClassName = 'max-h-[4.75rem]',
  expandedClassName = 'max-h-56 overflow-y-auto',
}: CollapsiblePromptProps) {
  const t = useTranslations('pages.generate');
  const [expanded, setExpanded] = useState(false);
  const normalizedPrompt = prompt.trim() || fallback || t('prompt.fallback');
  const canExpand =
    normalizedPrompt.length > 120 || normalizedPrompt.includes('\n');

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(normalizedPrompt);
      toast.success(t('prompt.copied'));
    } catch {
      toast.error(t('toast.copy_failed'));
    }
  };

  return (
    <div className={cn('min-w-0 space-y-2', className)}>
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2.5',
          expanded ? expandedClassName : collapsedClassName,
          bodyClassName
        )}
      >
        <p className="text-sm leading-5 font-medium break-words whitespace-pre-wrap text-slate-700">
          {normalizedPrompt}
        </p>
        {!expanded && canExpand && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-b from-transparent to-blue-50" />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-8 rounded-lg border border-blue-100 bg-white px-2.5 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
          onClick={copyPrompt}
        >
          <Copy className="size-3.5" />
          {t('prompt.copy')}
        </Button>
        {canExpand && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 rounded-lg border border-blue-100 bg-white px-2.5 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            <ChevronDown
              className={cn(
                'size-3.5 transition-transform',
                expanded && 'rotate-180'
              )}
            />
            {expanded ? t('prompt.collapse') : t('prompt.expand')}
          </Button>
        )}
      </div>
    </div>
  );
}
