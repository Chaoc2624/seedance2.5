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
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <AppImage
        src={envConfigs.app_logo}
        alt={envConfigs.app_name}
        width={80}
        height={80}
      />
      <h1 className="text-2xl font-normal">Seedance 2.5 page not found</h1>
      <Button asChild>
        <a href={homeUrl} className="mt-4">
          <SmartIcon name="ArrowLeft" />
          <span>Back to Home</span>
        </a>
      </Button>
    </div>
  );
}
