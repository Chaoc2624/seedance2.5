import {
  enCapabilities,
  enCapabilityCopy,
  enCreatorFeedbackCopy,
  enFaqSection,
  enGallerySeoCopy,
  enHeroCopy,
  enHomeMeta,
  enMultilingualCopy,
  enPaywallCopy,
  enUseCases,
  enUseCasesCopy,
  enWhatsNewCopy,
  enWorkflowCopy,
} from './-home-en-seo';
import type { HomePageCopy } from './-home-page-copy-types';

export const enHomePageCopy: HomePageCopy = {
  meta: {
    title: enHomeMeta.title,
    description: enHomeMeta.description,
  },
  hero: {
    eyebrow: enHeroCopy.eyebrow,
    title: enHeroCopy.title,
    description: enHeroCopy.description,
    chips: [
      'Video only',
      'Reference to video',
      'Small-language prompts',
      'Sound-aware scenes',
    ],
  },
  gallery: {
    dialogDescription: enGallerySeoCopy.dialogDescription,
    title: enGallerySeoCopy.title,
    description: enGallerySeoCopy.description,
  },
  whatsNew: {
    eyebrow: enWhatsNewCopy.eyebrow,
    title: enWhatsNewCopy.title,
    description: enWhatsNewCopy.description,
    cards: [
      {
        title: 'Seedance 2.5 multilingual video',
        label: 'Small-language prompts',
      },
      {
        title: 'Sharper cinematic motion',
        label: 'Cleaner video output',
      },
      {
        title: 'Reference-led direction',
        label: 'Images, clips, frames',
      },
      {
        title: 'Sound-aware storytelling',
        label: 'Dialogue and ambience',
      },
    ],
  },
  capability: {
    title: enCapabilityCopy.title,
    description: enCapabilityCopy.description,
  },
  capabilities: enCapabilities.map((item) => ({
    title: item.title,
    description: item.description,
  })),
  multilingual: {
    title: enMultilingualCopy.title,
    description: enMultilingualCopy.description,
    footer: enMultilingualCopy.footer,
  },
  useCases: {
    title: enUseCasesCopy.title,
    description: enUseCasesCopy.description,
    items: enUseCases,
  },
  workflow: {
    title: enWorkflowCopy.title,
    description: enWorkflowCopy.description,
    steps: enWorkflowCopy.steps,
  },
  creatorFeedback: {
    title: enCreatorFeedbackCopy.title,
    description: enCreatorFeedbackCopy.description,
  },
  faq: {
    id: enFaqSection.id,
    title: enFaqSection.title,
    description: enFaqSection.description,
    items: enFaqSection.items.map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
  },
  paywall: {
    title: enPaywallCopy.title,
    description: enPaywallCopy.description,
    comparePlans: 'Compare plans',
    plans: enPaywallCopy.plans.map((plan) => ({
      name: plan.name,
      description: plan.description,
      features: [...plan.features],
      ...('featured' in plan && plan.featured ? { featured: true } : {}),
    })),
  },
};
