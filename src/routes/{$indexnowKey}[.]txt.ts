import { createFileRoute } from '@tanstack/react-router';

import { getRuntimeConfig } from '@/config/runtime.server';

const INDEXNOW_KEY_RE = /^[A-Za-z0-9_-]{8,128}$/;

export const Route = createFileRoute('/{$indexnowKey}.txt')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const requestedKey = params.indexnowKey?.trim() || '';

        if (!INDEXNOW_KEY_RE.test(requestedKey)) {
          return new Response('Not Found', { status: 404 });
        }

        const configs = await getRuntimeConfig();
        const configuredKeys = [
          configs.bing_indexnow_key,
          configs.bing_webmaster_verification_id,
        ]
          .map((key) => key?.trim() || '')
          .filter((key) => INDEXNOW_KEY_RE.test(key));

        if (!configuredKeys.includes(requestedKey)) {
          return new Response('Not Found', { status: 404 });
        }

        return new Response(requestedKey, {
          headers: {
            'Cache-Control': 'public, max-age=300',
            'Content-Type': 'text/plain; charset=utf-8',
          },
        });
      },
    },
  },
});
