import { createServerFn } from '@tanstack/react-start';

import { PERMISSIONS, requirePermission } from '@/core/rbac/index.server';

import {
  getAdminAITaskBatches,
  getAdminAITaskBatchesCount,
  getAITaskFilterOptions,
  getAITasks,
  getAITasksCount,
  type AITaskFilters,
} from '@/models/ai_task.server';
import { getUserInfo } from '@/models/user.server';

type AITaskPageInput = {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  userKeyword?: string;
  provider?: string;
  model?: string;
  scene?: string;
  createdFrom?: string;
  createdTo?: string;
};

function getOptionalFilter(value?: string) {
  return value && value !== 'all' ? value : undefined;
}

function getDateRangeFilter(createdFrom?: string, createdTo?: string) {
  const fromDate = createdFrom ? new Date(createdFrom) : null;
  const toDate = createdTo ? new Date(createdTo) : null;
  if (toDate && !Number.isNaN(toDate.getTime())) {
    toDate.setSeconds(59, 999);
  }

  return {
    createdAtFrom:
      fromDate && !Number.isNaN(fromDate.getTime()) ? fromDate : undefined,
    createdAtTo: toDate && !Number.isNaN(toDate.getTime()) ? toDate : undefined,
  };
}

function getAdminAITaskFilter(data: AITaskPageInput): AITaskFilters {
  return {
    mediaType: getOptionalFilter(data.type),
    status: getOptionalFilter(data.status),
    provider: getOptionalFilter(data.provider),
    model: getOptionalFilter(data.model),
    scene: getOptionalFilter(data.scene),
    userKeyword: data.userKeyword?.trim() || undefined,
    ...getDateRangeFilter(data.createdFrom, data.createdTo),
  };
}

export const getAdminAITasksFn = createServerFn({ method: 'GET' })
  .inputValidator((data: AITaskPageInput) => data)
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.AITASKS_READ });
    const { page, limit } = data;
    const aiTasks = await getAITasks({
      ...getAdminAITaskFilter(data),
      getUser: true,
      page,
      limit,
    });
    return aiTasks;
  });

export const getAdminAITasksCountFn = createServerFn({ method: 'GET' })
  .inputValidator((data: AITaskPageInput) => data)
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.AITASKS_READ });
    const count = await getAITasksCount(getAdminAITaskFilter(data));
    return count;
  });

export const getAdminAITasksPageDataFn = createServerFn({ method: 'GET' })
  .inputValidator((data: AITaskPageInput) => data)
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.AITASKS_READ });
    const { page, limit } = data;
    const filter = getAdminAITaskFilter(data);
    const [total, aiTasks, filterOptions] = await Promise.all([
      getAdminAITaskBatchesCount(filter),
      getAdminAITaskBatches({ ...filter, page, limit }),
      getAITaskFilterOptions(),
    ]);

    return { total, aiTasks, filterOptions };
  });

export const getUserAITasksPageDataFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { page?: number; limit?: number; type?: string }) => data
  )
  .handler(async ({ data }) => {
    const userInfo = await getUserInfo();
    if (!userInfo) throw new Error('not authenticated');

    const { page, limit, type } = data;
    const filter = {
      userId: userInfo.id,
      mediaType: type && type !== 'all' ? type : undefined,
    };

    const [total, aiTasks] = await Promise.all([
      getAITasksCount(filter),
      getAITasks({ ...filter, page, limit }),
    ]);

    return { total, aiTasks };
  });
