import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';

import { Link } from '@/core/i18n/navigation';

import AppImage from '@/components/blocks/common/media/app-image';
import { SmartIcon } from '@/components/blocks/common/smart-icon';
import { Button } from '@/components/ui/button';
import { Highlighter } from '@/components/ui/highlighter';
import { cn } from '@/lib/utils';
import { Section } from '@/types/blocks/landing';

import { SocialAvatars } from './social-avatars';

export function Hero({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const highlightText = section.highlight_text ?? '';
  let texts = null;
  if (highlightText && section.title) {
    const highlightIndex = section.title.indexOf(highlightText);
    if (highlightIndex >= 0) {
      texts = [
        section.title.slice(0, highlightIndex),
        section.title.slice(highlightIndex + highlightText.length),
      ];
    }
  }

  const isCompact = (section as any).variant === 'compact';

  return (
    <section
      id={section.id}
      className={cn(
        'relative',
        isCompact
          ? 'pt-18 pb-3 md:pt-22 md:pb-5'
          : 'pt-24 pb-8 md:pt-36 md:pb-8',
        section.className,
        className
      )}
    >
      {section.announcement && (
        <Link
          href={section.announcement.url || ''}
          target={section.announcement.target || '_self'}
          className="group mx-auto mb-8 flex w-fit max-w-[calc(100%-2rem)] items-center gap-4 rounded-md border border-border bg-background p-1 pl-4 shadow-sm shadow-zinc-950/5 transition-colors duration-300 hover:border-cyan-500/40 hover:bg-muted/40"
        >
          <span className="text-sm text-foreground">
            {section.announcement.title}
          </span>
          <span className="block h-4 w-0.5 border-l bg-white dark:border-background dark:bg-zinc-700"></span>

          <div className="size-6 overflow-hidden rounded-full bg-background duration-500 group-hover:bg-muted">
            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
              <span className="flex size-6">
                <ArrowRight className="m-auto size-3" />
              </span>
              <span className="flex size-6">
                <ArrowRight className="m-auto size-3" />
              </span>
            </div>
          </div>
        </Link>
      )}

      <div
        className={cn(
          'relative mx-auto max-w-full px-4 text-center',
          isCompact ? 'md:max-w-3xl' : 'md:max-w-5xl'
        )}
      >
        {texts && texts.length > 0 ? (
          <h1
            className={cn(
              'font-semibold text-balance text-foreground',
              isCompact
                ? 'text-4xl leading-tight sm:mt-2 sm:text-5xl'
                : 'text-4xl leading-tight sm:mt-12 sm:text-6xl'
            )}
          >
            {texts[0]}
            <Highlighter action="underline" color="#FF9800">
              {highlightText}
            </Highlighter>
            {texts[1]}
          </h1>
        ) : (
          <h1
            className={cn(
              'font-semibold text-balance text-foreground',
              isCompact
                ? 'text-4xl leading-tight sm:mt-2 sm:text-5xl'
                : 'text-4xl leading-tight sm:mt-12 sm:text-6xl'
            )}
          >
            {section.title}
          </h1>
        )}

        <p
          className={cn(
            'mx-auto max-w-3xl text-balance text-muted-foreground',
            isCompact
              ? 'mt-5 mb-2 text-lg leading-relaxed'
              : 'mt-8 mb-8 text-lg'
          )}
          dangerouslySetInnerHTML={{ __html: section.description ?? '' }}
        />

        {section.buttons && (
          <div className="flex items-center justify-center gap-4">
            {section.buttons.map((button, idx) => (
              <Button
                asChild
                size={button.size || 'default'}
                variant={button.variant || 'default'}
                className="px-5 text-sm"
                key={idx}
              >
                <Link href={button.url ?? ''} target={button.target ?? '_self'}>
                  {button.icon && <SmartIcon name={button.icon as string} />}
                  <span>{button.title}</span>
                </Link>
              </Button>
            ))}
          </div>
        )}

        {section.tip && (
          <p
            className="mt-6 block text-center text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: section.tip ?? '' }}
          />
        )}

        {section.show_avatars && !isCompact && (
          <SocialAvatars tip={section.avatars_tip || ''} />
        )}
      </div>

      {!isCompact && (section.image?.src || section.image_invert?.src) && (
        <div className="relative mt-8 border-y border-border/70 sm:mt-16">
          <div className="relative z-10 mx-auto max-w-6xl border-x px-3">
            <div className="border-x">
              <div
                aria-hidden
                className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
              />
              {section.image_invert?.src && (
                <AppImage
                  className="relative z-2 hidden w-full border border-border/70 dark:block"
                  src={section.image_invert.src}
                  alt={section.image_invert.alt || section.image?.alt || ''}
                  width={
                    section.image_invert.width || section.image?.width || 1200
                  }
                  height={
                    section.image_invert.height || section.image?.height || 630
                  }
                  sizes="(max-width: 768px) 100vw, 1200px"
                  loading="lazy"
                  fetchPriority="high"
                />
              )}
              {section.image?.src && (
                <AppImage
                  className="relative z-2 block w-full border border-border/70 dark:hidden"
                  src={section.image.src}
                  alt={section.image.alt || section.image_invert?.alt || ''}
                  width={
                    section.image.width || section.image_invert?.width || 1200
                  }
                  height={
                    section.image.height || section.image_invert?.height || 630
                  }
                  sizes="(max-width: 768px) 100vw, 1200px"
                  loading="lazy"
                  fetchPriority="high"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {!isCompact && section.background_image?.src && (
        <div className="absolute inset-0 -z-10 hidden h-full w-full overflow-hidden md:block">
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/80 via-background/80 to-background" />
          <AppImage
            src={section.background_image.src}
            alt={section.background_image.alt || ''}
            className="absolute inset-0 h-full w-full object-cover opacity-60 blur-[0px]"
            loading="lazy"
            sizes="(max-width: 768px) 0vw, 100vw"
          />
        </div>
      )}
    </section>
  );
}
