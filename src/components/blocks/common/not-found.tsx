import { useState, useEffect } from 'react';

import { defaultLocale, locales } from '@/config/locale';

import AppImage from '@/components/blocks/common/media/app-image';
import { SmartIcon } from '@/components/blocks/common/smart-icon';
import { Button } from '@/components/ui/button';
import { envConfigs } from '@/config';

function getHomeUrl(pathname: string) {
  for (const l of locales) {
    if (
      l !== defaultLocale &&
      (pathname === `/${l}` || pathname.startsWith(`/${l}/`))
    ) {
      return `/${l}`;
    }
  }
  return '/';
}

export function NotFoundPage() {
  const [homeUrl, setHomeUrl] = useState('/');

  useEffect(() => {
    setHomeUrl(getHomeUrl(window.location.pathname));
  }, []);

  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_42%,rgba(37,99,235,0.14)_0,rgba(37,99,235,0.04)_32%,transparent_58%),linear-gradient(180deg,#f8fbff_0%,#eff6ff_52%,#ffffff_100%)] px-6 text-center text-slate-950">
      <div
        aria-hidden
        className="absolute inset-x-10 top-10 -z-10 h-40 rounded-full bg-blue-200/25 blur-3xl"
      />
      <div className="rounded-[2rem] border border-blue-100 bg-white/82 p-8 shadow-[0_28px_90px_rgba(37,99,235,0.16)] backdrop-blur-xl">
        <div className="mx-auto flex size-20 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
          <AppImage
            src={envConfigs.app_logo}
            alt={envConfigs.app_name}
            width={56}
            height={56}
          />
        </div>
        <p className="mt-6 text-sm font-semibold text-blue-700">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-slate-950">
          Seedance 2.5 page not found
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
          This page drifted out of frame. Return home and keep creating video.
        </p>
        <Button
          asChild
          className="mt-6 rounded-full bg-blue-600 px-5 text-white shadow-[0_14px_34px_rgba(37,99,235,0.22)] hover:bg-blue-700"
        >
          <a href={homeUrl}>
            <SmartIcon name="ArrowLeft" />
            <span>Back to Home</span>
          </a>
        </Button>
      </div>
    </div>
  );
}
