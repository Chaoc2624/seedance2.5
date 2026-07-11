import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';
import GripVertical from 'lucide-react/dist/esm/icons/grip-vertical';
import { Fragment, type ReactNode, useState } from 'react';

import { Link } from '@/core/i18n/navigation';

import { Form } from '@/components/blocks/form';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Crumb } from '@/types/blocks/common';
import { Form as FormType } from '@/types/blocks/form';

export function FormCard({
  title,
  description,
  crumbs,
  form,
  className,
  collapsible = false,
  defaultCollapsed = false,
  collapsedIndicator,
  collapsedContent,
  dragHandleProps,
}: {
  title?: string;
  description?: string;
  crumbs?: Crumb[];
  form: FormType;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  collapsedIndicator?: ReactNode;
  collapsedContent?: ReactNode;
  dragHandleProps?: any;
}) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <Card className={cn(className)}>
      {crumbs && crumbs.length > 0 && (
        <Breadcrumb className="px-6">
          <BreadcrumbList>
            {crumbs.map((crumb, index) => (
              <Fragment key={index}>
                <BreadcrumbItem className="hidden md:block">
                  {crumb.is_active ? (
                    <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                  ) : (
                    <Link href={crumb.url || ''}>{crumb.title}</Link>
                  )}
                </BreadcrumbItem>
                {index < crumbs.length - 1 && (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {(title || description || collapsible || dragHandleProps) && (
        <CardHeader className="gap-x-3">
          {title && (
            <CardTitle className="min-w-0 break-words">{title}</CardTitle>
          )}
          {description && (
            <CardDescription
              className="min-w-0 break-words"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
          {(collapsible || dragHandleProps) && (
            <CardAction className="flex max-w-[min(100%,28rem)] min-w-0 flex-row items-center gap-2">
              {collapsible && isCollapsed && collapsedIndicator && (
                <div className="max-w-[min(18rem,calc(100vw-10rem))] min-w-0 overflow-hidden [&_[data-slot=badge]]:max-w-full [&_[data-slot=badge]]:min-w-0 [&_[data-slot=badge]]:shrink [&_[data-slot=badge]]:truncate">
                  {collapsedIndicator}
                </div>
              )}
              {collapsible && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  aria-expanded={!isCollapsed}
                  aria-label={
                    isCollapsed ? 'Expand section' : 'Collapse section'
                  }
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  type="button"
                >
                  {isCollapsed ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronUp className="size-4" />
                  )}
                </Button>
              )}
              {dragHandleProps && (
                <div
                  {...dragHandleProps}
                  className="shrink-0 cursor-grab p-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
                >
                  <GripVertical className="size-4" />
                </div>
              )}
            </CardAction>
          )}
        </CardHeader>
      )}

      {form &&
        (collapsible && isCollapsed ? (
          collapsedContent ? (
            <CardContent>{collapsedContent}</CardContent>
          ) : null
        ) : (
          <CardContent>
            <Form {...form} />
          </CardContent>
        ))}
    </Card>
  );
}
