import { AIMediaType } from '@/extensions/ai/types';

type TimelineMediaType = 'image' | 'video';

type TimelineTaskMediaSource = {
  mediaType: string;
  taskInfo: string | null;
  taskResult: string | null;
};

export type TimelineMediaSlot = {
  key: string;
  url?: string;
  status?: string;
  error?: string;
};

type TimelineSlotEntry = {
  taskId?: string;
  taskIds?: string[];
  taskResults?: Record<
    string,
    {
      status: string;
      resultUrls: string[];
      error?: string;
    }
  >;
  expectedResults?: number;
  resultUrls: string[];
  status: string;
};

const RESULT_JSON_KEYS = new Set(['resultJson', 'result_json']);
const INPUT_CONTAINER_KEYS = new Set([
  'input',
  'options',
  'param',
  'request',
  'requestJson',
  'request_json',
]);
const IMAGE_URL_KEYS = new Set([
  'url',
  'uri',
  'src',
  'image',
  'imageUrl',
  'image_url',
  'outputUrl',
  'output_url',
]);
const VIDEO_URL_KEYS = new Set([
  'url',
  'uri',
  'src',
  'video',
  'videoUrl',
  'video_url',
  'outputUrl',
  'output_url',
]);
const IMAGE_ARRAY_KEYS = new Set([
  'images',
  'imageUrls',
  'image_urls',
  'resultUrls',
  'result_urls',
  'output',
  'data',
]);
const VIDEO_ARRAY_KEYS = new Set([
  'videos',
  'videoUrls',
  'video_urls',
  'resultUrls',
  'result_urls',
  'output',
  'data',
]);

function parseJson(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function parseNestedJson(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed || !/^[{[]/.test(trimmed)) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function isMediaUrl(value: string) {
  return (
    /^https?:\/\//i.test(value) ||
    value.startsWith('/') ||
    value.startsWith('data:image/') ||
    value.startsWith('data:video/')
  );
}

function collectGeneratedMediaUrls(
  value: unknown,
  mediaType: TimelineMediaType,
  options: { withinResultJson?: boolean } = {}
) {
  const results = new Set<string>();
  const urlKeys = mediaType === 'video' ? VIDEO_URL_KEYS : IMAGE_URL_KEYS;
  const arrayKeys = mediaType === 'video' ? VIDEO_ARRAY_KEYS : IMAGE_ARRAY_KEYS;

  const visit = (
    input: unknown,
    context: { key?: string; withinResultJson: boolean }
  ) => {
    if (!input) return;

    if (typeof input === 'string') {
      const parsed = context.withinResultJson ? parseNestedJson(input) : null;
      if (parsed) {
        visit(parsed, context);
        return;
      }

      if (
        context.key &&
        (urlKeys.has(context.key) || arrayKeys.has(context.key)) &&
        isMediaUrl(input)
      ) {
        results.add(input);
      }
      return;
    }

    if (Array.isArray(input)) {
      input.forEach((item) => visit(item, context));
      return;
    }

    if (typeof input !== 'object') return;

    Object.entries(input as Record<string, unknown>).forEach(
      ([key, nested]) => {
        if (INPUT_CONTAINER_KEYS.has(key)) return;

        if (RESULT_JSON_KEYS.has(key) && typeof nested === 'string') {
          const parsed = parseNestedJson(nested);
          if (parsed) {
            visit(parsed, { key, withinResultJson: true });
          }
          return;
        }

        visit(nested, {
          key,
          withinResultJson: context.withinResultJson || arrayKeys.has(key),
        });
      }
    );
  };

  visit(value, { withinResultJson: options.withinResultJson ?? false });
  return Array.from(results);
}

export function getTimelineEntryUrls(task: TimelineTaskMediaSource) {
  const mediaType = task.mediaType === AIMediaType.VIDEO ? 'video' : 'image';

  // `taskInfo` holds the app's own stored/re-hosted copy of each generated
  // media file, while `taskResult` carries the provider's original response
  // (e.g. temporary URLs in `resultJson.resultUrls`). Both describe the SAME
  // generated images under different URLs, so merging them double-counts every
  // result (a single generated image shows up as two). Prefer the stored copy
  // and only fall back to the provider payload when nothing was stored yet
  // (e.g. a task that is still processing or a record without `taskInfo`).
  const storedUrls = collectGeneratedMediaUrls(
    parseJson(task.taskInfo),
    mediaType,
    { withinResultJson: true }
  );
  if (storedUrls.length > 0) {
    return storedUrls;
  }

  return collectGeneratedMediaUrls(parseJson(task.taskResult), mediaType);
}

/**
 * A requested output maps to one stable task slot. Never borrow another
 * task's URL when a pending or failed task has no result of its own.
 */
export function getTimelineMediaSlots(
  entry: TimelineSlotEntry
): TimelineMediaSlot[] {
  const expectedCount = Math.max(1, entry.expectedResults ?? 1);
  const taskIds = entry.taskIds ?? (entry.taskId ? [entry.taskId] : []);
  const taskResults = entry.taskResults;

  if (taskResults) {
    const resultOnlyIds = Object.keys(taskResults).filter(
      (id) => !taskIds.includes(id)
    );
    const slots = [...taskIds, ...resultOnlyIds].map((id) => {
      const result = taskResults[id];
      return {
        key: id,
        url: result?.resultUrls[0],
        status: result?.status,
        error: result?.error,
      };
    });

    while (slots.length < expectedCount) {
      slots.push({
        key: `pending-${slots.length}`,
        status: entry.status,
      });
    }

    return slots.slice(0, 4);
  }

  if (taskIds.length > 0) {
    return taskIds.slice(0, 4).map((id, index) => ({
      key: id,
      url: entry.resultUrls[index],
      status: entry.status,
    }));
  }

  const slotCount = Math.min(
    4,
    Math.max(expectedCount, entry.resultUrls.length)
  );
  return Array.from({ length: slotCount }, (_, index) => ({
    key: `legacy-${index}`,
    url: entry.resultUrls[index],
    status: entry.status,
  }));
}
