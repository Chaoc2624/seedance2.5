import { createFileRoute } from '@tanstack/react-router';

import { getHeadMeta } from '@/lib/seo';
import { SignIn } from '@/routes/{-$locale}/_auth/sign-in/components/sign-in';

export const Route = createFileRoute('/{-$locale}/_auth/sign-in/')({
  component: SignInPage,
  head: ({ params }) =>
    getHeadMeta({
      metadataKey: 'common.sign',
      canonicalUrl: '/sign-in',
      locale: params.locale,
    }),
});

function SignInPage() {
  // Get callbackUrl from search params
  const search = Route.useSearch() as Record<string, string>;
  const callbackUrl = search?.callbackUrl || '/';
  const email = search?.email || '';

  return <SignIn configs={{}} callbackUrl={callbackUrl} defaultEmail={email} />;
}
