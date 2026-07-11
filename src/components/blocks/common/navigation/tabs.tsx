import { useEffect, useState } from 'react';

import { useRouter } from '@/core/i18n/navigation';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Tabs as TabsComponent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Tab } from '@/types/blocks/common';

export function Tabs({
  tabs,
  size,
}: {
  tabs: Tab[];
  size?: 'sm' | 'md' | 'lg';
}) {
  const router = useRouter();
  const activeTabName = tabs?.find((tab) => tab.is_active)?.name || '';
  const [tabName, setTabName] = useState(activeTabName);

  useEffect(() => {
    setTabName(activeTabName);
  }, [activeTabName]);

  const handleValueChange = (nextTabName: string) => {
    setTabName(nextTabName);

    if (nextTabName === activeTabName) return;

    const nextTab = tabs?.find((tab) => tab.name === nextTabName);
    if (nextTab?.url) {
      router.push(nextTab.url);
    }
  };

  return (
    <div className="relative mb-8">
      <ScrollArea className="w-full lg:max-w-none">
        <div className="flex items-center space-x-2">
          <TabsComponent value={tabName} onValueChange={handleValueChange}>
            <TabsList className={cn(size === 'sm' && 'h-8')}>
              {tabs.map((tab, idx) => (
                <TabsTrigger key={idx} value={tab.name || ''}>
                  {tab.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </TabsComponent>
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
