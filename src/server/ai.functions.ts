import { createServerFn } from '@tanstack/react-start';

import {
  findImageModelForRequest,
  getEnabledImageModels,
  getImageModelCreditCost,
  parseImageModelCatalog,
} from '@/config/ai-models';
import type { ImageGeneratorScene } from '@/config/ai-models';
import {
  DEFAULT_VIDEO_MODEL_CATALOG,
  findVideoModelForRequest,
  getEnabledVideoModels,
  getVideoModelCreditCost,
  normalizeVideoModelDuration,
} from '@/config/ai-video-models';
import type { VideoGeneratorScene } from '@/config/ai-video-models';
import { getRuntimeConfig } from '@/config/runtime.server';

import { AIMediaType } from '@/extensions/ai';

import { envConfigs } from '@/config';
import { getUuid } from '@/lib/hash';
import { getMembershipEntitlements } from '@/lib/membership';
import { createAITask, NewAITask } from '@/models/ai_task.server';
import {
  AITask,
  findAITaskById,
  getAITasksByBatchId,
  UpdateAITask,
  updateAITaskById,
} from '@/models/ai_task.server';
import {
  getRemainingCredits,
  grantDailyCreditsForUser,
} from '@/models/credit.server';
import { getUserInfo } from '@/models/user.server';
import {
  sortBatchTasksForDisplay,
  withBatchOutputCount,
} from '@/services/ai-batch';
import {
  getImageMockFixture,
  getImageMockFixtureCount,
  isAIDevMockEnabledForRuntime,
  saveImageMockFixture,
} from '@/services/ai-dev-mock.server';
import {
  assertAIRequestAccess,
  getAIEntitlementsForUser,
} from '@/services/ai-entitlements.server';
import { persistAITaskAssets } from '@/services/ai-task-asset-storage.server';
import { getAIService } from '@/services/ai.server';
import { ROLES, hasRole } from '@/services/rbac.server';

async function canUseAIDevMock(userId: string) {
  if (!isAIDevMockEnabledForRuntime()) {
    return false;
  }

  return await hasRole(userId, ROLES.SUPER_ADMIN);
}

function isImage4KRequest({
  mediaType,
  options,
}: {
  mediaType: string;
  options?: Record<string, unknown>;
}) {
  if (mediaType !== AIMediaType.IMAGE) {
    return false;
  }

  return (
    String(
      options?.resolution || options?._credit_resolution || ''
    ).toUpperCase() === '4K'
  );
}

function getProviderOptions(options?: Record<string, unknown>) {
  if (!options) {
    return options;
  }

  return Object.fromEntries(
    Object.entries(options).filter(([key]) => !key.startsWith('_'))
  );
}

