import { createFileRoute, Outlet } from '@tanstack/react-router';

import { ThemeProvider } from '@/core/theme/provider';

import { Toaster } from '@/components/ui/sonner';
import { AppContextProvider } from '@/contexts/app';

export const Route = createFileRoute('/{-$locale}/_auth')({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <AppContextProvider>
      <ThemeProvider>
        <div className="flex min-h-screen items-center justify-center">
          <Outlet />
        </div>
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </AppContextProvider>
  );
}
