/**
 * Payment callback server route
 */
import { createFileRoute } from '@tanstack/react-router';

import { PaymentType } from '@/extensions/payment/types';

import { envConfigs } from '@/config';
import { findOrderByOrderNo } from '@/models/order.server';
import { getUserInfo } from '@/models/user.server';
import {
  getPaymentService,
  handleCheckoutSuccess,
} from '@/services/payment.server';

export const Route = createFileRoute('/api/payment/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        let redirectUrl = '';

        try {
          const url = new URL(request.url);
          const orderNo = url.searchParams.get('order_no') || '';

          if (!orderNo) throw new Error('invalid callback params');

          const user = await getUserInfo();
          if (!user || !user.email) throw new Error('no auth, please sign in');

          const order = await findOrderByOrderNo(orderNo);
          if (!order) throw new Error('order not found');
          if (!order.paymentSessionId || !order.paymentProvider)
            throw new Error('invalid order');
          if (order.userId !== user.id)
            throw new Error('order and user not match');

          const paymentService = await getPaymentService();
          const paymentProvider = paymentService.getProvider(
            order.paymentProvider
          );
          if (!paymentProvider) throw new Error('payment provider not found');

          const session = await paymentProvider.getPaymentSession({
            sessionId: order.paymentSessionId,
          });

          await handleCheckoutSuccess({ order, session });

          redirectUrl =
            order.callbackUrl ||
            (order.paymentType === PaymentType.SUBSCRIPTION
              ? `${envConfigs.app_url}/settings/billing`
              : `${envConfigs.app_url}/settings/payments`);
        } catch (e: any) {
          console.log('checkout callback failed:', e);
          redirectUrl = `${envConfigs.app_url}/pricing`;
        }

        return new Response(null, {
          status: 302,
          headers: { Location: redirectUrl },
        });
      },
    },
  },
});
