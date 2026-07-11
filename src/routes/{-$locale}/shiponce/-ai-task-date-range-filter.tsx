import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function getDateTimeValue(value?: string | number | Date) {
  if (!value) return '';

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '';

  const pad = (num: number) => String(num).padStart(2, '0');
  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes()),
  ].join('');
}

function getDateTimeDisplay(value?: string | number) {
  const dateValue = getDateTimeValue(value);
  return dateValue ? dateValue.replace('T', ' ') : '';
}

function getRelativeDateTime(hours: number) {
  return getDateTimeValue(new Date(Date.now() - hours * 60 * 60 * 1000));
}

function getTimeValue(value?: string) {
  return getDateTimeValue(value).slice(11, 16);
}

function setDatePart(value: string, date: Date, fallbackTime: string) {
  const time = getTimeValue(value) || fallbackTime;
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${time}`;
}

function setTimePart(value: string, time: string) {
  const date = getDateTimeValue(value).slice(0, 10);
  if (!date) return value;
  return `${date}T${time || '00:00'}`;
}

function startOfDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function isSameDay(value: string, date: Date) {
  const selectedDate = new Date(value);
  return (
    !Number.isNaN(selectedDate.getTime()) &&
    selectedDate.getFullYear() === date.getFullYear() &&
    selectedDate.getMonth() === date.getMonth() &&
    selectedDate.getDate() === date.getDate()
  );
}

function getCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (Date | null)[] = [];

  for (let index = 0; index < startOffset; index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(year, month, day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

export function DateTimeRangeFilter({
  searchParams,
  updateSearch,
  t,
}: {
  searchParams: Record<string, string | number | undefined>;
  updateSearch: (updates: Record<string, string | number | undefined>) => void;
  t: (key: string) => string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [draftFrom, setDraftFrom] = React.useState(
    getDateTimeValue(searchParams.createdFrom)
  );
  const [draftTo, setDraftTo] = React.useState(
    getDateTimeValue(searchParams.createdTo)
  );
  const [visibleMonth, setVisibleMonth] = React.useState(() => {
    const initialDate = searchParams.createdFrom
      ? new Date(String(searchParams.createdFrom))
      : new Date();
    return Number.isNaN(initialDate.getTime()) ? new Date() : initialDate;
  });
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setDraftFrom(getDateTimeValue(searchParams.createdFrom));
    setDraftTo(getDateTimeValue(searchParams.createdTo));
  }, [searchParams.createdFrom, searchParams.createdTo]);

  React.useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  const displayFrom = getDateTimeDisplay(searchParams.createdFrom);
  const displayTo = getDateTimeDisplay(searchParams.createdTo);
  const displayValue =
    displayFrom || displayTo
      ? `${displayFrom || t('list.filters.any_time')} - ${displayTo || t('list.filters.any_time')}`
      : t('list.filters.any_time');

  const applyRange = (createdFrom?: string, createdTo?: string) => {
    if (
      createdFrom &&
      createdTo &&
      new Date(createdTo).getTime() < new Date(createdFrom).getTime()
    ) {
      updateSearch({ createdFrom: createdTo, createdTo: createdFrom });
      setIsOpen(false);
      return;
    }

    updateSearch({
      createdFrom: createdFrom || undefined,
      createdTo: createdTo || undefined,
    });
    setIsOpen(false);
  };

  const applyQuickRange = (hours: number) => {
    const from = getRelativeDateTime(hours);
    const to = getDateTimeValue(new Date());
    setDraftFrom(from);
    setDraftTo(to);
    applyRange(from, to);
  };

  const handleDaySelect = (date: Date) => {
    if (!draftFrom || draftTo) {
      setDraftFrom(setDatePart('', date, '00:00'));
      setDraftTo('');
      return;
    }

    const nextTo = setDatePart('', date, '23:59');
    if (new Date(nextTo).getTime() < new Date(draftFrom).getTime()) {
      setDraftTo(draftFrom);
      setDraftFrom(setDatePart('', date, '00:00'));
      return;
    }

    setDraftTo(nextTo);
  };

  const fromDay = startOfDay(draftFrom);
  const toDay = startOfDay(draftTo);
  const calendarDays = getCalendarDays(visibleMonth);
  const monthTitle = `${visibleMonth.getFullYear()} / ${String(
    visibleMonth.getMonth() + 1
  ).padStart(2, '0')}`;
  const weekdays = t('list.filters.weekdays').split(',');

  return (
    <div
      ref={panelRef}
      className="relative flex min-w-[260px] flex-[1.2_1_260px] flex-col gap-1.5 text-xs font-medium text-muted-foreground"
    >
      <span>{t('list.filters.created_range')}</span>
      <Button
        type="button"
        variant="outline"
        className="h-9 justify-start overflow-hidden bg-background px-3 text-left font-normal"
        onClick={() => setIsOpen((value) => !value)}
      >
        <span className="truncate">{displayValue}</span>
      </Button>
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-[min(92vw,520px)] rounded-lg border bg-popover p-3 text-popover-foreground shadow-lg">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                setVisibleMonth(
                  new Date(
                    visibleMonth.getFullYear(),
                    visibleMonth.getMonth() - 1,
                    1
                  )
                )
              }
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="text-sm font-semibold text-foreground">
              {monthTitle}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                setVisibleMonth(
                  new Date(
                    visibleMonth.getFullYear(),
                    visibleMonth.getMonth() + 1,
                    1
                  )
                )
              }
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted-foreground">
            {weekdays.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-9" />;
              }

              const dayValue = new Date(
                day.getFullYear(),
                day.getMonth(),
                day.getDate()
              ).getTime();
              const isStart = draftFrom ? isSameDay(draftFrom, day) : false;
              const isEnd = draftTo ? isSameDay(draftTo, day) : false;
              const isInRange =
                fromDay !== null &&
                toDay !== null &&
                dayValue > fromDay &&
                dayValue < toDay;

              return (
                <Button
                  key={day.toISOString()}
                  type="button"
                  variant="ghost"
                  className={cn(
                    'h-9 rounded-md px-0 font-medium',
                    isInRange && 'bg-cyan-50 text-cyan-800',
                    (isStart || isEnd) &&
                      'bg-[linear-gradient(90deg,var(--brand-cyan),var(--brand-lime))] text-slate-950 hover:brightness-95'
                  )}
                  onClick={() => handleDaySelect(day)}
                >
                  {day.getDate()}
                </Button>
              );
            })}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border bg-background p-2">
              <div className="text-xs font-medium text-muted-foreground">
                {t('list.filters.created_from')}
              </div>
              <div className="mt-1 text-sm font-semibold">
                {draftFrom
                  ? getDateTimeDisplay(draftFrom)
                  : t('list.filters.click_start_date')}
              </div>
              <Input
                type="time"
                value={getTimeValue(draftFrom)}
                disabled={!draftFrom}
                className="mt-2 h-9"
                onChange={(event) =>
                  setDraftFrom(setTimePart(draftFrom, event.target.value))
                }
              />
            </div>
            <div className="rounded-md border bg-background p-2">
              <div className="text-xs font-medium text-muted-foreground">
                {t('list.filters.created_to')}
              </div>
              <div className="mt-1 text-sm font-semibold">
                {draftTo
                  ? getDateTimeDisplay(draftTo)
                  : t('list.filters.click_end_date')}
              </div>
              <Input
                type="time"
                value={getTimeValue(draftTo)}
                disabled={!draftTo}
                className="mt-2 h-9"
                onChange={(event) =>
                  setDraftTo(setTimePart(draftTo, event.target.value))
                }
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { label: t('list.filters.last_24_hours'), hours: 24 },
              { label: t('list.filters.last_3_days'), hours: 72 },
              { label: t('list.filters.last_7_days'), hours: 168 },
              { label: t('list.filters.last_30_days'), hours: 720 },
            ].map((item) => (
              <Button
                key={item.hours}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyQuickRange(item.hours)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setDraftFrom('');
                setDraftTo('');
                applyRange();
              }}
            >
              {t('list.filters.clear_time')}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => applyRange(draftFrom, draftTo)}
            >
              {t('list.filters.apply_time')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
