import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import Crown from 'lucide-react/dist/esm/icons/crown';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useLocale, useTranslations } from '@/core/i18n/hooks';
import { Link } from '@/core/i18n/navigation';

import { PaymentModal } from '@/components/blocks/payment/payment-modal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/hooks/use-app-context';
import { getCookie } from '@/lib/cookie';
import { getMembershipEntitlements } from '@/lib/membership';
import { cn } from '@/lib/utils';
import type { Subscription } from '@/models/subscription.server';
import type { FAQ } from '@/types/blocks/landing';
import type {
  Pricing as PricingType,
  PricingItem,
} from '@/types/blocks/pricing';

import {
  getMaxAnnualDiscountPercent,
  withAnnualSavings,
} from './pricing-billing';
import { PricingComparison } from './pricing-comparison';
import { PricingFaq } from './pricing-faq';
import {
  PricingPlanCards,
  type PricingPlanFeature,
} from './pricing-plan-cards';

type PricingExperienceProps = {
  section: PricingType;
  className?: string;
  currentSubscription?: Subscription | null;
  remainingCredits?: number;
};

function getInitialGroup(section: PricingType) {
  const yearlyGroup = section.groups?.find((item) => item.name === 'yearly');
  const featuredGroup = section.groups?.find((item) => item.is_featured);

  return (
    yearlyGroup?.name || featuredGroup?.name || section.groups?.[0]?.name || ''
  );
}

function formatRenewalDate(
  value: Date | string | null | undefined,
  locale: string
) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString(locale);
}

function getMembershipFeatures({
  item,
  messages,
}: {
  item: PricingItem;
  messages: ReturnType<typeof useTranslations>;
}): PricingPlanFeature[] {
  const plan = item.plan_name?.toLowerCase() || item.title?.toLowerCase();
  const isUltra = plan?.includes('ultra') || item.product_id.includes('studio');
  const isPro = isUltra || plan?.includes('pro');
  const capacity = isUltra ? 4 : isPro ? 2 : 1;

  return [
    { label: messages('image_creation'), included: true },
    { label: messages('image_two_k'), included: true },
    { label: messages('comparison.reference_editing'), included: true },
    { label: messages('four_k'), included: !!isPro },
    { label: messages('comparison.video'), included: !!isPro },
    { label: messages('comparison.music'), included: !!isPro },
    {
      label: messages('outputs_active', {
        outputs: capacity,
        active: capacity,
      }),
      included: true,
    },
  ];
}

