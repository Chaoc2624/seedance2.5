import Check from 'lucide-react/dist/esm/icons/check';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import X from 'lucide-react/dist/esm/icons/x';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Subscription } from '@/models/subscription.server';
import type { PricingItem } from '@/types/blocks/pricing';

export type PricingPlanFeature = {
  label: string;
  included: boolean;
};

type PricingPlanCardsProps = {
  items: PricingItem[];
  currentSubscription?: Subscription | null;
  loadingProductId?: string | null;
  onChoose: (item: PricingItem) => void;
  getFeatures: (item: PricingItem) => PricingPlanFeature[];
  labels: {
    currentPlan: string;
    choosePlan: string;
    buyCredits: string;
    credits: string;
    processing: string;
  };
};

function getPlanTone(item: PricingItem) {
  const plan = item.plan_name?.toLowerCase() || item.title?.toLowerCase();

  if (plan?.includes('ultra') || item.product_id.includes('studio')) {
    return {
      card: 'border-[#9aae49]/45 bg-[#20291a] shadow-[0_24px_56px_-40px_rgba(234,255,79,0.58)]',
      credit: 'border-[#dced7b]/15 bg-black/20',
      button: 'border-[#f2ff9a] bg-[#eaff4f] text-[#151a0c] hover:bg-[#f2ff9a]',
      icon: 'text-[#eaff4f]',
    };
  }

  if (plan?.includes('pro')) {
    return {
      card: 'border-[#667535]/50 bg-[#182016] shadow-[0_24px_56px_-40px_rgba(174,198,75,0.4)]',
      credit: 'border-[#b7cc66]/15 bg-[#232d1a]',
      button: 'border-[#ddec7c] bg-[#cfe94a] text-[#151a0c] hover:bg-[#eaff4f]',
      icon: 'text-[#ddec7c]',
    };
  }

  return {
    card: 'border-[#374034] bg-[#141914]',
    credit: 'border-[#3c4436] bg-black/15',
    button: 'border-[#e2e6d2] bg-[#e9eadf] text-[#151a0c] hover:bg-white',
    icon: 'text-[#e2e6d2]',
  };
}

export function PricingPlanCards({
  items,
  currentSubscription,
  loadingProductId,
  onChoose,
  getFeatures,
  labels,
}: PricingPlanCardsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
      {items.map((item) => {
        const tone = getPlanTone(item);
        const isCurrentPlan =
          currentSubscription?.productId === item.product_id;
        const isCreditPack = item.group === 'one-time';
        const isLoading = loadingProductId === item.product_id;

        return (
          <article
            className={cn(
              'relative flex min-w-0 flex-col overflow-hidden rounded-lg border p-5 shadow-[0_18px_45px_-38px_rgba(0,0,0,0.9)]',
              tone.card,
              isCurrentPlan && 'border-[#ddec7c]/60 bg-[#ddec7c]/[0.08]'
            )}
            key={item.product_id}
          >
            <div className="mb-5 flex min-h-6 items-center justify-between gap-3">
              <span className="text-xl font-semibold text-zinc-100">
                {item.title}
              </span>
              {(item.label || isCurrentPlan) && (
                <span
                  className={cn(
                    'rounded-md border px-2 py-0.5 text-[11px] font-semibold',
                    isCurrentPlan
                      ? 'border-[#ddec7c]/30 bg-[#ddec7c]/15 text-[#f0ffc0]'
                      : 'border-[#ddec7c]/30 bg-[#ddec7c]/15 text-[#f0ffc0]'
                  )}
                >
                  {isCurrentPlan ? labels.currentPlan : item.label}
                </span>
              )}
            </div>

            <p className="min-h-10 text-sm leading-5 text-zinc-400">
              {item.description}
            </p>

            <div className={cn('mt-5 rounded-md border p-4', tone.credit)}>
              <div className="flex items-center gap-2">
                <Sparkles className={cn('size-4', tone.icon)} />
                <span className="text-lg font-semibold text-white">
                  {item.credits?.toLocaleString() || 0} {labels.credits}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-zinc-400">
                {item.interval === 'one-time'
                  ? item.tip
                  : item.interval === 'year'
                    ? item.tip
                    : `${item.credits?.toLocaleString() || 0} ${labels.credits} ${item.unit || ''}`}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-x-2 gap-y-1">
              {item.original_price && (
                <span className="font-mono text-xl font-semibold text-[#d2d89f] line-through">
                  {item.original_price}
                </span>
              )}
              <span className="font-mono text-4xl font-semibold text-white tabular-nums">
                {item.price}
              </span>
              {item.unit && (
                <span className="mb-1 text-sm text-zinc-400">{item.unit}</span>
              )}
            </div>

            <Button
              className={cn(
                'mt-5 w-full shadow-[0_6px_0_rgba(0,0,0,0.24)] active:translate-y-px active:shadow-none',
                tone.button,
                isCurrentPlan &&
                  'border-[#ddec7c]/25 bg-[#ddec7c]/15 text-[#f0ffc0] hover:bg-[#ddec7c]/15'
              )}
              disabled={isCurrentPlan || !!loadingProductId}
              onClick={() => onChoose(item)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {labels.processing}
                </>
              ) : isCurrentPlan ? (
                labels.currentPlan
              ) : isCreditPack ? (
                labels.buyCredits
              ) : (
                `${labels.choosePlan} ${item.title}`
              )}
            </Button>

            <ul className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm text-zinc-300">
              {getFeatures(item).map((feature, index) => (
                <li
                  className={cn(
                    'flex items-start gap-2.5',
                    feature.included ? 'text-zinc-200' : 'text-zinc-500'
                  )}
                  key={`${item.product_id}-${index}-${feature.label}`}
                >
                  {feature.included ? (
                    <Check className="mt-0.5 size-4 shrink-0 text-[#ddec7c]" />
                  ) : (
                    <X className="mt-0.5 size-4 shrink-0 text-zinc-600" />
                  )}
                  <span>{feature.label}</span>
                </li>
              ))}
            </ul>

            {item.tip && (
              <p className="mt-auto pt-5 text-xs leading-5 text-zinc-500">
                {item.tip}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
