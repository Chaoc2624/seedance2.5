import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  createFileRoute,
  Link,
  Outlet,
  useMatches,
  useNavigate,
} from '@tanstack/react-router';
import {
  Check,
  ChevronDown,
  FileText,
  Hash,
  Monitor,
  Moon,
  PanelLeft,
  Search,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  buildSearchIndex,
  getDocsList,
  type DocNavItem,
  type SearchEntry,
} from '@/core/docs/source';
import { ThemeProvider } from '@/core/theme/provider';

import {
  defaultLocale,
  getLocaleOption,
  localeOptions,
  normalizeLocale,
} from '@/config/locale';

import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTrigger,
} from '@/components/ui/dialog';
import { envConfigs } from '@/config';
import { AppContextProvider } from '@/contexts/app';

export const Route = createFileRoute('/{-$locale}/_docs')({
  beforeLoad: async () => {
    const { modules } = await import('@/config/preset');
    if (!modules.docs) {
      const { redirect } = await import('@tanstack/react-router');
      throw redirect({ to: '/' as any });
    }
  },
  component: DocsLayout,
});

function DocsLayout() {
  const { locale: rawLocale } = Route.useParams();
  const locale = rawLocale || defaultLocale;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const docs = getDocsList(locale);
  const searchIndex = buildSearchIndex(locale);

  return (
    <AppContextProvider>
      <ThemeProvider>
        <div className="flex min-h-screen flex-col">
          {/* Header */}
          <DocsHeader
            locale={locale}
            docs={docs}
            searchIndex={searchIndex}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
          />

          <div className="flex flex-1">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <aside
              className={`fixed top-16 z-40 h-[calc(100vh-4rem)] shrink-0 overflow-y-auto border-r border-border bg-card transition-all duration-200 md:sticky ${
                sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
              }`}
            >
              <nav className="p-4">
                <DocsSidebar
                  docs={docs}
                  locale={locale}
                  closeSidebar={() => setSidebarOpen(false)}
                />
              </nav>
            </aside>

            {/* Main content */}
            <main className="min-w-0 flex-1">
              <Outlet />
            </main>
          </div>
        </div>
      </ThemeProvider>
    </AppContextProvider>
  );
}

/* ─── Header ─────────────────────────────────────────────────── */

