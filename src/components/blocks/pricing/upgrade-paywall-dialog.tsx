import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import X from 'lucide-react/dist/esm/icons/x';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useLocale, useTranslations } from '@/core/i18n/hooks';
import { Link } from '@/core/i18n/navigation';

import { PaymentModal } from '@/components/blocks/payment/payment-modal';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/hooks/use-app-context';
import { getCookie } from '@/lib/cookie';
import type { Subscription } from '@/models/subscription.server';
import type { Pricing, PricingItem } from '@/types/blocks/pricing';

import {
  getMaxAnnualDiscountPercent,
  withAnnualSavings,
} from './pricing-billing';
import {
  PricingPlanCards,
  type PricingPlanFeature,
} from './pricing-plan-cards';

export type UpgradePaywallReason =
  | '4k'
  | 'capacity'
  | 'credits'
  | 'music'
  | 'video';

type UpgradePaywallDialogProps = {
  open: boolean;
  onClose: () => void;
  reason: UpgradePaywallReason;
};

type PricingPageData = {
  sections?: {
    pricing?: Pricing & {
      data?: {
        currentSubscription?: Subscription | null;
      };
    };
  };
};

function getBillingGroups(section?: Pricing) {
  const items = section?.items || [];
  const has = (predicate: (item: PricingItem) => boolean) =>
    items.some(predicate);

  return [
    has((item) => item.interval === 'day') && 'day',
    has((item) => item.interval === 'month') && 'monthly',
    has((item) => item.interval === 'year') && 'yearly',
    has((item) => item.interval === 'one-time') && 'one-time',
  ].filter(Boolean) as string[];
}

function getInitialGroup(reason: UpgradePaywallReason, groups: string[]) {
  if (reason === 'credits' && groups.includes('one-time')) return 'one-time';
  if (groups.includes('yearly')) return 'yearly';
  return groups[0] || '';
}

function matchesGroup(item: PricingItem, group: string) {
  if (group === 'day') return item.interval === 'day';
  if (group === 'monthly') return item.interval === 'month';
  if (group === 'yearly') return item.interval === 'year';
  return item.interval === 'one-time';
}

function getPaywallFeatures(
  item: PricingItem,
  t: ReturnType<typeof useTranslations>
): PricingPlanFeature[] {
  const plan = item.plan_name?.toLowerCase() || item.title?.toLowerCase();
  const isUltra = plan?.includes('ultra') || item.product_id.includes('studio');
  const isPro = isUltra || plan?.includes('pro');
  const capacity = isUltra ? 4 : isPro ? 2 : 1;

  return [
    { label: t('image_creation'), included: true },
    { label: t('two_k'), included: true },
    { label: t('reference_editing'), included: true },
    { label: t('four_k'), included: !!isPro },
    { label: t('video'), included: !!isPro },
    { label: t('music'), included: !!isPro },
    {
      label: t('active_tasks', { count: capacity }),
      included: true,
    },
  ];
}

