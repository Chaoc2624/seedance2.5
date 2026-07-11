import aiSaas from './ai-saas';
import contentPlatform from './content-platform';
import developerTool from './developer-tool';
import ecommerce from './ecommerce';
import general from './general';

export interface TemplateDefinition {
  name: string;
  nameZh: string;
  description: string;
  /** Ordered list of section ids to include */
  sections: string[];
  /** Maps section id → array of icon names for its items */
  iconMap?: Record<string, string[]>;
}

export const templates: Record<string, TemplateDefinition> = {
  'ai-saas': aiSaas,
  'developer-tool': developerTool,
  ecommerce,
  'content-platform': contentPlatform,
  general,
};

export function getTemplate(key: string): TemplateDefinition {
  const tpl = templates[key];
  if (!tpl) {
    throw new Error(
      `Unknown template "${key}". Available: ${Object.keys(templates).join(', ')}`
    );
  }
  return tpl;
}
