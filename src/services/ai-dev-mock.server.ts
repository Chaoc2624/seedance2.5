import fs from 'node:fs/promises';
import path from 'node:path';

import { AIMediaType } from '@/extensions/ai';

import { isCloudflareWorker, isProduction } from '@/lib/env';
import { md5 } from '@/lib/hash';

type ImageMockFixture = {
  key: string;
  mediaType: string;
  scene: string;
  provider: string;
  model: string;
  prompt: string;
  options?: Record<string, unknown>;
  taskInfo: unknown;
  taskResult: unknown;
  savedAt: string;
  imageUrls: string[];
};

type ImageMockFixtureStore = {
  version: 1;
  fixtures: Record<string, ImageMockFixture>;
};

const EMPTY_FIXTURE_STORE: ImageMockFixtureStore = {
  version: 1,
  fixtures: {},
};

// Matches image URLs even when embedded inside stringified JSON (e.g. the
// doubly-encoded `resultJson` field), so they can be localized too.
const EMBEDDED_IMAGE_URL_RE =
  /https?:\/\/[^\s"'\\)]+\.(?:png|jpe?g|webp)(?:\?[^\s"'\\)]*)?/gi;

function canUseLocalImageMocks() {
  return !isProduction && !isCloudflareWorker && typeof process !== 'undefined';
}

function getImageMockFixturePath() {
  return path.join(
    process.cwd(),
    'content',
    'dev-mocks',
    'image-generation.json'
  );
}

function getImageMockAssetDir() {
  return path.join(process.cwd(), 'public', 'dev-mocks', 'ai-images');
}

function sanitizeSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildImageMockFixtureKey({
  mediaType,
  scene,
  provider,
  model,
  prompt = '',
  options,
}: {
  mediaType: string;
  scene: string;
  provider: string;
  model: string;
  prompt?: string;
  options?: Record<string, unknown>;
}) {
  const promptSignature = md5(
    JSON.stringify({
      prompt: prompt.trim(),
      options: options ?? {},
    })
  ).slice(0, 10);

  return [mediaType, scene, provider, model, promptSignature]
    .map((segment) => sanitizeSegment(segment || 'default'))
    .join('__');
}

async function readImageMockFixtureStore(): Promise<ImageMockFixtureStore> {
  if (!canUseLocalImageMocks()) {
    return EMPTY_FIXTURE_STORE;
  }

  try {
    const raw = await fs.readFile(getImageMockFixturePath(), 'utf8');
    const parsed = JSON.parse(raw) as Partial<ImageMockFixtureStore>;
    return {
      version: 1,
      fixtures: parsed.fixtures ?? {},
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('Failed to read image mock fixture store:', error);
    }
    return EMPTY_FIXTURE_STORE;
  }
}

async function writeImageMockFixtureStore(store: ImageMockFixtureStore) {
  const fixturePath = getImageMockFixturePath();
  await fs.mkdir(path.dirname(fixturePath), { recursive: true });
  await fs.writeFile(fixturePath, JSON.stringify(store, null, 2), 'utf8');
}

function collectImageUrls(value: unknown): string[] {
  const results = new Set<string>();

  const visit = (input: unknown) => {
    if (!input) {
      return;
    }

    if (typeof input === 'string') {
      if (
        /^https?:\/\//i.test(input) ||
        input.startsWith('/dev-mocks/ai-images/')
      ) {
        results.add(input);
        return;
      }
      // The string may itself be stringified JSON (e.g. resultJson) that
      // embeds image URLs. Pull those out so they get localized as well.
      const embedded = input.match(EMBEDDED_IMAGE_URL_RE);
      embedded?.forEach((match) => results.add(match));
      return;
    }

    if (Array.isArray(input)) {
      input.forEach(visit);
      return;
    }

    if (typeof input !== 'object') {
      return;
    }

    Object.entries(input as Record<string, unknown>).forEach(
      ([key, nested]) => {
        if (
          typeof nested === 'string' &&
          /^(url|uri|src|image|imageUrl|thumbnailUrl)$/i.test(key) &&
          (/^https?:\/\//i.test(nested) ||
            nested.startsWith('/dev-mocks/ai-images/'))
        ) {
          results.add(nested);
          return;
        }

        visit(nested);
      }
    );
  };

  visit(value);
  return Array.from(results);
}

function replaceUrlsDeep(
  value: unknown,
  mapping: Map<string, string>
): unknown {
  if (!value) {
    return value;
  }

  if (typeof value === 'string') {
    const direct = mapping.get(value);
    if (direct) {
      return direct;
    }
    // Replace URLs embedded inside stringified JSON (e.g. resultJson) too.
    let replaced = value;
    for (const [from, to] of mapping) {
      if (replaced.includes(from)) {
        replaced = replaced.split(from).join(to);
      }
    }
    return replaced;
  }

  if (Array.isArray(value)) {
    return value.map((item) => replaceUrlsDeep(item, mapping));
  }

  if (typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
      key,
      replaceUrlsDeep(nested, mapping),
    ])
  );
}

