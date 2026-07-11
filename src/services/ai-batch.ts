export const BATCH_OUTPUT_COUNT_OPTION = '_batch_output_count';

export type BatchTaskSnapshot = {
  status: string;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
};

type BatchTaskGroupItem = BatchTaskSnapshot & {
  id: string;
  batchId?: string | null;
  options?: unknown;
  costCredits?: number | null;
};

export type AITaskBatch<T extends BatchTaskGroupItem> = {
  id: string;
  batchId: string | null;
  tasks: T[];
  expectedOutputs: number;
  status: string;
  costCredits: number;
};

function parseOptions(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value === 'object') {
    return value as Record<string, unknown> | null;
  }
  if (typeof value !== 'string') return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function toTimestamp(value?: string | Date | null) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getStatusRank(status: string) {
  if (status === 'success') return 0;
  if (status === 'failed' || status === 'canceled') return 2;
  return 1;
}

export function getBatchOutputCount(options: unknown, fallback: number) {
  const value = Number(parseOptions(options)?.[BATCH_OUTPUT_COUNT_OPTION]);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(4, Math.max(1, Math.trunc(value)));
}

export function withBatchOutputCount(
  options: Record<string, unknown> | undefined,
  count: number
) {
  return {
    ...options,
    [BATCH_OUTPUT_COUNT_OPTION]: Math.min(4, Math.max(1, Math.trunc(count))),
  };
}

/**
 * Completed images occupy the earliest visual slots in the order their result
 * was persisted. Pending work follows, then terminal failures.
 */
export function sortBatchTasksForDisplay<T extends BatchTaskSnapshot>(
  tasks: T[]
) {
  return [...tasks].sort((first, second) => {
    const rankDelta =
      getStatusRank(first.status) - getStatusRank(second.status);
    if (rankDelta !== 0) return rankDelta;

    const firstTime =
      getStatusRank(first.status) === 0
        ? toTimestamp(first.updatedAt ?? first.createdAt)
        : toTimestamp(first.createdAt ?? first.updatedAt);
    const secondTime =
      getStatusRank(second.status) === 0
        ? toTimestamp(second.updatedAt ?? second.createdAt)
        : toTimestamp(second.createdAt ?? second.updatedAt);
    return firstTime - secondTime;
  });
}

function getAggregateBatchStatus(tasks: BatchTaskSnapshot[]) {
  const statuses = tasks.map((task) => task.status);

  if (statuses.includes('processing')) return 'processing';
  if (statuses.includes('pending')) return 'pending';
  if (statuses.includes('success')) return 'success';
  if (
    statuses.length > 0 &&
    statuses.every((status) => status === 'canceled')
  ) {
    return 'canceled';
  }

  return 'failed';
}

/**
 * Groups provider-level task rows into the one submission a user made. Tasks
 * without a batch id intentionally remain one-row batches for legacy data.
 */
export function groupAITasksBySubmission<T extends BatchTaskGroupItem>(
  tasks: T[]
): AITaskBatch<T>[] {
  const groups = new Map<string, T[]>();

  tasks.forEach((task) => {
    const key = task.batchId || task.id;
    const group = groups.get(key) ?? [];
    group.push(task);
    groups.set(key, group);
  });

  return Array.from(groups.entries()).map(([id, batchTasks]) => {
    const orderedTasks = sortBatchTasksForDisplay(batchTasks);
    const expectedOutputs = Math.max(
      orderedTasks.length,
      ...orderedTasks.map((task) => getBatchOutputCount(task.options, 1))
    );

    return {
      id,
      batchId: orderedTasks[0]?.batchId || null,
      tasks: orderedTasks,
      expectedOutputs,
      status: getAggregateBatchStatus(orderedTasks),
      costCredits: orderedTasks.reduce(
        (total, task) => total + Number(task.costCredits || 0),
        0
      ),
    };
  });
}
