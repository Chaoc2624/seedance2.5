/**
 * Post-build patch for Cloudflare Pages and Workers deployment.
 *
 * Fixes known incompatibilities between Nitro's generated worker output and
 * Cloudflare's workerd runtime.
 */
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, relative } from 'node:path';

const cwd = process.cwd();
const workerDirs = [
  join(cwd, 'dist', '_worker.js'),
  join(cwd, '.output', 'server'),
].filter(isWorkerDir);

const esmImports = `
import * as _n_process from "node:process";
import * as _n_buffer from "node:buffer";
import * as _n_crypto from "node:crypto";
import * as _n_events from "node:events";
import * as _n_stream from "node:stream";
import * as _n_string_decoder from "node:string_decoder";
import * as _n_timers from "node:timers";
import * as _n_util from "node:util";
import * as _n_url from "node:url";
import * as _n_net from "node:net";
import * as _n_tls from "node:tls";
import * as _n_zlib from "node:zlib";
import * as _n_diagnostics_channel from "node:diagnostics_channel";

const _cf_builtins = {
  "node:process": _n_process,
  "node:buffer": _n_buffer,
  "node:crypto": _n_crypto,
  "node:events": _n_events,
  "node:stream": _n_stream,
  "node:string_decoder": _n_string_decoder,
  "node:timers": _n_timers,
  "node:util": _n_util,
  "node:url": _n_url,
  "node:net": _n_net,
  "node:tls": _n_tls,
  "node:zlib": _n_zlib,
  "node:diagnostics_channel": _n_diagnostics_channel
};
`;

function isWorkerDir(dir) {
  try {
    return statSync(dir).isDirectory() && existsSync(join(dir, '_runtime.mjs'));
  } catch {
    return false;
  }
}

function displayPath(path) {
  return relative(cwd, path) || '.';
}

function patchRuntime(workerDir) {
  const runtimePath = join(workerDir, '_runtime.mjs');
  const requirePattern =
    /var __require = \/\* @__PURE__ \*\/ createRequire\(import\.meta\.url\);/;

  let code = readFileSync(runtimePath, 'utf8');
  const original = code;
  const needsRequirePatch =
    requirePattern.test(code) && !code.includes('var _orig__require =');

  if (needsRequirePatch && !code.includes('const _cf_builtins = {')) {
    code = code.replace(
      /import \{ createRequire \} from "node:module";/,
      `import { createRequire } from "node:module";\n${esmImports}`
    );
  }

  if (needsRequirePatch) {
    code = code.replace(
      requirePattern,
      `var _orig__require = /* @__PURE__ */ createRequire(import.meta.url || "file:///");
var __require = function(id) {
  if (_cf_builtins[id]) return _cf_builtins[id];
  return _orig__require(id);
};`
    );
  }

  if (code !== original) {
    writeFileSync(runtimePath, code, 'utf8');
    console.log(
      `✔ Patched ${displayPath(runtimePath)}: createRequire fallback applied`
    );
    return;
  }

  console.log(`• ${displayPath(runtimePath)} already compatible`);
}

function patchDrizzleBundle(workerDir) {
  const libsDir = join(workerDir, '_libs');
  if (!existsSync(libsDir)) {
    console.log(`• ${displayPath(libsDir)} not found, skipping drizzle patch`);
    return;
  }

  const files = readdirSync(libsDir);
  for (const file of files) {
    if (!file.startsWith('drizzle-orm') || !file.endsWith('.mjs')) continue;

    const filePath = join(libsDir, file);
    let code = readFileSync(filePath, 'utf8');
    const original = code;

    code = code.replaceAll(
      'buffer$1.hasOwnProperty(key)',
      'Object.prototype.hasOwnProperty.call(buffer$1, key)'
    );
    code = code.replaceAll(
      'buffer.hasOwnProperty(key)',
      'Object.prototype.hasOwnProperty.call(buffer, key)'
    );
    code = code.replaceAll(
      'Buffer.hasOwnProperty(key)',
      'Object.prototype.hasOwnProperty.call(Buffer, key)'
    );

    if (code !== original) {
      writeFileSync(filePath, code, 'utf8');
      console.log(`✔ Patched ${displayPath(filePath)}: Buffer hasOwnProperty`);
    }
  }
}

function patchWorkerWranglerConfig() {
  const configPath = join(cwd, '.output', 'server', 'wrangler.json');
  if (!existsSync(configPath)) return;

  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  let changed = false;

  if ('pages_build_output_dir' in config) {
    delete config.pages_build_output_dir;
    changed = true;
    console.log(
      `✔ Patched ${displayPath(configPath)}: removed Pages-only output field`
    );
  }

  // Align with Cloudflare dashboard Observability / wrangler.jsonc shape.
  // deploy.sh can further override via CF_WORKER_OBSERVABILITY_* env vars.
  const flag = (key, fallback = false) =>
    String(process.env[key] ?? fallback)
      .trim()
      .toLowerCase() === 'true';
  const rate = (key, fallback = 1) => {
    const value = Number(process.env[key] ?? fallback);
    return Number.isFinite(value) ? value : fallback;
  };
  const headRate = rate('CF_WORKER_OBSERVABILITY_HEAD_SAMPLING_RATE', 1);
  const nextObservability = {
    enabled: flag('CF_WORKER_OBSERVABILITY_ENABLED', false),
    head_sampling_rate: headRate,
    logs: {
      enabled: flag('CF_WORKER_OBSERVABILITY_LOGS_ENABLED', true),
      head_sampling_rate: rate(
        'CF_WORKER_OBSERVABILITY_LOGS_HEAD_SAMPLING_RATE',
        headRate
      ),
      persist: flag('CF_WORKER_OBSERVABILITY_LOGS_PERSIST', true),
      invocation_logs: flag('CF_WORKER_OBSERVABILITY_LOGS_INVOCATION', true),
    },
    traces: {
      enabled: flag('CF_WORKER_OBSERVABILITY_TRACES_ENABLED', true),
      persist: flag('CF_WORKER_OBSERVABILITY_TRACES_PERSIST', true),
      head_sampling_rate: rate(
        'CF_WORKER_OBSERVABILITY_TRACES_HEAD_SAMPLING_RATE',
        headRate
      ),
    },
  };
  const prev = config.observability;
  if (JSON.stringify(prev ?? null) !== JSON.stringify(nextObservability)) {
    config.observability = nextObservability;
    changed = true;
    console.log(
      `✔ Patched ${displayPath(configPath)}: observability=${JSON.stringify(nextObservability)}`
    );
  }

  if (changed) {
    writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  }
}

if (workerDirs.length === 0) {
  console.warn('⚠ No Cloudflare worker output found to patch.');
}

for (const workerDir of workerDirs) {
  try {
    patchRuntime(workerDir);
    patchDrizzleBundle(workerDir);
  } catch (err) {
    console.warn(`⚠ Could not patch ${displayPath(workerDir)}:`, err.message);
  }
}

patchWorkerWranglerConfig();
