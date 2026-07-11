/**
 * Application preset configuration.
 *
 * Controls which modules are enabled at build time.
 * - 'full': AI SaaS with admin, payment, AI generators, docs, RBAC, etc.
 * - 'lite': Ad-monetized landing page with blog, feedback, analytics via env.
 *
 * Set via VITE_APP_PRESET env var. Defaults to 'full' for backward compatibility.
 */

export type Preset = 'full' | 'lite';

export const APP_PRESET: Preset =
  (import.meta.env?.VITE_APP_PRESET as Preset) ?? 'full';

/**
 * Read a per-module env var; falls back to the given default if unset.
 * Truthy values: "true", "1", "yes", "on" (case-insensitive).
 */
function readModuleEnv(key: string, fallback: boolean): boolean {
  const raw = import.meta.env?.[key];
  if (raw === undefined || raw === null || raw === '') return fallback;
  const normalized = String(raw).trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  return fallback;
}

/**
 * Module enable/disable flags derived from preset + optional env overrides.
 * Core infrastructure (auth, db, i18n, theme) is always enabled.
 * The opt-in toggles below (ai, showcases, docs, blog, updates) are
 * configurable per-project via VITE_APP_MODULE_* env vars.
 */
export const modules = {
  // --- always on ---
  auth: true,
  legal: true,

  // --- configurable via env; defaults follow preset ---
  blog: readModuleEnv('VITE_APP_MODULE_BLOG', true),
  docs: readModuleEnv('VITE_APP_MODULE_DOCS', APP_PRESET === 'full'),
  updates: readModuleEnv('VITE_APP_MODULE_UPDATES', APP_PRESET === 'full'),
  showcases: readModuleEnv('VITE_APP_MODULE_SHOWCASES', APP_PRESET === 'full'),
  ai: readModuleEnv('VITE_APP_MODULE_AI', APP_PRESET === 'full'),

  // --- preset-bound for now (admin/auth-heavy features) ---
  payment: APP_PRESET === 'full',
  credits: APP_PRESET === 'full',
  activity: APP_PRESET === 'full',
  admin: APP_PRESET === 'full',
  rbac: APP_PRESET === 'full',
  configTable: APP_PRESET === 'full',
} as const;

export type ModuleName = keyof typeof modules;

export function isModuleEnabled(name: ModuleName): boolean {
  return modules[name];
}
