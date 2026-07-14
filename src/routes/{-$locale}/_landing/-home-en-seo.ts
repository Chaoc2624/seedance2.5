/**
 * EN homepage SEO copy + density helpers.
 * Source of truth for measurable brand/long-tail placement on the EN home route.
 */

export const enHomeMeta = {
  title: 'Seedance 2.5 Video Generation | AI Video Generator',
  description:
    'Seedance 2.5 video generation turns prompts, images, clips, camera direction, and sound into cinematic AI videos for multilingual creative teams.',
} as const;

export const enHeroCopy = {
  eyebrow: 'Seedance 2.5 video generation',
  title: 'Seedance 2.5 for sharper AI videos in every language',
  description:
    'Seedance 2.5 video generation turns prompts, images, clips, camera direction, and sound cues into cinematic videos. Built for global teams, including small-language creative briefs.',
} as const;

export const enGallerySeoCopy = {
  dialogDescription: 'Seedance 2.5 video reference preview',
  title: 'Seedance 2.5 video gallery',
  description:
    'Browse motion references from Seedance 2.5 video generation. Open any clip in a focused preview, or move straight into Video Generate with Seedance 2.5.',
} as const;

export const enWhatsNewCopy = {
  eyebrow: 'Seedance 2.5 updates',
  title: "What's new",
  description:
    'New video-first workflows for cleaner motion, multilingual prompts, references, and sound-aware creative direction.',
} as const;

export const enCapabilityCopy = {
  title: 'Direct every part of the shot',
  description:
    'Seedance 2.5 video generation brings references, performance, motion, editing, and sound into one focused video workflow.',
} as const;

export const enCapabilities: ReadonlyArray<{
  title: string;
  description: string;
}> = [
  {
    title: 'Multimodal direction',
    description:
      'Combine prompts, reference images, clips, and audio cues in one video workflow.',
  },
  {
    title: 'Reference anything',
    description:
      'Guide characters, camera language, rhythm, composition, and atmosphere with references.',
  },
  {
    title: 'Character consistency',
    description:
      'Keep faces, wardrobe, proportions, and visual identity coherent across a sequence.',
  },
  {
    title: 'Camera and motion control',
    description:
      'Describe precise movement, shot scale, lens behavior, and transitions in natural language.',
  },
  {
    title: 'Video extension and editing',
    description:
      'Extend an existing clip, reshape a scene, or connect shots while preserving continuity.',
  },
  {
    title: 'Synchronized sound',
    description:
      'Plan dialogue, ambience, music, and action beats as part of the same creative brief.',
  },
];

export const enMultilingualCopy = {
  title: 'Create for the languages your audience speaks',
  description:
    'Seedance 2.5 is designed for multilingual prompting and localized storytelling, including languages that receive less support in mainstream creative tools.',
  footer:
    'Prompt in the language that carries the right cultural detail, then adapt the result for another market without changing tools.',
} as const;

export const enUseCasesCopy = {
  title: 'One model, many production contexts',
  description:
    'From a fast social cut to a full cinematic concept, start with the same compact Seedance 2.5 video composer.',
} as const;

export const enUseCases: ReadonlyArray<readonly [string, string]> = [
  [
    'Advertising',
    'Campaign films, product stories, and localized creative variants.',
  ],
  [
    'Education',
    "Explain difficult ideas with visual lessons in a learner's own language.",
  ],
  [
    'Storytelling',
    'Develop characters, worlds, and cinematic sequences from a single brief.',
  ],
  [
    'Social content',
    'Create vertical clips and regional versions for global communities.',
  ],
  [
    'Previsualization',
    'Test framing, movement, lighting, and scene rhythm before production.',
  ],
  [
    'Music and performance',
    'Build visual performances around lyrics, beats, and choreography.',
  ],
];

export const enWorkflowCopy = {
  title: 'From reference to finished motion',
  description:
    'A direct three-part workflow keeps the creative decision in view from prompt to final Seedance 2.5 video.',
  steps: [
    [
      'Add references',
      'Upload an image, a clip, or the first and last frames.',
    ],
    [
      'Describe the scene',
      'Write the action, camera, sound, and language direction.',
    ],
    [
      'Generate and refine',
      'Create the video, review motion, and iterate from the result.',
    ],
  ] as const,
};

