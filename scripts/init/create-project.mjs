#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

import pc from 'picocolors';

const TEMPLATE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
);

const EXCLUDED_TOP_LEVEL_DIRS = new Set([
  '.git',
  'node_modules',
  '.output',
  'dist',
  '.tanstack',
  '.source',
  '.wrangler',
  '.chats',
  '.debug',
  '.test',
  '.vercel',
]);

const EXCLUDED_TOP_LEVEL_FILES = new Set([
  'tsconfig.tsbuildinfo',
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  '.env.test',
  'wrangler.toml',
]);

const EXCLUDED_EXTS = new Set(['.db', '.sql']);

const EXCLUDED_REL_PREFIXES = [
  path.join('src', 'config', 'db', 'migrations'),
  path.join('src', 'shared', 'types', 'cloudflare.d.ts'),
];

let createdTarget = null;
let cleanupDone = false;
let activeChild = null;

function cleanupCreatedTarget() {
  if (cleanupDone) return;
  cleanupDone = true;
  if (activeChild && !activeChild.killed) {
    try {
      activeChild.kill('SIGTERM');
    } catch {}
  }
  if (!createdTarget) return;
  if (!fs.existsSync(createdTarget)) return;
  try {
    fs.rmSync(createdTarget, { recursive: true, force: true });
    process.stderr.write(pc.yellow(`\nAborted — removed ${createdTarget}\n`));
  } catch (err) {
    process.stderr.write(
      pc.red(`Cleanup failed for ${createdTarget}: ${err?.message ?? err}\n`)
    );
  }
}

process.on('SIGINT', () => {
  cleanupCreatedTarget();
  process.exit(130);
});
process.on('SIGTERM', () => {
  cleanupCreatedTarget();
  process.exit(143);
});
process.on('SIGHUP', () => {
  cleanupCreatedTarget();
  process.exit(129);
});

function expandHome(input) {
  if (input === '~') return os.homedir();
  if (input.startsWith('~/') || input.startsWith('~\\')) {
    return path.join(os.homedir(), input.slice(2));
  }
  return input;
}

function shouldCopy(src) {
  const rel = path.relative(TEMPLATE_ROOT, src);
  if (rel === '' || rel === '.') return true;
  if (path.basename(rel) === '.DS_Store') return false;
  const firstSegment = rel.split(path.sep)[0];
  if (EXCLUDED_TOP_LEVEL_DIRS.has(firstSegment)) return false;
  if (!rel.includes(path.sep) && EXCLUDED_TOP_LEVEL_FILES.has(rel))
    return false;
  for (const prefix of EXCLUDED_REL_PREFIXES) {
    if (rel === prefix || rel.startsWith(prefix + path.sep)) return false;
  }
  if (EXCLUDED_EXTS.has(path.extname(rel))) return false;
  return true;
}

function parseArgs(argv) {
  const positional = [];
  let noInstall = false;
  let noInit = false;
  let help = false;
  for (const arg of argv) {
    if (arg === '--no-install') noInstall = true;
    else if (arg === '--no-init') noInit = true;
    else if (arg === '-h' || arg === '--help') help = true;
    else positional.push(arg);
  }
  return { target: positional[0], noInstall, noInit, help };
}

function printHelp() {
  process.stdout.write(`
${pc.bold('shiponce')} — scaffold a new project from this template

${pc.bold('Usage:')}
  shiponce <target> [options]

${pc.bold('Options:')}
  --no-install   Skip bun install
  --no-init      Skip bun run init
  -h, --help     Show this help

${pc.bold('Examples:')}
  shiponce pdf-singer              # creates ./pdf-singer under cwd
  shiponce ~/code/my-new-app       # absolute or ~-expanded path
`);
}

async function promptTarget() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    const answer = await rl.question(
      pc.cyan('? ') + 'Target directory for the new project: '
    );
    if (!answer.trim()) throw new Error('Target path is required');
    return answer.trim();
  } finally {
    rl.close();
  }
}

async function resolveTargetPath(targetArg) {
  const raw = targetArg ?? (await promptTarget());
  const resolved = path.resolve(expandHome(raw));
  if (resolved === TEMPLATE_ROOT) {
    throw new Error('Target cannot be the template directory itself');
  }
  if (fs.existsSync(resolved)) {
    const contents = fs.readdirSync(resolved);
    if (contents.length > 0) {
      throw new Error(`Target already exists and is not empty: ${resolved}`);
    }
  }
  return resolved;
}

function logStep(message) {
  process.stdout.write(`${pc.cyan('•')} ${message}\n`);
}

function copyTemplate(target) {
  logStep('Copying template files');
  fs.mkdirSync(target, { recursive: true });
  fs.cpSync(TEMPLATE_ROOT, target, { recursive: true, filter: shouldCopy });
}

function runGitInit(target) {
  logStep('Initializing git repository');
  const result = spawnSync('git', ['init', '--quiet'], {
    cwd: target,
    stdio: 'ignore',
  });
  if (result.status !== 0) {
    process.stderr.write(pc.yellow('  git init failed — continuing\n'));
  }
}

function runInteractiveChild(cmd, args, cwd, label, extraEnv) {
  return new Promise((resolve, reject) => {
    const env = extraEnv ? { ...process.env, ...extraEnv } : process.env;
    const child = spawn(cmd, args, { cwd, stdio: 'inherit', env });
    activeChild = child;
    child.on('error', (err) => {
      activeChild = null;
      reject(err);
    });
    child.on('close', (code, signal) => {
      activeChild = null;
      if (code === 0) resolve();
      else if (signal)
        reject(new Error(`${label} terminated by signal ${signal}`));
      else reject(new Error(`${label} exited with code ${code}`));
    });
  });
}

async function runBunInstall(target) {
  logStep('Running bun install');
  await runInteractiveChild('bun', ['install'], target, 'bun install');
}

async function runBunRunInit(target) {
  logStep('Handing off to project init');
  const tsxBin = path.join(target, 'node_modules', '.bin', 'tsx');
  if (!fs.existsSync(tsxBin)) {
    throw new Error(
      `tsx not found at ${tsxBin} — did bun install complete successfully?`
    );
  }
  await runInteractiveChild(
    tsxBin,
    ['scripts/init/init-project.ts'],
    target,
    'init-project.ts',
    { SHIPONCE_DEFAULT_PROJECT_NAME: path.basename(target) }
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  process.stdout.write(
    `\n${pc.bgCyan(pc.black(' shiponce — Scaffold New Project '))}\n\n`
  );

  const target = await resolveTargetPath(args.target);

  logStep(`${pc.bold('Template:')} ${pc.dim(TEMPLATE_ROOT)}`);
  logStep(`${pc.bold('Target:')}   ${pc.dim(target)}`);

  createdTarget = target;
  copyTemplate(target);
  runGitInit(target);

  if (args.noInstall) logStep(pc.dim('Skipped bun install (--no-install)'));
  else await runBunInstall(target);

  if (args.noInit) logStep(pc.dim('Skipped init (--no-init)'));
  else await runBunRunInit(target);

  createdTarget = null;
  process.stdout.write(`\n${pc.green('Done!')}\n`);
  process.stdout.write(`  ${pc.cyan(`cd ${target}`)}\n`);
  process.stdout.write(`  ${pc.cyan('bun run dev')}\n`);
}

main().catch((err) => {
  process.stderr.write(pc.red(err?.message ?? String(err)) + '\n');
  cleanupCreatedTarget();
  process.exit(1);
});
