import { Fragment } from 'react';

import { getThemeBlock } from '@/core/theme/blocks';

import type { DynamicPage as DynamicPageType } from '@/types/blocks/landing';

export default function DynamicPage({
  locale: _locale,
  page,
  data,
}: {
  locale?: string;
  page: DynamicPageType;
  data?: Record<string, any>;
}) {
  return (
    <>
      {page.title && !page.sections?.hero && (
        <h1 className="sr-only">{page.title}</h1>
      )}
      {page?.sections &&
        Object.keys(page.sections).map((sectionKey: string) => {
          const section = page.sections?.[sectionKey];
          if (!section || section.disabled === true) {
            return null;
          }

          if (page.show_sections && !page.show_sections.includes(sectionKey)) {
            return null;
          }

          // block name
          const block = section.block || section.id || sectionKey;

          switch (block) {
            default:
              try {
                if (section.component) {
                  return (
                    <Fragment key={sectionKey}>{section.component}</Fragment>
                  );
                }

                const DynamicBlock = getThemeBlock(block);
                return (
                  <DynamicBlock
                    key={sectionKey}
                    section={section}
                    {...(data || section.data || {})}
                  />
                );
              } catch {
                return null;
              }
          }
        })}
    </>
  );
}
