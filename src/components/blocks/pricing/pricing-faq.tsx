import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { FAQ } from '@/types/blocks/landing';

type PricingFaqProps = {
  section: FAQ;
};

export function PricingFaq({ section }: PricingFaqProps) {
  return (
    <section className="mt-20 border-t border-[#394231] pt-12 md:mt-24 md:pt-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold text-white md:text-4xl">
          {section.title}
        </h2>
        {section.description && (
          <p className="mt-3 text-base leading-7 text-zinc-400">
            {section.description}
          </p>
        )}
      </div>

      <Accordion
        className="mx-auto mt-8 max-w-4xl rounded-lg border border-[#394231] bg-[#11170f] p-2"
        collapsible
        type="single"
      >
        {section.items?.map((item, index) => (
          <AccordionItem
            className="border-[#394231] px-4 last:border-b-0 data-[state=open]:bg-[#1a2115]"
            key={item.question || item.title || index}
            value={`pricing-faq-${index}`}
          >
            <AccordionTrigger className="py-5 text-left text-base font-semibold text-zinc-100 hover:no-underline">
              {item.question || item.title}
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-sm leading-7 text-zinc-400">
              {item.answer || item.description}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
