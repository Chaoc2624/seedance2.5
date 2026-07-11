import {
  Await,
  createFileRoute,
  defer,
  useNavigate,
} from '@tanstack/react-router';
import * as React from 'react';
import { z } from 'zod';

import { useTranslations } from '@/core/i18n/hooks';

import { TableCard } from '@/components/blocks/table';
import { Header, Main, MainHeader } from '@/components/layouts/admin-dashboard';
import { getHeadMeta } from '@/lib/seo';
import type { Crumb, Tab } from '@/types/blocks/common';
import type { Table, TableColumn } from '@/types/blocks/table';

import {
  AITaskFilters,
  EMPTY_AITASK_FILTER_OPTIONS,
  type AITaskFilterOptions,
} from './-ai-task-filters';
import { TaskDetailsDialog, type TaskDetails } from './-ai-task-result-preview';
import { createAITaskColumns } from './-ai-task-table-columns';

const searchSchema = z.object({
  page: z.number().catch(1).optional(),
  pageSize: z.number().catch(30).optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  userKeyword: z.string().optional(),
  provider: z.string().optional(),
  model: z.string().optional(),
  scene: z.string().optional(),
  createdFrom: z.string().optional(),
  createdTo: z.string().optional(),
});

function getFilterValue(value?: string) {
  return value && value !== 'all' ? value : undefined;
}

function getAiTasksUrl(current: Record<string, unknown>, nextType?: string) {
  const params = new URLSearchParams();
  const nextSearch = {
    ...current,
    page: undefined,
    type: getFilterValue(nextType),
  };

  Object.entries(nextSearch).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  return query ? `/shiponce/ai-tasks?${query}` : '/shiponce/ai-tasks';
}

function AITasksTableContent({
  total,
  aiTasks,
  filterOptions,
  columns,
  page,
  limit,
  onFilterOptionsChange,
}: {
  total: number;
  aiTasks: any[];
  filterOptions: AITaskFilterOptions;
  columns: TableColumn[];
  page: number;
  limit: number;
  onFilterOptionsChange: (filterOptions: AITaskFilterOptions) => void;
}) {
  React.useEffect(() => {
    onFilterOptionsChange(filterOptions);
  }, [filterOptions, onFilterOptionsChange]);

  const table: Table = {
    columns,
    data: aiTasks,
    pagination: { total, page, limit },
  };

  return <TableCard table={table} />;
}

export const Route = createFileRoute('/{-$locale}/shiponce/ai-tasks')({
  validateSearch: searchSchema,
  loaderDeps: ({
    search: {
      page,
      pageSize,
      type,
      status,
      userKeyword,
      provider,
      model,
      scene,
      createdFrom,
      createdTo,
    },
  }) => ({
    page: page || 1,
    limit: pageSize || 30,
    type,
    status,
    userKeyword,
    provider,
    model,
    scene,
    createdFrom,
    createdTo,
  }),
  loader: ({ deps }) => {
    const dataPromise = (async () => {
      const { getAdminAITasksPageDataFn } =
        await import('@/server/ai-task.functions');
      return await getAdminAITasksPageDataFn({ data: deps });
    })();
    return { dataDeferred: defer(dataPromise) };
  },
  staleTime: 30 * 1000,
  head: () =>
    getHeadMeta({
      metadataKey: 'admin.ai-tasks.metadata',
      canonicalUrl: '/shiponce/ai-tasks',
    }),
  component: AiTasksPage,
});

