import type { Configs } from '@/models/config.server';
import { getStorageService } from '@/services/storage.server';

type PersistAITaskAssetsInput = {
  taskId: string;
  mediaType: string;
  provider: string;
  taskInfo: unknown;
  taskResult?: unknown;
  configs?: Configs;
};

type PersistAITaskAssetsResult = {
  taskInfo: unknown;
  taskResult?: unknown;
  changed: boolean;
};

type MediaKind = 'audio' | 'image' | 'video';

const FIELD_MEDIA_KIND: Record<string, MediaKind> = {
  audioUrl: 'audio',
  imageUrl: 'image',
  thumbnailUrl: 'image',
  videoUrl: 'video',
};

const DEFAULT_EXTENSION: Record<MediaKind, string> = {
  audio: 'mp3',
  image: 'png',
  video: 'mp4',
};

const CONTENT_TYPES: Record<string, string> = {
  aac: 'audio/aac',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  m4a: 'audio/mp4',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  mp4: 'video/mp4',
  png: 'image/png',
  wav: 'audio/wav',
  webm: 'video/webm',
  webp: 'image/webp',
};

function hasConfiguredStorage(configs?: Configs) {
  if (!configs) return false;
  return Boolean(
    (configs.r2_access_key &&
      configs.r2_secret_key &&
      configs.r2_bucket_name) ||
    (configs.s3_access_key && configs.s3_secret_key && configs.s3_bucket)
  );
}

function cloneJsonValue<T>(value: T): T {
  if (!value || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function getConfiguredUrlPrefixes(configs?: Configs) {
  if (!configs) return [];

  const prefixes = [
    configs.r2_domain,
    configs.r2_endpoint,
    configs.s3_domain,
    configs.s3_endpoint,
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean);

  return prefixes.map((prefix) =>
    prefix.endsWith('/') ? prefix : `${prefix}/`
  );
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function isAlreadyPersistedUrl(url: string, configs?: Configs) {
  return getConfiguredUrlPrefixes(configs).some(
    (prefix) => url === prefix.slice(0, -1) || url.startsWith(prefix)
  );
}

function getAssetFormatFromUrl(url: string, kind: MediaKind) {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    const match = pathname.match(/\.([a-z0-9]+)$/);
    const extension = match?.[1];
    if (extension && CONTENT_TYPES[extension]) {
      return {
        extension,
        contentType: CONTENT_TYPES[extension],
      };
    }
  } catch {
    // Fall through to a stable default extension.
  }

  return {
    extension: DEFAULT_EXTENSION[kind],
    contentType: undefined,
  };
}

function getAssetKey({
  taskId,
  mediaType,
  provider,
  collection,
  index,
  field,
  extension,
}: {
  taskId: string;
  mediaType: string;
  provider: string;
  collection: string;
  index: number;
  field: string;
  extension: string;
}) {
  const safeProvider = provider.replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
  const safeMediaType = mediaType.replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
  const safeField = field.replace(/[^a-z0-9_-]/gi, '-').toLowerCase();

  return [
    'ai-results',
    safeProvider || 'provider',
    safeMediaType || 'media',
    taskId,
    `${collection}-${index}-${safeField}.${extension}`,
  ].join('/');
}

export function replaceUrlsInValue(
  value: unknown,
  urlMap: Map<string, string>
): unknown {
  if (typeof value === 'string') {
    const direct = urlMap.get(value);
    if (direct) return direct;

    // Provider payloads such as Kie's resultJson are JSON encoded inside a
    // string. Replace embedded URLs too, otherwise the task retains both the
    // provider URL and the persisted R2 URL as separate display resources.
    let replaced = value;
    for (const [sourceUrl, persistedUrl] of urlMap) {
      if (replaced.includes(sourceUrl)) {
        replaced = replaced.split(sourceUrl).join(persistedUrl);
      }
    }
    return replaced;
  }

  if (Array.isArray(value)) {
    return value.map((item) => replaceUrlsInValue(item, urlMap));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        replaceUrlsInValue(item, urlMap),
      ])
    );
  }

  return value;
}

function getMediaItems(taskInfo: unknown) {
  if (!taskInfo || typeof taskInfo !== 'object') return [];
  const source = taskInfo as Record<string, unknown>;
  const groups: Array<{ collection: string; items: unknown[] }> = [];

  for (const collection of ['images', 'videos', 'songs']) {
    const items = source[collection];
    if (Array.isArray(items)) {
      groups.push({ collection, items });
    }
  }

  return groups;
}

async function persistUrl({
  configs,
  taskId,
  mediaType,
  provider,
  collection,
  index,
  field,
  url,
}: {
  configs?: Configs;
  taskId: string;
  mediaType: string;
  provider: string;
  collection: string;
  index: number;
  field: string;
  url: string;
}) {
  const kind = FIELD_MEDIA_KIND[field];
  if (!kind || !isHttpUrl(url) || isAlreadyPersistedUrl(url, configs)) {
    return url;
  }

  const assetFormat = getAssetFormatFromUrl(url, kind);
  const key = getAssetKey({
    taskId,
    mediaType,
    provider,
    collection,
    index,
    field,
    extension: assetFormat.extension,
  });
  const storageService = await getStorageService(configs);

  if (await storageService.exists({ key })) {
    return storageService.getPublicUrl({ key }) || url;
  }

  const result = await storageService.downloadAndUpload({
    url,
    key,
    contentType: assetFormat.contentType,
    disposition: 'inline',
  });

  if (!result.success || !result.url) {
    throw new Error(result.error || 'Storage upload failed');
  }

  return result.url;
}

export async function persistAITaskAssets({
  taskId,
  mediaType,
  provider,
  taskInfo,
  taskResult,
  configs,
}: PersistAITaskAssetsInput): Promise<PersistAITaskAssetsResult> {
  if (!hasConfiguredStorage(configs)) {
    return { taskInfo, taskResult, changed: false };
  }

  const nextTaskInfo = cloneJsonValue(taskInfo);
  const urlMap = new Map<string, string>();

  for (const { collection, items } of getMediaItems(nextTaskInfo)) {
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      if (!item || typeof item !== 'object') continue;
      const itemRecord = item as Record<string, unknown>;

      for (const [field, kind] of Object.entries(FIELD_MEDIA_KIND)) {
        const currentUrl = itemRecord[field];
        if (typeof currentUrl !== 'string' || !kind) continue;

        try {
          const persistedUrl = await persistUrl({
            configs,
            taskId,
            mediaType,
            provider,
            collection,
            index,
            field,
            url: currentUrl,
          });
          if (persistedUrl !== currentUrl) {
            itemRecord[field] = persistedUrl;
            urlMap.set(currentUrl, persistedUrl);
          }
        } catch (error) {
          console.error('AI task asset persistence failed:', {
            taskId,
            mediaType,
            provider,
            collection,
            index,
            field,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }
  }

  const nextTaskResult =
    urlMap.size > 0 ? replaceUrlsInValue(taskResult, urlMap) : taskResult;

  return {
    taskInfo: nextTaskInfo,
    taskResult: nextTaskResult,
    changed: urlMap.size > 0,
  };
}
