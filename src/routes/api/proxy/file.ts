/**
 * File proxy server route
 */
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/proxy/file')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const fileUrl = url.searchParams.get('url');

        if (!fileUrl) {
          return new Response('Missing url parameter', { status: 400 });
        }

        try {
          const response = await fetch(fileUrl);
          if (!response.ok) {
            return new Response(
              `Failed to fetch file: ${response.statusText}`,
              {
                status: response.status,
              }
            );
          }

          const contentType =
            response.headers.get('content-type') || 'application/octet-stream';

          return new Response(response.body, {
            headers: { 'Content-Type': contentType },
          });
        } catch (error) {
          console.error('Proxy error:', error);
          return new Response('Internal Server Error', { status: 500 });
        }
      },
    },
  },
});