type AIGenerateInput = {
  provider: string;
  mediaType: string;
  model: string;
  prompt?: string;
  options?: Record<string, unknown>;
  scene?: string;
  useDevMock?: boolean;
  batchId?: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

async function generateAITask(data: AIGenerateInput) {
  let {
    provider,
    mediaType,
    model,
    prompt,
    options,
    scene,
    useDevMock,
    batchId,
  } = data;

  if (!provider || !mediaType || !model) throw new Error('invalid params');
  if (!prompt && !options) throw new Error('prompt or options is required');

  const configs = await getRuntimeConfig();
  const aiService = await getAIService(configs);
  if (!aiService.getMediaTypes().includes(mediaType))
    throw new Error('invalid mediaType');

  const aiProvider = aiService.getProvider(provider);
  if (!aiProvider) throw new Error('invalid provider');

  const imageModel =
    mediaType === AIMediaType.IMAGE
      ? findImageModelForRequest({
          models: parseImageModelCatalog(configs.ai_image_model_catalog),
          provider,
          model,
          scene: scene || '',
        })
      : null;

  if (mediaType === AIMediaType.IMAGE && !imageModel) {
    throw new Error('image model is disabled or not configured');
  }

  const videoModel =
    mediaType === AIMediaType.VIDEO
      ? findVideoModelForRequest({
          models: DEFAULT_VIDEO_MODEL_CATALOG,
          provider,
          model,
          scene: scene || '',
        })
      : null;

  if (mediaType === AIMediaType.VIDEO && !videoModel) {
    throw new Error('video model is disabled or not configured');
  }

  const user = await getUserInfo();
  if (!user) throw new Error('no auth, please sign in');
  const canUseDevMock = await canUseAIDevMock(user.id);

  await assertAIRequestAccess({
    userId: user.id,
    mediaType,
    is4K: isImage4KRequest({ mediaType, options }),
  });

  if (useDevMock) {
    if (!canUseDevMock) {
      throw new Error(
        'mock mode is only available for super admins in local development'
      );
    }

    if (mediaType !== AIMediaType.IMAGE) {
      throw new Error('mock mode currently only supports image generation');
    }

    const fixture = await getImageMockFixture({
      mediaType,
      scene: scene || '',
      provider,
      model,
      prompt: prompt || '',
      options,
    });

    if (!fixture) {
      throw new Error(
        'No local mock result is available yet. Turn mock off and generate once to seed it.'
      );
    }

    const mockTask: NewAITask = {
      id: getUuid(),
      userId: user.id,
      mediaType,
      provider,
      model,
      prompt: prompt || '',
      scene: scene || '',
      options: options ? JSON.stringify(options) : null,
      status: 'success',
      costCredits: 0,
      taskId: `mock-${fixture.key}-${Date.now()}`,
      taskInfo: fixture.taskInfo ? JSON.stringify(fixture.taskInfo) : null,
      taskResult: fixture.taskResult
        ? JSON.stringify(fixture.taskResult)
        : null,
      batchId: batchId || null,
    };
    const createdTask = await createAITask(mockTask);
    return { ...createdTask, mockMode: true };
  }

  let costCredits = 2;
  if (mediaType === AIMediaType.IMAGE) {
    if (scene !== 'image-to-image' && scene !== 'text-to-image') {
      throw new Error('invalid scene');
    }

    costCredits = getImageModelCreditCost({
      model: imageModel!,
      scene: scene as ImageGeneratorScene,
      options,
    });
  } else if (mediaType === AIMediaType.VIDEO) {
    if (
      scene !== 'text-to-video' &&
      scene !== 'image-to-video' &&
      scene !== 'video-to-video'
    ) {
      throw new Error('invalid scene');
    }

    costCredits = getVideoModelCreditCost({
      model: videoModel!,
      scene: scene as VideoGeneratorScene,
      options,
    });
    const normalizedDuration = normalizeVideoModelDuration({
      model: videoModel!,
      duration: options?.duration,
    });
    if (normalizedDuration) {
      options = {
        ...options,
        duration: normalizedDuration,
      };
    }
  } else if (mediaType === AIMediaType.MUSIC) {
    costCredits = 10;
    scene = 'text-to-music';
  } else {
    throw new Error('invalid mediaType');
  }

  await grantDailyCreditsForUser({ user });

  const remainingCredits = await getRemainingCredits(user.id);
  if (remainingCredits < costCredits) throw new Error('insufficient credits');

  const callbackUrl = `${envConfigs.app_url}/api/ai/notify/${provider}`;
  const result = await aiProvider.generate({
    params: {
      mediaType,
      model,
      prompt: prompt || '',
      callbackUrl,
      options: getProviderOptions(options),
    },
  });
  if (!result?.taskId) throw new Error('ai generate failed');

  const aiTaskId = getUuid();
  let taskInfo: unknown = result.taskInfo ?? null;
  let taskResult: unknown = result.taskResult ?? null;

  if (result.taskStatus === 'success' && canUseDevMock) {
    // Fixture recording must never replace the real task's result URLs. Batch
    // requests can share a fixture key, while each real task needs its own data.
    await saveImageMockFixture({
      mediaType,
      scene: scene || '',
      provider,
      model,
      prompt: prompt || '',
      options,
      taskInfo,
      taskResult,
    });
  }

  if (taskInfo) {
    const persistedAssets = await persistAITaskAssets({
      taskId: aiTaskId,
      mediaType,
      provider,
      taskInfo,
      taskResult,
      configs,
    });
    taskInfo = persistedAssets.taskInfo;
    taskResult = persistedAssets.taskResult ?? taskResult;
  }

  const newAITask: NewAITask = {
    id: aiTaskId,
    userId: user.id,
    mediaType,
    provider,
    model,
    prompt: prompt || '',
    scene: scene || '',
    options: options ? JSON.stringify(options) : null,
    status: result.taskStatus,
    costCredits,
    taskId: result.taskId,
    taskInfo: taskInfo ? JSON.stringify(taskInfo) : null,
    taskResult: taskResult ? JSON.stringify(taskResult) : null,
    batchId: batchId || null,
  };
  await createAITask(newAITask);

  return newAITask;
}

async function createFailedBatchTask({
  data,
  userId,
  batchId,
  error,
}: {
  data: AIGenerateInput;
  userId: string;
  batchId: string;
  error: unknown;
}) {
  const failedTask: NewAITask = {
    id: getUuid(),
    userId,
    mediaType: data.mediaType,
    provider: data.provider,
    model: data.model,
    prompt: data.prompt || '',
    scene: data.scene || '',
    options: data.options ? JSON.stringify(data.options) : null,
    status: 'failed',
    costCredits: 0,
    taskInfo: null,
    taskResult: JSON.stringify({ errorMessage: getErrorMessage(error) }),
    batchId,
  };
  return await createAITask(failedTask);
}

export const aiGenerateFn = createServerFn({ method: 'POST' })
  .inputValidator((data: AIGenerateInput) => data)
  .handler(async ({ data }) => generateAITask(data));

/**
 * Creates every provider request for one user submission on the server. The
 * browser submits intent once; each child request is persisted, including
 * failures that occur before a provider task ID is available.
 */
export const aiGenerateBatchFn = createServerFn({ method: 'POST' })
  .inputValidator((data: AIGenerateInput & { count?: number }) => data)
  .handler(async ({ data }) => {
    const user = await getUserInfo();
    if (!user) throw new Error('no auth, please sign in');

    const count = Math.min(
      4,
      Math.max(1, Number.isFinite(data.count) ? Math.trunc(data.count!) : 1)
    );
    const entitlements = await getAIEntitlementsForUser(user.id);
    if (count > entitlements.maxBatchOutputs) {
      throw new Error(
        `Your ${entitlements.label} plan supports up to ${entitlements.maxBatchOutputs} outputs per request`
      );
    }
    const batchId = getUuid();
    const options = withBatchOutputCount(data.options, count);
    const batchData: AIGenerateInput = { ...data, options, batchId };
    const tasks: AITask[] = [];

    // Dispatch sequentially. The task row created after each provider accepts
    // a request consumes its credits before the next request is evaluated.
    for (let index = 0; index < count; index += 1) {
      try {
        tasks.push(await generateAITask(batchData));
      } catch (error) {
        tasks.push(
          await createFailedBatchTask({
            data: batchData,
            userId: user.id,
            batchId,
            error,
          })
        );
      }
    }

    return { batchId, tasks: sortBatchTasksForDisplay(tasks) };
  });

/**
 * Query the provider for one task's latest status, re-host any returned assets,
 * persist the change, and mutate the passed task in place. Shared by the
 * single-task (`aiQueryFn`) and batch (`aiQueryBatchFn`) query endpoints.
 * Throws on a missing provider or empty provider response so single-task
 * callers keep their previous error behavior; the batch caller catches per task.
 */
async function refreshAITaskFromProvider({
  task,
  aiService,
  configs,
  canUseDevMock,
}: {
  task: AITask;
  aiService: Awaited<ReturnType<typeof getAIService>>;
  configs: Awaited<ReturnType<typeof getRuntimeConfig>>;
  canUseDevMock: boolean;
}): Promise<AITask> {
  if (!task.taskId) throw new Error('task not found');

  const aiProvider = aiService.getProvider(task.provider);
  if (!aiProvider) throw new Error('invalid ai provider');

  const result = await aiProvider?.query?.({
    taskId: task.taskId,
    mediaType: task.mediaType,
    model: task.model,
  });

  if (!result?.taskStatus) throw new Error('query ai task failed');

  let taskInfo: unknown = result.taskInfo ?? null;
  let taskResult: unknown = result.taskResult ?? null;

  if (result.taskStatus === 'success' && canUseDevMock) {
    await saveImageMockFixture({
      mediaType: task.mediaType,
      scene: task.scene,
      provider: task.provider,
      model: task.model,
      prompt: task.prompt,
      options: task.options ? JSON.parse(task.options) : undefined,
      taskInfo,
      taskResult,
    });
  }

  if (taskInfo) {
    const persistedAssets = await persistAITaskAssets({
      taskId: task.id,
      mediaType: task.mediaType,
      provider: task.provider,
      taskInfo,
      taskResult,
      configs,
    });
    taskInfo = persistedAssets.taskInfo;
    taskResult = persistedAssets.taskResult ?? taskResult;
  }

  const updateData: UpdateAITask = {
    status: result.taskStatus,
    taskInfo: taskInfo ? JSON.stringify(taskInfo) : null,
    taskResult: taskResult ? JSON.stringify(taskResult) : null,
    creditId: task.creditId,
  };
  if (
    updateData.status !== task.status ||
    updateData.taskInfo !== task.taskInfo ||
    updateData.taskResult !== task.taskResult
  ) {
    await updateAITaskById(task.id, updateData);
  }

  task.status = updateData.status || '';
  task.taskInfo = updateData.taskInfo || null;
  task.taskResult = updateData.taskResult || null;

  return task;
}

function isSettledTaskStatus(status: string) {
  return status === 'success' || status === 'failed' || status === 'canceled';
}

export const aiQueryFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { taskId: string }) => data)
  .handler(async ({ data }) => {
    const { taskId } = data;
    if (!taskId) throw new Error('invalid params');

    const user = await getUserInfo();
    if (!user) throw new Error('no auth, please sign in');
    const canUseDevMock = await canUseAIDevMock(user.id);
    const task = await findAITaskById(taskId);
    if (!task || !task.taskId) throw new Error('task not found');
    if (task.userId !== user.id) throw new Error('no permission');

    const configs = await getRuntimeConfig();
    const aiService = await getAIService(configs);

    return refreshAITaskFromProvider({
      task,
      aiService,
      configs,
      canUseDevMock,
    });
  });