export function PricingExperience({
  section,
  className,
  currentSubscription,
  remainingCredits = 0,
}: PricingExperienceProps) {
  const locale = useLocale();
  const t = useTranslations('pages.pricing.messages');
  const {
    user,
    configs,
    fetchConfigs,
    setIsShowPaymentModal,
    setIsShowSignModal,
  } = useAppContext();
  const [group, setGroup] = useState(() => getInitialGroup(section));
  const [pricingItem, setPricingItem] = useState<PricingItem | null>(null);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  useEffect(() => {
    setGroup(getInitialGroup(section));
  }, [section]);

  const items = useMemo(() => {
    const allItems = section.items || [];
    const selectedItems = allItems.filter(
      (item) => !item.group || item.group === group
    );

    return withAnnualSavings(selectedItems, allItems, locale);
  }, [group, locale, section.items]);
  const comparisonItems = useMemo(
    () => section.items?.filter((item) => item.group === 'monthly') || [],
    [section.items]
  );
  const annualDiscountPercent = useMemo(
    () => getMaxAnnualDiscountPercent(section.items || []),
    [section.items]
  );
  const entitlements = getMembershipEntitlements(currentSubscription);
  const renewalDate = formatRenewalDate(
    currentSubscription?.currentPeriodEnd,
    locale
  );
  const faq = t.raw('faq') as FAQ;

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
      if (!user) {
        setIsShowSignModal(true);
        return;
      }

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
    <section
      className={cn(
        'min-h-[100dvh] overflow-hidden bg-[#090b08] py-14 text-zinc-100 md:py-20',
        className,
        section.className
      )}
      id={section.id}
    >
      <div className="container">
        {section.sr_only_title && (
          <h1 className="sr-only">{section.sr_only_title}</h1>
        )}

        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 border-b border-white/10 pb-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <div className="mb-4 flex items-center gap-2 text-[#ddec7c]">
                <Sparkles className="size-4" />
                <span className="text-sm font-semibold">
                  {t('value_label')}
                </span>
              </div>
              <h2 className="max-w-2xl text-4xl font-semibold text-white md:text-5xl">
                {section.title}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
                {section.description}
              </p>
            </div>

            <aside className="rounded-lg border border-[#394231] bg-[#12170f] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-400">
                    {t('membership_title')}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    {entitlements.label}
                  </p>
                </div>
                <Crown className="size-5 text-[#ddec7c]" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-sm">
                <div>
                  <p className="text-zinc-500">{t('credits_label')}</p>
                  <p className="mt-1 font-mono text-lg text-zinc-100 tabular-nums">
                    {remainingCredits.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">
                    {currentSubscription
                      ? t('renews_label')
                      : t('access_label')}
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-100">
                    {renewalDate || t('credits_access')}
                  </p>
                </div>
              </div>
              {currentSubscription && (
                <Link className="mt-5 inline-flex" href="/settings/billing">
                  <Button
                    className="border border-white/15 bg-white/[0.06] text-zinc-100 hover:bg-white/[0.11]"
                    size="sm"
                    variant="outline"
                  >
                    <CreditCard className="size-4" />
                    {t('manage_billing')}
                  </Button>
                </Link>
              )}
            </aside>
          </div>

          {section.groups && section.groups.length > 0 && (
            <Tabs className="mt-9" onValueChange={setGroup} value={group}>
              <TabsList className="h-auto max-w-full border-[#394231] bg-[#151b12] p-1 text-zinc-400">
                {section.groups.map((item) => (
                  <TabsTrigger
                    className="rounded-md text-zinc-300 data-[state=active]:bg-[#eaff4f] data-[state=active]:text-[#151a0c]"
                    key={item.name}
                    value={item.name || ''}
                  >
                    {item.title}
                    {item.name === 'yearly' && annualDiscountPercent > 0 && (
                      <span className="ml-2 rounded-sm bg-[#eaff4f] px-1.5 py-0.5 text-[10px] font-semibold text-[#151a0c]">
                        {t('annual_save', { percent: annualDiscountPercent })}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          <div className="mt-6">
            <PricingPlanCards
              currentSubscription={currentSubscription}
              getFeatures={(item) =>
                getMembershipFeatures({ item, messages: t })
              }
              items={items}
              labels={{
                currentPlan: t('current_plan'),
                choosePlan: t('choose_plan'),
                buyCredits: t('buy_credits'),
                credits: t('comparison.credits'),
                processing: t('processing'),
              }}
              loadingProductId={loadingProductId}
              onChoose={(item) => void handleChoose(item)}
            />
          </div>

          <PricingComparison
            items={comparisonItems}
            labels={{
              title: t('comparison.title'),
              description: t('comparison.description'),
              showMore: t('comparison.show_more'),
              showLess: t('comparison.show_less'),
              credits: t('comparison.credits'),
              outputs: t('comparison.outputs'),
              activeTasks: t('comparison.active_tasks'),
              imageCreation: t('comparison.image_creation'),
              referenceEditing: t('comparison.reference_editing'),
              fourK: t('comparison.four_k'),
              video: t('comparison.video'),
              music: t('comparison.music'),
              included: t('comparison.included'),
              unavailable: t('comparison.unavailable'),
            }}
          />

          {faq?.items && <PricingFaq section={faq} />}
        </div>
      </div>

      <PaymentModal
        isLoading={!!loadingProductId}
        onCheckout={handleCheckout}
        pricingItem={pricingItem}
      />
    </section>
  );
}
