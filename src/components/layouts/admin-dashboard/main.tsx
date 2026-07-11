import { Children, type ReactNode } from 'react';

import { Link } from '@/core/i18n/navigation';

import { Tabs } from '@/components/blocks/common/navigation/tabs';
import { SmartIcon } from '@/components/blocks/common/smart-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Button as ButtonType,
  Filter as FilterType,
  Search as SearchType,
  Tab,
} from '@/types/blocks/common';

import { Filter } from './filter';
import { Search } from './search';

export function Main({
  children,
  className,
  contentClassName,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const childItems = Children.toArray(children);
  const [header, ...content] = childItems;

  return (
    <div
      className={cn(
        '@container/main flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-8 md:px-6',
        className
      )}
    >
      {header}
      {content.length > 0 ? (
        <div
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overscroll-contain pb-8',
            contentClassName
          )}
        >
          {content}
        </div>
      ) : null}
    </div>
  );
}

export function MainHeader({
  title,
  description,
  tabs,
  filters,
  search,
  actions,
  className,
}: {
  title?: string;
  description?: string;
  tabs?: Tab[];
  filters?: FilterType[];
  search?: SearchType;
  actions?: ButtonType[];
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight">{title || ''}</h2>
          <p className="text-muted-foreground">{description || ''}</p>
        </div>
        <div>
          {actions?.map((action, idx) => {
            const TheBtn = (
              <Button
                onClick={action.onClick}
                variant={action.variant || 'default'}
                size={action.size || 'sm'}
              >
                {action.icon && <SmartIcon name={action.icon as string} />}
                {action.title}
              </Button>
            );

            if (action.url) {
              return (
                <Link
                  key={idx}
                  href={action.url}
                  target={action.target || '_self'}
                >
                  {TheBtn}
                </Link>
              );
            }

            return <span key={idx}>{TheBtn}</span>;
          })}
        </div>
      </div>
      {tabs && tabs.length > 0 ? <Tabs tabs={tabs} /> : null}
      {(search || filters) && (
        <div className="mb-6 flex justify-start gap-2">
          {search && <Search search={search} />}
          {filters && filters.length > 0
            ? filters.map((filter) => (
                <Filter key={filter.name} filter={filter} />
              ))
            : null}
        </div>
      )}
    </div>
  );
}
