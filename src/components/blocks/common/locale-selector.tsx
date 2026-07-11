import Check from 'lucide-react/dist/esm/icons/check';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import { useEffect, useRef, useState } from 'react';

import { useLocale } from '@/core/i18n/hooks';
import {
  usePathname,
  useRouter,
  useSearchParams,
} from '@/core/i18n/navigation';

import {
  defaultLocale,
  getLocaleOption,
  localeOptions,
  normalizeLocale,
} from '@/config/locale';

import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cacheSet } from '@/lib/cache';
import { cn } from '@/lib/utils';

type SelectableLocaleOption = {
  code: string;
  label: string;
  flag: string;
};

export function LocaleSelector({
  options = localeOptions,
  type = 'icon',
  className,
  compact = false,
}: {
  options?: readonly SelectableLocaleOption[];
  type?: 'icon' | 'button';
  className?: string;
  compact?: boolean;
}) {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const normalizedCurrentLocale =
    normalizeLocale(currentLocale) ?? defaultLocale;
  const activeLocale = options.some((option) => option.code === currentLocale)
    ? currentLocale
    : normalizedCurrentLocale;
  const currentOption =
    options.find((option) => option.code === activeLocale) ??
    getLocaleOption(normalizedCurrentLocale);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      requestAnimationFrame(() => triggerRef.current?.blur());
    }
  };

  const handleSwitchLanguage = (value: string) => {
    setOpen(false);

    if (value !== currentLocale) {
      // Update localStorage to sync with locale detector
      cacheSet('locale', value);
      // Change i18next language
      import('@/core/i18n').then((mod) => {
        mod.default.changeLanguage(value);
      });
      const query = searchParams?.toString?.() ?? '';
      const href = query ? `${pathname}?${query}` : pathname;
      router.push(href, {
        locale: value,
      });
    }
  };

  // Return a placeholder during SSR to avoid hydration mismatch
  if (!mounted || !currentOption) {
    return (
      <button
        type="button"
        className={cn(
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'h-9 rounded-full border-border/70 bg-background/80 px-3 shadow-xs',
          className
        )}
        disabled
      >
        <span className="flex size-5 items-center justify-center rounded-full bg-muted text-sm">
          {currentOption?.flag ?? '🌐'}
        </span>
        <span className={cn('truncate', compact && 'sr-only')}>
          {currentOption?.label ?? currentLocale}
        </span>
        {!compact && <ChevronDown className="size-3.5 text-muted-foreground" />}
      </button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          aria-label={`Switch language. Current language: ${currentOption.label}`}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'h-9 cursor-pointer rounded-full border-border/70 bg-background/80 px-3 shadow-xs hover:bg-accent/70 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:bg-accent/80',
            type === 'icon' && 'backdrop-blur-sm',
            className
          )}
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-muted text-sm">
            {currentOption.flag}
          </span>
          <span
            className={cn(
              'max-w-[7.5rem] truncate text-sm font-medium',
              compact && 'sr-only'
            )}
          >
            {currentOption.label}
          </span>
          {!compact && (
            <ChevronDown
              className={cn(
                'size-3.5 text-muted-foreground transition-transform duration-200',
                open && 'rotate-180'
              )}
            />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[220px] rounded-2xl border-border/70 bg-background/95 p-2 shadow-xl backdrop-blur-xl"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          triggerRef.current?.blur();
        }}
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onSelect={() => handleSwitchLanguage(option.code)}
            className={cn(
              'cursor-pointer rounded-xl px-3 py-2 data-[highlighted]:bg-accent/70 data-[highlighted]:text-foreground',
              option.code === activeLocale && 'bg-accent/60 text-foreground'
            )}
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-muted text-sm shadow-xs">
              {option.flag}
            </span>
            <span className="truncate text-sm font-medium">{option.label}</span>
            {option.code === activeLocale && (
              <Check size={16} className="text-foreground" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
