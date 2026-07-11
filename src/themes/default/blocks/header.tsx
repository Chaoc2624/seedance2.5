import Menu from 'lucide-react/dist/esm/icons/menu';
import PanelLeftClose from 'lucide-react/dist/esm/icons/panel-left-close';
import PanelLeftOpen from 'lucide-react/dist/esm/icons/panel-left-open';
import X from 'lucide-react/dist/esm/icons/x';
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Link, usePathname } from '@/core/i18n/navigation';

import {
  SIDE_HEADER_COLLAPSED_WIDTH,
  SIDE_HEADER_EXPANDED_WIDTH,
  type HeaderPosition,
} from '@/config/layout';
import { modules } from '@/config/preset';

import { BrandLogo } from '@/components/blocks/common/branding/brand-logo';
import { LocaleSelector } from '@/components/blocks/common/locale-selector';
import AppImage from '@/components/blocks/common/media/app-image';
import { SmartIcon } from '@/components/blocks/common/smart-icon';
import { ThemeToggler } from '@/components/blocks/common/theme-toggler';
import { SignUser } from '@/components/blocks/sign/sign-user';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger as RawNavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { useMedia } from '@/hooks/use-media';
import { useScrollLock } from '@/hooks/use-scroll-lock';
import { cn } from '@/lib/utils';
import { NavItem } from '@/types/blocks/common';
import { Header as HeaderType } from '@/types/blocks/landing';

// Avoid SSR/client render inconsistency by mounting the trigger only after hydration.
function NavigationMenuTrigger(
  props: React.ComponentProps<typeof RawNavigationMenuTrigger>
) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  // Only render after client has mounted, to avoid SSR/client render id mismatch
  if (!mounted) return null;
  return (
    <RawNavigationMenuTrigger
      {...props}
      onPointerDown={(e) => {
        // Prevent default to disable click toggle, making it hover-only
        e.preventDefault();
        props.onPointerDown?.(e);
      }}
      onClick={(e) => {
        e.preventDefault();
        props.onClick?.(e);
      }}
    />
  );
}

/**
 * In lite mode, show baseline content routes plus explicitly enabled module
 * routes. Anchors (/#xxx) are always allowed.
 */
const liteAllowedPaths = ['/', '/blog', '/feedback'];
const aiModuleAllowedPaths = [
  '/image-generator',
  '/ai/music-generator',
  '/video-generator',
  '/ai-image-generator',
  '/ai-music-generator',
  '/ai-video-generator',
];
const HEADER_GLASS_ANCHOR_OFFSET = 24;
const HEADER_GLASS_BLEND_DISTANCE = 96;
const HEADER_SCROLL_MAX_BLUR = 18;
const LANDING_HOME_HEADER_THEME_CLASS_NAME = 'landing-home-header-theme';
const LANDING_HEADER_DARK_BACKGROUND = '10, 10, 10';

function isNavItemVisible(url?: string, children?: any[]): boolean {
  if (modules.admin) return true; // full mode — show everything

  if (!url && (!children || children.length === 0)) return false;

  // Anchors on landing page (/#features etc.) are always visible
  if (url?.startsWith('/#') || url === '/') return true;

  // Check direct URL against whitelist
  if (url) {
    if (
      modules.ai &&
      aiModuleAllowedPaths.some((p) => url === p || url.startsWith(p + '/'))
    ) {
      return true;
    }

    return liteAllowedPaths.some((p) => url === p || url.startsWith(p + '/'));
  }

  // Parent with children: show if any child is visible
  if (children && children.length > 0) {
    return children.some((child: any) => isNavItemVisible(child.url));
  }

  return false;
}

function isActivePath(pathname: string, url?: string): boolean {
  if (!url || url.startsWith('http') || url.startsWith('/#')) {
    return false;
  }

  if (url === '/') {
    return pathname === '/';
  }

  return pathname === url || pathname.endsWith(url);
}

