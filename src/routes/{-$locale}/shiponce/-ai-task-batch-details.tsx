import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

import {
  collectTaskResourcesFromValues,
  CopyTaskIdButton,
  ResourceGallery,
  stringifyJsonValue,
} from './-ai-task-result-preview';

type BatchTaskDetail = {
  id: string;
  status: string;
  provider: string;
  model: string;
  taskId?: string | null;
  taskInfo?: string | null;
  taskResult?: string | null;
};

export type AITaskBatchDetailLabels = {
  providerRequests: string;
  request: string;
  requestLogs: string;
  openFullSize: string;
  taskId: string;
};

export function AITaskBatchDetails({
  tasks,
  labels,
}: {
  tasks: BatchTaskDetail[];
  labels: AITaskBatchDetailLabels;
}) {
  const resources = Array.from(
    collectTaskResourcesFromValues(
      tasks.flatMap((task) => [task.taskInfo, task.taskResult])
    ).values()
  );

  return (
    <div className="space-y-6">
      <ResourceGallery
        resources={resources}
        openExternalLabel={labels.openFullSize}
      />

      <section>
        <h3 className="text-sm font-semibold text-foreground">
          {labels.providerRequests}
        </h3>
        <Accordion type="multiple" className="mt-3 space-y-2">
          {tasks.map((task, index) => (
            <AccordionItem
              key={task.id}
              value={task.id}
              className="rounded-lg border bg-background px-4"
            >
              <AccordionTrigger className="py-3 text-left hover:no-underline">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="truncate text-sm font-medium">
                    {labels.request} {index + 1}
                  </span>
                  <Badge variant="outline" className="font-medium">
                    {task.status}
                  </Badge>
                  <span className="hidden truncate text-xs text-muted-foreground sm:inline">
                    {task.provider} / {task.model}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{labels.taskId}</span>
                  <span className="truncate font-mono">
                    {task.taskId || task.id}
                  </span>
                  <CopyTaskIdButton taskId={task.taskId || task.id} />
                </div>
                <div className="mt-3 rounded-md border bg-muted/25 p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    {labels.requestLogs}
                  </p>
                  <pre className="max-h-80 overflow-auto text-xs leading-5 whitespace-pre-wrap">
                    {stringifyJsonValue({
                      taskInfo: task.taskInfo,
                      taskResult: task.taskResult,
                    })}
                  </pre>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
