import type { TemplateDefinition } from './index';

const contentPlatform: TemplateDefinition = {
  name: 'Content Platform',
  nameZh: '内容平台',
  description:
    'Blogs, newsletters, knowledge bases, community platforms, and media sites.',
  sections: [
    'hero',
    'introduce',
    'features',
    'benefits',
    'stats',
    'testimonials',
    'faq',
    'subscribe',
    'cta',
  ],
  iconMap: {
    introduce: [
      'RiArticleLine',
      'RiPenNibLine',
      'RiTeamLine',
      'RiSearchLine',
    ],
    features: [
      'RiArticleLine',
      'RiPenNibLine',
      'RiNotification3Line',
      'RiSearchLine',
      'RiShareLine',
      'RiBarChart2Line',
    ],
  },
};

export default contentPlatform;
