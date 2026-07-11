/**
 * Localize dev-mock AI image URLs.
 *
 * Older dev-mock AI tasks (and fixture-store entries) point taskInfo/taskResult
 * at remote provider URLs (pub-*.r2.dev, tempfile.*) that load unreliably in
 * the browser. This script downloads every referenced image into
 * public/dev-mocks/ai-images/ and rewrites both the DB rows and the fixture
 * store to local `/dev-mocks/ai-images/...` paths so they render reliably.
 *
 * Dev only. Run via:
 *   bun run localize:ai-mocks
 */

import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import { eq } from 'drizzle-orm';

import { db } from '@/core/db/index.server';

import { aiTask } from '@/config/db/schema';

const ASSET_DIR = path.join(process.cwd(), 'public', 'dev-mocks', 'ai-images');
const FIXTURE_PATH = path.join(
  process.cwd(),
  'content',
  'dev-mocks',
  'image-generation.json'
);
const LOCAL_PREFIX = '/dev-mocks/ai-images/';
// Matches image URLs even when embedded inside stringified JSON (resultJson).
const IMAGE_URL_RE =
  /https?:\/\/[^\s"'\\)]+\.(?:png|jpe?g|webp)(?:\?[^\s"'\\)]*)?/gi;

function extensionFor(url: string): string {
  const clean = (url.split('?')[0] ?? '').toLowerCase();
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return '.jpg';
  if (clean.endsWith('.webp')) return '.webp';
  return '.png';
}

function localNameFor(url: string): string {
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 16);
  return `mock-${hash}${extensionFor(url)}`;
}

function collectUrls(text: string | null | undefined, into: Set<string>) {
  if (!text) return;
  const matches = text.match(IMAGE_URL_RE);
  matches?.forEach((match) => into.add(match));
}

async function downloadAll(urls: Set<string>): Promise<Map<string, string>> {
  await fs.mkdir(ASSET_DIR, { recursive: true });
  const mapping = new Map<string, string>();

  for (const url of urls) {
    const fileName = localNameFor(url);
    const filePath = path.join(ASSET_DIR, fileName);
    const localUrl = `${LOCAL_PREFIX}${fileName}`;

    try {
      await fs.access(filePath);
      mapping.set(url, localUrl);
      console.log(`• cached  ${url}`);
      continue;
    } catch {
      // Not downloaded yet.
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`✗ skip    ${url} (HTTP ${response.status})`);
        continue;
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(filePath, bytes);
      mapping.set(url, localUrl);
      console.log(`✓ saved   ${url} -> ${localUrl}`);
    } catch (error) {
      console.warn(`✗ failed  ${url}: ${(error as Error).message}`);
    }
  }

  return mapping;
}

function applyMapping(
  text: string | null,
  mapping: Map<string, string>
): string | null {
  if (!text) return text;
  let output = text;
  for (const [from, to] of mapping) {
    if (output.includes(from)) {
      output = output.split(from).join(to);
    }
  }
  return output;
}

async function main() {
  const urls = new Set<string>();

  const rows = await db()
    .select({
      id: aiTask.id,
      taskInfo: aiTask.taskInfo,
      taskResult: aiTask.taskResult,
    })
    .from(aiTask);

  for (const row of rows) {
    collectUrls(row.taskInfo, urls);
    collectUrls(row.taskResult, urls);
  }

  let fixtureRaw: string | null = null;
  try {
    fixtureRaw = await fs.readFile(FIXTURE_PATH, 'utf8');
    collectUrls(fixtureRaw, urls);
  } catch {
    // No fixture store present.
  }

  if (urls.size === 0) {
    console.log('No remote image URLs found. Nothing to do.');
    return;
  }
  console.log(`Found ${urls.size} unique remote image URL(s).`);

  const mapping = await downloadAll(urls);
  if (mapping.size === 0) {
    console.log('No images could be downloaded (all remote URLs failed).');
    return;
  }

  let updatedRows = 0;
  for (const row of rows) {
    const nextInfo = applyMapping(row.taskInfo, mapping);
    const nextResult = applyMapping(row.taskResult, mapping);
    if (nextInfo !== row.taskInfo || nextResult !== row.taskResult) {
      await db()
        .update(aiTask)
        .set({ taskInfo: nextInfo, taskResult: nextResult })
        .where(eq(aiTask.id, row.id));
      updatedRows += 1;
    }
  }
  console.log(`Updated ${updatedRows} DB task row(s).`);

  if (fixtureRaw) {
    const nextFixture = applyMapping(fixtureRaw, mapping);
    if (nextFixture && nextFixture !== fixtureRaw) {
      await fs.writeFile(FIXTURE_PATH, nextFixture, 'utf8');
      console.log('Rewrote fixture store to local paths.');
    }
  }

  console.log('Done.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
