import { createFileRoute, Outlet } from '@tanstack/react-router';

import { useTranslations } from '@/core/i18n/hooks';
import { ThemeProvider } from '@/core/theme/provider';

import { DEFAULT_HEADER_POSITION } from '@/config/layout';

// Get the landing layout component synchronously (pre-loaded via import.meta.glob)
import ThemeLandingLayout from '@/themes/default/layouts/landing';

import { NotFoundPage } from '@/components/blocks/common/not-found';
import { Toaster } from '@/components/ui/sonner';
import { AppContextProvider } from '@/contexts/app';
import {
  Footer as FooterType,
  Header as HeaderType,
} from '@/types/blocks/landing';

export const Route = createFileRoute('/{-$locale}/_landing')({
  loader: async () => {
    try {
      const { getLandingLayoutDataFn } =
        await import('@/server/root.functions');
      return await getLandingLayoutDataFn();
    } catch {
      return {
        headerPosition: DEFAULT_HEADER_POSITION,
      };
    }
  },
  component: LandingLayout,
  notFoundComponent: NotFoundPage,
});

function LandingLayout() {
  const t = useTranslations('landing');
  const { headerPosition } = Route.useLoaderData();

  const header: HeaderType = t.raw('header');
  const footer: FooterType = t.raw('footer');

  return (
    <AppContextProvider>
      <ThemeProvider>
        <ThemeLandingLayout
          header={header}
          footer={footer}
          headerPosition={headerPosition}
        >
          <Outlet />
        </ThemeLandingLayout>
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </AppContextProvider>
  );
}
