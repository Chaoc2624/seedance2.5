import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  gte,
  inArray,
  like,
  lte,
  or,
  sql,
} from 'drizzle-orm';

import { db } from '@/core/db/index.server';

import { aiTask, credit, user } from '@/config/db/schema';

import { AITaskStatus } from '@/extensions/ai';

import { appendUserToResult, User } from '@/models/user.server';
import { groupAITasksBySubmission } from '@/services/ai-batch';

import { consumeCredits, CreditStatus } from './credit.server';

export type AITask = typeof aiTask.$inferSelect & {
  user?: User;
};
export type AdminAITaskBatch = AITask & {
  taskIds: string[];
  tasks: AITask[];
  expectedOutputs: number;
  completedOutputs: number;
  failedOutputs: number;
};
export type NewAITask = typeof aiTask.$inferInsert;
export type UpdateAITask = Partial<Omit<NewAITask, 'id' | 'createdAt'>>;

export interface AITaskFilters {
  userId?: string;
  userKeyword?: string;
  status?: string;
  mediaType?: string;
  provider?: string;
  model?: string;
  scene?: string;
  createdAtFrom?: Date;
  createdAtTo?: Date;
}

export interface AITaskFilterOptions {
  statuses: string[];
  mediaTypes: string[];
  providers: string[];
  models: string[];
  scenes: string[];
}

function getAITaskWhere({
  userId,
  userKeyword,
  status,
  mediaType,
  provider,
  model,
  scene,
  createdAtFrom,
  createdAtTo,
}: AITaskFilters) {
  const normalizedUserKeyword = userKeyword?.trim();
  const userKeywordCondition = normalizedUserKeyword
    ? or(
        eq(aiTask.userId, normalizedUserKeyword),
        exists(
          db()
            .select({ id: user.id })
            .from(user)
            .where(
              and(
                eq(user.id, aiTask.userId),
                or(
                  like(user.email, `%${normalizedUserKeyword}%`),
                  like(user.name, `%${normalizedUserKeyword}%`)
                )
              )
            )
        )
      )
    : undefined;

  return and(
    userId ? eq(aiTask.userId, userId) : undefined,
    userKeywordCondition,
    mediaType ? eq(aiTask.mediaType, mediaType) : undefined,
    provider ? eq(aiTask.provider, provider) : undefined,
    model ? eq(aiTask.model, model) : undefined,
    scene ? eq(aiTask.scene, scene) : undefined,
    status ? eq(aiTask.status, status) : undefined,
    createdAtFrom ? gte(aiTask.createdAt, createdAtFrom) : undefined,
    createdAtTo ? lte(aiTask.createdAt, createdAtTo) : undefined
  );
}

export async function createAITask(newAITask: NewAITask) {
  const result = await db().transaction(async (tx: any) => {
    // 1. create task record
    const [taskResult] = await tx.insert(aiTask).values(newAITask).returning();

    if (newAITask.costCredits && newAITask.costCredits > 0) {
      // 2. consume credits
      const consumedCredit = await consumeCredits({
        userId: newAITask.userId,
        credits: newAITask.costCredits,
        scene: newAITask.scene,
        description: `generate ${newAITask.mediaType}`,
        metadata: JSON.stringify({
          type: 'ai-task',
          mediaType: taskResult.mediaType,
          taskId: taskResult.id,
        }),
        tx,
      });

      // 3. update task record with consumed credit id
      if (consumedCredit && consumedCredit.id) {
        taskResult.creditId = consumedCredit.id;
        await tx
          .update(aiTask)
          .set({ creditId: consumedCredit.id })
          .where(eq(aiTask.id, taskResult.id));
      }
    }

    return taskResult;
  });

  return result;
}

export async function findAITaskById(id: string) {
  const [result] = await db().select().from(aiTask).where(eq(aiTask.id, id));
  return result;
}

/**
 * Fetch every task that belongs to a single user submission (batch), ordered
 * by creation time so the aggregated view keeps a stable slot order. Scoped to
 * the owning user so a batchId alone can't leak another user's tasks.
 */