/**
 * Batch status endpoint. Given one submission's `batchId`, refresh every task
 * that isn't settled yet (each provider query isolated so one failure can't
 * sink the batch) and return the full task list. The frontend polls this once
 * per batch and rebuilds its timeline entry from the returned tasks, instead of
 * polling and stitching N single tasks together on the client.
 */
export const aiQueryBatchFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { batchId: string }) => data)
  .handler(async ({ data }) => {
    const { batchId } = data;
    if (!batchId) throw new Error('invalid params');

    const user = await getUserInfo();
    if (!user) throw new Error('no auth, please sign in');

    const tasks = await getAITasksByBatchId(batchId, user.id);
    if (tasks.length === 0) return { batchId, tasks: [] };

    const configs = await getRuntimeConfig();
    const aiService = await getAIService(configs);
    const canUseDevMock = await canUseAIDevMock(user.id);

    const refreshed = await Promise.all(
      tasks.map(async (task) => {
        if (isSettledTaskStatus(task.status) || !task.taskId) {
          return task;
        }
        try {
          return await refreshAITaskFromProvider({
            task,
            aiService,
            configs,
            canUseDevMock,
          });
        } catch (error) {
          console.error('Failed to refresh batch task:', task.id, error);
          return task;
        }
      })
    );

    return { batchId, tasks: sortBatchTasksForDisplay(refreshed) };
  });

