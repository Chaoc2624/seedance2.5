import {
  Link as TanStackLink,
  useLocation,
  useRouter as useTanStackRouter,
} from '@tanstack/react-router';
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';

import { adminLocales, defaultLocale, locales } from '@/config/locale';

function isPlainLeftClick(event: ReactMouseEvent<HTMLAnchorElement>) {
  return !(
    event.button !== 0 ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  );
}

function scrollToHashTarget(hash: string) {
  const targetId = decodeURIComponent(hash.replace(/^#/, ''));
  if (!targetId) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  }

  const target = document.getElementById(targetId);
  if (!target) {
    return false;
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

function isLocaleAllowedForPath(locale: string, pathname: string): boolean {
  if (locales.includes(locale)) {
    return true;
  }

  if (!adminLocales.includes(locale)) {
    return false;
  }

  const prefix = `/${locale}/shiponce`;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function stripLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2}(?:-[a-zA-Z]{2,4})?)(?=\/|$)/);
  if (!match?.[1] || !isLocaleAllowedForPath(match[1], pathname)) {
    return pathname;
  }

  return pathname.slice(match[0].length) || '/';
}

/**
 * Get the current locale from the URL path.
 * No prefix → defaultLocale.
 */
export function useCurrentLocale(): string {
  const location = useLocation();
  const match = location.pathname.match(
    /^\/([a-z]{2}(?:-[a-zA-Z]{2,4})?)(?:\/|$)/
  );
  if (match?.[1] && isLocaleAllowedForPath(match[1], location.pathname)) {
    return match[1];
  }
  return defaultLocale;
}

/**
 * Read query parameters from the current TanStack Router location.
 */
export function useSearchParams() {
  const location = useLocation();
  return new URLSearchParams(location.search as Record<string, string>);
}

/**
 * Get the current pathname (without locale prefix).
 */
export function usePathname(): string {
  const location = useLocation();
  const pathname = location.pathname;
  // Check if path starts with a known locale prefix
  const match = pathname.match(/^\/([a-z]{2}(?:-[a-zA-Z]{2,4})?)(\/.*)?$/);
  if (match && isLocaleAllowedForPath(match[1], pathname)) {
    return match[2] || '/';
  }
  return pathname;
}

/**
 * Build a locale-prefixed path.
 * Default locale → no prefix (e.g. /about).
 * Other locales → /$locale/about.
 */
export function localePath(path: string, locale?: string): string {
  const loc = locale || defaultLocale;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Default locale: no prefix
  if (loc === defaultLocale) {
    return cleanPath;
  }
  return `/${loc}${cleanPath}`;
}

/**
 * Router wrapper with locale-aware navigation.
 */
export function useRouter() {
  const router = useTanStackRouter();
  const currentLocale = useCurrentLocale();

  function resolveHref(href: string, opts?: { locale?: string }): string {
    const locale = opts?.locale || currentLocale;
    // Strip existing locale prefix
    const stripped = stripLocalePrefix(href);
    const cleanPath = stripped || '/';
    // Default locale: no prefix
    if (locale === defaultLocale) {
      return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    }
    return `/${locale}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
  }

  return {
    push(href: string, opts?: { locale?: string }) {
      const to = resolveHref(href, opts);
      router.navigate({ to: to as any });
    },
    replace(href: string, opts?: { locale?: string }) {
      const to = resolveHref(href, opts);
      router.navigate({ to: to as any, replace: true });
    },
    back() {
      window.history.back();
    },
    forward() {
      window.history.forward();
    },
    refresh() {
      window.location.reload();
    },
  };
}

/**
 * Locale-aware Link component.
 *
 * Accepts `href` and converts internal paths to TanStack Router's `to`.
 * Default locale: no prefix. Other locales: /$locale/ prefix.
 */
interface LinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
> {
  href: string;
  children?: ReactNode;
  locale?: string;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, locale, children, ...props },
  ref
) {
  const currentLocale = useCurrentLocale();
  const location = useLocation();
  const hashIndex = href.indexOf('#');
  const hasHash = hashIndex >= 0;
  const rawPath = hasHash ? href.slice(0, hashIndex) : href;
  const hash = hasHash ? href.slice(hashIndex) : '';

  // External links use plain <a>
  if (href.startsWith('http') || href.startsWith('mailto:')) {
    return (
      <a ref={ref} href={href} {...props} suppressHydrationWarning>
        {children}
      </a>
    );
  }

  // Build locale-aware path
  const targetLocale = locale || currentLocale;
  let to = rawPath;
  if (rawPath.startsWith('/')) {
    // Strip existing locale prefix
    const stripped = stripLocalePrefix(rawPath);
    const cleanPath = stripped || '/';
    // Default locale: no prefix
    if (targetLocale === defaultLocale) {
      to = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    } else {
      to = `/${targetLocale}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
    }
  } else if (!rawPath && hash) {
    to = location.pathname;
  }

  const targetHref = hash ? `${to}${hash}` : to;
  const handleClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    props.onClick?.(event);

    if (
      event.defaultPrevented ||
      !hash ||
      !isPlainLeftClick(event) ||
      (!!props.target && props.target !== '_self') ||
      location.pathname !== to
    ) {
      return;
    }

    event.preventDefault();

    const nextUrl = rawPath
      ? `${to}${hash}`
      : `${location.pathname}${location.search}${hash}`;

    if (window.location.hash === hash) {
      window.history.replaceState(window.history.state, '', nextUrl);
    } else {
      window.history.pushState(window.history.state, '', nextUrl);
    }

    if (!scrollToHashTarget(hash)) {
      window.location.hash = hash;
    }
  };

  return (
    <TanStackLink
      ref={ref}
      to={targetHref as any}
      {...(props as any)}
      onClick={handleClick}
    >
      {children}
    </TanStackLink>
  );
});

/**
 * Redirect helper (server-side / loader).
 */
export { redirect } from '@tanstack/react-router';
