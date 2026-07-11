import CopyIcon from 'lucide-react/dist/esm/icons/copy';
import { ReactNode } from 'react';
import pkg from 'react-copy-to-clipboard';
const { CopyToClipboard } = pkg;
import { toast } from 'sonner';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function Copy({
  value,
  placeholder: _placeholder,
  metadata,
  className,
  children,
}: {
  value: string;
  placeholder?: string;
  metadata?: Record<string, any>;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex max-w-full">
          <CopyToClipboard
            text={value}
            onCopy={() => toast.success(metadata?.message ?? 'Copied')}
          >
            <div
              className={`group flex max-w-full cursor-pointer items-center gap-1.5 ${className || ''}`}
            >
              <div className="min-w-0 truncate">{children}</div>
              <CopyIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 opacity-0 transition-opacity duration-200 group-hover:text-foreground group-hover:opacity-100" />
            </div>
          </CopyToClipboard>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs break-all">{value}</p>
      </TooltipContent>
    </Tooltip>
  );
}
