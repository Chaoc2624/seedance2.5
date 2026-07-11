import { BProgress } from '@bprogress/core';
import {
  Outlet,
  HeadContent,
  Scripts,
  createRootRoute,
  useRouter,
} from '@tanstack/react-router';
import { useEffect } from 'react';
import '@bprogress/core/css';
import i18n from '@/core/i18n';

import appCss from '@/config/style/global.css?url';

import {
  AdsManager,
  AdsenseProvider,
  GoogleFundingChoicesProvider,
} from '@/extensions/ads';
import {
  AnalyticsManager,
  GoogleAnalyticsProvider,
  ClarityAnalyticsProvider,
  PlausibleAnalyticsProvider,
} from '@/extensions/analytics';

import { ClickToComponentDevtools } from '@/components/blocks/common/click-to-component-devtools';
import { envConfigs } from '@/config';

export const Route = createRootRoute({
  loader: async () => {
    try {
      const { getRootLoaderDataFn } = await import('@/server/root.functions');
      const data = await getRootLoaderDataFn();

      return {
        googleAnalyticsId: data.googleAnalyticsId,
        clarityId: data.clarityId,
        plausibleScriptId: data.plausibleScriptId,
        adsenseCode: data.adsenseCode,
        googleFundingChoicesId: data.googleFundingChoicesId,
        gscId: data.gscId,
        bingWebmasterVerificationId: data.bingWebmasterVerificationId,
      };
    } catch {
      return {
        googleAnalyticsId: '',
        clarityId: '',
        plausibleScriptId: '',
        adsenseCode: '',
        googleFundingChoicesId: '',
        gscId: '',
        bingWebmasterVerificationId: '',
      };
    }
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: envConfigs.app_favicon },
    ],
  }),
  component: RootLayout,
});

BProgress.configure({ showSpinner: false });

function useBodyScrollLockGap() {
  useEffect(() => {
    const body = document.body;
    const documentElement = document.documentElement;
    let scrollbarWidth = 0;

    const setScrollbarWidth = (width: number) => {
      scrollbarWidth = Math.max(0, width);
      documentElement.style.setProperty(
        '--removed-body-scroll-bar-size',
        `${scrollbarWidth}px`
      );
    };

    const measureScrollbarWidth = () => {
      if (body.hasAttribute('data-scroll-locked')) return;
      setScrollbarWidth(window.innerWidth - documentElement.clientWidth);
    };

    const syncScrollLockGap = () => {
      if (!body.hasAttribute('data-scroll-locked')) {
        measureScrollbarWidth();
        return;
      }

      documentElement.style.setProperty(
        '--removed-body-scroll-bar-size',
        `${scrollbarWidth}px`
      );
    };

    measureScrollbarWidth();

    const observer = new MutationObserver(syncScrollLockGap);
    observer.observe(body, {
      attributes: true,
      attributeFilter: ['data-scroll-locked'],
    });
    window.addEventListener('resize', measureScrollbarWidth, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measureScrollbarWidth);
      documentElement.style.removeProperty('--removed-body-scroll-bar-size');
    };
  }, []);
}

function isChunkLoadError(value: unknown): boolean {
  const message =
    value instanceof Error
      ? value.message
      : typeof value === 'string'
        ? value
        : '';

  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('error loading dynamically imported module')
  );
}

function getChunkLoadErrorUrl(value: unknown): string {
  const message =
    value instanceof Error
      ? value.message
      : typeof value === 'string'
        ? value
        : '';
  return message.match(/https?:\/\/\S+?\.js/)?.[0] ?? 'unknown';
}

function useChunkLoadReload() {
  useEffect(() => {
    const reloadOnce = (value: unknown) => {
      if (!isChunkLoadError(value)) return;

      const key = `seedance:chunk-reload:${getChunkLoadErrorUrl(value)}`;
      if (sessionStorage.getItem(key)) return;

      sessionStorage.setItem(key, '1');
      window.location.reload();
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      reloadOnce(event.reason);
    };

    const handleError = (event: ErrorEvent) => {
      reloadOnce(event.error ?? event.message);
    };

    window.addEventListener('unhandledrejection', handleRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);
}

function RootLayout() {
  const router = useRouter();
  const {
    googleAnalyticsId,
    clarityId,
    plausibleScriptId,
    adsenseCode,
    googleFundingChoicesId,
    gscId,
    bingWebmasterVerificationId,
  } = Route.useLoaderData();

  useBodyScrollLockGap();
  useChunkLoadReload();

  useEffect(() => {
    const unsubStart = router.subscribe(
      'onBeforeNavigate',
      ({ pathChanged }) => {
        if (pathChanged) {
          BProgress.start();
        }
      }
    );

    const unsubDone = router.subscribe('onResolved', () => {
      BProgress.done();
    });

    return () => {
      unsubStart();
      unsubDone();
    };
  }, [router]);

  const analytics = new AnalyticsManager();
  if (googleAnalyticsId) {
    analytics.addProvider(
      new GoogleAnalyticsProvider({ gaId: googleAnalyticsId })
    );
  }
  if (clarityId) {
    analytics.addProvider(new ClarityAnalyticsProvider({ clarityId }));
  }
  if (plausibleScriptId) {
    analytics.addProvider(
      new PlausibleAnalyticsProvider({
        scriptId: plausibleScriptId,
      })
    );
  }

  const ads = new AdsManager();
  if (adsenseCode) {
    ads.addProvider(new AdsenseProvider({ adId: adsenseCode }));
  }
  if (googleFundingChoicesId) {
    ads.addProvider(
      new GoogleFundingChoicesProvider({
        publisherId: googleFundingChoicesId,
      })
    );
  }

  return (
    <html lang={i18n.language || 'en'} suppressHydrationWarning>
      <head>
        <HeadContent />
        {gscId && <meta name="google-site-verification" content={gscId} />}
        {bingWebmasterVerificationId && (
          <meta name="msvalidate.01" content={bingWebmasterVerificationId} />
        )}
        {analytics.getMetaTags()}
        {ads.getMetaTags()}
        {analytics.getHeadScripts()}
        {ads.getHeadScripts()}
      </head>
      <body className="overflow-x-hidden" suppressHydrationWarning>
        <Outlet />
        <Scripts />
        <ClickToComponentDevtools />
        {analytics.getBodyScripts()}
        {ads.getBodyScripts()}
      </body>
    </html>
  );
}
