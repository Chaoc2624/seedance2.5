import { LazyImage } from '@/components/blocks/common/media/lazy-image';
import { ScrollAnimation } from '@/components/ui/scroll-animation';
import { Section, SectionItem } from '@/types/blocks/landing';

export function Testimonials({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const TestimonialCard = ({ item }: { item: SectionItem }) => {
    return (
      <div className="flex flex-col justify-end gap-6 rounded-(--radius) border border-transparent bg-card/25 p-8 ring-1 ring-foreground/[0.07]">
        <p className='self-end text-balance text-foreground before:mr-1 before:content-["“"] after:ml-1 after:content-["”"]'>
          {item.quote || item.description}
        </p>
        <div className="flex items-center gap-3">
          <div className="aspect-square size-9 overflow-hidden rounded-lg border border-transparent shadow-md ring-1 shadow-black/15 ring-foreground/10">
            <LazyImage
              src={item.image?.src || item.avatar?.src || ''}
              alt={item.image?.alt || item.avatar?.alt || item.name || ''}
              className="h-full w-full object-cover"
            />
          </div>
          <h3 className="sr-only">
            {item.name}, {item.role || item.title}
          </h3>
          <div className="space-y-px">
            <p className="text-sm font-medium">{item.name} </p>
            <p className="text-xs text-muted-foreground">
              {item.role || item.title}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id={section.id}
      className={`py-16 md:py-24 ${section.className} ${className}`}
    >
      <div className="container">
        <ScrollAnimation>
          <div className="mx-auto max-w-2xl text-center text-balance">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {section.title}
            </h2>
            <p className="mb-6 text-muted-foreground md:mb-12 lg:mb-16">
              {section.description}
            </p>
          </div>
        </ScrollAnimation>
        <ScrollAnimation delay={0.2}>
          <div className="relative rounded-(--radius) border-border/50">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-px lg:*:nth-1:rounded-t-none lg:*:nth-2:rounded-tl-none lg:*:nth-2:rounded-br-none lg:*:nth-3:rounded-l-none lg:*:nth-4:rounded-r-none lg:*:nth-5:rounded-tl-none lg:*:nth-5:rounded-br-none lg:*:nth-6:rounded-b-none">
              {section.items?.map((item, index) => (
                <TestimonialCard key={index} item={item} />
              ))}
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
