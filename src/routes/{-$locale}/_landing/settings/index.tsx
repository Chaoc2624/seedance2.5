import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/{-$locale}/_landing/settings/')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/$locale/_landing/settings/profile', params } as any);
  },
});
