import { createFileRoute, defer, Await } from '@tanstack/react-router';
import { useEffect, useMemo, useState, Suspense } from 'react';

import { useTranslations } from '@/core/i18n/hooks';

import { FormCard } from '@/components/blocks/form';
import { AIModelCatalogCard } from '@/components/features/admin/ai-model-catalog-card';
import { Header, Main, MainHeader } from '@/components/layouts/admin-dashboard';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getHeadMeta } from '@/lib/seo';
import { cn } from '@/lib/utils';
import { getSettingTabs, getSettingGroupsByTab } from '@/services/settings';
import type { Crumb, Tab } from '@/types/blocks/common';
import type { Form as FormType } from '@/types/blocks/form';

export const Route = createFileRoute('/{-$locale}/shiponce/settings/$tab')({
  loader: ({ params }) => {
    // Wrap the promise with defer to unblock navigation
    return {
      settingsPromise: defer(
        (async () => {
          const { getAdminSettingsFn } =
            await import('@/server/config.functions');
          return getAdminSettingsFn({ data: { tab: params.tab } });
        })()
      ),
    };
  },
  staleTime: 30 * 1000,
  head: () =>
    getHeadMeta({
      metadataKey: 'admin.settings.metadata',
      canonicalUrl: '/shiponce/settings',
    }),
  component: SettingsPageLayout,
});

function SettingsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid auto-rows-max grid-cols-1 items-start gap-6 xl:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="h-full w-full opacity-70">
          <CardHeader>
            <Skeleton className="mb-2 h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="pt-2">
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SettingsPageLayout() {
  const { tab } = Route.useParams();
  const { settingsPromise } = Route.useLoaderData();
  const t = useTranslations('admin.settings');

  const checkTranslation = (val?: string) => {
    if (!val) return val;
    const translated = t(val);
    if (translated === `admin.settings.${val}` || translated === val) {
      return val;
    }
    return translated;
  };

  const crumbs: Crumb[] = [
    { title: t('edit.crumbs.admin'), url: '/shiponce' },
    { title: t('edit.crumbs.settings'), is_active: true },
  ];

  // We fetch static tabs locally so we can render the shell instantly
  const rawTabs = getSettingTabs(tab ?? 'auth');
  const tabs: Tab[] = rawTabs.map((tItem: any) => ({
    ...tItem,
    title: checkTranslation(tItem.title) as string,
  }));

  const groupCount = getSettingGroupsByTab(tab ?? 'auth').length;

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('edit.title')} tabs={tabs} />
        <Suspense fallback={<SettingsSkeleton count={groupCount} />}>
          <Await promise={settingsPromise}>
            {(data: any) => <SettingsPageContent data={data} />}
          </Await>
        </Suspense>
      </Main>
    </>
  );
}

function hasConfiguredSettingValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  return (
    value !== undefined &&
    value !== null &&
    String(value).trim() !== '' &&
    String(value).trim() !== 'false'
  );
}

function hasPresentSettingValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value !== undefined && value !== null && String(value).trim() !== '';
}

function normalizeSettingValue(field: any, value: unknown) {
  if (field.type === 'checkbox') {
    if (Array.isArray(value)) {
      return value
        .map(String)
        .map((item) => item.trim())
        .filter(Boolean)
        .sort();
    }

    if (typeof value === 'string') {
      const trimmedValue = value.trim();
      if (!trimmedValue) {
        return [];
      }

      try {
        const parsedValue = JSON.parse(trimmedValue);
        if (Array.isArray(parsedValue)) {
          return parsedValue
            .map(String)
            .map((item) => item.trim())
            .filter(Boolean)
            .sort();
        }
      } catch {
        // Fall through to comma-separated values.
      }

      return trimmedValue
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .sort();
    }

    return [];
  }

  return value !== undefined && value !== null ? String(value).trim() : '';
}

function getConfiguredValue(configs: Record<string, unknown>, field: any) {
  return configs[field.name] ?? field.value;
}

function getOptionTitle(field: any, value: string) {
  return field.options?.find((option: any) => option.value === value)?.title;
}

