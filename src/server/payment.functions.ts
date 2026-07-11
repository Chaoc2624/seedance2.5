import { createServerFn } from '@tanstack/react-start';

import i18n from '@/core/i18n';
import { PERMISSIONS, requirePermission } from '@/core/rbac/index.server';

import {
  PaymentInterval,
  PaymentOrder,
  PaymentPrice,
  PaymentType,
} from '@/extensions/payment/types';

import { envConfigs } from '@/config';
import { getSnowId, getUuid } from '@/lib/hash';
import { getAllConfigs } from '@/models/config.server';
import {
  createOrder,
  NewOrder,
  OrderStatus,
  updateOrderByOrderNo,
  getOrders,
  getOrdersCount,
} from '@/models/order.server';
import { getUserInfo } from '@/models/user.server';
import {
  getCreemPricingOverride,
  parseCreemProductIdMap,
} from '@/services/creem-pricing.server';
import { getPaymentService } from '@/services/payment.server';
import { PricingCurrency } from '@/types/blocks/pricing';

function getMappedPaymentProductId({
  productId,
  mapping,
}: {
  productId: string;
  mapping: Record<string, string>;
}) {
  return mapping[productId] || '';
}

function getCheckoutBaseUrl(configs: Record<string, string>) {
  const appUrl = (configs.app_url || envConfigs.app_url || '').trim();
  if (!appUrl) {
    throw new Error('app_url is required for checkout');
  }

  return appUrl.replace(/\/+$/, '');
}

export const checkoutFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      product_id: string;
      currency?: string;
      locale?: string;
      payment_provider?: string;
      metadata?: Record<string, string>;
    }) => data
  )
  .handler(async ({ data }) => {
    const { product_id, currency, locale, payment_provider, metadata } = data;
    if (!product_id) throw new Error('product_id is required');

    const lang = locale || 'en';
    const pricing = i18n.getResourceBundle(lang, 'translation')?.pages?.pricing
      ?.page?.sections?.pricing;
    if (!pricing) throw new Error('pricing data not found');

    const pricingItem = pricing.items?.find(
      (item: any) => item.product_id === product_id
    );
    if (!pricingItem) throw new Error('pricing item not found');
    if (!pricingItem.product_id && !pricingItem.amount)
      throw new Error('invalid pricing item');

    const user = await getUserInfo();
    if (!user || !user.email) throw new Error('no auth, please sign in');

    const configs = await getAllConfigs();

    let paymentProviderName =
      configs.select_payment_enabled === 'true'
        ? payment_provider || configs.default_payment_provider || ''
        : configs.default_payment_provider || '';
    if (!paymentProviderName) throw new Error('no payment provider configured');

    // Validate provider
    let allowedProviders: string[] | undefined;
    if (
      currency &&
      currency.toLowerCase() !== (pricingItem.currency || 'usd').toLowerCase()
    ) {
      const currData = pricingItem.currencies?.find(
        (c: PricingCurrency) =>
          c.currency.toLowerCase() === currency.toLowerCase()
      );
      allowedProviders = currData?.payment_providers;
    }
    if (!allowedProviders?.length)
      allowedProviders = pricingItem.payment_providers;
    if (
      allowedProviders?.length &&
      !allowedProviders.includes(paymentProviderName)
    ) {
      throw new Error(
        `payment provider ${paymentProviderName} is not supported`
      );
    }

    const paymentService = await getPaymentService();
    const provider = paymentService.getProvider(paymentProviderName);
    if (!provider?.name) throw new Error('no payment provider configured');

    const defaultCurrency = (pricingItem.currency || 'usd').toLowerCase();
    let checkoutCurrency = defaultCurrency;
    let checkoutAmount = pricingItem.amount;

    if (currency) {
      const req = currency.toLowerCase();
      if (req !== defaultCurrency && pricingItem.currencies?.length) {
        const cd = pricingItem.currencies.find(
          (c: PricingCurrency) => c.currency.toLowerCase() === req
        );
        if (cd) {
          checkoutCurrency = req;
          checkoutAmount = cd.amount;
        }
      }
    }

    const paymentInterval: PaymentInterval =
      pricingItem.interval || PaymentInterval.ONE_TIME;
    const paymentType =
      paymentInterval === PaymentInterval.ONE_TIME
        ? PaymentType.ONE_TIME
        : PaymentType.SUBSCRIPTION;
    const orderNo = getSnowId();

    let paymentProductId = '';
    if (currency && currency.toLowerCase() !== defaultCurrency) {
      const cd = pricingItem.currencies?.find(
        (c: PricingCurrency) =>
          c.currency.toLowerCase() === currency.toLowerCase()
      );
      if (cd?.payment_product_id) paymentProductId = cd.payment_product_id;
    }
    if (!paymentProductId)
      paymentProductId = pricingItem.payment_product_id || '';

    if (paymentProviderName === 'creem') {
      const creemPricingOverride = await getCreemPricingOverride({
        configs,
        productId: pricingItem.product_id,
      });
      if (creemPricingOverride) {
        checkoutAmount = creemPricingOverride.amount;
        checkoutCurrency = creemPricingOverride.currency.toLowerCase();
        paymentProductId = creemPricingOverride.payment_product_id;
      }

      const creemProductId = getMappedPaymentProductId({
        productId: pricingItem.product_id,
        mapping: parseCreemProductIdMap(configs.creem_product_ids),
      });
      if (creemProductId) {
        paymentProductId = creemProductId;
      }
    }

    const checkoutPrice: PaymentPrice = {
      amount: checkoutAmount,
      currency: checkoutCurrency,
    };
    if (
      !paymentProductId &&
      (!checkoutPrice.amount || !checkoutPrice.currency)
    ) {
      throw new Error('invalid checkout price');
    }
    if (paymentProductId) paymentProductId = paymentProductId.trim();
    if (!paymentProductId && provider.name === 'creem') {
      throw new Error(
        `Creem Product IDs Mapping is missing "${pricingItem.product_id}" for ${checkoutCurrency.toUpperCase()}`
      );
    }

    const appUrl = getCheckoutBaseUrl(configs);
    let callbackBaseUrl = appUrl;
    if (locale && locale !== configs.default_locale)
      callbackBaseUrl += `/${locale}`;

    const callbackUrl =
      paymentType === PaymentType.SUBSCRIPTION
        ? `${callbackBaseUrl}/settings/billing`
        : `${callbackBaseUrl}/settings/payments`;

    const checkoutOrder: PaymentOrder = {
      description: pricingItem.product_name,
      customer: { name: user.name, email: user.email },
      type: paymentType,
      metadata: {
        app_name: configs.app_name || envConfigs.app_name,
        order_no: orderNo,
        user_id: user.id,
        ...metadata,
      },
      successUrl: `${appUrl}/api/payment/callback?order_no=${orderNo}`,
      cancelUrl: `${callbackBaseUrl}/pricing`,
    };

    if (paymentProductId) checkoutOrder.productId = paymentProductId;
    checkoutOrder.price = checkoutPrice;
    if (paymentType === PaymentType.SUBSCRIPTION) {
      checkoutOrder.plan = {
        interval: paymentInterval,
        name: pricingItem.product_name,
      };
    }

    const order: NewOrder = {
      id: getUuid(),
      orderNo,
      userId: user.id,
      userEmail: user.email,
      status: OrderStatus.PENDING,
      amount: checkoutAmount,
      currency: checkoutCurrency,
      productId: pricingItem.product_id,
      paymentType,
      paymentInterval,
      paymentProvider: provider.name,
      checkoutInfo: JSON.stringify(checkoutOrder),
      createdAt: new Date(),
      productName: pricingItem.product_name,
      description: pricingItem.description,
      callbackUrl,
      creditsAmount: pricingItem.credits,
      creditsValidDays: pricingItem.valid_days,
      planName: pricingItem.plan_name || '',
      paymentProductId,
    };

    await createOrder(order);

    const result = await provider.createPayment({ order: checkoutOrder });
    await updateOrderByOrderNo(orderNo, {
      status: OrderStatus.CREATED,
      checkoutInfo: JSON.stringify(result.checkoutParams),
      checkoutResult: JSON.stringify(result.checkoutResult),
      checkoutUrl: result.checkoutInfo.checkoutUrl,
      paymentSessionId: result.checkoutInfo.sessionId,
      paymentProvider: result.provider,
    });
    return result.checkoutInfo;
  });

