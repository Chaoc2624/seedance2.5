import { createFileRoute, notFound } from '@tanstack/react-router';

import { Link } from '@/core/i18n/navigation';

import { getHeadMeta } from '@/lib/seo';

const imageGeneratorPages = {
  'nano-banana-2': {
    title: 'Nano Banana 2 Image Generator',
    description:
      'Generate and edit images with Nano Banana 2 in Seedance 2.5, with prompt-first controls for references, campaign visuals, and creative drafts.',
    heading: 'Nano Banana 2 Image Generator',
    eyebrow: 'Image model',
    ctaHref: '/image-generator?model=nano-banana-2',
  },
  'gpt-image-2': {
    title: 'GPT Image 2 Image Generator',
    description:
      'Create GPT Image 2 visuals in Seedance 2.5 with strong text rendering, reference editing, and production-ready image workflows.',
    heading: 'GPT Image 2 Image Generator',
    eyebrow: 'Image model',
    ctaHref: '/image-generator?model=gpt-image-2',
  },
  'ai-face-swap': {
    title: 'AI Face Swap Image Generator',
    description:
      'Use Seedance 2.5 Face Swap to create realistic face replacement concepts with image references and controlled editing workflows.',
    heading: 'AI Face Swap Image Generator',
    eyebrow: 'Image workflow',
    ctaHref: '/image-generator?feature=ai-face-swap',
  },
} as const;

type ImageGeneratorSlug = keyof typeof imageGeneratorPages;

function getImageGeneratorPage(slug: string) {
  return imageGeneratorPages[slug as ImageGeneratorSlug];
}

export const Route = createFileRoute(
  '/{-$locale}/_landing/image-generator/$slug'
)({
  loader: ({ params }) => {
    const page = getImageGeneratorPage(params.slug);
    if (!page) {
      throw notFound();
    }
    return page;
  },
  component: ImageGeneratorSlugPage,
  head: ({ params, loaderData }) =>
    getHeadMeta({
      title: loaderData.title,
      description: loaderData.description,
      canonicalUrl: `/image-generator/${params.slug}`,
      locale: params.locale,
    }),
});

function ImageGeneratorSlugPage() {
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
          Open Image Generator
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
