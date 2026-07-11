import type { PricingItem } from '@/types/blocks/pricing';

export function withAnnualSavings(
  items: PricingItem[],
  allItems: PricingItem[],
  locale: string
) {
  return items.map((item) => {
    if (item.interval !== 'year') return item;

    const monthly = allItems.find(
      (candidate) =>
        candidate.interval === 'month' && candidate.title === item.title
    );
    if (!monthly || monthly.amount * 12 <= item.amount) return item;

    return {
      ...item,
      original_price: new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: monthly.currency,
        maximumFractionDigits: 0,
      }).format(monthly.amount / 100),
      price: new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: item.currency,
        maximumFractionDigits: 0,
      }).format(item.amount / 1200),
      unit: '/ month, billed annually',
    };
  });
}

export function getMaxAnnualDiscountPercent(items: PricingItem[]) {
  const discounts = items.flatMap((annual) => {
    if (annual.interval !== 'year') return [];
    const monthly = items.find(
      (candidate) =>
        candidate.interval === 'month' && candidate.title === annual.title
    );
    if (!monthly || monthly.amount * 12 <= annual.amount) return [];

    return [
      Math.round(
        ((monthly.amount * 12 - annual.amount) / (monthly.amount * 12)) * 100
      ),
    ];
  });

  return discounts.length > 0 ? Math.max(...discounts) : 0;
}