function formatSummaryValue(
  field: any,
  value: unknown,
  t: ReturnType<typeof useTranslations>
) {
  if (!hasPresentSettingValue(value)) {
    return '';
  }

  if (field.type === 'password') {
    return t('edit.summary.configured');
  }

  if (field.type === 'switch') {
    return String(value) === 'true'
      ? t('edit.summary.enabled')
      : t('edit.summary.disabled');
  }

  if (field.type === 'checkbox') {
    const values = normalizeSettingValue(field, value);
    return Array.isArray(values)
      ? values
          .map((item) => getOptionTitle(field, item) || item)
          .filter(Boolean)
          .join(t('edit.status.name_separator'))
      : '';
  }

  if (field.type === 'select') {
    return getOptionTitle(field, String(value)) || String(value);
  }

  if (field.type === 'upload_image') {
    try {
      const pathname = new URL(String(value)).pathname;
      return pathname.split('/').filter(Boolean).pop() || String(value);
    } catch {
      return String(value).split('/').filter(Boolean).pop() || String(value);
    }
  }

  return String(value).trim();
}

function SettingsCollapsedSummary({
  items,
}: {
  items: Array<{
    label: string;
    value: string;
    isConfigured: boolean;
  }>;
}) {
  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="grid min-h-10 min-w-0 grid-cols-[minmax(11rem,1.1fr)_minmax(7rem,1fr)] items-center gap-4 rounded-md border border-border/50 bg-background/35 px-3 py-2"
        >
          <span
            className={cn(
              'min-w-0 truncate text-sm font-medium',
              item.isConfigured ? 'text-foreground/80' : 'text-muted-foreground'
            )}
            title={item.label}
          >
            {item.label}
          </span>
          {item.value ? (
            <span
              className={cn(
                'max-w-full min-w-0 justify-self-end truncate text-right text-sm',
                item.isConfigured
                  ? 'rounded-sm bg-primary/10 px-2 py-0.5 font-semibold text-primary ring-1 ring-primary/15'
                  : 'text-foreground/75'
              )}
              title={item.value}
            >
              {item.value}
            </span>
          ) : (
            <span className="min-w-0 text-right text-sm text-muted-foreground/45">
              -
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function shouldTranslateSettingText(value?: string) {
  return Boolean(value && /^[a-z0-9_.-]+$/i.test(value));
}

function shouldCollapseSettingsGroup(
  tab: string | undefined,
  groupName: string
) {
  return tab === 'payment' && ['stripe', 'creem', 'paypal'].includes(groupName);
}

function getUploadImageLabels(t: ReturnType<typeof useTranslations>) {
  return {
    upload: t('upload.labels.upload'),
    maxSize: t('upload.labels.max_size'),
    uploading: t('upload.labels.uploading'),
    failed: t('upload.labels.failed'),
    replaceImage: t('upload.labels.replace_image'),
    removeImage: t('upload.labels.remove_image'),
    uploadFailed: t('upload.labels.upload_failed'),
    onlyImages: t('upload.labels.only_images'),
    notImage: t('upload.labels.not_image'),
    sizeExceeded: t('upload.labels.size_exceeded'),
  };
}

function getPaymentFormColumns(forms: FormType[]) {
  const formByName = new Map(forms.map((form: any) => [form._groupName, form]));
  const usedNames = new Set(['basic_payment', 'stripe', 'creem', 'paypal']);
  const otherForms = forms.filter(
    (form: any) => !usedNames.has(form._groupName)
  );

  return [
    [formByName.get('basic_payment'), ...otherForms].filter(Boolean),
    [
      formByName.get('stripe'),
      formByName.get('creem'),
      formByName.get('paypal'),
    ].filter(Boolean),
  ] as FormType[][];
}

function SettingsPageContent({ data }: { data: any }) {
  const { configs, settingGroups, settings } = data;
  const { tab } = Route.useParams();
  const t = useTranslations('admin.settings');
  const [currentConfigs, setCurrentConfigs] =
    useState<Record<string, string>>(configs);
  const uploadImageLabels = useMemo(() => getUploadImageLabels(t), [t]);

  useEffect(() => {
    setCurrentConfigs(configs);
  }, [configs]);

  const checkTranslation = (val?: string) => {
    if (!val) return val;
    if (!shouldTranslateSettingText(val)) return val;

    const translated = t(val);
    if (translated === `admin.settings.${val}` || translated === val) {
      return val;
    }
    return translated;
  };

  const handleSubmit = async (formData: FormData) => {
    const payload: Record<string, string> = {};
    formData.forEach((value, name) => {
      const nextValue = String(value);
      const currentValue = String(currentConfigs[name] ?? '');

      if (nextValue !== currentValue) {
        payload[name] = nextValue;
      }
    });

    if (Object.keys(payload).length === 0) {
      return {
        status: 'success' as const,
        message: t('ai_model_catalog.messages.no_changes'),
      };
    }

    const { saveAdminSettingsFn } = await import('@/server/config.functions');
    const result = await saveAdminSettingsFn({ data: payload });
    if (result.status === 'success') {
      setCurrentConfigs((current) => ({
        ...current,
        ...payload,
      }));
    }
    return result;
  };

  // Build the initial forms
  const initialForms: FormType[] = useMemo(() => {
    const forms: FormType[] = [];

    settingGroups.forEach((group: any) => {
      if (group.tab !== tab) {
        return;
      }

      if (group.name === 'ai_model_catalog') {
        return;
      }

      forms.push({
        title: checkTranslation(group.title) as string,
        description: checkTranslation(group.description),
        fields: settings
          .filter((setting: any) => setting.group === group.name)
          .map((setting: any) => ({
            name: setting.name,
            title: checkTranslation(setting.title) as string,
            type: setting.type as any,
            placeholder: checkTranslation(setting.placeholder),
            group: setting.group,
            options: setting.options
              ? setting.options.map((opt: any) => ({
                  ...opt,
                  title: checkTranslation(opt.title) as string,
                }))
              : undefined,
            tip: checkTranslation(setting.tip),
            value: setting.value,
            attributes: setting.attributes,
            metadata:
              setting.type === 'upload_image'
                ? {
                    ...setting.metadata,
                    labels: uploadImageLabels,
                  }
                : setting.metadata,
          })),
        passby: {
          provider: group.name,
          tab: group.tab,
        },
        data: currentConfigs,
        submit: {
          button: {
            title: t('edit.buttons.submit'),
          },
          handler: handleSubmit as any,
        },
        _groupName: group.name,
      } as any);
    });

    return forms;
  }, [currentConfigs, settingGroups, settings, tab, t]);

  const orderKey = `shiponce_admin_settings_order_${tab}`;

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const orderedForms = useMemo(() => {
    let finalForms = [...initialForms];
    // Check if there is a saved order for this tab in localStorage
    if (typeof window !== 'undefined') {
      const savedOrderStr = localStorage.getItem(orderKey);
      if (savedOrderStr) {
        try {
          const savedOrder = JSON.parse(savedOrderStr);
          if (Array.isArray(savedOrder)) {
            finalForms.sort((a: any, b: any) => {
              const indexA = savedOrder.indexOf(a._groupName);
              const indexB = savedOrder.indexOf(b._groupName);
              if (indexA === -1 && indexB === -1) return 0;
              if (indexA === -1) return 1;
              if (indexB === -1) return -1;
              return indexA - indexB;
            });
          }
        } catch (e) {
          console.error('Failed to parse saved order', e);
        }
      }
    }
    return finalForms;
  }, [initialForms, orderKey]);

  if (!isClient) return <SettingsSkeleton />;

  const renderFormCard = (form: any) => {
    const defaultCollapsed = shouldCollapseSettingsGroup(tab, form._groupName);
    const summaryItems = form.fields.map((field: any) => {
      const value = getConfiguredValue(currentConfigs, field);
      return {
        label: field.title,
        value: formatSummaryValue(field, value, t),
        isConfigured: hasConfiguredSettingValue(value),
      };
    });

    return (
      <FormCard
        title={form.title}
        description={form.description}
        form={form}
        className="w-full"
        defaultCollapsed={defaultCollapsed}
        collapsedContent={<SettingsCollapsedSummary items={summaryItems} />}
        collapsible={true}
      />
    );
  };

  return (
    <div className="space-y-6">
      {tab === 'ai' && (
        <AIModelCatalogCard
          initialValue={currentConfigs.ai_image_model_catalog}
        />
      )}
      {tab === 'payment' ? (
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
          {getPaymentFormColumns(orderedForms).map((column, index) => (
            <div key={index} className="flex min-w-0 flex-col gap-6">
              {column.map((form: any) => (
                <div key={form._groupName}>{renderFormCard(form)}</div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid auto-rows-max grid-cols-1 items-start gap-6 xl:grid-cols-2 2xl:grid-cols-3">
          {orderedForms.map((form: any) => (
            <div key={form._groupName}>{renderFormCard(form)}</div>
          ))}
        </div>
      )}
    </div>
  );
}