function inferImageExtension(url: string, contentType: string | null) {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).toLowerCase();
    if (
      ext === '.png' ||
      ext === '.jpg' ||
      ext === '.jpeg' ||
      ext === '.webp'
    ) {
      return ext;
    }
  } catch {
    // Ignore invalid URLs and use content-type fallback.
  }

  switch (contentType) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/webp':
      return '.webp';
    default:
      return '.png';
  }
}

async function downloadMockImages({
  fixtureKey,
  urls,
}: {
  fixtureKey: string;
  urls: string[];
}) {
  if (!canUseLocalImageMocks()) {
    return new Map<string, string>();
  }

  const assetDir = getImageMockAssetDir();
  await fs.mkdir(assetDir, { recursive: true });

  const mappingEntries = await Promise.all(
    urls.map(async (url, index) => {
      if (!/^https?:\/\//i.test(url)) {
        return [url, url] as const;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch mock image: ${response.status}`);
      }

      const bytes = Buffer.from(await response.arrayBuffer());
      const extension = inferImageExtension(
        url,
        response.headers.get('content-type')
      );
      const fileName = `${fixtureKey}-${index + 1}${extension}`;
      const filePath = path.join(assetDir, fileName);

      await fs.writeFile(filePath, bytes);
      return [url, `/dev-mocks/ai-images/${fileName}`] as const;
    })
  );

  return new Map(mappingEntries);
}

export function isAIDevMockEnabledForRuntime() {
  return canUseLocalImageMocks();
}

export async function getImageMockFixtureCount() {
  const store = await readImageMockFixtureStore();
  return Object.keys(store.fixtures).length;
}

export async function getImageMockFixture({
  mediaType,
  scene,
  provider,
  model,
  prompt,
  options,
}: {
  mediaType: string;
  scene: string;
  provider: string;
  model: string;
  prompt?: string;
  options?: Record<string, unknown>;
}) {
  if (!canUseLocalImageMocks() || mediaType !== AIMediaType.IMAGE) {
    return null;
  }

  const store = await readImageMockFixtureStore();
  const fixtureKey = buildImageMockFixtureKey({
    mediaType,
    scene,
    provider,
    model,
    prompt,
    options,
  });
  return store.fixtures[fixtureKey] ?? null;
}

export async function saveImageMockFixture({
  mediaType,
  scene,
  provider,
  model,
  prompt,
  options,
  taskInfo,
  taskResult,
}: {
  mediaType: string;
  scene: string;
  provider: string;
  model: string;
  prompt: string;
  options?: Record<string, unknown>;
  taskInfo: unknown;
  taskResult: unknown;
}) {
  if (!canUseLocalImageMocks() || mediaType !== AIMediaType.IMAGE) {
    return { taskInfo, taskResult };
  }

  const fixtureKey = buildImageMockFixtureKey({
    mediaType,
    scene,
    provider,
    model,
    prompt,
    options,
  });
  const rawTaskInfo = taskInfo ? JSON.parse(JSON.stringify(taskInfo)) : null;
  const rawTaskResult = taskResult
    ? JSON.parse(JSON.stringify(taskResult))
    : null;
  const imageUrls = Array.from(
    new Set([
      ...collectImageUrls(rawTaskInfo),
      ...collectImageUrls(rawTaskResult),
    ])
  );

  try {
    const urlMapping = await downloadMockImages({
      fixtureKey,
      urls: imageUrls,
    });

    const transformedTaskInfo = replaceUrlsDeep(rawTaskInfo, urlMapping);
    const transformedTaskResult = replaceUrlsDeep(rawTaskResult, urlMapping);

    const store = await readImageMockFixtureStore();
    store.fixtures[fixtureKey] = {
      key: fixtureKey,
      mediaType,
      scene,
      provider,
      model,
      prompt,
      options,
      taskInfo: transformedTaskInfo,
      taskResult: transformedTaskResult,
      savedAt: new Date().toISOString(),
      imageUrls: Array.from(urlMapping.values()),
    };
    await writeImageMockFixtureStore(store);

    return {
      taskInfo: transformedTaskInfo,
      taskResult: transformedTaskResult,
    };
  } catch (error) {
    console.error('Failed to save image mock fixture:', error);
    return { taskInfo, taskResult };
  }
}