export const getActiveProvidersFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const aiService = await getAIService();
    return aiService.getProviderNames();
  }
);

export const getImageModelCatalogFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const configs = await getRuntimeConfig();
  const aiService = await getAIService(configs);
  const activeProviders = aiService.getProviderNames();
  const activeProviderSet = new Set(activeProviders);
  const models = getEnabledImageModels(
    parseImageModelCatalog(configs.ai_image_model_catalog)
  ).filter((model) => activeProviderSet.has(model.provider));

  return {
    activeProviders,
    models,
  };
});

export const getVideoModelCatalogFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const configs = await getRuntimeConfig();
  const aiService = await getAIService(configs);
  const activeProviders = aiService.getProviderNames();
  const activeProviderSet = new Set(activeProviders);
  const models = getEnabledVideoModels(DEFAULT_VIDEO_MODEL_CATALOG).filter(
    (model) => activeProviderSet.has(model.provider)
  );

  return {
    activeProviders,
    models,
  };
});

export const getAIEntitlementsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getUserInfo();
    const entitlements = user
      ? await getAIEntitlementsForUser(user.id)
      : getMembershipEntitlements();

    return {
      ...entitlements,
      // Keep the existing image-generator contract while exposing richer flags.
      canUseProFeatures: entitlements.canUse4K,
    };
  }
);

export const getImageDevMockStateFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getUserInfo();
    if (!user) {
      return { canUseMock: false, fixtureCount: 0 };
    }

    const canUseMock = await canUseAIDevMock(user.id);
    if (!canUseMock) {
      return { canUseMock: false, fixtureCount: 0 };
    }

    return {
      canUseMock: true,
      fixtureCount: await getImageMockFixtureCount(),
    };
  }
);