export const enCreatorFeedbackCopy = {
  title: 'Loved by creators',
  description:
    'Directors, marketers, educators, and content teams use Seedance 2.5 to move from a creative brief to finished motion faster.',
} as const;

export const enFaqSection = {
  id: 'faq',
  title: 'Frequently asked questions',
  description:
    'Clear answers about multimodal video creation with Seedance 2.5.',
  items: [
    {
      question: 'What is Seedance 2.5?',
      answer:
        'Seedance 2.5 is a video-first AI creation workflow. Seedance 2.5 video generation turns prompts, reference media, camera direction, and sound cues into cinematic videos for teams that need sharper motion control.',
    },
    {
      question: 'Which inputs can I use?',
      answer:
        'You can start with a text prompt, reference images, video clips, or audio cues. Combine them to describe the subject, motion, composition, atmosphere, and pacing you want in Seedance 2.5.',
    },
    {
      question: 'Can I generate a video from an image or an existing clip?',
      answer:
        'Yes. Use the text/image-to-video workflow for a reference image, or use a video reference when you want to extend or reshape an existing visual direction with Seedance 2.5.',
    },
    {
      question: 'Can I control camera movement and character consistency?',
      answer:
        'Yes. Describe shot scale, camera movement, lens behavior, transitions, and performance in natural language. Reference images and clips can also help preserve characters, wardrobe, and visual identity across a sequence.',
    },
    {
      question: 'Can I extend or edit an existing video?',
      answer:
        'Yes. The workflow supports video extension and targeted editing so you can continue a shot, reshape a scene, or connect shots while keeping the creative direction consistent.',
    },
    {
      question: 'Which output settings are available?',
      answer:
        'The generator exposes controls for duration, resolution, and aspect ratio. The homepage composer starts with a 5-second, 1080p, 16:9 video setup, and you can adjust those settings in the generator.',
    },
    {
      question: 'Does Seedance 2.5 support multilingual prompts?',
      answer:
        'Yes. You can write creative briefs in supported languages and use the same Seedance 2.5 workflow for localized stories, regional variants, and culturally specific direction.',
    },
  ],
} as const;

export const enPaywallCopy = {
  title: 'Choose the pace of your production',
  description:
    'Start free, then unlock more generation capacity when Seedance 2.5 becomes part of your regular workflow.',
  plans: [
    {
      name: 'Free',
      description: 'Explore prompts and test the Seedance 2.5 video workflow.',
      features: [
        'Starter credits',
        'Core video controls',
        'Public showcase access',
      ],
    },
    {
      name: 'Creator',
      description:
        'More generations and higher-quality output for regular publishing.',
      features: [
        'More monthly credits',
        'Priority generation',
        'Commercial workflows',
      ],
      featured: true,
    },
    {
      name: 'Studio',
      description: 'Capacity and collaboration for teams producing at scale.',
      features: [
        'Highest credit allowance',
        'Team-ready workflow',
        'Priority support',
      ],
    },
  ],
} as const;

export const enFooterBrandDescription =
  'Seedance 2.5 is an AI video generation workspace for prompt-first cinematic production, multilingual briefs, and reference-led motion workflows.';

/** Exact long-tail target (case-insensitive match after normalize). */
export const EN_HOME_LONG_TAIL = 'seedance 2.5 video generation';
export const EN_HOME_BRAND_PHRASE = 'seedance 2.5';

export function tokenizeSeoText(text: string): string[] {
  return (
    text
      .toLowerCase()
      .match(/[a-z0-9]+(?:\.[0-9]+)?|[a-z0-9]+(?:-[a-z0-9]+)*/g) ?? []
  );
}

export function countPhraseInTokens(phrase: string, tokens: string[]): number {
  const phraseTokens = tokenizeSeoText(phrase);
  if (phraseTokens.length === 0) return 0;
  let count = 0;
  for (let i = 0; i <= tokens.length - phraseTokens.length; i++) {
    let match = true;
    for (let j = 0; j < phraseTokens.length; j++) {
      if (tokens[i + j] !== phraseTokens[j]) {
        match = false;
        break;
      }
    }
    if (match) count += 1;
  }
  return count;
}

