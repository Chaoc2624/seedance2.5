import { createFileRoute, redirect } from '@tanstack/react-router';

import { useTranslations } from '@/core/i18n/hooks';

import { modules } from '@/config/preset';

import ThemeDynamicPage from '@/themes/default/pages/dynamic-page';

import { VideoGenerator } from '@/components/features/ai-generator';
import { getHeadMeta } from '@/lib/seo';
import { DynamicPage } from '@/types/blocks/landing';

export const Route = createFileRoute('/{-$locale}/_landing/video-generator')({
  beforeLoad: () => {
    if (!modules.ai) {
      throw redirect({ to: '/' as any });
    }
  },
  component: AiVideoGeneratorPage,
  head: ({ params }) =>
    getHeadMeta({
      metadataKey: 'ai.video.metadata',
      canonicalUrl: '/video-generator',
      locale: params.locale,
    }),
});

function AiVideoGeneratorPage() {
  const { locale } = Route.useParams();
  const t = useTranslations('ai.video');

  const page: DynamicPage = {
    sections: {
      hero: {
        title: t('page.title'),
        description: t('page.description'),
        background_image: {
          src: '/imgs/bg/tree.jpg',
          alt: 'hero background',
        },
      },
      generator: {
        beforeLoad: () => {
          if (!modules.ai) {
            throw redirect({ to: '/' as any });
          }
        },
        component: <VideoGenerator srOnlyTitle={t('generator.title')} />,
      },
    },
  };

  return <ThemeDynamicPage locale={locale} page={page} />;
}
