/**
 * Base section skeletons shared by all templates.
 * These define the structural shape (images, icons, layout) — AI fills in the text.
 */

export interface SectionSkeleton {
  id: string;
  block?: string;
  /** Static props that AI should NOT override */
  static: Record<string, any>;
  /** Schema hint for AI: how many items, what fields each item needs, etc. */
  ai_hint: {
    needs_title?: boolean;
    needs_description?: boolean;
    needs_tip?: boolean;
    items_count?: number;
    item_fields?: string[];
    extra_fields?: string[];
  };
}

// ─── Hero ───
export const heroSkeleton: SectionSkeleton = {
  id: 'hero',
  static: {
    show_avatars: true,
    show_award: false,
    buttons: [
      { icon: 'Zap', url: '/pricing', target: '_self', variant: 'default' },
      {
        icon: 'BookOpenText',
        url: '/docs',
        target: '_blank',
        variant: 'outline',
      },
    ],
    image: {
      src: '/imgs/features/admin.png',
      alt: 'hero',
      width: 1200,
      height: 800,
    },
    image_invert: {
      src: '/imgs/features/admin-dark.png',
      alt: 'hero',
      width: 1200,
      height: 800,
    },
  },
  ai_hint: {
    needs_title: true,
    needs_description: true,
    needs_tip: true,
    extra_fields: [
      'highlight_text',
      'announcement',
      'avatars_tip',
      'buttons[].title',
    ],
  },
};

// ─── Logos ───
export const logosSkeleton: SectionSkeleton = {
  id: 'logos',
  static: {
    items: [
      {
        title: 'TanStack',
        image: { src: '/imgs/logos/tanstack.svg', alt: 'TanStack' },
      },
      {
        title: 'React',
        image: { src: '/imgs/logos/react.svg', alt: 'React' },
      },
      {
        title: 'TailwindCSS',
        image: { src: '/imgs/logos/tailwindcss.svg', alt: 'TailwindCSS' },
      },
      {
        title: 'Shadcn/UI',
        image: { src: '/imgs/logos/shadcn.svg', alt: 'Shadcn/UI' },
      },
      {
        title: 'Vercel',
        image: { src: '/imgs/logos/vercel.svg', alt: 'Vercel' },
      },
      {
        title: 'Supabase',
        image: { src: '/imgs/logos/supabase.svg', alt: 'Supabase' },
      },
    ],
  },
  ai_hint: {
    needs_title: true,
  },
};

// ─── Introduce (features-list) ───
export const introduceSkeleton: SectionSkeleton = {
  id: 'introduce',
  block: 'features-list',
  static: {
    image: { src: '/imgs/features/landing-page.png', alt: 'introduce' },
    className: 'bg-muted',
  },
  ai_hint: {
    needs_title: true,
    needs_description: true,
    items_count: 4,
    item_fields: ['title', 'description', 'icon'],
  },
};

// ─── Benefits (features-accordion) ───
export const benefitsSkeleton: SectionSkeleton = {
  id: 'benefits',
  block: 'features-accordion',
  static: {},
  ai_hint: {
    needs_title: true,
    needs_description: true,
    items_count: 3,
    item_fields: ['title', 'description', 'icon'],
  },
};

// ─── Usage (features-step) ───
export const usageSkeleton: SectionSkeleton = {
  id: 'usage',
  block: 'features-step',
  static: {
    image_position: 'left',
    text_align: 'center' as const,
    className: 'bg-muted',
  },
  ai_hint: {
    needs_title: true,
    needs_description: true,
    items_count: 4,
    item_fields: ['title', 'description'],
  },
};

// ─── Features (grid) ───
export const featuresSkeleton: SectionSkeleton = {
  id: 'features',
  static: {},
  ai_hint: {
    needs_title: true,
    needs_description: true,
    items_count: 6,
    item_fields: ['title', 'description', 'icon'],
  },
};

// ─── Stats ───
export const statsSkeleton: SectionSkeleton = {
  id: 'stats',
  static: { className: 'bg-muted' },
  ai_hint: {
    needs_title: true,
    needs_description: true,
    items_count: 3,
    item_fields: ['title', 'description'],
  },
};

// ─── Testimonials ───
export const testimonialsSkeleton: SectionSkeleton = {
  id: 'testimonials',
  static: {},
  ai_hint: {
    needs_title: true,
    needs_description: true,
    items_count: 6,
    item_fields: ['name', 'role', 'quote'],
  },
};

// ─── FAQ ───
export const faqSkeleton: SectionSkeleton = {
  id: 'faq',
  static: {},
  ai_hint: {
    needs_title: true,
    needs_description: true,
    items_count: 6,
    item_fields: ['question', 'answer'],
  },
};

// ─── CTA ───
export const ctaSkeleton: SectionSkeleton = {
  id: 'cta',
  static: {
    buttons: [
      { url: '/pricing', target: '_self', icon: 'Zap' },
      {
        url: '/docs',
        target: '_blank',
        variant: 'outline',
        icon: 'BookOpenText',
      },
    ],
    className: 'bg-muted',
  },
  ai_hint: {
    needs_title: true,
    needs_description: true,
    extra_fields: ['buttons[].title'],
  },
};

// ─── Subscribe ───
export const subscribeSkeleton: SectionSkeleton = {
  id: 'subscribe',
  static: {
    submit: {
      action: '/api/subscribe',
    },
    className: 'bg-muted',
  },
  ai_hint: {
    needs_title: true,
    needs_description: true,
    extra_fields: ['submit.input.placeholder', 'submit.button.title'],
  },
};

// ─── Pricing ───
export const pricingSkeleton: SectionSkeleton = {
  id: 'pricing',
  block: 'pricing',
  static: {},
  ai_hint: {
    needs_title: true,
    needs_description: true,
    items_count: 3,
    item_fields: ['title', 'description', 'price', 'features'],
  },
};

/** All available skeletons keyed by section id */
export const allSkeletons: Record<string, SectionSkeleton> = {
  hero: heroSkeleton,
  logos: logosSkeleton,
  introduce: introduceSkeleton,
  benefits: benefitsSkeleton,
  usage: usageSkeleton,
  features: featuresSkeleton,
  stats: statsSkeleton,
  testimonials: testimonialsSkeleton,
  faq: faqSkeleton,
  cta: ctaSkeleton,
  subscribe: subscribeSkeleton,
  pricing: pricingSkeleton,
};
