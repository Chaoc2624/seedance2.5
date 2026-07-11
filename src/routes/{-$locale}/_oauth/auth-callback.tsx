import { createFileRoute } from '@tanstack/react-router';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import { useEffect } from 'react';

export const Route = createFileRoute('/{-$locale}/_oauth/auth-callback')({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  useEffect(() => {
    // Small delay to ensure the session cookie is fully written
    const timer = setTimeout(() => {
      // Use localStorage event to notify the main page (works even when COOP blocks window.opener)
      localStorage.setItem('auth-callback-success', Date.now().toString());
      localStorage.removeItem('auth-callback-success');
      window.close();

      // Fallback: if window.close() doesn't work (e.g. not opened as popup)
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Signing you in...</p>
    </div>
  );
}
