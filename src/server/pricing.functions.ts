import { createServerFn } from '@tanstack/react-start';

import i18n from '@/core/i18n';

import { defaultLocale } from '@/config/locale';

import { getAllConfigs } from '@/models/config.server';
import { getRemainingCredits } from '@/models/credit.server';
import { getCurrentSubscription } from '@/models/subscription.server';
import { getUserInfo } from '@/models/user.server';
import {
  applyCreemPricingOverridesToItems,
  getCreemPricingOverrides,
} from '@/services/creem-pricing.server';
import { PricingItem } from '@/types/blocks/pricing';

export const getPricingPageDataFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { locale?: string }) => data)
  .handler(async ({ data }) => {
    const locale = data.locale || defaultLocale;
    const t = i18n.getFixedT(locale);

    const page = JSON.parse(
      JSON.stringify(t('pages.pricing.page', { returnObjects: true }))
    ) as any;

    const pricing = page.sections?.pricing;
    if (!pricing?.items?.length) {
      return page;
    }

    let configs: Record<string, string> = {};
    try {
      configs = await getAllConfigs();
    } catch (error) {
      console.warn(
        'Failed to load pricing runtime configs, falling back to locale pricing.',
        error
      );
    }

    if (configs.pay_as_you_go_enabled === 'false') {
      pricing.groups = pricing.groups?.filter(
        (group: { name?: string }) => group.name !== 'one-time'
      );
      pricing.items = pricing.items.filter(
        (item: PricingItem) => item.group !== 'one-time'
      );
    }

    const overrides = await getCreemPricingOverrides(configs);
    pricing.items = applyCreemPricingOverridesToItems(
      pricing.items as PricingItem[],
      overrides
    );

    try {
      const user = await getUserInfo();
      if (user) {
        const [currentSubscription, remainingCredits] = await Promise.all([
          getCurrentSubscription(user.id),
          getRemainingCredits(user.id),
        ]);

        pricing.data = {
          ...pricing.data,
          currentSubscription,
          remainingCredits,
        };
      }
    } catch (error) {
      console.warn(
        'Failed to load pricing user entitlement data, rendering anonymous pricing.',
        error
      );
    }

    return page;
  });
