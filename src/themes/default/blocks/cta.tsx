import { Link } from '@/core/i18n/navigation';

import { SmartIcon } from '@/components/blocks/common/smart-icon';
import { Button } from '@/components/ui/button';
import { ScrollAnimation } from '@/components/ui/scroll-animation';
import { cn } from '@/lib/utils';
import { Section } from '@/types/blocks/landing';

export function Cta({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section
      id={section.id}
      className={cn(
        'relative overflow-hidden border-t border-border/70 bg-muted/35 py-16 md:py-24',
        section.className,
        className
      )}
    >
      <div className="container">
        <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="text-center md:text-left">
            <ScrollAnimation>
              <h2 className="text-3xl leading-tight font-bold text-balance lg:text-4xl">
                {section.title}
              </h2>
            </ScrollAnimation>
            <ScrollAnimation delay={0.15}>
              <p
                className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: section.description ?? '' }}
              />
            </ScrollAnimation>
          </div>

          <ScrollAnimation delay={0.3}>
            <div className="flex flex-wrap justify-center gap-3 md:justify-end">
              {section.buttons?.map((button, idx) => (
                <Button
                  asChild
                  size={button.size || 'default'}
                  variant={button.variant || 'default'}
                  key={idx}
                >
                  <Link
                    href={button.url || ''}
                    target={button.target || '_self'}
                  >
                    {button.icon && <SmartIcon name={button.icon as string} />}
                    <span>{button.title}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