function isLandingHomePath(pathname: string) {
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/';
  return (
    normalizedPathname === '/' ||
    /^\/[a-z]{2}(?:-[a-z]{2,4})?$/.test(normalizedPathname)
  );
}

type SideNavSection = {
  key: string;
  title?: string;
  items: NavItem[];
};

const SIDE_UTILITY_ITEM_CLASS =
  'h-11 shrink-0 rounded-[1rem] border border-white/12 bg-[#11140f]/78 text-[#e4e5d8] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_34px_-26px_rgba(0,0,0,0.72)] backdrop-blur-xl backdrop-saturate-150 transition-[width] duration-300 ease-out hover:border-white/18 hover:bg-white/[0.08]';
const HEADER_PRIMARY_BUTTON_CLASS =
  'border border-[#eaff4f]/42 bg-[#eaff4f] text-[#111407] shadow-[0_14px_36px_-22px_rgba(234,255,79,0.58)] hover:bg-[#f1ff72] dark:bg-[#eaff4f] dark:text-[#111407] dark:hover:bg-[#f1ff72]';

function buildCollapsibleTextClass(isCollapsed: boolean) {
  return cn(
    'overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-250 ease-out',
    isCollapsed
      ? 'max-w-0 translate-x-[-6px] opacity-0'
      : 'max-w-[12rem] translate-x-0 opacity-100'
  );
}

function isAnchorUrl(url?: string): url is string {
  return !!url && url.startsWith('/#');
}

function BrandMark({ brand }: { brand: HeaderType['brand'] }) {
  if (!brand) return null;

  return (
    <span className="flex size-11 items-center justify-center rounded-lg border border-border bg-background shadow-sm shadow-black/5">
      {brand.logo ? (
        <AppImage
          src={brand.logo.src}
          alt={brand.title ? '' : brand.logo.alt || ''}
          width={brand.logo.width || 80}
          height={brand.logo.height || 80}
          className="size-7 rounded-xl object-contain"
        />
      ) : (
        <span className="text-base font-semibold">
          {brand.title?.charAt(0) || 'A'}
        </span>
      )}
    </span>
  );
}

function SideNavItemLink({
  item,
  pathname,
  activeHash,
  collapsibleTextClass,
  onAnchorActivate,
}: {
  item: NavItem;
  pathname: string;
  activeHash: string;
  collapsibleTextClass: string;
  onAnchorActivate: (url: string) => void;
}) {
  const anchor = isAnchorUrl(item.url);
  const active = anchor
    ? activeHash === item.url
    : isActivePath(pathname, item.url);

  return (
    <Link
      href={item.url || ''}
      target={item.target || '_self'}
      aria-current={active ? 'page' : undefined}
      onClick={anchor ? () => onAnchorActivate(item.url as string) : undefined}
      className={cn(
        'group flex min-h-11 w-full items-center overflow-hidden rounded-lg border border-transparent text-[15px] font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[#eaff4f]/60 focus-visible:outline-none',
        active
          ? 'border-white/12 bg-white/[0.105] text-[#f4f2e6] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md'
          : 'text-[#b7baab] hover:border-white/10 hover:bg-white/[0.07] hover:text-[#f4f2e6]'
      )}
    >
      <span
        aria-hidden
        className="flex h-11 w-[calc(var(--landing-side-header-collapsed-width)-1rem)] shrink-0 items-center justify-center"
      >
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-xl transition-[background-color,color,transform] duration-200 ease-out',
            active
              ? 'bg-white/[0.075] text-[#f4f2e6]'
              : 'text-[#aeb2a3] group-hover:bg-white/[0.055] group-hover:text-[#f4f2e6]'
          )}
        >
          {item.icon ? (
            <SmartIcon name={item.icon as string} className="size-4" />
          ) : (
            <span className="size-1.5 rounded-full bg-current opacity-60" />
          )}
        </span>
      </span>
      <span className="-ml-1.5 min-w-0 flex-1 pr-2 leading-5">
        <span className={cn('line-clamp-2', collapsibleTextClass)}>
          {item.title}
        </span>
      </span>
    </Link>
  );
}

