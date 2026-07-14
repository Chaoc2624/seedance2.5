export type HomePageCopy = {
  meta: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    chips: ReadonlyArray<string>;
  };
  gallery: {
    dialogDescription: string;
    title: string;
    description: string;
  };
  whatsNew: {
    eyebrow: string;
    title: string;
    description: string;
    cards: ReadonlyArray<{ title: string; label: string }>;
  };
  capability: {
    title: string;
    description: string;
  };
  capabilities: ReadonlyArray<{
    title: string;
    description: string;
  }>;
  multilingual: {
    title: string;
    description: string;
    footer: string;
  };
  useCases: {
    title: string;
    description: string;
    items: ReadonlyArray<readonly [string, string]>;
  };
  workflow: {
    title: string;
    description: string;
    steps: ReadonlyArray<readonly [string, string]>;
  };
  creatorFeedback: {
    title: string;
    description: string;
  };
  faq: {
    id: string;
    title: string;
    description: string;
    items: ReadonlyArray<{
      question: string;
      answer: string;
    }>;
  };
  paywall: {
    title: string;
    description: string;
    comparePlans: string;
    plans: ReadonlyArray<{
      name: string;
      description: string;
      features: ReadonlyArray<string>;
      featured?: boolean;
    }>;
  };
};
