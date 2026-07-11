import { definePlugin } from 'nitro';

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const env = (event.req as { runtime?: { cloudflare?: { env?: unknown } } })
      .runtime?.cloudflare?.env;

    if (env && typeof env === 'object') {
      (globalThis as { __env__?: Record<string, string> }).__env__ =
        env as Record<string, string>;
    }
  });
});