function DocsHeader({
  locale,
  docs: _docs,
  searchIndex,
  onToggleSidebar,
}: {
  locale: string;
  docs: DocNavItem[];
  searchIndex: SearchEntry[];
  onToggleSidebar: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-sm md:gap-4 md:px-4">
      {/* Sidebar toggle (left on mobile) */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="inline-flex items-center justify-center rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
        aria-label="Toggle sidebar"
      >
        <PanelLeft className="h-4 w-4" />
      </button>

      {/* Logo + App name */}
      <Link
        to={'/' as any}
        className="inline-flex items-center gap-2.5 font-semibold"
      >
        <img
          src={envConfigs.app_logo}
          alt={envConfigs.app_name}
          className="h-7 w-7"
        />
        <span className="hidden text-lg font-bold text-primary sm:inline-block">
          {envConfigs.app_name}
        </span>
      </Link>

      {/* Center: Search (hidden on mobile, but ⌘K still works) */}
      <div className="hidden flex-1 justify-center md:flex">
        <DocsSearch locale={locale} searchIndex={searchIndex} />
      </div>
      {/* Mobile spacer */}
      <div className="flex-1 md:hidden" />

      {/* Right group */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Language switcher */}
        <LanguageSwitcher locale={locale} />

        {/* Theme switcher */}
        <ThemeSwitcher />

        {/* Sidebar toggle (far right on desktop) */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden items-center justify-center rounded-full border bg-secondary p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:inline-flex"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

/* ─── Search ─────────────────────────────────────────────────── */

function DocsSearch({
  locale,
  searchIndex,
}: {
  locale: string;
  searchIndex: SearchEntry[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const [isMac, setIsMac] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Detect platform after hydration
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.userAgent));
  }, []);

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Reset query when dialog opens
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
    }
  }, [open]);

  // Filter search index entries, always include page title when any sub-entry matches
  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    const matched = searchIndex.filter((entry) =>
      entry.text.toLowerCase().includes(q)
    );
    // Collect slugs that have results
    const matchedSlugs = new Set(matched.map((e) => e.docSlug));
    // Ensure page entries for matched slugs are included
    const pageEntries = searchIndex.filter(
      (e) =>
        e.type === 'page' && matchedSlugs.has(e.docSlug) && !matched.includes(e)
    );
    // Merge: page entries first per slug, then matched entries in order
    const allEntries = [...pageEntries, ...matched];
    // Sort: group by slug, page first within each group
    allEntries.sort((a, b) => {
      if (a.docSlug !== b.docSlug) return a.docSlug.localeCompare(b.docSlug);
      if (a.type === 'page') return -1;
      if (b.type === 'page') return 1;
      return 0;
    });
    return allEntries;
  }, [query, searchIndex]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  // ResizeObserver for animated height
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const viewport = el.firstElementChild as HTMLElement | null;
    if (!viewport) return;

    const observer = new ResizeObserver(() => {
      el.style.setProperty('--animated-height', `${viewport.clientHeight}px`);
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [results]);

  const handleSelect = useCallback(
    (entry: SearchEntry) => {
      setOpen(false);
      const base =
        locale && locale !== defaultLocale
          ? `/${locale}${entry.docUrl}`
          : entry.docUrl;
      const anchor =
        entry.type === 'heading' && entry.anchor ? entry.anchor : '';

      if (anchor) {
        // Navigate then scroll to anchor after page renders
        navigate({ to: base }).then(() => {
          setTimeout(() => {
            const el = document.getElementById(anchor);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              window.history.replaceState(null, '', `${base}#${anchor}`);
            }
          }, 100);
        });
      } else {
        navigate({ to: base });
      }
    },
    [locale, navigate]
  );

  // Keyboard navigation: ↑↓ and Enter
  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!results || results.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => (i + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => (i - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelect(results[activeIdx]);
      }
    },
    [results, activeIdx, handleSelect]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger button */}
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex w-full max-w-sm items-center gap-2 rounded-xl border bg-secondary/50 p-1.5 ps-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Search</span>
          <div className="ms-auto hidden gap-0.5 sm:inline-flex">
            <kbd className="rounded-md border bg-background px-1.5">
              {isMac ? '⌘' : 'Ctrl'}
            </kbd>
            <kbd className="rounded-md border bg-background px-1.5">K</kbd>
          </div>
        </button>
      </DialogTrigger>

      {/* Search dialog */}
      <DialogPortal>
        <DialogOverlay className="bg-transparent backdrop-blur-xs" />
        <DialogPrimitive.Content
          className="fixed top-[20vh] left-1/2 z-50 w-[calc(100%-1rem)] max-w-[640px] -translate-x-1/2 overflow-hidden rounded-2xl border bg-popover/80 text-popover-foreground shadow-2xl shadow-black/50 backdrop-blur-xl duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <DialogPrimitive.Title className="hidden">
            Search
          </DialogPrimitive.Title>

          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-border p-3">
            <Search className="size-5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Search docs..."
              className="w-0 flex-1 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:outline-none"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
            >
              ESC
            </button>
          </div>

          {/* Results list with animated height */}
          <div
            ref={listRef}
            data-empty={results === null}
            className="h-[var(--animated-height)] overflow-hidden transition-[height] duration-200 data-[empty=true]:h-0"
          >
            <div
              className={`flex max-h-[460px] w-full flex-col overflow-y-auto p-1 ${results === null ? 'hidden' : ''}`}
            >
              {results?.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No results found.
                </p>
              ) : (
                results?.map((entry, i) => (
                  <SearchResultItem
                    key={`${entry.docSlug}-${entry.type}-${i}`}
                    entry={entry}
                    active={i === activeIdx}
                    onPointerMove={() => setActiveIdx(i)}
                    onClick={() => handleSelect(entry)}
                  />
                ))
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

/* ─── Search Result Item ─────────────────────────────────────── */

function SearchResultItem({
  entry,
  active,
  onPointerMove,
  onClick,
}: {
  entry: SearchEntry;
  active: boolean;
  onPointerMove: () => void;
  onClick: () => void;
}) {
  const ref = useCallback(
    (el: HTMLButtonElement | null) => {
      if (active && el) {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    },
    [active]
  );

  return (
    <button
      ref={ref}
      type="button"
      aria-selected={active}
      onPointerMove={onPointerMove}
      onClick={onClick}
      className={`relative flex items-center gap-2 rounded-lg p-2 text-start text-sm select-none ${
        entry.type !== 'page' ? 'ps-8' : ''
      } ${
        entry.type === 'page' || entry.type === 'heading'
          ? 'font-medium'
          : 'text-popover-foreground/80'
      } ${active ? 'bg-accent text-accent-foreground' : ''}`}
    >
      {/* Vertical connector line for sub-items */}
      {entry.type !== 'page' && (
        <div
          role="none"
          className="absolute inset-y-0 start-[18px] w-px bg-border"
        />
      )}
      {/* Type icon */}
      {entry.type === 'page' && (
        <FileText className="size-6 shrink-0 rounded-sm border bg-muted p-0.5 text-muted-foreground shadow-sm" />
      )}
      {entry.type === 'heading' && (
        <Hash className="size-4 shrink-0 text-muted-foreground" />
      )}
      {/* Content */}
      <p className="min-w-0 truncate">
        {entry.text.length > 80 ? entry.text.slice(0, 80) + '…' : entry.text}
      </p>
    </button>
  );
}

/* ─── Sidebar ────────────────────────────────────────────────── */

function DocsSidebar({
  docs,
  locale,
  closeSidebar,
}: {
  docs: ReturnType<typeof getDocsList>;
  locale: string;
  closeSidebar?: () => void;
}) {
  const matches = useMatches();
  // Extract current slug from the last matched route
  const currentPath = matches[matches.length - 1]?.pathname || '';

  return (
    <ul className="space-y-0.5">
      {docs.map((doc) => {
        const href =
          locale && locale !== defaultLocale ? `/${locale}${doc.url}` : doc.url;
        const isActive = currentPath === href || currentPath === doc.url;

        return (
          <li key={doc.slug}>
            <Link
              to={href}
              onClick={closeSidebar}
              className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                isActive
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {doc.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/* ─── Language switcher ──────────────────────────────────────── */

function LanguageSwitcher({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const normalizedLocale = normalizeLocale(locale) ?? defaultLocale;
  const currentOption = getLocaleOption(normalizedLocale);

  const closeMenu = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.blur());
  };

  if (!currentOption) {
    return null;
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border/70 bg-background/85 px-3 py-2 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-accent/70"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-muted text-sm">
          {currentOption.flag}
        </span>
        <span className="max-w-[7rem] truncate">{currentOption.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeMenu} />
          <div className="absolute right-0 z-50 mt-2 w-[220px] rounded-2xl border border-border/70 bg-popover/95 p-2 shadow-xl backdrop-blur-xl">
            {localeOptions.map((option) => (
              <Link
                key={option.code}
                to={
                  (option.code === defaultLocale
                    ? '/docs'
                    : `/${option.code}/docs`) as any
                }
                onClick={closeMenu}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  option.code === normalizedLocale
                    ? 'bg-accent/70 text-foreground'
                    : 'text-popover-foreground hover:bg-accent/60'
                }`}
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-muted text-base shadow-xs">
                  {option.flag}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate leading-none font-medium">
                    {option.label}
                  </span>
                  <span className="mt-1 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                    {option.code}
                  </span>
                </span>
                {option.code === normalizedLocale ? (
                  <Check className="h-4 w-4 text-foreground" />
                ) : null}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Theme switcher ─────────────────────────────────────────── */

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const modes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const;

  useEffect(() => setMounted(true), []);

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-border p-0.5">
      {modes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
            mounted && theme === value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label={label}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
