import type { TemplateDefinition } from './index';

const ecommerce: TemplateDefinition = {
  name: 'E-commerce / Product',
  nameZh: '电商 / 产品',
  description:
    'Online stores, product landing pages, and digital goods marketplaces.',
  sections: [
    'hero',
    'logos',
    'benefits',
    'features',
    'stats',
    'testimonials',
    'faq',
    'cta',
  ],
  iconMap: {
    benefits: ['RiShoppingBagLine', 'RiTruckLine', 'RiShieldCheckLine'],
    features: [
      'RiShoppingCartLine',
      'RiSecurePaymentLine',
      'RiTruckLine',
      'RiCustomerServiceLine',
      'RiRefundLine',
      'RiStarLine',
    ],
  },
};

export default ecommerce;
