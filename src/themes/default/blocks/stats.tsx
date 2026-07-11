import { ScrollAnimation } from '@/components/ui/scroll-animation';
import { Section } from '@/types/blocks/landing';

export function Stats({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section
      id={section.id}
      className={`py-12 md:py-24 ${section.className} ${className}`}
    >
      <div className={`container space-y-8 md:space-y-16`}>
        <ScrollAnimation>
          <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {section.title}
            </h2>
            <p className="mb-6 text-muted-foreground md:mb-12 lg:mb-16">
              {section.description}
            </p>
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={0.2}>
          <div className="grid gap-12 divide-y *:text-center md:grid-cols-3 md:gap-2 md:divide-x md:divide-y-0">
            {section.items?.map((item, idx) => (
              <div className="space-y-4" key={idx}>
                <h3 className="sr-only">
                  {item.title} {item.description}
                </h3>
                <div className="text-5xl font-bold text-primary">
                  {item.title}
                </div>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
