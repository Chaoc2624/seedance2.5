import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollAnimation } from '@/components/ui/scroll-animation';
import { cn } from '@/lib/utils';
import { Section } from '@/types/blocks/landing';

export type FaqItemLike = {
  question?: string;
  title?: string;
  answer?: string;
  description?: string;
};

/** Normalize FAQ rows for both the interactive accordion and crawlable SSR answers. */
export function getFaqAnswerEntries(items: FaqItemLike[] = []) {
  return items
    .map((item) => ({
      question: (item.question || item.title || '').trim(),
      answer: (item.answer || item.description || '').trim(),
    }))
    .filter((item) => item.answer.length > 0);
}

/**
 * Always-in-DOM answers for crawlers. Kept visually hidden so the accordion can
 * collapse normally without keeping closed panels mounted (Radix closed height).
 */
export function FaqCrawlableAnswers({ items }: { items?: FaqItemLike[] }) {
  const entries = getFaqAnswerEntries(items);
  if (entries.length === 0) return null;

  return (
    <div className="sr-only" data-faq-seo-answers aria-hidden="true">
      {entries.map((item, idx) => (
        <article key={`${item.question}-${idx}`}>
          {item.question ? <h3>{item.question}</h3> : null}
          <p>{item.answer}</p>
        </article>
      ))}
    </div>
  );
}

export function Faq({
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
        'relative overflow-hidden border-t border-border/70 bg-background py-16 md:py-24',
        section.className,
        className
      )}
    >
      <div className="container">
        <ScrollAnimation>
          <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
            {section.title && (
              <h2 className="mb-4 text-3xl leading-tight font-bold text-balance lg:text-4xl">
                {section.title}
              </h2>
            )}
            {section.description && (
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {section.description}
              </p>
            )}
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={0.2}>
          <div className="mx-auto max-w-4xl">
            <FaqCrawlableAnswers items={section.items} />
            <Accordion
              type="single"
              collapsible
              className="w-full rounded-md border border-border bg-card p-2 shadow-sm shadow-black/5"
            >
              {section.items?.map((item, idx) => (
                <div className="group" key={idx}>
                  <AccordionItem
                    value={item.question || item.title || ''}
                    className="peer rounded-sm border-none px-5 py-2 data-[state=open]:border-none data-[state=open]:bg-muted/45"
                  >
                    <AccordionTrigger className="cursor-pointer text-left text-base font-semibold hover:no-underline">
                      {item.question || item.title || ''}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-base leading-relaxed text-muted-foreground">
                        {item.answer || item.description || ''}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <hr className="mx-6 border-dashed group-last:hidden peer-data-[state=open]:opacity-0" />
                </div>
              ))}
            </Accordion>

            <p
              className="mt-6 px-8 text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: section.tip || '' }}
            />
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
