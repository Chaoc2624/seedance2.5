import MoreHorizontal from 'lucide-react/dist/esm/icons/more-horizontal';

import { Link } from '@/core/i18n/navigation';

import { SmartIcon } from '@/components/blocks/common/smart-icon';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button as ButtonType } from '@/types/blocks/common';

export function Dropdown({
  value,
  placeholder: _placeholder,
  metadata: _metadata,
  className: _className,
}: {
  value: ButtonType[];
  placeholder?: string;
  metadata: Record<string, any>;
  className?: string;
}) {
  if (!value || value.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {value?.map((item) => {
          return (
            <DropdownMenuItem key={item.title}>
              {item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="flex w-full items-center gap-2 text-left"
                >
                  {item.icon && (
                    <SmartIcon name={item.icon as string} className="h-4 w-4" />
                  )}
                  {item.title}
                </button>
              ) : (
                <Link
                  href={item.url || ''}
                  target={item.target || '_self'}
                  className="flex w-full items-center gap-2"
                >
                  {item.icon && (
                    <SmartIcon name={item.icon as string} className="h-4 w-4" />
                  )}
                  {item.title}
                </Link>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