export function UpgradePaywallDialog({
  open,
  onClose,
  reason,
}: UpgradePaywallDialogProps) {
  const locale = useLocale();
  const t = useTranslations('pages.pricing.messages.paywall');
  const {
    configs,
    fetchConfigs,
    setIsShowPaymentModal,
    setIsShowSignModal,
    user,
  } = useAppContext();
  const [section, setSection] = useState<Pricing | null>(null);
  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);
  const [group, setGroup] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [pricingItem, setPricingItem] = useState<PricingItem | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setIsLoading(true);
    import('@/server/pricing.functions')
      .then(({ getPricingPageDataFn }) =>
        getPricingPageDataFn({ data: { locale } })
      )
      .then((data) => {
        if (cancelled) return;
        const pricing = (data as PricingPageData).sections?.pricing;
        const groups = getBillingGroups(pricing);
        setSection(pricing || null);
        setCurrentSubscription(pricing?.data?.currentSubscription || null);
        setGroup(getInitialGroup(reason, groups));
      })
      .catch((error) => {
        console.error('Failed to load upgrade plans:', error);
        toast.error(t('load_error'));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locale, open, reason, t]);

  const billingGroups = useMemo(
    () => getBillingGroups(section || undefined),
    [section]
  );
  const items = useMemo(() => {
    const allItems = section?.items || [];
    return withAnnualSavings(
      allItems.filter((item) => matchesGroup(item, group)),
      allItems,
      locale
    );
  }, [group, locale, section?.items]);
  const annualDiscountPercent = useMemo(
    () => getMaxAnnualDiscountPercent(section?.items || []),
    [section?.items]
  );

  const getAffiliateMetadata = (paymentProvider: string) => {
    const metadata: Record<string, string> = {};

    if (
      configs.affonso_enabled === 'true' &&
      ['stripe', 'creem'].includes(paymentProvider)
    ) {
      metadata.affonso_referral = getCookie('affonso_referral') || '';
    }

    if (configs.promotekit_enabled === 'true' && paymentProvider === 'stripe') {
      metadata.promotekit_referral =
        (window as { promotekit_referral?: string }).promotekit_referral ||
        getCookie('promotekit_referral') ||
        '';
    }

    return metadata;
  };

  const handleCheckout = async (
    item: PricingItem,
    paymentProvider?: string
  ) => {
    try {
      setLoadingProductId(item.product_id);
      const { checkoutFn } = await import('@/server/payment.functions');
      const data = await checkoutFn({
        data: {
          product_id: item.product_id,
          currency: item.currency,
          locale: locale || 'en',
          payment_provider: paymentProvider || '',
          metadata: getAffiliateMetadata(paymentProvider || ''),
        },
      });

      if (!data.checkoutUrl) throw new Error('checkout url not found');
      window.location.href = data.checkoutUrl;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`${t('checkout_failed')}: ${message}`);
      setLoadingProductId(null);
    }
  };

  const handleChoose = async (item: PricingItem) => {
    if (!user) {
      onClose();
      setIsShowSignModal(true);
      return;
    }

    const paymentConfigs = await fetchConfigs();
    if (paymentConfigs.select_payment_enabled === 'true') {
      setPricingItem(item);
      setIsShowPaymentModal(true);
      return;
    }

    await handleCheckout(item, paymentConfigs.default_payment_provider);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent
          className="overflow-y-auto border-0 bg-[#090b08] p-0 text-zinc-100 shadow-none"
          fullScreen
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          showCloseButton={false}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t(`reasons.${reason}`)}</DialogDescription>
          </DialogHeader>

          <Button
            aria-label={t('close')}
            className="absolute top-4 right-4 z-10 size-9 border border-white/15 bg-black/20 p-0 text-zinc-100 hover:bg-white/10"
            onClick={onClose}
            size="icon"
            variant="outline"
          >
            <X className="size-4" />
          </Button>

          <div className="min-h-full px-5 pt-14 pb-8 sm:px-8 sm:pt-12 md:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full border border-[#ddec7c]/20 bg-[#ddec7c]/10 text-[#ddec7c]">
                <Sparkles className="size-5" />
              </div>
              <h2 className="text-3xl font-semibold text-white md:text-4xl">
                {t('title')}
              </h2>
              <p className="mt-3 text-base leading-7 text-zinc-400">
                {t(`reasons.${reason}`)}
              </p>
            </div>

            {billingGroups.length > 0 && (
              <Tabs className="mt-7" onValueChange={setGroup} value={group}>
                <TabsList className="mx-auto flex h-auto w-fit max-w-full flex-wrap border-[#394231] bg-[#151b12] p-1 text-zinc-400">
                  {billingGroups.map((billingGroup) => (
                    <TabsTrigger
                      className="rounded-md px-3 text-zinc-300 data-[state=active]:bg-[#eaff4f] data-[state=active]:text-[#151a0c]"
                      key={billingGroup}
                      value={billingGroup}
                    >
                      {t(`groups.${billingGroup}`)}
                      {billingGroup === 'yearly' &&
                        annualDiscountPercent > 0 && (
                          <span className="ml-2 rounded-sm bg-[#eaff4f] px-1.5 py-0.5 text-[10px] font-semibold text-[#151a0c]">
                            {t('annual_save', {
                              percent: annualDiscountPercent,
                            })}
                          </span>
                        )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}

            {isLoading ? (
              <div className="flex min-h-72 items-center justify-center text-zinc-400">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : items.length > 0 ? (
              <div className="mt-7">
                <PricingPlanCards
                  currentSubscription={currentSubscription}
                  getFeatures={(item) => getPaywallFeatures(item, t)}
                  items={items}
                  labels={{
                    currentPlan: t('current_plan'),
                    choosePlan: t('choose_plan'),
                    buyCredits: t('buy_credits'),
                    credits: t('credits'),
                    processing: t('processing'),
                  }}
                  loadingProductId={loadingProductId}
                  onChoose={(item) => void handleChoose(item)}
                />
              </div>
            ) : (
              <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.035] p-6 text-center text-sm text-zinc-400">
                <p>{t('load_error')}</p>
                <Link className="mt-4 inline-flex" href="/pricing">
                  <Button variant="outline">
                    <CreditCard className="size-4" />
                    {t('view_pricing')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PaymentModal
        isLoading={!!loadingProductId}
        onCheckout={handleCheckout}
        pricingItem={pricingItem}
      />
    </>
  );
}
