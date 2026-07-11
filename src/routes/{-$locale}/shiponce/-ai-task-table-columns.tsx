import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TableColumn } from '@/types/blocks/table';

import { AITaskBatchDetails } from './-ai-task-batch-details';
import {
  collectTaskResourcesFromValues,
  CopyTaskIdButton,
  type TaskDetails,
  TaskResultButton,
} from './-ai-task-result-preview';

const STATUS_LABEL_CLASSES: Record<string, string> = {
  success: 'border-emerald-700 bg-emerald-700 text-white',
  pending: 'border-slate-500 bg-slate-500 text-white',
  processing: 'border-sky-600 bg-sky-600 text-white',
  failed: 'border-red-600 bg-red-600 text-white',
  canceled: 'border-zinc-500 bg-zinc-500 text-white',
};

const FIELD_LABEL_CLASSES: Record<string, string> = {
  mediaType: 'border-blue-200 bg-blue-50 text-blue-700',
  scene: 'border-violet-200 bg-violet-50 text-violet-700',
  provider: 'border-amber-200 bg-amber-50 text-amber-700',
  model: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  costCredits: 'border-slate-200 bg-slate-50 text-slate-700',
};

function TaskBadge({
  value,
  className,
}: {
  value: unknown;
  className?: string;
}) {
  if (value === undefined || value === null || value === '') return null;

  return (
    <Badge variant="outline" className={cn('font-semibold', className)}>
      {String(value)}
    </Badge>
  );
}

export function createAITaskColumns({
  t,
  setTaskDetails,
}: {
  t: (key: string) => string;
  setTaskDetails: (details: TaskDetails) => void;
}): TableColumn[] {
  return [
    {
      name: 'id',
      title: t('fields.task_id'),
      className: 'w-16 min-w-16 max-w-16',
      callback: (item) => <CopyTaskIdButton taskId={String(item.id || '')} />,
    },
    { name: 'createdAt', title: t('fields.created_at'), type: 'time' },
    { name: 'user', title: t('fields.user'), type: 'user' },
    {
      name: 'status',
      title: t('fields.status'),
      callback: (item) => (
        <TaskBadge
          value={item.status}
          className={STATUS_LABEL_CLASSES[item.status] || ''}
        />
      ),
    },
    {
      name: 'costCredits',
      title: t('fields.cost_credits'),
      callback: (item) => (
        <TaskBadge
          value={item.costCredits}
          className={FIELD_LABEL_CLASSES.costCredits}
        />
      ),
    },
    {
      name: 'mediaType',
      title: t('fields.media_type'),
      callback: (item) => (
        <TaskBadge
          value={item.mediaType}
          className={FIELD_LABEL_CLASSES.mediaType}
        />
      ),
    },
    {
      name: 'scene',
      title: t('fields.scene'),
      callback: (item) => (
        <TaskBadge value={item.scene} className={FIELD_LABEL_CLASSES.scene} />
      ),
    },
    {
      name: 'provider',
      title: t('fields.provider'),
      callback: (item) => (
        <TaskBadge
          value={item.provider}
          className={FIELD_LABEL_CLASSES.provider}
        />
      ),
    },
    {
      name: 'model',
      title: t('fields.model'),
      callback: (item) => (
        <TaskBadge value={item.model} className={FIELD_LABEL_CLASSES.model} />
      ),
    },
    {
      name: 'prompt',
      title: t('fields.prompt'),
      className: 'w-36 min-w-36 max-w-36',
      callback: (item) => {
        const prompt = String(item.prompt ?? '');

        return (
          <Button
            type="button"
            variant="ghost"
            className="h-auto w-36 justify-start px-0 py-1 text-left text-xs leading-5 font-normal"
            title={prompt}
            onClick={() =>
              setTaskDetails({
                title: t('fields.prompt'),
                content: (
                  <p className="text-sm leading-6 break-words whitespace-pre-wrap">
                    {prompt}
                  </p>
                ),
              })
            }
          >
            <span className="line-clamp-2 block w-full">{prompt}</span>
          </Button>
        );
      },
    },
    {
      name: 'taskResult',
      title: t('fields.result'),
      className: 'w-64 min-w-64 max-w-64',
      callback: (item) => {
        const tasks = item.tasks || [item];
        const resources = Array.from(
          collectTaskResourcesFromValues(
            tasks.flatMap((task: any) => [task.taskInfo, task.taskResult])
          ).values()
        );

        return (
          <TaskResultButton
            resources={resources}
            ariaLabel={t('details.view_results')}
            onOpen={() => {
              setTaskDetails({
                title: t('details.title'),
                content: (
                  <AITaskBatchDetails
                    tasks={tasks}
                    labels={{
                      providerRequests: t('details.provider_requests'),
                      request: t('details.request'),
                      requestLogs: t('details.request_logs'),
                      openFullSize: t('details.open_full_size'),
                      taskId: t('fields.task_id'),
                    }}
                  />
                ),
              });
            }}
          />
        );
      },
    },
  ];
}
