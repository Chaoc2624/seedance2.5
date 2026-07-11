import { createFileRoute } from '@tanstack/react-router';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import { useEffect, useRef } from 'react';

import { signIn } from '@/core/auth/client';

import { ensureDeviceFingerprint } from '@/lib/device-fingerprint';

export const Route = createFileRoute('/{-$locale}/_oauth/auth-popup')({
  component: AuthPopupPage,
  validateSearch: (search: Record<string, unknown>) => ({
    provider: (search.provider as string) || '',
  }),
});

function AuthPopupPage() {
  const { provider } = Route.useSearch();
  const triggered = useRef(false);

  useEffect(() => {
    if (!provider || triggered.current) return;
    triggered.current = true;

    void ensureDeviceFingerprint().then(() =>
      signIn.social({
        provider,
        callbackURL: '/auth-callback',
      })
    );
  }, [provider]);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">
        Redirecting to {provider}...
      </p>
    </div>
  );
}