export async function getAITasksByBatchId(
  batchId: string,
  userId: string
): Promise<AITask[]> {
  return db()
    .select()
    .from(aiTask)
    .where(and(eq(aiTask.batchId, batchId), eq(aiTask.userId, userId)))
    .orderBy(asc(aiTask.createdAt));
}

export async function updateAITaskById(id: string, updateAITask: UpdateAITask) {
  const result = await db().transaction(async (tx: any) => {
    // task failed, Revoke credit consumption record
    if (updateAITask.status === AITaskStatus.FAILED && updateAITask.creditId) {
      // get consumed credit record
      const [consumedCredit] = await tx
        .select()
        .from(credit)
        .where(eq(credit.id, updateAITask.creditId));
      if (consumedCredit && consumedCredit.status === CreditStatus.ACTIVE) {
        const consumedItems = JSON.parse(consumedCredit.consumedDetail || '[]');

        // console.log('consumedItems', consumedItems);

        // add back consumed credits
        await Promise.all(
          consumedItems.map((item: any) => {
            if (item && item.creditId && item.creditsConsumed > 0) {
              return tx
                .update(credit)
                .set({
                  remainingCredits: sql`${credit.remainingCredits} + ${item.creditsConsumed}`,
                })
                .where(eq(credit.id, item.creditId));
            }
          })
        );

        // delete consumed credit record
        await tx
          .update(credit)
          .set({
            status: CreditStatus.DELETED,
          })
          .where(eq(credit.id, updateAITask.creditId));
      }
    }

    // update task
    const [result] = await tx
      .update(aiTask)
      .set(updateAITask)
      .where(eq(aiTask.id, id))
      .returning();

    return result;
  });

  return result;
}

export async function getAITasksCount({
  userId,
  userKeyword,
  status,
  mediaType,
  provider,
  model,
  scene,
  createdAtFrom,
  createdAtTo,
}: AITaskFilters): Promise<number> {
  const [result] = await db().select({ count: count() }).from(aiTask).where(
    getAITaskWhere({
      userId,
      userKeyword,
      mediaType,
      provider,
      model,
      scene,
      status,
      createdAtFrom,
      createdAtTo,
    })
  );

  return result?.count || 0;
}

function getBatchCreatedAt(tasks: AITask[]) {
  return tasks.reduce((earliest, task) => {
    return task.createdAt < earliest ? task.createdAt : earliest;
  }, tasks[0]!.createdAt);
}

function toAdminAITaskBatches(tasks: AITask[]): AdminAITaskBatch[] {
  return groupAITasksBySubmission(tasks)
    .map((batch) => {
      const primaryTask = batch.tasks[0]!;
      const completedOutputs = batch.tasks.filter(
        (task) => task.status === AITaskStatus.SUCCESS
      ).length;
      const failedOutputs = batch.tasks.filter(
        (task) =>
          task.status === AITaskStatus.FAILED ||
          task.status === AITaskStatus.CANCELED
      ).length;

      return {
        ...primaryTask,
        id: batch.id,
        batchId: batch.batchId,
        createdAt: getBatchCreatedAt(batch.tasks),
        status: batch.status,
        costCredits: batch.costCredits,
        taskIds: batch.tasks.map((task) => task.id),
        tasks: batch.tasks,
        expectedOutputs: batch.expectedOutputs,
        completedOutputs,
        failedOutputs,
      };
    })
    .sort(
      (first, second) => second.createdAt.getTime() - first.createdAt.getTime()
    );
}

const aiTaskBatchKey = sql<string>`coalesce(${aiTask.batchId}, ${aiTask.id})`;
const aiTaskBatchCreatedAt = sql<Date>`min(${aiTask.createdAt})`;

export async function getAdminAITaskBatchesCount(
  filters: AITaskFilters
): Promise<number> {
  const [result] = await db()
    .select({ count: sql<number>`count(distinct ${aiTaskBatchKey})` })
    .from(aiTask)
    .where(getAITaskWhere(filters));

  return Number(result?.count || 0);
}