function AiTasksPage() {
  const { dataDeferred } = Route.useLoaderData();
  const searchParams = Route.useSearch();
  const navigate = useNavigate();
  const t = useTranslations('admin.ai-tasks');
  const [taskDetails, setTaskDetails] = React.useState<TaskDetails | null>(
    null
  );
  const [userKeyword, setUserKeyword] = React.useState(
    searchParams.userKeyword || ''
  );
  const [filterOptions, setFilterOptions] = React.useState<AITaskFilterOptions>(
    EMPTY_AITASK_FILTER_OPTIONS
  );

  const page = searchParams.page || 1;
  const limit = searchParams.pageSize || 30;
  const type = searchParams.type;

  React.useEffect(() => {
    setUserKeyword(searchParams.userKeyword || '');
  }, [searchParams.userKeyword]);

  const updateSearch = React.useCallback(
    (updates: Record<string, string | number | undefined>) => {
      navigate({
        // @ts-ignore TanStack search state is route-specific and keeps custom filters.
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          ...updates,
          page: 1,
        }),
      });
    },
    [navigate]
  );

  const clearFilters = React.useCallback(() => {
    setUserKeyword('');
    navigate({
      // @ts-ignore TanStack search state is route-specific and keeps pagination keys.
      search: (prev: Record<string, unknown>) => ({
        pageSize: prev.pageSize,
        type: prev.type,
      }),
    });
  }, [navigate]);

  const handleFilterOptionsChange = React.useCallback(
    (nextFilterOptions: AITaskFilterOptions) => {
      setFilterOptions(nextFilterOptions);
    },
    []
  );

  const columns = React.useMemo(
    () => createAITaskColumns({ t, setTaskDetails }),
    [t]
  );
  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/shiponce' },
    { title: t('list.crumbs.ai-tasks'), is_active: true },
  ];
  const fallbackTable: Table = {
    columns,
    data: [],
    isLoading: true,
  };
  const tabs: Tab[] = [
    {
      title: t('list.tabs.all'),
      name: 'all',
      url: getAiTasksUrl(searchParams, 'all'),
      is_active: !type || type === 'all',
    },
    {
      title: t('list.tabs.music'),
      name: 'music',
      url: getAiTasksUrl(searchParams, 'music'),
      is_active: type === 'music',
    },
    {
      title: t('list.tabs.image'),
      name: 'image',
      url: getAiTasksUrl(searchParams, 'image'),
      is_active: type === 'image',
    },
    {
      title: t('list.tabs.video'),
      name: 'video',
      url: getAiTasksUrl(searchParams, 'video'),
      is_active: type === 'video',
    },
    {
      title: t('list.tabs.audio'),
      name: 'audio',
      url: getAiTasksUrl(searchParams, 'audio'),
      is_active: type === 'audio',
    },
    {
      title: t('list.tabs.text'),
      name: 'text',
      url: getAiTasksUrl(searchParams, 'text'),
      is_active: type === 'text',
    },
  ];

  return (
    <>
      <Header crumbs={crumbs} />
      <Main
        className="h-[calc(100svh-var(--header-height)-1rem)] min-h-0 overflow-hidden py-0"
        contentClassName="flex min-h-0 flex-col overflow-hidden pb-0"
      >
        <MainHeader
          title={t('list.title')}
          tabs={tabs}
          actions={[]}
          className="shrink-0 bg-background pt-8"
        />
        <div className="flex min-h-0 flex-1 flex-col gap-4 pb-8">
          <AITaskFilters
            searchParams={searchParams}
            filterOptions={filterOptions}
            userKeyword={userKeyword}
            setUserKeyword={setUserKeyword}
            updateSearch={updateSearch}
            clearFilters={clearFilters}
            t={t}
          />
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <React.Suspense fallback={<TableCard table={fallbackTable} />}>
              <Await promise={dataDeferred}>
                {({ total, aiTasks, filterOptions }) => (
                  <AITasksTableContent
                    total={total}
                    aiTasks={aiTasks}
                    filterOptions={filterOptions}
                    columns={columns}
                    page={page}
                    limit={limit}
                    onFilterOptionsChange={handleFilterOptionsChange}
                  />
                )}
              </Await>
            </React.Suspense>
          </div>
        </div>
      </Main>
      <TaskDetailsDialog
        details={taskDetails}
        onClose={() => setTaskDetails(null)}
      />
    </>
  );
}
