import Copy from 'lucide-react/dist/esm/icons/copy';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';
import FileJson from 'lucide-react/dist/esm/icons/file-json';
import Music from 'lucide-react/dist/esm/icons/music';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type TaskResource = {
  url: string;
  type: 'audio' | 'image' | 'video';
};

export type TaskDetails = {
  title: string;
  content: ReactNode;
};

function parseJsonValue(value: unknown): unknown {
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

export function stringifyJsonValue(value: unknown) {
  const parsedValue = parseJsonValue(value);
  if (typeof parsedValue === 'string') return parsedValue;
  return JSON.stringify(parsedValue, null, 2);
}

function getResourceType(
  key: string,
  url: string
): TaskResource['type'] | null {
  const normalizedKey = key.toLowerCase();
  const normalizedUrl = url.split('?')[0]?.toLowerCase() || url.toLowerCase();

  if (
    normalizedKey.includes('video') ||
    /\.(mp4|mov|webm|m4v)$/i.test(normalizedUrl)
  ) {
    return 'video';
  }

  if (
    normalizedKey.includes('audio') ||
    normalizedKey.includes('song') ||
    /\.(mp3|wav|m4a|aac|ogg)$/i.test(normalizedUrl)
  ) {
    return 'audio';
  }

  if (
    normalizedKey.includes('image') ||
    normalizedKey.includes('thumbnail') ||
    /\.(png|jpe?g|webp|gif|avif)$/i.test(normalizedUrl)
  ) {
    return 'image';
  }

  return null;
}

function collectTaskResources(
  value: unknown,
  keyPath: string[] = [],
  resources = new Map<string, TaskResource>()
) {
  const parsedValue = parseJsonValue(value);

  if (typeof parsedValue === 'string') {
    if (!/^https?:\/\//i.test(parsedValue)) return resources;
    const resourceType = getResourceType(keyPath.join('.'), parsedValue);
    if (resourceType && !resources.has(parsedValue)) {
      resources.set(parsedValue, { url: parsedValue, type: resourceType });
    }
    return resources;
  }

  if (Array.isArray(parsedValue)) {
    parsedValue.forEach((item, index) =>
      collectTaskResources(item, [...keyPath, String(index)], resources)
    );
    return resources;
  }

  if (parsedValue && typeof parsedValue === 'object') {
    Object.entries(parsedValue as Record<string, unknown>).forEach(
      ([key, item]) => collectTaskResources(item, [...keyPath, key], resources)
    );
  }

  return resources;
}

export function collectTaskResourcesFromValues(values: unknown[]) {
  const resources = new Map<string, TaskResource>();
  values.forEach((value) => collectTaskResources(value, [], resources));
  return resources;
}

export function CopyTaskIdButton({ taskId }: { taskId: string }) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(taskId);
    toast.success('Copied');
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="size-8"
      title={taskId}
      aria-label="Copy task ID"
      onClick={handleCopy}
    >
      <Copy className="size-4" />
    </Button>
  );
}

function ResourceThumb({
  resource,
  className,
}: {
  resource: TaskResource;
  className?: string;
}) {
  if (resource.type === 'image') {
    return (
      <img
        src={resource.url}
        alt=""
        loading="lazy"
        decoding="async"
        className={cn(
          'rounded-md object-cover ring-1 ring-border',
          className || 'size-14'
        )}
      />
    );
  }

  if (resource.type === 'video') {
    return (
      <video
        src={resource.url}
        preload="metadata"
        muted
        playsInline
        className={cn(
          'rounded-md bg-muted object-cover ring-1 ring-border',
          className || 'size-14'
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        'flex items-center justify-center rounded-md bg-muted text-muted-foreground ring-1 ring-border',
        className || 'size-14'
      )}
    >
      <Music className="size-5" />
    </span>
  );
}

export function ResourceGallery({
  resources,
  openExternalLabel,
}: {
  resources: TaskResource[];
  openExternalLabel: string;
}) {
  if (resources.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {resources.map((resource) =>
        resource.type === 'audio' ? (
          <div
            key={resource.url}
            className="flex min-w-0 items-center gap-3 rounded-lg border bg-background p-3"
          >
            <audio
              src={resource.url}
              preload="metadata"
              controls
              className="min-w-0 flex-1"
            />
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`${openExternalLabel}: ${resource.type}`}
              className="flex size-10 shrink-0 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>
        ) : (
          <a
            key={resource.url}
            href={resource.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`${openExternalLabel}: ${resource.type}`}
            className="group relative min-w-0 overflow-hidden rounded-lg border bg-background transition-[border-color,box-shadow] hover:border-primary/45 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <div className="flex aspect-[4/3] w-full items-center justify-center bg-muted/25 p-2">
              <ResourceThumb
                resource={resource}
                className="h-full w-full rounded-md object-contain"
              />
            </div>
            <span className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-md border border-background/30 bg-background/85 text-foreground shadow-sm transition-colors group-hover:bg-background">
              <ExternalLink className="size-4" />
            </span>
          </a>
        )
      )}
    </div>
  );
}

export function TaskResultButton({
  resources,
  onOpen,
  ariaLabel,
}: {
  resources: TaskResource[];
  onOpen: () => void;
  ariaLabel: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      className="h-auto min-h-20 w-64 justify-start px-0 py-1 text-left font-normal"
      aria-label={ariaLabel}
      onClick={onOpen}
    >
      <div className="grid min-w-0 grid-cols-2 gap-2">
        {resources.slice(0, 2).map((resource) => (
          <ResourceThumb
            key={resource.url}
            resource={resource}
            className="h-20 w-28 rounded-lg object-cover"
          />
        ))}
        {resources.length === 0 && (
          <span className="flex h-20 w-28 items-center justify-center rounded-lg border bg-muted/40">
            <FileJson className="size-4 text-muted-foreground" />
          </span>
        )}
      </div>
    </Button>
  );
}

export function TaskDetailsDialog({
  details,
  onClose,
}: {
  details: TaskDetails | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={details !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] w-[min(96vw,1180px)] max-w-none overflow-hidden">
        <DialogHeader>
          <DialogTitle>{details?.title}</DialogTitle>
        </DialogHeader>
        <div
          className="max-h-[72vh] overflow-y-auto overscroll-contain rounded-md border bg-muted/30 p-4"
          onWheel={(event) => event.stopPropagation()}
        >
          {details?.content}
        </div>
      </DialogContent>
    </Dialog>
  );
}
