import type { TemplateDefinition } from './index';

const developerTool: TemplateDefinition = {
  name: 'Developer Tool',
  nameZh: '开发者工具',
  description:
    'CLI tools, APIs, SDKs, developer platforms, and infrastructure services.',
  sections: [
    'hero',
    'logos',
    'features',
    'usage',
    'introduce',
    'stats',
    'testimonials',
    'faq',
    'cta',
  ],
  iconMap: {
    introduce: [
      'RiCodeFill',
      'RiTerminalBoxLine',
      'RiGitBranchLine',
      'RiPlugLine',
    ],
    features: [
      'RiCodeFill',
      'RiTerminalBoxLine',
      'RiShieldCheckLine',
      'RiSpeedLine',
      'RiPlugLine',
      'RiTeamLine',
    ],
  },
};

export default developerTool;
