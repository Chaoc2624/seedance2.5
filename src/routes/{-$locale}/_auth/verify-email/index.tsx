import { createFileRoute } from '@tanstack/react-router';

import { getHeadMeta } from '@/lib/seo';
import { VerifyEmailPage as VerifyEmail } from '@/routes/{-$locale}/_auth/verify-email/components/verify-email';

export const Route = createFileRoute('/{-$locale}/_auth/verify-email/')({
  component: VerifyEmailPageRoute,
  head: ({ params }) =>
    getHeadMeta({
      canonicalUrl: '/verify-email',
      locale: params.locale,
      noIndex: true,
    }),
});

function VerifyEmailPageRoute() {
  return <VerifyEmail />;
}
