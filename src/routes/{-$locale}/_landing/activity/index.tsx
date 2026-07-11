import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/{-$locale}/_landing/activity/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/$locale/_landing/activity/ai-tasks',
      params,
    } as any);
  },
});
