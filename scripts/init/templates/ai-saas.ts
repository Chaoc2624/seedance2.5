import type { TemplateDefinition } from './index';

const aiSaas: TemplateDefinition = {
  name: 'AI SaaS Tool',
  nameZh: 'AI SaaS 工具',
  description:
    'AI-powered software service: image generators, chatbots, content tools, etc.',
  sections: [
    'hero',
    'logos',
    'introduce',
    'benefits',
    'usage',
    'features',
    'stats',
    'testimonials',
    'faq',
    'cta',
  ],
  iconMap: {
    introduce: [
      'RiNextjsFill',
      'RiDatabase2Line',
      'RiCloudyFill',
      'RiRobot2Line',
    ],
    benefits: ['RiNextjsFill', 'RiClapperboardAiLine', 'RiCodeFill'],
    features: [
      'RiNextjsFill',
      'RiKey2Fill',
      'RiDatabase2Line',
      'RiCloudy2Fill',
      'RiBarChart2Line',
      'RiRobot2Line',
    ],
  },
};

export default aiSaas;
