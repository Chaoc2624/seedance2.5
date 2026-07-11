import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';

import { Link } from '@/core/i18n/navigation';

import AppImage from '@/components/blocks/common/media/app-image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Section } from '@/types/blocks/landing';

import { pickAccent } from './_accents';

type GalleryFeature = {
  title?: string;
  description?: string;
};

function getItemFeatures(value: unknown): GalleryFeature[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (feature): feature is GalleryFeature =>
      typeof feature === 'object' &&
      feature !== null &&
      ('title' in feature || 'description' in feature)
  );
}

export function GalleryGrid({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const items = section.items ?? [];
  const showViewMore = section.show_view_more === true;
  const viewMoreLabel =
    typeof section.view_more_label === 'string'
      ? section.view_more_label
      : 'View more showcase';

  if (items.length === 0) {
    return null;
  }

  const spotlightItems = items.slice(0, 4);
  const galleryItems = items.slice(4);

  return (
    <section
      id={section.id || 'gallery'}
      className={cn(
        'relative overflow-hidden border-t border-border/70 bg-background py-16 md:py-24',
        section.className,
        className
      )}
    >
      <div className="container">
        {(section.title || section.description) && (
          <div className="mx-auto mb-10 max-w-4xl text-center md:mb-12">
            {section.title && (
              <h2 className="mb-5 text-4xl leading-tight font-bold text-balance lg:text-5xl">
                {section.title}
              </h2>
            )}
            {section.description && (
              <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground">
                {section.description}
              </p>
            )}
          </div>
        )}

        <div className="mx-auto max-w-6xl space-y-8 md:space-y-10">
          <div className="grid gap-5 md:grid-cols-2">
            {spotlightItems.map((item, index) => {
              const accent = pickAccent(index);
              const imageAlt = item.image?.alt ?? item.title ?? 'Example';
              const features = getItemFeatures(item.features);

              return (
                <article
                  key={item.title ?? item.image?.src ?? index}
                  className="group overflow-hidden rounded-md border border-border/70 bg-card shadow-sm shadow-black/5 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md hover:shadow-black/5"
                >
                  <figure className="border-b border-border/70 bg-muted/30 p-3">
                    <div className="relative aspect-[16/11] overflow-hidden rounded-sm bg-background/70">
                      {item.image?.src && (
                        <AppImage
                          src={item.image.src}
                          alt={imageAlt}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.015]"
                          loading="lazy"
                        />
                      )}
                    </div>
                  </figure>

                  <div className="p-5 md:p-6">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <span
                        className={cn(
                          'inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-bold',
                          accent.icon
                        )}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span
                        aria-hidden
                        className={cn(
                          'h-1 w-20 rounded-full bg-gradient-to-r',
                          accent.line
                        )}
                      />
                    </div>

                    {item.title && (
                      <h3 className="text-2xl leading-tight font-bold text-balance">
                        {item.title}
                      </h3>
                    )}
                    {(item.description || section.description) && (
                      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                        {item.description || section.description}
                      </p>
                    )}

                    {features.length > 0 && (
                      <div className="mt-5 grid gap-3 border-t border-border/70 pt-5">
                        {features.map((feature, featureIndex) => (
                          <div
                            key={feature.title ?? featureIndex}
                            className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-4"
                          >
                            {feature.title && (
                              <h4 className="text-sm font-semibold">
                                {feature.title}
                              </h4>
                            )}
                            {feature.description && (
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {feature.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {galleryItems.length > 0 && (
            <div className="grid grid-cols-2 gap-4 border-t border-border/70 pt-10 md:grid-cols-4">
              {galleryItems.map((item, index) => (
                <figure
                  key={item.title ?? item.image?.src ?? index}
                  className="group relative aspect-square overflow-hidden rounded-md border border-border/60 bg-muted/40"
                >
                  {item.image?.src && (
                    <AppImage
                      src={item.image.src}
                      alt={item.image.alt ?? item.title ?? 'Example'}
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                  {(item.title || item.description) && (
                    <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      {item.title && (
                        <div className="text-sm font-semibold text-white">
                          {item.title}
                        </div>
                      )}
                      {item.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-white/80">
                          {item.description}
                        </p>
                      )}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}

          {showViewMore && (
            <div className="flex justify-center pt-2">
              <Button asChild variant="outline" size="lg">
                <Link href="/image-generator">
                  {viewMoreLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
