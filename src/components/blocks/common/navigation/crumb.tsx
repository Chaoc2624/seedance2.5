import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';

import { Link } from '@/core/i18n/navigation';

import { SmartIcon } from '@/components/blocks/common/smart-icon';
import { NavItem } from '@/types/blocks/common';

export function Crumb({ items }: { items: NavItem[] }) {
  return (
    <nav className="flex items-center text-sm text-muted-foreground md:px-3">
      {items.map((item, index) => {
        const isActive = item.is_active;
        return (
          <div key={index} className="flex items-center">
            <Link
              href={item.url || ''}
              className={`line-clamp-1 flex min-w-8 items-center gap-2 transition-colors hover:text-foreground ${
                isActive ? 'font-medium text-primary hover:text-primary' : ''
              }`}
            >
              {item.icon && (
                <SmartIcon name={item.icon as string} className="size-4" />
              )}
              {item.title}
            </Link>

            {!isActive && (
              <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground/40" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
