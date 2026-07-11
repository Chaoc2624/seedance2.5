import { useSearch, useNavigate } from '@tanstack/react-router';
import ArrowDown from 'lucide-react/dist/esm/icons/arrow-down';
import ArrowUp from 'lucide-react/dist/esm/icons/arrow-up';
import ArrowUpDown from 'lucide-react/dist/esm/icons/arrow-up-down';
import Trash from 'lucide-react/dist/esm/icons/trash';
import * as React from 'react';

import { Link } from '@/core/i18n/navigation';

import { SmartIcon } from '@/components/blocks/common/smart-icon';
import { Button } from '@/components/ui/button';
import {
  TableBody,
  TableCell,
  Table as TableComponent,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { type Pagination } from '@/types/blocks/common';
import { type TableColumn } from '@/types/blocks/table';

import { Copy } from './copy';
import { Dropdown } from './dropdown';
import { Image } from './image';
import { JsonPreview } from './json-preview';
import { Label } from './label';
import { Time } from './time';
import { User } from './user';

export function Table({
  columns,
  data,
  emptyMessage,
  pagination,
  isLoading,
}: {
  columns?: TableColumn[];
  data?: any[];
  emptyMessage?: string;
  pagination?: Pagination;
  isLoading?: boolean;
}) {
  if (!columns) {
    columns = [];
  }

  const [colWidths, setColWidths] = React.useState<Record<number, number>>({});
  const resizingRef = React.useRef<{
    idx: number;
    startX: number;
    startWidth: number;
  } | null>(null);

  const startResize = React.useCallback((e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();

    const cell = (e.currentTarget as HTMLElement).closest(
      'th, td'
    ) as HTMLElement;
    const startWidth = cell?.offsetWidth || 150;

    setColWidths((prev) => ({ ...prev, [idx]: startWidth }));
    resizingRef.current = { idx, startX: e.clientX, startWidth };

    const handleMouseMove = (mouseEvent: MouseEvent) => {
      if (!resizingRef.current) return;
      const { idx, startX, startWidth } = resizingRef.current;
      const newWidth = Math.max(60, startWidth + (mouseEvent.clientX - startX));
      setColWidths((prev) => ({ ...prev, [idx]: newWidth }));
    };

    const handleMouseUp = () => {
      resizingRef.current = null;
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const getColStyle = (idx: number) => {
    if (colWidths[idx]) {
      return {
        width: colWidths[idx],
        minWidth: colWidths[idx],
        maxWidth: colWidths[idx],
      };
    }
    return {};
  };

  const ResizeHandle = ({ idx }: { idx: number }) => (
    <div
      onMouseDown={(e) => startResize(e, idx)}
      className="absolute top-0 right-0 bottom-0 z-10 flex w-3 translate-x-1.5 transform cursor-col-resize items-center justify-center transition-colors group-hover/col:bg-primary/5 hover:bg-primary/10"
    >
      <div className="h-full w-[2px] bg-border/50 transition-colors group-hover/col:bg-primary/50" />
    </div>
  );

  const searchParams = useSearch({ strict: false });
  const navigate = useNavigate();
  const loadingRowCount = Math.min(pagination?.limit || 10, 5);

  const currentSortBy = (searchParams as any)?.sortBy;
  const currentSortOrder = (searchParams as any)?.sortOrder;

  const getColumnClassName = (column: TableColumn, isHeader = false) =>
    cn(
      column.className,
      column.resizable && 'group/col relative',
      column.type === 'actions' &&
        cn(
          'sticky right-0 bg-card text-right shadow-[-14px_0_18px_-18px_rgba(15,23,42,0.55)]',
          isHeader ? 'z-30' : 'z-20',
          'before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-border'
        )
    );

  return (
    <TableComponent className="w-full">
      <TableHeader className="">
        <TableRow className="rounded-md">
          {columns &&
            columns.map((item: TableColumn, idx: number) => {
              if (item.sortable && item.name) {
                const isSorted = currentSortBy === item.name;
                const nextSortOrder =
                  isSorted && currentSortOrder === 'asc' ? 'desc' : 'asc';
                return (
                  <TableHead
                    key={idx}
                    className={getColumnClassName(item, true)}
                    style={getColStyle(idx)}
                  >
                    <div
                      className={
                        item.resizable ? 'flex w-full items-center pr-2' : ''
                      }
                    >
                      <button
                        onClick={() => {
                          navigate({
                            // @ts-ignore
                            search: (prev: any) => ({
                              ...prev,
                              sortBy: item.name,
                              sortOrder: nextSortOrder,
                              page: 1,
                            }),
                          });
                        }}
                        className="flex w-full items-center gap-1.5 font-semibold transition-colors outline-none hover:text-foreground"
                      >
                        {item.title}
                        {isSorted ? (
                          currentSortOrder === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/30" />
                        )}
                      </button>
                    </div>
                    {item.resizable && <ResizeHandle idx={idx} />}
                  </TableHead>
                );
              }

              return (
                <TableHead
                  key={idx}
                  className={getColumnClassName(item, true)}
                  style={getColStyle(idx)}
                >
                  <div
                    className={
                      item.resizable ? 'flex w-full items-center pr-2' : ''
                    }
                  >
                    {item.title}
                  </div>
                  {item.resizable && <ResizeHandle idx={idx} />}
                </TableHead>
              );
            })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: loadingRowCount }).map((_, rowIdx) => (
            <TableRow key={`skeleton-row-${rowIdx}`} className="h-14">
              {columns &&
                columns.map((column: TableColumn, iidx: number) => (
                  <TableCell
                    key={`skeleton-col-${iidx}`}
                    className={getColumnClassName(column)}
                  >
                    <div className="h-4 w-2/3 animate-pulse rounded bg-muted/60" />
                  </TableCell>
                ))}
            </TableRow>
          ))
        ) : data && data.length > 0 ? (
          data.map((item: any, idx: number) => (
            <TableRow key={idx} className="h-16">
              {columns &&
                columns.map((column: TableColumn, iidx: number) => {
                  const value = item[column.name as keyof typeof item];

                  const content = column.callback
                    ? column.callback(item)
                    : value;

                  let cellContent = content;

                  if (column.type === 'image') {
                    cellContent = (
                      <Image
                        placeholder={column.placeholder}
                        value={content}
                        metadata={column.metadata}
                        className={column.className}
                      />
                    );
                  } else if (column.type === 'time') {
                    cellContent = (
                      <Time
                        placeholder={column.placeholder}
                        value={content}
                        metadata={column.metadata}
                        className={column.className}
                      />
                    );
                  } else if (column.type === 'label') {
                    cellContent = (
                      <Label
                        placeholder={column.placeholder}
                        value={content}
                        metadata={column.metadata}
                        className={column.className}
                      />
                    );
                  } else if (column.type === 'copy' && content) {
                    cellContent = (
                      <Copy
                        placeholder={column.placeholder}
                        value={content}
                        metadata={column.metadata}
                        className={column.className}
                      >
                        {content}
                      </Copy>
                    );
                  } else if (column.type === 'dropdown') {
                    cellContent = (
                      <Dropdown
                        placeholder={column.placeholder}
                        value={content}
                        metadata={column.metadata}
                        className={column.className}
                      />
                    );
                  } else if (column.type === 'actions') {
                    cellContent = (
                      <div
                        className={cn(
                          'flex items-center gap-2',
                          column.metadata?.actionsWrap === false
                            ? 'flex-nowrap'
                            : 'flex-wrap',
                          column.metadata?.actionsClassName
                        )}
                      >
                        {(content as any[]).map((btn, bidx) => (
                          <Button
                            key={bidx}
                            variant={btn.variant || 'outline'}
                            size={btn.size || 'sm'}
                            asChild={!!btn.url}
                            onClick={btn.onClick}
                          >
                            {btn.url ? (
                              <Link
                                href={btn.url}
                                target={btn.target || '_self'}
                              >
                                {btn.icon && <SmartIcon name={btn.icon} />}
                                {btn.title && (
                                  <span className="ml-1.5">{btn.title}</span>
                                )}
                              </Link>
                            ) : (
                              <>
                                {btn.icon && <SmartIcon name={btn.icon} />}
                                {btn.title && (
                                  <span className="ml-1.5">{btn.title}</span>
                                )}
                              </>
                            )}
                          </Button>
                        ))}
                      </div>
                    );
                  } else if (column.type === 'user') {
                    cellContent = (
                      <User
                        placeholder={column.placeholder}
                        value={value}
                        metadata={column.metadata}
                        className={column.className}
                      />
                    );
                  } else if (column.type === 'json_preview') {
                    cellContent = (
                      <JsonPreview
                        placeholder={column.placeholder}
                        value={value}
                        metadata={column.metadata}
                        className={column.className}
                      />
                    );
                  }

                  return (
                    <TableCell
                      key={iidx}
                      className={getColumnClassName(column)}
                      style={getColStyle(iidx)}
                    >
                      <div
                        className={
                          column.resizable
                            ? 'flex w-full items-center pr-2'
                            : ''
                        }
                      >
                        {cellContent !== undefined &&
                        cellContent !== null &&
                        cellContent !== ''
                          ? cellContent
                          : column.placeholder}
                      </div>
                      {column.resizable && <ResizeHandle idx={iidx} />}
                    </TableCell>
                  );
                })}
            </TableRow>
          ))
        ) : (
          <TableRow className="">
            <TableCell colSpan={columns.length}>
              <div className="flex w-full items-center justify-center py-8 text-muted-foreground">
                {emptyMessage ? (
                  <p>{emptyMessage}</p>
                ) : (
                  <Trash className="h-10 w-10" />
                )}
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </TableComponent>
  );
}

export * from './table-card';
