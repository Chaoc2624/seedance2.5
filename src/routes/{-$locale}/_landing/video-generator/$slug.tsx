import { createFileRoute, notFound } from '@tanstack/react-router';

import { Link } from '@/core/i18n/navigation';

import { getHeadMeta } from '@/lib/seo';

const videoGeneratorPages = {
  'seedance-2': {
    title: 'Seedance 2.5 Video Generator',
    description:
      'Generate Seedance 2.5 videos in Seedance 2.5 with prompt-to-video and image-to-video workflows for cinematic motion drafts.',
    heading: 'Seedance 2.5 Video Generator',
    eyebrow: 'Video model',
    ctaHref: '/video-generator?model=seedance-2',
  },
  'image-to-video': {
    title: 'Image to Video Generator',
    description:
      'Turn still images into video clips with Seedance 2.5 image-to-video workflows, reference uploads, camera motion, and model controls.',
    heading: 'Image to Video Generator',
    eyebrow: 'Video workflow',
    ctaHref: '/video-generator?feature=animate-images',
  },
} as const;

type VideoGeneratorSlug = keyof typeof videoGeneratorPages;

function getVideoGeneratorPage(slug: string) {
  return videoGeneratorPages[slug as VideoGeneratorSlug];
}

export const Route = createFileRoute(
  '/{-$locale}/_landing/video-generator/$slug'
)({
  loader: ({ params }) => {
    const page = getVideoGeneratorPage(params.slug);
    if (!page) {
      throw notFound();
    }
    return page;
  },
  component: VideoGeneratorSlugPage,
  head: ({ params, loaderData }) =>
    getHeadMeta({
      title: loaderData.title,
      description: loaderData.description,
      canonicalUrl: `/video-generator/${params.slug}`,
      locale: params.locale,
    }),
});

function VideoGeneratorSlugPage() {
  const page = Route.useLoaderData();

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
      <p className="mb-4 text-sm font-semibold text-[#d8f269]">
        {page.eyebrow}
      </p>
      <h1 className="max-w-3xl font-display text-4xl font-semibold tracking-normal text-[#f4f2e6] sm:text-6xl">
        {page.heading}
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-7 text-[#b8bcad]">
        {page.description}
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={page.ctaHref}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-[#d8f269] px-5 text-sm font-bold text-[#111407] transition-colors hover:bg-[#eaff4f] focus-visible:ring-2 focus-visible:ring-[#eaff4f]/70 focus-visible:outline-none"
        >
          Open Video Generator
        </Link>
        <Link
          href="/generate"
          className="inline-flex h-12 items-center justify-center rounded-xl border border-white/12 bg-white/[0.055] px-5 text-sm font-bold text-[#f4f2e6] transition-colors hover:border-[#d8f269]/48 hover:bg-white/[0.085] focus-visible:ring-2 focus-visible:ring-[#eaff4f]/70 focus-visible:outline-none"
        >
          Open Workspace
        </Link>
      </div>
    </section>
  );
}