export const getAdminPaymentsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      page?: number;
      limit?: number;
      type?: string;
      status?: string;
      provider?: string;
      orderNo?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.PAYMENTS_READ });
    const { page, limit, type, status, provider, orderNo } = data;
    const payments = await getOrders({
      orderNo: orderNo ? (orderNo as string) : undefined,
      paymentType: type as PaymentType,
      paymentProvider:
        provider && provider !== 'all' ? (provider as string) : undefined,
      status: status && status !== 'all' ? (status as OrderStatus) : undefined,
      getUser: true,
      page,
      limit,
    });
    return payments;
  });

export const getAdminPaymentsCountFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      type?: string;
      status?: string;
      provider?: string;
      orderNo?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.PAYMENTS_READ });
    const { type, status, provider, orderNo } = data;
    const count = await getOrdersCount({
      orderNo: orderNo ? (orderNo as string) : undefined,
      paymentType: type as PaymentType,
      paymentProvider:
        provider && provider !== 'all' ? (provider as string) : undefined,
      status: status && status !== 'all' ? (status as OrderStatus) : undefined,
    });
    return count;
  });

export const getAdminPaymentsPageDataFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      page?: number;
      limit?: number;
      type?: string;
      status?: string;
      provider?: string;
      orderNo?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    await requirePermission({ code: PERMISSIONS.PAYMENTS_READ });
    const { page, limit, type, status, provider, orderNo } = data;
    const filter = {
      orderNo: orderNo ? (orderNo as string) : undefined,
      paymentType: type as PaymentType,
      paymentProvider:
        provider && provider !== 'all' ? (provider as string) : undefined,
      status: status && status !== 'all' ? (status as OrderStatus) : undefined,
    };

    // Execute both in a single server function call
    const [total, payments] = await Promise.all([
      getOrdersCount(filter),
      getOrders({ ...filter, getUser: true, page, limit }),
    ]);

    return { total, payments };
  });

export const getUserPaymentsPageDataFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { page?: number; limit?: number; type?: string }) => data
  )
  .handler(async ({ data }) => {
    const userInfo = await getUserInfo();
    if (!userInfo) throw new Error('not authenticated');

    const { page, limit, type } = data;
    const filter = {
      userId: userInfo.id,
      paymentType: type && type !== 'all' ? (type as PaymentType) : undefined,
      status: OrderStatus.PAID,
    };

    const [total, payments] = await Promise.all([
      getOrdersCount(filter),
      getOrders({ ...filter, page, limit }),
    ]);

    return { total, payments };
  });
