import { createFileRoute } from '@tanstack/react-router';

import { getHeadMeta } from '@/lib/seo';

import { SignUp } from './components/sign-up';

export const Route = createFileRoute('/{-$locale}/_auth/sign-up/')({
  component: SignUpPage,
  head: ({ params }) =>
    getHeadMeta({
      metadataKey: 'common.sign',
      canonicalUrl: '/sign-up',
      locale: params.locale,
    }),
});

function SignUpPage() {
  const search = Route.useSearch() as Record<string, string>;
  const callbackUrl = search?.callbackUrl || '/';

  return <SignUp configs={{}} callbackUrl={callbackUrl} />;
}
