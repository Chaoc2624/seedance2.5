import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import type { TemplateDefinition } from './templates';
import { allSkeletons } from './templates/base';
import type { GeneratedContent } from './ai-generate';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '../../');
const LOCALE_DIR = resolve(ROOT, 'src/config/locale');

/**
 * Merge AI-generated text content with template skeletons to produce
 * a complete page config, then write to locale JSON files.
 */
export function writePageConfigs(
  content: GeneratedContent,
  template: TemplateDefinition,
  productName: string
) {
  const enPage = buildPageConfig(content.en, template, 'en');
  const zhPage = buildPageConfig(content.zh, template, 'zh');

  const enPath = resolve(LOCALE_DIR, 'en/pages/index.json');
  const zhPath = resolve(LOCALE_DIR, 'zh/pages/index.json');

  mkdirSync(dirname(enPath), { recursive: true });
  mkdirSync(dirname(zhPath), { recursive: true });

  writeFileSync(enPath, JSON.stringify({ page: enPage }, null, 2) + '\n');
  writeFileSync(zhPath, JSON.stringify({ page: zhPage }, null, 2) + '\n');

  // Update brand name in landing.json
  updateLandingBrand('en', productName);
  updateLandingBrand('zh', productName);

  return { enPath, zhPath };
}

function buildPageConfig(
  aiContent: Record<string, any>,
  template: TemplateDefinition,
  _locale: string
) {
  const sections: Record<string, any> = {};

  for (const sectionId of template.sections) {
    const skeleton = allSkeletons[sectionId];
    if (!skeleton) continue;

    const aiSection = aiContent[sectionId] || {};
    const section: Record<string, any> = {
      id: sectionId,
    };

    // Add block type if differs from id
    if (skeleton.block) {
      section.block = skeleton.block;
    }

    // Merge AI text fields
    if (aiSection.title) section.title = aiSection.title;
    if (aiSection.description) section.description = aiSection.description;
    if (aiSection.tip) section.tip = aiSection.tip;
    if (aiSection.label) section.label = aiSection.label;

    // Hero-specific fields
    if (sectionId === 'hero') {
      if (aiSection.highlight_text) {
        section.highlight_text = aiSection.highlight_text;
      }
      if (aiSection.announcement) {
        section.announcement = {
          badge: aiSection.announcement.badge || 'New',
          title: aiSection.announcement.title || '',
          url: '/pricing',
        };
      }
      if (aiSection.avatars_tip) section.avatars_tip = aiSection.avatars_tip;

      // Merge button titles into static button structure
      const staticButtons = skeleton.static.buttons || [];
      const aiButtons = aiSection.buttons || [];
      section.buttons = staticButtons.map(
        (btn: Record<string, any>, i: number) => ({
          ...btn,
          title: aiButtons[i]?.title || btn.title || '',
        })
      );
    }

    // CTA button titles
    if (sectionId === 'cta' && aiSection.buttons) {
      const staticButtons = skeleton.static.buttons || [];
      section.buttons = staticButtons.map(
        (btn: Record<string, any>, i: number) => ({
          ...btn,
          title: aiSection.buttons[i]?.title || btn.title || '',
        })
      );
    }

    // Subscribe fields
    if (sectionId === 'subscribe') {
      section.submit = {
        input: {
          placeholder:
            aiSection.submit?.input?.placeholder || 'Enter your email',
        },
        button: {
          title: aiSection.submit?.button?.title || 'Subscribe',
        },
        action: '/api/subscribe',
      };
    }

    // Items with icons from template iconMap
    if (aiSection.items && Array.isArray(aiSection.items)) {
      const icons = template.iconMap?.[sectionId] || [];
      section.items = aiSection.items.map(
        (item: Record<string, any>, i: number) => {
          const merged: Record<string, any> = { ...item };
          // Replace AI placeholder icons with template icons
          if (icons[i] && merged.icon) {
            merged.icon = icons[i];
          } else if (icons[i]) {
            merged.icon = icons[i];
          }
          // Add placeholder images for sections that need them
          if (
            ['introduce', 'benefits', 'usage'].includes(sectionId) &&
            !merged.image
          ) {
            merged.image = {
              src: `/imgs/features/${i + 1}.png`,
              alt: sectionId,
            };
          }
          // Add avatar images for testimonials
          if (sectionId === 'testimonials' && !merged.image) {
            merged.image = {
              src: `/imgs/avatars/${i + 1}.png`,
              alt: merged.name || 'avatar',
            };
          }
          return merged;
        }
      );
    }

    // Spread all static props (images, layout, className, etc.)
    for (const [key, value] of Object.entries(skeleton.static)) {
      if (!(key in section)) {
        section[key] = value;
      }
    }

    sections[sectionId] = section;
  }

  return {
    show_sections: template.sections,
    sections,
  };
}

function updateLandingBrand(locale: string, productName: string) {
  const landingPath = resolve(LOCALE_DIR, `${locale}/landing.json`);
  try {
    const landing = JSON.parse(readFileSync(landingPath, 'utf-8'));
    if (landing.header?.brand) {
      landing.header.brand.title = productName;
    }
    if (landing.footer?.brand) {
      landing.footer.brand.title = productName;
    }
    writeFileSync(landingPath, JSON.stringify(landing, null, 2) + '\n');
  } catch {
    // landing.json might not exist in some setups, skip
  }
}