function SideNavMenu({
  sideNavSections,
  pathname,
  activeHash,
  isSideHeaderCollapsed,
  collapsibleTextClass,
  onAnchorActivate,
}: {
  sideNavSections: SideNavSection[];
  pathname: string;
  activeHash: string;
  isSideHeaderCollapsed: boolean;
  collapsibleTextClass: string;
  onAnchorActivate: (url: string) => void;
}) {
  return (
    <nav aria-label="Primary navigation" className="px-2">
      <div className={cn('space-y-4', isSideHeaderCollapsed && 'space-y-3')}>
        {sideNavSections.map((section) => (
          <div
            key={section.key}
            className={cn('space-y-1.5', isSideHeaderCollapsed && 'space-y-1')}
          >
            {section.title ? (
              <div
                className={cn(
                  'pr-4 pb-1 pl-[calc(var(--landing-side-header-collapsed-width)-0.625rem)] text-[10px] font-semibold tracking-[0.24em] text-[#c7cab8]/62 uppercase'
                )}
              >
                <span className={collapsibleTextClass}>{section.title}</span>
              </div>
            ) : null}
            <div className="space-y-1">
              {section.items.map((item, index) => (
                <SideNavItemLink
                  key={`${section.key}-${item.url || item.title}-${index}`}
                  item={item}
                  pathname={pathname}
                  activeHash={activeHash}
                  collapsibleTextClass={collapsibleTextClass}
                  onAnchorActivate={onAnchorActivate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}

function SideUtilityPanel({
  header,
  showLocaleSelector,
  isSideHeaderCollapsed,
}: {
  header: HeaderType;
  showLocaleSelector: boolean;
  isSideHeaderCollapsed: boolean;
}) {
  if (
    !header.buttons?.length &&
    !header.show_theme &&
    !showLocaleSelector &&
    !header.show_sign
  ) {
    return null;
  }

  const rowClass = 'flex h-12 items-center justify-start';

  return (
    <div className="mt-auto space-y-2.5 border-t border-foreground/10 px-3 py-2.5">
      {header.buttons?.length ? (
        <div className={rowClass}>
          {header.buttons.map((button, idx) => (
            <Link
              key={idx}
              href={button.url || ''}
              target={button.target || '_self'}
              className={cn(
                SIDE_UTILITY_ITEM_CLASS,
                'inline-flex items-center justify-start gap-2 px-4 text-sm font-medium whitespace-nowrap',
                isSideHeaderCollapsed ? 'w-11' : 'w-[10.5rem]'
              )}
            >
              {button.icon && (
                <SmartIcon name={button.icon as string} className="size-4" />
              )}
              <span className={cn(isSideHeaderCollapsed && 'sr-only')}>
                {button.title}
              </span>
            </Link>
          ))}
        </div>
      ) : null}
      {header.show_theme ? (
        <div className={rowClass}>
          <ThemeToggler
            className={cn(
              SIDE_UTILITY_ITEM_CLASS,
              'flex w-11 items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-[#eaff4f]/60 focus-visible:outline-none [&_svg]:size-4'
            )}
          />
        </div>
      ) : null}
      {showLocaleSelector ? (
        <div className={rowClass}>
          <LocaleSelector
            compact={isSideHeaderCollapsed}
            className={cn(
              SIDE_UTILITY_ITEM_CLASS,
              'justify-start px-3 data-[state=open]:border-white/18 data-[state=open]:bg-white/[0.09]',
              isSideHeaderCollapsed ? 'w-11' : 'w-[10.5rem]'
            )}
          />
        </div>
      ) : null}
      {header.show_sign ? (
        <div className={rowClass}>
          <SignUser
            iconOnly={isSideHeaderCollapsed}
            showIcon={!isSideHeaderCollapsed}
            userNav={header.user_nav}
            className="w-auto md:w-auto"
            buttonClassName={cn(
              'ml-0 h-11 shrink-0 justify-start rounded-[1rem] pl-4 transition-[width] duration-300 ease-out',
              HEADER_PRIMARY_BUTTON_CLASS,
              isSideHeaderCollapsed ? 'w-11 pr-0' : 'w-[10.5rem] pr-4'
            )}
          />
        </div>
      ) : null}
    </div>
  );
}

function SideHeader({
  header,
  isSideHeaderCollapsed,
  onSideHeaderCollapsedChange,
  sideHeaderWidth,
  sideNavSections,
  pathname,
  activeHash,
  collapsibleTextClass,
  showLocaleSelector,
  onAnchorActivate,
}: {
  header: HeaderType;
  isSideHeaderCollapsed: boolean;
  onSideHeaderCollapsedChange?: (collapsed: boolean) => void;
  sideHeaderWidth: number;
  sideNavSections: SideNavSection[];
  pathname: string;
  activeHash: string;
  collapsibleTextClass: string;
  showLocaleSelector: boolean;
  onAnchorActivate: (url: string) => void;
}) {
  return (
    <header
      aria-label="Site header"
      data-slot="sidebar-container"
      data-state={isSideHeaderCollapsed ? 'collapsed' : 'expanded'}
      style={
        {
          width: `${sideHeaderWidth}px`,
          minWidth: `${sideHeaderWidth}px`,
          maxWidth: `${sideHeaderWidth}px`,
          transition:
            'width 300ms ease-out, min-width 300ms ease-out, max-width 300ms ease-out',
          '--landing-side-header-collapsed-width': `${SIDE_HEADER_COLLAPSED_WIDTH}px`,
        } as CSSProperties
      }
      className="fixed inset-y-0 left-0 z-50 hidden overflow-hidden bg-[#080a08]/82 shadow-[inset_-1px_0_0_rgba(244,242,230,0.08),inset_1px_0_0_rgba(255,255,255,0.035),18px_0_45px_-32px_rgba(0,0,0,0.72)] backdrop-blur-2xl backdrop-saturate-150 will-change-[width] lg:flex"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[var(--landing-side-header-collapsed-width)] bg-linear-to-b from-white/[0.045] via-white/[0.015] to-[#dbe983]/[0.035]" />

      <div className="relative flex min-h-0 w-full flex-col">
        <div className="flex h-[110px] flex-col border-b border-white/8 py-3">
          <div className="flex items-center">
            <div className="flex h-10 w-[var(--landing-side-header-collapsed-width)] shrink-0 items-center justify-center">
              <button
                type="button"
                aria-label={
                  isSideHeaderCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
                }
                onClick={() =>
                  onSideHeaderCollapsedChange?.(!isSideHeaderCollapsed)
                }
                className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground shadow-sm shadow-black/5 transition-all duration-200 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {isSideHeaderCollapsed ? (
                  <PanelLeftOpen className="size-4" />
                ) : (
                  <PanelLeftClose className="size-4" />
                )}
              </button>
            </div>
            {header.brand ? (
              <Link
                href={header.brand.url || ''}
                target={header.brand.target || '_self'}
                className="flex min-w-0 items-center pr-4 text-foreground"
              >
                <span
                  className={cn(
                    'min-w-0 truncate text-[15px] font-semibold tracking-tight',
                    collapsibleTextClass
                  )}
                >
                  {header.brand.title}
                </span>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>
          <div className="mt-auto flex h-12 items-center">
            {header.brand ? (
              <Link
                href={header.brand.url || ''}
                target={header.brand.target || '_self'}
                className="flex h-12 w-[var(--landing-side-header-collapsed-width)] items-center justify-center text-foreground"
              >
                <BrandMark brand={header.brand} />
              </Link>
            ) : (
              <div
                aria-hidden
                className="h-12 w-[var(--landing-side-header-collapsed-width)] shrink-0"
              />
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pt-4 pb-3">
          <SideNavMenu
            sideNavSections={sideNavSections}
            pathname={pathname}
            activeHash={activeHash}
            isSideHeaderCollapsed={isSideHeaderCollapsed}
            collapsibleTextClass={collapsibleTextClass}
            onAnchorActivate={onAnchorActivate}
          />
        </div>
        <SideUtilityPanel
          header={header}
          showLocaleSelector={showLocaleSelector}
          isSideHeaderCollapsed={isSideHeaderCollapsed}
        />
      </div>
    </header>
  );
}

export function Header({
  header,
  position = 'top',
  isSideHeaderCollapsed = false,
  onSideHeaderCollapsedChange,
}: {
  header: HeaderType;
  position?: HeaderPosition;
  isSideHeaderCollapsed?: boolean;
  onSideHeaderCollapsedChange?: (collapsed: boolean) => void;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollProgressRef = useRef(0);
  const scrollRafRef = useRef<number | null>(null);
  const isLarge = useMedia('(min-width: 64rem)');
  const pathname = usePathname();
  const isLandingHome = isLandingHomePath(pathname);
  const isBlogDetailPage = /^\/blog\/(?!category(?:\/|$))[^/]+\/?$/.test(
    pathname
  );
  const showLocaleSelector = Boolean(header.show_locale && !isBlogDetailPage);
  const isSideHeader = position === 'left';
  const sideHeaderWidth = isSideHeaderCollapsed
    ? SIDE_HEADER_COLLAPSED_WIDTH
    : SIDE_HEADER_EXPANDED_WIDTH;
  const sideNavSections = (header.nav?.items || [])
    .filter((item) => isNavItemVisible(item.url, item.children))
    .reduce<SideNavSection[]>((sections, item, idx) => {
      const visibleChildren =
        item.children?.filter((sub) => isNavItemVisible(sub.url)) || [];

      if (visibleChildren.length <= 1) {
        const link = visibleChildren.length === 1 ? visibleChildren[0] : item;
        const lastSection = sections.at(-1);

        if (lastSection && !lastSection.title) {
          lastSection.items.push(link);
        } else {
          sections.push({
            key: `side-section-${idx}`,
            items: [link],
          });
        }

        return sections;
      }

      sections.push({
        key: `side-section-${idx}`,
        title: item.title,
        items: visibleChildren,
      });

      return sections;
    }, []);
  const collapsibleTextClass = buildCollapsibleTextClass(isSideHeaderCollapsed);

  // Scroll-spy: highlight side-nav anchor items based on the section currently
  // in view. Anchor URLs (e.g. "/#features") have no route change, so without
  // an observer the active state never updates.
  const anchorIds = useMemo(() => {
    const ids: string[] = [];
    for (const section of sideNavSections) {
      for (const item of section.items) {
        if (isAnchorUrl(item.url)) {
          ids.push((item.url as string).slice(2));
        }
      }
    }
    return ids;
  }, [sideNavSections]);
  const anchorKey = anchorIds.join('|');
  const [activeHash, setActiveHash] = useState<string>('');
  const anchorClickLockRef = useRef<boolean>(false);
  const anchorClickTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isSideHeader) return;
    // Reset on route change so a previous page's section can't keep
    // highlighting an item the new page doesn't even contain.
    setActiveHash('');
    if (!anchorKey) return;

    const ids = anchorKey.split('|');
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (anchorClickLockRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHash(`/#${entry.target.id}`);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isSideHeader, anchorKey, pathname]);

  useEffect(() => {
    return () => {
      if (anchorClickTimerRef.current != null) {
        window.clearTimeout(anchorClickTimerRef.current);
      }
    };
  }, []);

  const handleAnchorActivate = useCallback((url: string) => {
    setActiveHash(url);
    anchorClickLockRef.current = true;
    if (anchorClickTimerRef.current != null) {
      window.clearTimeout(anchorClickTimerRef.current);
    }
    anchorClickTimerRef.current = window.setTimeout(() => {
      anchorClickLockRef.current = false;
      anchorClickTimerRef.current = null;
    }, 600);
  }, []);

  useScrollLock(isMobileMenuOpen && !isLarge);

  useEffect(() => {
    // Blend the glass effect in gradually instead of snapping at a threshold.
    const handleScroll = () => {
      if (scrollRafRef.current != null) return;
      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = null;
        const nextProgress = Math.min(
          Math.max(window.scrollY - HEADER_GLASS_ANCHOR_OFFSET, 0) /
            HEADER_GLASS_BLEND_DISTANCE,
          1
        );
        if (Math.abs(nextProgress - scrollProgressRef.current) < 0.01) return;
        scrollProgressRef.current = nextProgress;
        setScrollProgress(nextProgress);
      });
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollRafRef.current != null) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, []);

  const headerGlassStyle = useMemo<CSSProperties>(() => {
    const easedProgress = 1 - Math.pow(1 - scrollProgress, 3);
    const blur = Number((easedProgress * HEADER_SCROLL_MAX_BLUR).toFixed(2));
    const saturation = Number((1 + easedProgress * 0.22).toFixed(2));
    const backgroundAlpha = Number((1 - easedProgress).toFixed(3));
    const foregroundStartPercent = Number(
      ((1 - easedProgress) * 100).toFixed(2)
    );

    return {
      '--landing-header-light-bg': `rgba(255, 255, 255, ${backgroundAlpha})`,
      '--landing-header-dark-bg': `rgba(${LANDING_HEADER_DARK_BACKGROUND}, ${backgroundAlpha})`,
      '--landing-header-foreground': `color-mix(in oklab, var(--landing-header-start-foreground) ${foregroundStartPercent}%, var(--landing-header-end-foreground))`,
      '--landing-header-light-border': 'transparent',
      '--landing-header-dark-border': 'transparent',
      '--landing-header-shadow': 'none',
      '--tw-backdrop-blur': `blur(${blur}px)`,
      '--tw-backdrop-saturate': `saturate(${saturation})`,
    } as CSSProperties;
  }, [scrollProgress]);

  const headerOverlayStyle = useMemo<CSSProperties>(() => {
    const blur = Number((scrollProgress * HEADER_SCROLL_MAX_BLUR).toFixed(2));

    return {
      opacity: scrollProgress,
      '--tw-backdrop-blur': `blur(${blur}px)`,
    } as CSSProperties;
  }, [scrollProgress]);

  // Navigation menu for large screens
  const NavMenu = () => {
    return (
      <NavigationMenu
        viewport={false}
        className="**:data-[slot=navigation-menu-content]:top-10 max-lg:hidden"
      >
        <NavigationMenuList className="gap-2">
          {header.nav?.items
            ?.filter((item) => isNavItemVisible(item.url, item.children))
            .map((item, idx) => {
              const visibleChildren =
                item.children?.filter((sub) => isNavItemVisible(sub.url)) || [];

              // No children or single child after filtering → render as top-level link
              if (visibleChildren.length <= 1) {
                const link =
                  visibleChildren.length === 1 ? visibleChildren[0] : item;
                return (
                  <NavigationMenuLink key={idx} asChild>
                    <Link
                      href={link.url || ''}
                      target={link.target || '_self'}
                      className={`landing-header-nav-link flex min-h-10 flex-row items-center gap-2 rounded-md px-4 py-2 text-sm transition-colors hover:bg-muted/60 ${
                        pathname.endsWith(link.url as string)
                          ? 'bg-muted text-foreground'
                          : ''
                      }`}
                    >
                      {link.icon && <SmartIcon name={link.icon as string} />}
                      {link.title}
                    </Link>
                  </NavigationMenuLink>
                );
              }

              return (
                <NavigationMenuItem key={idx}>
                  <NavigationMenuTrigger className="landing-header-nav-link flex flex-row items-center gap-2 text-sm">
                    {item.icon && (
                      <SmartIcon
                        name={item.icon as string}
                        className="h-4 w-4"
                      />
                    )}
                    {item.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="min-w-2xs origin-top p-0.5">
                    <div className="rounded-[calc(var(--radius)-2px)] border border-foreground/5 border-transparent bg-card p-2 shadow ring-1 ring-foreground/5">
                      <ul className="mt-1 space-y-2">
                        {visibleChildren.map(
                          (subItem: NavItem, index: number) => (
                            <ListItem
                              key={index}
                              href={subItem.url || ''}
                              target={subItem.target || '_self'}
                              title={subItem.title || ''}
                              description={subItem.description || ''}
                            >
                              {subItem.icon && (
                                <SmartIcon name={subItem.icon as string} />
                              )}
                            </ListItem>
                          )
                        )}
                      </ul>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              );
            })}
        </NavigationMenuList>
      </NavigationMenu>
    );
  };

  // Mobile menu using Accordion, shown on small screens
  const MobileMenu = ({ closeMenu }: { closeMenu: () => void }) => {
    return (
      <nav
        role="navigation"
        className="w-full [--color-border:--alpha(var(--color-foreground)/5%)] [--color-muted:--alpha(var(--color-foreground)/5%)]"
      >
        <Accordion
          type="single"
          collapsible
          className="-mx-4 mt-0.5 space-y-0.5 **:hover:no-underline"
        >
          {header.nav?.items
            ?.filter((item) => isNavItemVisible(item.url, item.children))
            .map((item, idx) => {
              const visibleChildren =
                item.children?.filter((sub) => isNavItemVisible(sub.url)) || [];

              // Single child after filtering → render as top-level link
              if (visibleChildren.length <= 1) {
                const link =
                  visibleChildren.length === 1 ? visibleChildren[0] : item;
                return (
                  <AccordionItem
                    key={idx}
                    value={link.title || ''}
                    className="group relative border-b-0 before:pointer-events-none before:absolute before:inset-x-4 before:bottom-0 before:border-b"
                  >
                    <Link
                      href={link.url || ''}
                      onClick={closeMenu}
                      className="landing-header-nav-link flex items-center justify-between px-4 py-3 text-lg **:!font-normal data-[state=open]:bg-muted"
                    >
                      {link.title}
                    </Link>
                  </AccordionItem>
                );
              }

              return (
                <AccordionItem
                  key={idx}
                  value={item.title || ''}
                  className="group relative border-b-0 before:pointer-events-none before:absolute before:inset-x-4 before:bottom-0 before:border-b"
                >
                  <AccordionTrigger className="landing-header-nav-link flex items-center justify-between px-4 py-3 text-lg **:!font-normal data-[state=open]:bg-muted">
                    {item.title}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <ul>
                      {visibleChildren.map((subItem: NavItem, iidx) => (
                        <li key={iidx}>
                          <Link
                            href={subItem.url || ''}
                            onClick={closeMenu}
                            className="landing-header-nav-link grid grid-cols-[auto_1fr] items-center gap-2.5 px-4 py-2"
                          >
                            <div
                              aria-hidden
                              className="flex items-center justify-center *:size-4"
                            >
                              {subItem.icon && (
                                <SmartIcon name={subItem.icon as string} />
                              )}
                            </div>
                            <div className="text-base">{subItem.title}</div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
        </Accordion>
      </nav>
    );
  };

  // List item for submenus in NavigationMenu
  function ListItem({
    title,
    description,
    children,
    href,
    target,
    ...props
  }: React.ComponentPropsWithoutRef<'li'> & {
    href: string;
    title: string;
    description?: string;
    target?: string;
  }) {
    return (
      <li {...props}>
        <NavigationMenuLink asChild>
          <Link
            href={href}
            target={target || '_self'}
            className="grid grid-cols-[auto_1fr] gap-3.5"
          >
            <div className="relative flex size-9 items-center justify-center rounded border border-transparent bg-background shadow-sm ring-1 ring-foreground/10">
              {children}
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-foreground">{title}</div>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {description}
              </p>
            </div>
          </Link>
        </NavigationMenuLink>
      </li>
    );
  }

  const headerButtonClassName = (variant?: string) =>
    cn(
      'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
      'h-10 px-4 ring-0',
      variant === 'outline'
        ? 'border border-primary border-transparent bg-background shadow-sm ring-1 shadow-black/15 ring-foreground/10 duration-200 hover:bg-muted/50 dark:ring-foreground/15 dark:hover:bg-muted/50'
        : HEADER_PRIMARY_BUTTON_CLASS
    );

  const HeaderButtons = ({
    className,
    compact = false,
  }: {
    className?: string;
    compact?: boolean;
  }) => {
    if (!header.buttons?.length) return null;

    return (
      <>
        {header.buttons.map((button, idx) => (
          <Link
            key={idx}
            href={button.url || ''}
            target={button.target || '_self'}
            className={cn(headerButtonClassName(button.variant), className)}
          >
            {button.icon && (
              <SmartIcon name={button.icon as string} className="size-4" />
            )}
            <span className={cn(compact && 'sr-only')}>{button.title}</span>
          </Link>
        ))}
      </>
    );
  };

  return (
    <>
      <header
        data-state={isMobileMenuOpen ? 'active' : 'inactive'}
        className={cn(
          'site-header-panel fixed inset-x-0 top-0 z-50',
          isLandingHome &&
            `${LANDING_HOME_HEADER_THEME_CLASS_NAME} landing-home-header-chrome`,
          isSideHeader && 'lg:hidden'
        )}
        style={isLandingHome ? headerGlassStyle : undefined}
      >
        <div
          aria-hidden
          className={cn(
            isLandingHome ? 'hidden' : 'site-header-scroll-overlay'
          )}
          style={isLandingHome ? undefined : headerOverlayStyle}
        />

        <div className="relative container">
          <div className="relative flex flex-wrap items-center justify-between lg:py-5">
            <div className="flex justify-between gap-8 max-lg:h-14 max-lg:w-full max-lg:border-b">
              {/* Brand Logo */}
              {header.brand && <BrandLogo brand={header.brand} />}

              {/* Desktop Navigation Menu */}
              {isLarge && <NavMenu />}
              {/* Hamburger menu button for mobile navigation */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={
                  isMobileMenuOpen == true ? 'Close Menu' : 'Open Menu'
                }
                className="relative z-20 -m-2.5 -mr-3 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="m-auto size-5 duration-200 in-data-[state=active]:scale-0 in-data-[state=active]:rotate-180 in-data-[state=active]:opacity-0" />
                <X className="absolute inset-0 m-auto size-5 scale-0 -rotate-180 opacity-0 duration-200 in-data-[state=active]:scale-100 in-data-[state=active]:rotate-0 in-data-[state=active]:opacity-100" />
              </button>
            </div>

            {/* Show mobile menu if needed */}
            {!isLarge && isMobileMenuOpen && (
              <MobileMenu closeMenu={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Header right section: theme toggler, locale selector, sign, buttons */}
            <div className="mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 in-data-[state=active]:flex max-lg:in-data-[state=active]:mt-6 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="flex w-full flex-row items-center gap-4 sm:flex-row sm:gap-6 sm:space-y-0 md:w-fit">
                <HeaderButtons />

                {header.show_theme ? <ThemeToggler /> : null}
                {showLocaleSelector ? <LocaleSelector /> : null}
                <div className="flex-1 md:hidden"></div>
                {header.show_sign ? (
                  <SignUser
                    userNav={header.user_nav}
                    buttonClassName={cn(
                      'ml-0 px-4 font-semibold',
                      HEADER_PRIMARY_BUTTON_CLASS
                    )}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>
      {isSideHeader && (
        <SideHeader
          header={header}
          isSideHeaderCollapsed={isSideHeaderCollapsed}
          onSideHeaderCollapsedChange={onSideHeaderCollapsedChange}
          sideHeaderWidth={sideHeaderWidth}
          sideNavSections={sideNavSections}
          pathname={pathname}
          activeHash={activeHash}
          collapsibleTextClass={collapsibleTextClass}
          showLocaleSelector={showLocaleSelector}
          onAnchorActivate={handleAnchorActivate}
        />
      )}
    </>
  );
}
