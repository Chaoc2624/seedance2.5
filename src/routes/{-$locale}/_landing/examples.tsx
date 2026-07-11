import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/{-$locale}/_landing/examples')({
  loader: ({ params }) => {
    throw redirect({
      to: (params.locale
        ? `/${params.locale}/image-generator`
        : '/image-generator') as any,
      replace: true,
    } as any);
  },
});
