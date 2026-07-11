/**
 * Auth catch-all server route
 * Forwards all requests to better-auth handler.
 */
import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth/index.server';

import { isCloudflareWorker } from '@/lib/env';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: handleAuth,
      POST: handleAuth,
      PUT: handleAuth,
      DELETE: handleAuth,
      PATCH: handleAuth,
    },
  },
});

async function handleAuth({ request }: { request: Request }) {
  // Rate limit get-session
  const url = new URL(request.url);
  if (!isCloudflareWorker && url.pathname.endsWith('/api/auth/get-session')) {
    const intervalMs =
      Number(process.env.AUTH_GET_SESSION_MIN_INTERVAL_MS) || 800;
    const limited = enforceMinIntervalRateLimit(request, {
      intervalMs,
      keyPrefix: 'auth-get-session',
    });
    if (limited) return limited;
  }

  const auth = await getAuth();
  return auth.handler(request);
}
