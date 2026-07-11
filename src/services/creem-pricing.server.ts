import { CreemProduct, CreemProvider } from '@/extensions/payment/creem';

import { Configs } from '@/models/config.server';
import { PricingItem } from '@/types/blocks/pricing';

type CreemPricingOverride = {
  amount: number;
  currency: string;
  price: string;
  payment_product_id: string;
};

declare global {
  var _cachedCreemProducts: {
    cacheKey: string;
    cachedAt: number;
    products: CreemProduct[];
  } | null;
}

const CREEM_PRODUCTS_CACHE_TTL_MS = 60_000;

export function parseCreemProductIdMap(value?: string): Record<string, string> {
  if (!value?.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([, productId]) => typeof productId === 'string')
        .map(([productId, paymentProductId]) => [
          productId.trim(),
          (paymentProductId as string).trim(),
        ])
        .filter(
          ([productId, paymentProductId]) => productId && paymentProductId
        )
    );
  } catch {
    throw new Error('Creem Product IDs Mapping must be a valid JSON object');
  }
}

function getCreemProductCacheKey(configs: Configs) {
  return [
    configs.creem_environment === 'production' ? 'production' : 'sandbox',
    configs.creem_api_key,
  ].join(':');
}

async function getCreemProducts(configs: Configs): Promise<CreemProduct[]> {
  if (!configs.creem_api_key?.trim()) {
    return [];
  }

  const cacheKey = getCreemProductCacheKey(configs);
  const cached = globalThis._cachedCreemProducts;
  if (
    cached?.cacheKey === cacheKey &&
    Date.now() - cached.cachedAt < CREEM_PRODUCTS_CACHE_TTL_MS
  ) {
    return cached.products;
  }

  const provider = new CreemProvider({
    apiKey: configs.creem_api_key,
    environment:
      configs.creem_environment === 'production' ? 'production' : 'sandbox',
  });

  const products = await provider.searchProducts();
  globalThis._cachedCreemProducts = {
    cacheKey,
    cachedAt: Date.now(),
    products,
  };

  return products;
}

function formatPrice(amount: number, currency: string) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: amount % 100 === 0 ? 0 : 2,
  }).format(amount / 100);

  return formatted.replace(/\s+/g, '');
}

export async function getCreemPricingOverrides(
  configs: Configs
): Promise<Record<string, CreemPricingOverride>> {
  try {
    const productIdMap = parseCreemProductIdMap(configs.creem_product_ids);
    if (
      !configs.creem_api_key?.trim() ||
      Object.keys(productIdMap).length === 0
    ) {
      return {};
    }

    const products = await getCreemProducts(configs);
    const productsById = new Map(
      products.map((product) => [product.id, product])
    );

    return Object.fromEntries(
      Object.entries(productIdMap)
        .map(([localProductId, creemProductId]) => {
          const product = productsById.get(creemProductId);
          if (!product || product.status === 'archived') {
            return null;
          }

          const currency = product.currency.toUpperCase();
          return [
            localProductId,
            {
              amount: product.price,
              currency,
              price: formatPrice(product.price, currency),
              payment_product_id: product.id,
            },
          ] as const;
        })
        .filter(Boolean) as [string, CreemPricingOverride][]
    );
  } catch (error) {
    console.warn(
      'Failed to sync Creem product prices, falling back to local pricing JSON.',
      error
    );
    return {};
  }
}

export function applyCreemPricingOverridesToItems(
  items: PricingItem[] | undefined,
  overrides: Record<string, CreemPricingOverride>
) {
  if (!items?.length || Object.keys(overrides).length === 0) {
    return items;
  }

  return items.map((item) => {
    const override = overrides[item.product_id];
    if (!override) {
      return item;
    }

    return {
      ...item,
      amount: override.amount,
      currency: override.currency,
      price: override.price,
      original_price: '',
      payment_product_id: override.payment_product_id,
    };
  });
}

export async function getCreemPricingOverride({
  configs,
  productId,
}: {
  configs: Configs;
  productId: string;
}) {
  const overrides = await getCreemPricingOverrides(configs);
  return overrides[productId];
}
