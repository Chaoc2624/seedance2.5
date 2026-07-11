import { createFileRoute } from '@tanstack/react-router';

import { useTranslations } from '@/core/i18n/hooks';

import { AITaskStatus } from '@/extensions/ai';

import { AudioPlayer, Empty, LazyImage } from '@/components/blocks/common';
import { TableCard } from '@/components/blocks/table';
import { getHeadMeta } from '@/lib/seo';
import { type AITask } from '@/models/ai_task.server';
import { Button, Tab } from '@/types/blocks/common';
import { type Table } from '@/types/blocks/table';

export const Route = createFileRoute('/{-$locale}/_landing/activity/ai-tasks')({
  component: AiTasksPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      type: search.type as string | undefined,
      page: search.page ? Number(search.page) : 1,
      limit: search.limit ? Number(search.limit) : 20,
    };
  },
  loaderDeps: ({ search: { type, page, limit } }) => ({ type, page, limit }),
  loader: async ({ deps: { type, page, limit } }) => {
    const { getUserAITasksPageDataFn } =
      await import('@/server/ai-task.functions');
    const data = await getUserAITasksPageDataFn({
      data: { type, page, limit },
    });
    return {
      total: data.total,
      aiTasks: data.aiTasks,
      type,
      page,
      limit,
    };
  },
  head: ({ params }) =>
    getHeadMeta({
      metadataKey: 'activity.ai-tasks.metadata',
      canonicalUrl: '/activity/ai-tasks',
      locale: params.locale,
    }),
});

function AiTasksPage() {
  const t = useTranslations('activity.ai-tasks');
  const { total, aiTasks, type, page, limit } = Route.useLoaderData();

  if (aiTasks === undefined) {
    return <Empty message="no auth" />;
  }

  const table: Table = {
    title: t('list.title'),
    columns: [
      { name: 'prompt', title: t('fields.prompt'), type: 'copy' },
      { name: 'mediaType', title: t('fields.media_type'), type: 'label' },
      { name: 'provider', title: t('fields.provider'), type: 'label' },
      { name: 'model', title: t('fields.model'), type: 'label' },
      { name: 'status', title: t('fields.status'), type: 'label' },
      { name: 'costCredits', title: t('fields.cost_credits'), type: 'label' },
      {
        name: 'result',
        title: t('fields.result'),
        callback: (item: AITask) => {
          if (item.taskInfo) {
            let taskInfo: any;
            try {
              taskInfo = JSON.parse(item.taskInfo);
            } catch {
              return '-';
            }
            if (taskInfo.errorMessage) {
              return (
                <div className="text-red-500">
                  Failed: {taskInfo.errorMessage}
                </div>
              );
            } else if (taskInfo.songs && taskInfo.songs.length > 0) {
              const songs: any[] = taskInfo.songs.filter(
                (song: any) => song.audioUrl
              );
              if (songs.length > 0) {
                return (
                  <div className="flex flex-col gap-2">
                    {songs.map((song: any) => (
                      <AudioPlayer
                        key={song.id}
                        src={song.audioUrl}
                        title={song.title}
                        className="w-80"
                      />
                    ))}
                  </div>
                );
              }
            } else if (taskInfo.images && taskInfo.images.length > 0) {
              return (
                <div className="flex flex-col gap-2">
                  {taskInfo.images.map((image: any, index: number) => (
                    <LazyImage
                      key={index}
                      src={image.imageUrl}
                      alt="Generated image"
                      className="h-32 w-auto"
                    />
                  ))}
                </div>
              );
            } else {
              return '-';
            }
          }
          return '-';
        },
      },
      { name: 'createdAt', title: t('fields.created_at'), type: 'time' },
      {
        name: 'action',
        title: t('fields.action'),
        type: 'dropdown',
        callback: (item: AITask) => {
          const items: Button[] = [];

          if (
            item.status === AITaskStatus.PENDING ||
            item.status === AITaskStatus.PROCESSING
          ) {
            items.push({
              title: t('list.buttons.refresh'),
              url: `/activity/ai-tasks/${item.id}/refresh`,
              icon: 'RiRefreshLine',
            });
          }

          return items;
        },
      },
    ],
    data: aiTasks,
    emptyMessage: t('list.empty_message'),
    pagination: {
      total,
      page,
      limit,
    },
  };

  const tabs: Tab[] = [
    {
      name: 'all',
      title: t('list.tabs.all'),
      url: '/activity/ai-tasks',
      is_active: !type || type === 'all',
    },
    {
      name: 'music',
      title: t('list.tabs.music'),
      url: '/activity/ai-tasks?type=music',
      is_active: type === 'music',
    },
    {
      name: 'image',
      title: t('list.tabs.image'),
      url: '/activity/ai-tasks?type=image',
      is_active: type === 'image',
    },
    {
      name: 'video',
      title: t('list.tabs.video'),
      url: '/activity/ai-tasks?type=video',
      is_active: type === 'video',
    },
    {
      name: 'audio',
      title: t('list.tabs.audio'),
      url: '/activity/ai-tasks?type=audio',
      is_active: type === 'audio',
    },
    {
      name: 'text',
      title: t('list.tabs.text'),
      url: '/activity/ai-tasks?type=text',
      is_active: type === 'text',
    },
  ];

  return (
    <div className="space-y-8">
      <TableCard title={t('list.title')} tabs={tabs} table={table} />
    </div>
  );
}