/**
 * Visible EN home marketing corpus (meta + hero + sections + FAQ answers + footer).
 * Excludes testimonial carousel body (uncontrolled DOM duplication).
 */
export function buildEnHomeSeoCorpus(options?: {
  footerBrandDescription?: string;
}): string {
  const footer = options?.footerBrandDescription ?? enFooterBrandDescription;

  const faqText = enFaqSection.items
    .map((item) => `${item.question} ${item.answer}`)
    .join(' ');

  const capabilityItems = enCapabilities
    .map((item) => `${item.title} ${item.description}`)
    .join(' ');

  const useCaseItems = enUseCases
    .map(([title, description]) => `${title} ${description}`)
    .join(' ');

  const workflowSteps = enWorkflowCopy.steps
    .map(([title, description]) => `${title} ${description}`)
    .join(' ');

  const plans = enPaywallCopy.plans
    .map(
      (plan) => `${plan.name} ${plan.description} ${plan.features.join(' ')}`
    )
    .join(' ');

  return [
    enHomeMeta.title,
    enHomeMeta.description,
    enHeroCopy.eyebrow,
    enHeroCopy.title,
    enHeroCopy.description,
    enWhatsNewCopy.eyebrow,
    enWhatsNewCopy.title,
    enWhatsNewCopy.description,
    enGallerySeoCopy.title,
    enGallerySeoCopy.description,
    enGallerySeoCopy.dialogDescription,
    enCapabilityCopy.title,
    enCapabilityCopy.description,
    capabilityItems,
    enMultilingualCopy.title,
    enMultilingualCopy.description,
    enMultilingualCopy.footer,
    enUseCasesCopy.title,
    enUseCasesCopy.description,
    useCaseItems,
    enWorkflowCopy.title,
    enWorkflowCopy.description,
    workflowSteps,
    enCreatorFeedbackCopy.title,
    enCreatorFeedbackCopy.description,
    enFaqSection.title,
    enFaqSection.description,
    faqText,
    enPaywallCopy.title,
    enPaywallCopy.description,
    plans,
    'Seedance 2.5',
    footer,
  ].join(' ');
}

export type EnHomeSeoMetrics = {
  totalWords: number;
  brandCount: number;
  brandOccupyPct: number;
  longTailCount: number;
  videoGenerationCount: number;
};

export function measureEnHomeSeoCorpus(corpus: string): EnHomeSeoMetrics {
  const tokens = tokenizeSeoText(corpus);
  const totalWords = tokens.length;
  const brandCount = countPhraseInTokens(EN_HOME_BRAND_PHRASE, tokens);
  const longTailCount = countPhraseInTokens(EN_HOME_LONG_TAIL, tokens);
  const videoGenerationCount = countPhraseInTokens('video generation', tokens);
  const brandOccupyPct =
    totalWords === 0 ? 0 : (brandCount * 2 * 100) / totalWords;

  return {
    totalWords,
    brandCount,
    brandOccupyPct,
    longTailCount,
    videoGenerationCount,
  };
}

export function measureEnHomeSeo(options?: {
  footerBrandDescription?: string;
}): EnHomeSeoMetrics {
  return measureEnHomeSeoCorpus(buildEnHomeSeoCorpus(options));
}

/** Strip script/style and tags for density checks against fetched/built HTML. */
export function extractVisibleTextFromHtml(html: string): string {
  const withoutBlocks = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ');
  const title =
    withoutBlocks.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '';
  const metaDesc =
    withoutBlocks.match(
      /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i
    )?.[1] ??
    withoutBlocks.match(
      /<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i
    )?.[1] ??
    '';
  const bodyOnly = withoutBlocks
    .replace(/<head\b[^>]*>[\s\S]*?<\/head>/i, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return `${title} ${metaDesc} ${bodyOnly}`.replace(/\s+/g, ' ').trim();
}

export function measureEnHomeSeoFromHtml(html: string): EnHomeSeoMetrics {
  return measureEnHomeSeoCorpus(extractVisibleTextFromHtml(html));
}
