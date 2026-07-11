import { createFileRoute, redirect } from '@tanstack/react-router';

import { useTranslations } from '@/core/i18n/hooks';

import { modules } from '@/config/preset';

import ThemeDynamicPage from '@/themes/default/pages/dynamic-page';

import { MusicGenerator } from '@/components/features/ai-generator';
import { getHeadMeta } from '@/lib/seo';
import { DynamicPage } from '@/types/blocks/landing';

export const Route = createFileRoute('/{-$locale}/_landing/ai/music-generator')(
  {
    beforeLoad: () => {
      if (!modules.ai) {
        throw redirect({ to: '/' as any });
      }
    },
    component: AiMusicGeneratorPage,
    head: ({ params }) =>
      getHeadMeta({
        metadataKey: 'ai.music.metadata',
        canonicalUrl: '/ai/music-generator',
        locale: params.locale,
      }),
  }
);

function AiMusicGeneratorPage() {
  const { locale } = Route.useParams();
  const t = useTranslations('ai.music');

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
        component: <MusicGenerator srOnlyTitle={t('generator.title')} />,
      },
    },
  };

  return <ThemeDynamicPage locale={locale} page={page} />;
}
