import { createFileRoute, redirect } from '@tanstack/react-router';

import { modules } from '@/config/preset';

import { CreateWorkspace } from '@/components/features/ai-generator/create-workspace';
import { getHeadMeta } from '@/lib/seo';

export const Route = createFileRoute('/{-$locale}/_landing/generate')({
  beforeLoad: () => {
    if (!modules.ai) {
      throw redirect({ to: '/' as any });
    }
  },
  component: GeneratePage,
  head: ({ params }) =>
    getHeadMeta({
      title: 'Seedance 2.5 Generate Workspace',
      description:
        'Generate AI images and videos in a timeline workspace with reusable prompt controls.',
      canonicalUrl: '/generate',
      noIndex: true,
      locale: params.locale,
    }),
});

function GeneratePage() {
  return <CreateWorkspace />;
}
