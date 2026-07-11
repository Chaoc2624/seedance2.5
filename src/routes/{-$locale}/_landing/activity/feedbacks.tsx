import { createFileRoute } from '@tanstack/react-router';

import { Empty } from '@/components/blocks/common/empty';
import { getHeadMeta } from '@/lib/seo';

export const Route = createFileRoute('/{-$locale}/_landing/activity/feedbacks')(
  {
    component: FeedbacksPage,
    head: ({ params }) =>
      getHeadMeta({
        metadataKey: 'activity.feedbacks.metadata',
        canonicalUrl: '/activity/feedbacks',
        locale: params.locale,
      }),
  }
);

function FeedbacksPage() {
  return (
    <div className="space-y-8">
      <Empty message="WIP - Feedbacks" />
    </div>
  );
}
