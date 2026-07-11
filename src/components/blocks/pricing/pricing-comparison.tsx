import Check from 'lucide-react/dist/esm/icons/check';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import X from 'lucide-react/dist/esm/icons/x';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PricingItem } from '@/types/blocks/pricing';

type ComparisonValue = boolean | string;

type ComparisonRow = {
  label: string;
  description?: string;
  values: ComparisonValue[];
};

type ComparisonSection = {
  title: string;
  rows: ComparisonRow[];
};

type PricingComparisonProps = {
  items: PricingItem[];
  labels: {
    title: string;
    description: string;
    showMore: string;
    showLess: string;
    credits: string;
    outputs: string;
    activeTasks: string;
    imageCreation: string;
    referenceEditing: string;
    fourK: string;
    video: string;
    music: string;
    included: string;
    unavailable: string;
  };
};

function formatCredits(item?: PricingItem) {
  if (!item?.credits) return '-';
  return item.credits.toLocaleString();
}

function ComparisonValueCell({
  value,
  labels,
}: {
  value: ComparisonValue;
  labels: PricingComparisonProps['labels'];
}) {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1.5 text-emerald-100">
        <Check className="size-3.5" />
        <span>{labels.included}</span>
      </span>
    );
  }

  if (value === false) {
    return (
      <span className="inline-flex items-center gap-1.5 text-zinc-500">
        <X className="size-3.5" />
        <span>{labels.unavailable}</span>
      </span>
    );
  }

  return <span className="text-zinc-200">{value}</span>;
}

export function PricingComparison({ items, labels }: PricingComparisonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const plans = items.slice(0, 3);
  const sections: ComparisonSection[] = [
    {
      title: labels.title,
      rows: [
        {
          label: labels.credits,
          values: plans.map(formatCredits),
        },
        {
          label: labels.outputs,
          values: ['1', '2', '4'],
        },
        {
          label: labels.activeTasks,
          values: ['1', '2', '4'],
        },
      ],
    },
    {
      title: labels.imageCreation,
      rows: [
        {
          label: labels.imageCreation,
          values: [true, true, true],
        },
        {
          label: labels.referenceEditing,
          values: [true, true, true],
        },
        {
          label: labels.fourK,
          values: [false, true, true],
        },
      ],
    },
    {
      title: labels.video,
      rows: [
        {
          label: labels.video,
          values: [false, true, true],
        },
        {
          label: labels.music,
          values: [false, true, true],
        },
      ],
    },
  ];

  return (
    <section
      aria-labelledby="pricing-comparison-title"
      className="pt-16 md:pt-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-2xl">
          <div className="mb-3 flex items-center gap-2 text-[#ddec7c]">
            <Sparkles className="size-4" />
            <span className="text-sm font-semibold">{labels.title}</span>
          </div>
          <h2
            className="text-3xl font-semibold text-white md:text-4xl"
            id="pricing-comparison-title"
          >
            {labels.title}
          </h2>
          <p className="mt-3 text-base leading-7 text-zinc-400">
            {labels.description}
          </p>
        </div>

        <div className="rounded-lg border border-[#394231] bg-[#11170f] p-3 md:p-5">
          <div
            className={cn(
              'relative overflow-hidden',
              !isExpanded && 'max-h-[36rem]'
            )}
          >
            <div className="hidden grid-cols-[minmax(11rem,1.6fr)_repeat(3,minmax(7rem,1fr))] gap-x-4 border-b border-white/10 px-4 pb-4 text-sm md:grid">
              <span className="text-zinc-500">{labels.description}</span>
              {plans.map((item) => (
                <span
                  className="font-semibold text-zinc-100"
                  key={item.product_id}
                >
                  {item.title}
                </span>
              ))}
            </div>

            <div className="space-y-3 md:space-y-5">
              {sections.map((section) => (
                <div
                  className="rounded-md bg-black/20 px-3 py-3 md:px-4"
                  key={section.title}
                >
                  <h3 className="mb-2 text-sm font-semibold text-zinc-100">
                    {section.title}
                  </h3>
                  <div className="hidden md:block">
                    {section.rows.map((row) => (
                      <div
                        className="grid grid-cols-[minmax(11rem,1.6fr)_repeat(3,minmax(7rem,1fr))] gap-x-4 py-3 text-sm"
                        key={row.label}
                      >
                        <span className="text-zinc-400">{row.label}</span>
                        {row.values.map((value, index) => (
                          <ComparisonValueCell
                            key={`${row.label}-${plans[index]?.product_id}`}
                            labels={labels}
                            value={value}
                          />
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 md:hidden">
                    {section.rows.map((row) => (
                      <div
                        className="rounded-md bg-white/[0.025] p-3"
                        key={row.label}
                      >
                        <p className="mb-3 text-sm text-zinc-300">
                          {row.label}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {row.values.map((value, index) => (
                            <div
                              key={`${row.label}-${plans[index]?.product_id}`}
                            >
                              <p className="mb-1 text-xs font-medium text-zinc-500">
                                {plans[index]?.title}
                              </p>
                              <ComparisonValueCell
                                labels={labels}
                                value={value}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {!isExpanded && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#11131a]"
              />
            )}
          </div>

          <div className="relative z-10 mt-4 flex justify-center">
            <Button
              aria-controls="pricing-comparison-title"
              aria-expanded={isExpanded}
              className="border border-white/15 bg-white/[0.06] text-zinc-100 hover:bg-white/[0.11]"
              onClick={() => setIsExpanded((value) => !value)}
              variant="outline"
            >
              {isExpanded ? labels.showLess : labels.showMore}
              <ChevronDown
                className={cn(
                  'size-4 transition-transform duration-200',
                  isExpanded && 'rotate-180'
                )}
              />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
