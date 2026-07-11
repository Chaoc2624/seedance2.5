import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/{-$locale}/shiponce/')({
  beforeLoad: ({ params }) => {
    const locale = (params as any).locale || '';
    const prefix = locale ? `/${locale}` : '';
    throw redirect({ to: `${prefix}/shiponce/users` as any });
  },
});
