import type { TemplateDefinition } from './index';

const general: TemplateDefinition = {
  name: 'General',
  nameZh: '通用',
  description: 'A versatile template that works for any product or service.',
  sections: [
    'hero',
    'features',
    'benefits',
    'usage',
    'stats',
    'testimonials',
    'faq',
    'cta',
  ],
  iconMap: {
    benefits: ['RiRocketLine', 'RiShieldCheckLine', 'RiTimerLine'],
    features: [
      'RiStarLine',
      'RiShieldCheckLine',
      'RiTimerLine',
      'RiTeamLine',
      'RiSettings3Line',
      'RiCustomerServiceLine',
    ],
  },
};

export default general;
