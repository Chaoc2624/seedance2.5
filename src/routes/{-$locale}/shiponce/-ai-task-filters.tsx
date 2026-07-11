import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { DateTimeRangeFilter } from './-ai-task-date-range-filter';

export type AITaskFilterOptions = {
  statuses: string[];
  mediaTypes: string[];
  providers: string[];
  models: string[];
  scenes: string[];
};

export const EMPTY_AITASK_FILTER_OPTIONS: AITaskFilterOptions = {
  statuses: [],
  mediaTypes: [],
  providers: [],
  models: [],
  scenes: [],
};

const DEFAULT_STATUS_OPTIONS = [
  'pending',
  'processing',
  'success',
  'failed',
  'canceled',
];

function getMergedOptions(primary: string[], fallback: string[] = []) {
  return Array.from(new Set([...fallback, ...primary])).filter(Boolean);
}

function getFilterValue(value?: string) {
  return value && value !== 'all' ? value : undefined;
}

function SelectFilter({
  label,
  value,
  options,
  allLabel,
  placeholder,
  onChange,
  className,
}: {
  label: string;
  value?: string;
  options: string[];
  allLabel: string;
  placeholder: string;
  onChange: (value?: string) => void;
  className?: string;
}) {
  return (
    <label
      className={cn(
        'flex min-w-[150px] flex-[1_1_150px] flex-col gap-1.5 text-xs font-medium text-muted-foreground',
        className
      )}
    >
      {label}
      <Select
        value={value || 'all'}
        onValueChange={(nextValue) => onChange(getFilterValue(nextValue))}
      >
        <SelectTrigger className="h-9 w-full bg-background">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{allLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

export function AITaskFilters({
  searchParams,
  filterOptions,
  userKeyword,
  setUserKeyword,
  updateSearch,
  clearFilters,
  t,
}: {
  searchParams: Record<string, string | number | undefined>;
  filterOptions: AITaskFilterOptions;
  userKeyword: string;
  setUserKeyword: (value: string) => void;
  updateSearch: (updates: Record<string, string | number | undefined>) => void;
  clearFilters: () => void;
  t: (key: string) => string;
}) {
  return (
    <form
      className="shrink-0 rounded-lg border bg-card p-4 shadow-xs"
      onSubmit={(event) => {
        event.preventDefault();
        updateSearch({ userKeyword: userKeyword.trim() || undefined });
      }}
    >
      <div className="flex flex-wrap items-end gap-3">
        <SelectFilter
          label={t('list.filters.status')}
          value={String(searchParams.status || '')}
          allLabel={t('list.filters.all')}
          placeholder={t('list.filters.status')}
          options={getMergedOptions(
            filterOptions.statuses,
            DEFAULT_STATUS_OPTIONS
          )}
          onChange={(status) => updateSearch({ status })}
        />
        <label className="flex min-w-[220px] flex-[1.3_1_220px] flex-col gap-1.5 text-xs font-medium text-muted-foreground">
          {t('list.filters.user')}
          <Input
            value={userKeyword}
            placeholder={t('list.filters.user_placeholder')}
            className="h-9"
            onChange={(event) => setUserKeyword(event.target.value)}
          />
        </label>
        <SelectFilter
          label={t('fields.provider')}
          value={String(searchParams.provider || '')}
          allLabel={t('list.filters.all')}
          placeholder={t('fields.provider')}
          options={filterOptions.providers}
          onChange={(provider) => updateSearch({ provider })}
        />
        <SelectFilter
          label={t('fields.model')}
          value={String(searchParams.model || '')}
          allLabel={t('list.filters.all')}
          placeholder={t('fields.model')}
          options={filterOptions.models}
          onChange={(model) => updateSearch({ model })}
        />
        <SelectFilter
          label={t('fields.scene')}
          value={String(searchParams.scene || '')}
          allLabel={t('list.filters.all')}
          placeholder={t('fields.scene')}
          options={filterOptions.scenes}
          onChange={(scene) => updateSearch({ scene })}
        />
        <DateTimeRangeFilter
          searchParams={searchParams}
          updateSearch={updateSearch}
          t={t}
        />
        <div className="ml-auto flex shrink-0 justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9"
            onClick={clearFilters}
          >
            {t('list.filters.reset')}
          </Button>
          <Button type="submit" size="sm" className="h-9">
            {t('list.filters.apply')}
          </Button>
        </div>
      </div>
    </form>
  );
}
