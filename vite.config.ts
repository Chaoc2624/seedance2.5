import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';

function readModuleEnv(key: string, fallback: boolean): boolean {
  const raw = process.env[key];
  if (raw === undefined || raw === null || raw === '') return fallback;
  const normalized = String(raw).trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  return fallback;
}

// ─── Vite config ─────────────────────────────────────────────────

export default defineConfig(({ command }) => {
  // ─── Preset-based route filtering ─────────────────────────────
  // In 'lite' mode, admin/docs/payment routes are excluded from the build.
  // Optional public modules can still be enabled via VITE_APP_MODULE_* flags.
  const preset = process.env.VITE_APP_PRESET || 'full';
  const aiModuleEnabled = readModuleEnv(
    'VITE_APP_MODULE_AI',
    preset === 'full'
  );
  const isBuild = command === 'build';

  const liteIgnorePatterns = [
    'admin', // /admin/* — entire admin panel
    '_docs', // /docs — documentation
    ...(aiModuleEnabled ? [] : ['(^|/)ai(/|$)']), // /ai/* generators
    'activity', // /activity — user activity center
    'pricing', // /pricing — pricing page
    'billing', // settings/billing*
    'credits', // settings/credits (in _landing/settings context)
    'invoices', // settings/invoices
    'showcases', // /showcases
    'updates', // /updates
  ];

  // Always ignore components dirs (they are not routes). The local no-db
  // config panel is a dev-server tool and must not enter production bundles.
  const baseIgnorePatterns = ['.*components.*', ...(isBuild ? ['config'] : [])];
  const routeFileIgnorePattern =
    preset === 'lite' && isBuild
      ? `(${[...baseIgnorePatterns, ...liteIgnorePatterns].join('|')})`
      : `(${baseIgnorePatterns.join('|')})`;

  return {
    define: {
      __SHIPONCE_SOURCE_ROOT__: JSON.stringify(process.cwd()),
    },
    server: {
      port: 4000,
    },
    optimizeDeps: {
      exclude: ['lucide-react', '@tanstack/start-server-core'],
    },
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      tailwindcss(),
      tanstackStart({
        srcDirectory: 'src',
        router: {
          routesDirectory: 'routes',
          routeFileIgnorePattern,
        },
      }),
      viteReact(),
      nitro({
        compatibilityDate: '2026-04-17',
        serverDir: 'src',
        ignore: ['routes/**'],
        plugins: ['./src/plugins/cloudflare-env.ts'],
      }),
    ],
  };
});
