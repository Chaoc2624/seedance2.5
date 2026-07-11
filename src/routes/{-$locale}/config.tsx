import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import Copy from 'lucide-react/dist/esm/icons/copy';
import RefreshCcw from 'lucide-react/dist/esm/icons/refresh-ccw';
import Save from 'lucide-react/dist/esm/icons/save';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ThemeProvider } from '@/core/theme/provider';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type {
  DevConfigField,
  DevConfigGroup,
  DevConfigTab,
  DevConfigTabName,
} from '@/services/config-settings';

interface DevConfigPageData {
  tabs: DevConfigTab[];
  groups: DevConfigGroup[];
  fields: DevConfigField[];
  values: Record<string, string>;
  envFilePath: string;
  productionEnvSnippet: string;
  mode: {
    preset: string;
    databaseProvider: string;
    hasDatabase: boolean;
    configTableEnabled: boolean;
  };
}

export const Route = createFileRoute('/{-$locale}/config')({
  beforeLoad: () => {
    if (!import.meta.env.DEV) {
      throw redirect({ to: '/' as any });
    }
  },
  loader: async () => {
    const { getDevConfigSettingsFn } =
      await import('@/server/dev-config.functions');
    return getDevConfigSettingsFn();
  },
  head: () => ({
    meta: [
      { title: 'Local Config' },
      { name: 'robots', content: 'noindex,nofollow' },
    ],
  }),
  component: DevConfigPage,
});

function quoteEnvValue(value: string) {
  return JSON.stringify(value ?? '');
}

function buildEnvSnippet(
  fields: DevConfigField[],
  values: Record<string, string>
) {
  return fields
    .map(
      (field) => `${field.envName} = ${quoteEnvValue(values[field.name] ?? '')}`
    )
    .join('\n');
}

function DevConfigPage() {
  const data = Route.useLoaderData() as DevConfigPageData;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DevConfigTabName>(
    data.tabs[0]?.name ?? 'site'
  );
  const [values, setValues] = useState<Record<string, string>>(data.values);
  const [baselineValues, setBaselineValues] = useState<Record<string, string>>(
    data.values
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(data.values);
    setBaselineValues(data.values);
  }, [data.values]);

  const changedFields = useMemo(
    () =>
      data.fields.filter(
        (field) =>
          String(values[field.name] ?? '') !==
          String(baselineValues[field.name] ?? '')
      ),
    [baselineValues, data.fields, values]
  );

  const envSnippet = useMemo(
    () => buildEnvSnippet(data.fields, values),
    [data.fields, values]
  );

  const handleSave = async () => {
    if (changedFields.length === 0) {
      toast.success('No changes');
      return;
    }

    setSaving(true);
    try {
      const payload = Object.fromEntries(
        changedFields.map((field) => [field.name, values[field.name] ?? ''])
      );
      const { saveDevConfigSettingsFn } =
        await import('@/server/dev-config.functions');
      const result = await saveDevConfigSettingsFn({ data: payload });
      toast.success(result.message);
      await router.invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(envSnippet);
    toast.success('Copied');
  };

  const activeGroups = data.groups.filter((group) => group.tab === activeTab);

  return (
    <ThemeProvider>
      <main className="min-h-screen bg-muted/30 px-4 py-6 text-foreground md:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Local only</Badge>
                <Badge
                  variant={data.mode.hasDatabase ? 'secondary' : 'default'}
                >
                  {data.mode.hasDatabase
                    ? 'Database configured'
                    : 'No database'}
                </Badge>
                <Badge variant="secondary">Preset: {data.mode.preset}</Badge>
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-normal">
                  Local Config
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  {data.envFilePath}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.invalidate()}
              >
                <RefreshCcw className="size-4" />
                Reload
              </Button>
              <Button type="button" onClick={handleSave} disabled={saving}>
                <Save className="size-4" />
                {saving ? 'Saving' : 'Save'}
              </Button>
            </div>
          </header>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as DevConfigTabName)}
          >
            <TabsList className="h-auto flex-wrap justify-start">
              {data.tabs.map((tab) => (
                <TabsTrigger key={tab.name} value={tab.name}>
                  {tab.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <section className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {activeGroups.map((group) => (
                <ConfigGroupCard
                  key={group.name}
                  group={group}
                  fields={data.fields.filter(
                    (field) => field.group === group.name
                  )}
                  values={values}
                  baselineValues={baselineValues}
                  onChange={(name, value) =>
                    setValues((current) => ({ ...current, [name]: value }))
                  }
                />
              ))}
            </div>

            <Card className="lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle>Deploy env</CardTitle>
                <CardDescription>
                  Use these values for Cloudflare deploy-time config.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={envSnippet || data.productionEnvSnippet}
                  readOnly
                  className="min-h-64 resize-none font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleCopy}
                >
                  <Copy className="size-4" />
                  Copy
                </Button>
                <Separator />
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Database provider: {data.mode.databaseProvider}</p>
                  <p>
                    Config table:{' '}
                    {data.mode.configTableEnabled ? 'enabled' : 'disabled'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  );
}

function ConfigGroupCard({
  group,
  fields,
  values,
  baselineValues,
  onChange,
}: {
  group: DevConfigGroup;
  fields: DevConfigField[];
  values: Record<string, string>;
  baselineValues: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{group.title}</CardTitle>
        <CardDescription>{group.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {fields.map((field) => {
          const changed =
            String(values[field.name] ?? '') !==
            String(baselineValues[field.name] ?? '');

          return (
            <div key={field.name} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor={field.name}>{field.title}</Label>
                <code
                  className={cn(
                    'rounded bg-muted px-2 py-1 text-[11px] text-muted-foreground',
                    changed && 'bg-primary/10 text-primary'
                  )}
                >
                  {field.envName}
                </code>
              </div>
              <Input
                id={field.name}
                type={field.inputMode === 'url' ? 'url' : 'text'}
                value={values[field.name] ?? ''}
                placeholder={field.placeholder}
                onChange={(event) => onChange(field.name, event.target.value)}
                className="font-mono"
              />
              {(field.tip || field.restartRecommended) && (
                <p className="text-xs leading-5 text-muted-foreground">
                  {field.tip}
                  {field.tip && field.restartRecommended ? ' ' : ''}
                  {field.restartRecommended
                    ? 'Restart may still be needed for client-bundled VITE values.'
                    : ''}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
