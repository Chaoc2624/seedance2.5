import { describe, expect, test } from 'bun:test';

import {
  groupAITasksBySubmission,
  getBatchOutputCount,
  sortBatchTasksForDisplay,
  withBatchOutputCount,
} from './ai-batch';

describe('AI batch display state', () => {
  test('stores and reads the requested output count without trusting invalid values', () => {
    expect(getBatchOutputCount(withBatchOutputCount({}, 3), 1)).toBe(3);
    expect(getBatchOutputCount({ _batch_output_count: 99 }, 1)).toBe(4);
    expect(getBatchOutputCount({ _batch_output_count: 'invalid' }, 2)).toBe(2);
  });

  test('puts completed results first in completion order', () => {
    const tasks = sortBatchTasksForDisplay([
      {
        id: 'first-pending',
        status: 'processing',
        createdAt: '2026-07-11T05:00:00.000Z',
      },
      {
        id: 'third-failed',
        status: 'failed',
        createdAt: '2026-07-11T05:00:02.000Z',
        updatedAt: '2026-07-11T05:00:04.000Z',
      },
      {
        id: 'second-completed',
        status: 'success',
        createdAt: '2026-07-11T05:00:01.000Z',
        updatedAt: '2026-07-11T05:00:03.000Z',
      },
    ]);

    expect(tasks.map((task) => task.id)).toEqual([
      'second-completed',
      'first-pending',
      'third-failed',
    ]);
  });

  test('groups a user submission while preserving every provider task', () => {
    const batches = groupAITasksBySubmission([
      {
        id: 'task-1',
        batchId: 'batch-1',
        status: 'success',
        options: withBatchOutputCount({}, 2),
        costCredits: 16,
      },
      {
        id: 'task-2',
        batchId: 'batch-1',
        status: 'success',
        options: withBatchOutputCount({}, 2),
        costCredits: 16,
      },
      { id: 'legacy-task', status: 'pending', costCredits: 8 },
    ]);

    expect(batches).toHaveLength(2);
    expect(batches[0]).toMatchObject({
      id: 'batch-1',
      expectedOutputs: 2,
      status: 'success',
      costCredits: 32,
    });
    expect(batches[0]?.tasks.map((task) => task.id)).toEqual([
      'task-1',
      'task-2',
    ]);
    expect(batches[1]).toMatchObject({
      id: 'legacy-task',
      expectedOutputs: 1,
      status: 'pending',
    });
  });
});