export async function getAdminAITaskBatches({
  page = 1,
  limit = 30,
  ...filters
}: AITaskFilters & {
  page?: number;
  limit?: number;
}): Promise<AdminAITaskBatch[]> {
  const batchRows: Array<{ batchId: string | null; taskId: string }> =
    await db()
      .select({
        batchId: sql<string | null>`max(${aiTask.batchId})`,
        taskId: sql<string>`min(${aiTask.id})`,
      })
      .from(aiTask)
      .where(getAITaskWhere(filters))
      .groupBy(aiTaskBatchKey)
      .orderBy(desc(aiTaskBatchCreatedAt))
      .limit(limit)
      .offset((page - 1) * limit);

  const batchIds = batchRows
    .map((row) => row.batchId)
    .filter((batchId): batchId is string => Boolean(batchId));
  const taskIds = batchRows
    .filter((row) => !row.batchId)
    .map((row) => row.taskId);

  if (batchIds.length === 0 && taskIds.length === 0) return [];

  const tasks = await db()
    .select()
    .from(aiTask)
    .where(
      or(
        batchIds.length > 0 ? inArray(aiTask.batchId, batchIds) : undefined,
        taskIds.length > 0 ? inArray(aiTask.id, taskIds) : undefined
      )
    )
    .orderBy(desc(aiTask.createdAt));

  return toAdminAITaskBatches(await appendUserToResult(tasks));
}

export async function getActiveAITasksCount(userId: string): Promise<number> {
  const [result] = await db()
    .select({ count: count() })
    .from(aiTask)
    .where(
      and(
        eq(aiTask.userId, userId),
        inArray(aiTask.status, [AITaskStatus.PENDING, AITaskStatus.PROCESSING])
      )
    );

  return result?.count || 0;
}

export async function getAITasks({
  userId,
  userKeyword,
  status,
  mediaType,
  provider,
  model,
  scene,
  createdAtFrom,
  createdAtTo,
  page = 1,
  limit = 30,
  getUser = false,
}: AITaskFilters & {
  page?: number;
  limit?: number;
  getUser?: boolean;
}): Promise<AITask[]> {
  const result = await db()
    .select()
    .from(aiTask)
    .where(
      getAITaskWhere({
        userId,
        userKeyword,
        mediaType,
        provider,
        model,
        scene,
        status,
        createdAtFrom,
        createdAtTo,
      })
    )
    .orderBy(desc(aiTask.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  if (getUser) {
    return appendUserToResult(result);
  }

  return result;
}

export async function getAITaskFilterOptions(): Promise<AITaskFilterOptions> {
  const [statusRows, mediaTypeRows, providerRows, modelRows, sceneRows] =
    await Promise.all([
      db()
        .select({ value: aiTask.status })
        .from(aiTask)
        .groupBy(aiTask.status)
        .orderBy(asc(aiTask.status)),
      db()
        .select({ value: aiTask.mediaType })
        .from(aiTask)
        .groupBy(aiTask.mediaType)
        .orderBy(asc(aiTask.mediaType)),
      db()
        .select({ value: aiTask.provider })
        .from(aiTask)
        .groupBy(aiTask.provider)
        .orderBy(asc(aiTask.provider)),
      db()
        .select({ value: aiTask.model })
        .from(aiTask)
        .groupBy(aiTask.model)
        .orderBy(asc(aiTask.model)),
      db()
        .select({ value: aiTask.scene })
        .from(aiTask)
        .groupBy(aiTask.scene)
        .orderBy(asc(aiTask.scene)),
    ]);

  const getValues = (rows: { value: string }[]) =>
    rows.map((row) => row.value).filter(Boolean);

  return {
    statuses: getValues(statusRows),
    mediaTypes: getValues(mediaTypeRows),
    providers: getValues(providerRows),
    models: getValues(modelRows),
    scenes: getValues(sceneRows),
  };
}
