import { allSkeletons } from './templates/base';
import type { TemplateDefinition } from './templates';

export interface ProductInfo {
  name: string;
  description: string;
  features: string;
  target: string;
  pricing?: string;
}

/**
 * Build the system + user prompt for AI landing page generation.
 * The AI returns a JSON object with `en` and `zh` keys, each containing
 * the text content for every section.
 */
export function buildPrompt(
  product: ProductInfo,
  template: TemplateDefinition
): { system: string; user: string } {
  const sectionSchemas = template.sections
    .map((id) => {
      const skeleton = allSkeletons[id];
      if (!skeleton) return null;
      const hint = skeleton.ai_hint;
      const fields: string[] = [];

      if (hint.needs_title) fields.push('title: string');
      if (hint.needs_description) fields.push('description: string');
      if (hint.needs_tip) fields.push('tip: string');

      if (hint.extra_fields) {
        for (const f of hint.extra_fields) {
          fields.push(`${f}: string`);
        }
      }

      if (hint.items_count && hint.item_fields) {
        fields.push(
          `items: Array<{ ${hint.item_fields.map((f) => `${f}: string`).join(', ')} }> // exactly ${hint.items_count} items`
        );
      }

      return `  "${id}": {\n    ${fields.join(',\n    ')}\n  }`;
    })
    .filter(Boolean)
    .join(',\n');

  const system = `You are a professional landing page copywriter. You generate JSON content for landing pages.

Rules:
- Output ONLY valid JSON, no markdown fences, no comments.
- The JSON has two top-level keys: "en" (English) and "zh" (Simplified Chinese).
- Each contains the same sections with localized content.
- For "hero" section:
  - "highlight_text" must be a substring of "title" (the highlighted part).
  - "announcement" is an object with "badge" and "title" fields.
  - "avatars_tip" is a short social proof text like "999+ users are using [Product]".
  - "buttons" is an array of objects, each with a "title" field for button label.
- For items with "icon" field: use a descriptive placeholder like "Icon1", "Icon2" — they will be replaced.
- For FAQ items: use "question" and "answer" fields.
- For testimonial items: use "name", "role", and "quote" fields. Generate realistic but fictional personas.
- For stats items: "title" should be a number/metric (e.g. "10K+"), "description" a short label.
- Write compelling, conversion-focused copy. Be specific to the product, avoid generic phrases.
- Chinese translations should feel natural, not machine-translated. Adapt idioms and phrasing.
- Keep titles concise (under 80 chars). Descriptions can be 1-2 sentences.`;

  const user = `Generate landing page content for this product:

Product name: ${product.name}
Description: ${product.description}
Core features: ${product.features}
Target users: ${product.target}
${product.pricing ? `Pricing info: ${product.pricing}` : ''}

Template type: ${template.name}
Sections to generate (in order): ${template.sections.join(', ')}

Output JSON schema:
{
  "en": {
${sectionSchemas}
  },
  "zh": {
    // Same structure as "en", but in Simplified Chinese
  }
}`;

  return { system, user };
}
