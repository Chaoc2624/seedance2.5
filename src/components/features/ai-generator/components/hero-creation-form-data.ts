export type GenerationMode = 'video' | 'image' | 'agent';

export type WorkflowOption = {
  id: string;
  title: string;
  description: string;
};

export type ModelOption = {
  id: string;
  provider: string;
  title: string;
  description: string;
  badge?: string;
  premium?: boolean;
  credits: string;
};

export const modeOptions: Array<{ id: GenerationMode; title: string }> = [
  { id: 'video', title: 'Video' },
  { id: 'image', title: 'Image' },
  { id: 'agent', title: 'Agent' },
];

export const workflowsByMode: Record<GenerationMode, WorkflowOption[]> = {
  video: [
    {
      id: 'text-image-video',
      title: 'Text/Image to Video',
      description: 'Generate motion from a prompt or upload',
    },
    {
      id: 'reference-video',
      title: 'Reference to Video',
      description: 'Use a reference clip or frame',
    },
    {
      id: 'frames-video',
      title: 'Frames to Video',
      description: 'Animate ordered story frames',
    },
    {
      id: 'video-edit',
      title: 'Video Edit',
      description: 'Edit an existing video with prompts',
    },
  ],
  image: [
    {
      id: 'text-image',
      title: 'Text to Image',
      description: 'Create a still image from text',
    },
    {
      id: 'image-edit',
      title: 'Edit Image',
      description: 'Retouch and regenerate selected areas',
    },
    {
      id: 'style-reference',
      title: 'Style Reference',
      description: 'Match a visual style from uploads',
    },
  ],
  agent: [
    {
      id: 'creative-agent',
      title: 'Creative Agent',
      description: 'Plan and generate a full asset set',
    },
    {
      id: 'campaign-agent',
      title: 'Campaign Agent',
      description: 'Turn a brief into platform-ready concepts',
    },
  ],
};

export const modelsByMode: Record<GenerationMode, ModelOption[]> = {
  video: [
    {
      id: 'pollo-2',
      provider: 'Pollo AI',
      title: 'Pollo 2.0',
      description: 'Ultra-fast cinematic video with audio',
      badge: 'Pro',
      premium: true,
      credits: '20 credits',
    },
    {
      id: 'pollo-25',
      provider: 'Pollo AI',
      title: 'Pollo 2.5',
      description: 'Highest-quality model for viral content',
      badge: 'Audio',
      credits: '4+ credits',
    },
    {
      id: 'seedance',
      provider: 'Seedance',
      title: 'Seedance 2.5',
      description: 'Synced audio-visual output',
      badge: 'New',
      credits: '4+ credits',
    },
    {
      id: 'google-veo',
      provider: 'Google',
      title: 'Google Veo 3',
      description: 'Fast video generation for detailed scenes',
      premium: true,
      credits: '8+ credits',
    },
    {
      id: 'sora',
      provider: 'OpenAI',
      title: 'Sora 2',
      description: 'Expressive motion and natural camera moves',
      premium: true,
      credits: '12+ credits',
    },
  ],
  image: [
    {
      id: 'gpt-image-2',
      provider: 'OpenAI',
      title: 'GPT Image 2',
      description: "World's best text rendering",
      badge: 'Best',
      premium: true,
      credits: '5 credits',
    },
    {
      id: 'lusee-image-2',
      provider: 'Lusee',
      title: 'Lusee Image 2.0',
      description: 'Realistic image model for fast drafts',
      badge: 'Best',
      credits: '3 credits',
    },
    {
      id: 'recraft-v4',
      provider: 'Recraft',
      title: 'Recraft V4 Pro',
      description: 'Precise brand and graphic generation',
      badge: 'Hot',
      credits: '6 credits',
    },
  ],
  agent: [
    {
      id: 'creative-director',
      provider: 'Lusee',
      title: 'Creative Director',
      description: 'Plans prompts, models, and outputs',
      badge: 'Beta',
      premium: true,
      credits: '30 credits',
    },
    {
      id: 'campaign-builder',
      provider: 'Lusee',
      title: 'Campaign Builder',
      description: 'Creates image and video variations',
      credits: '24 credits',
    },
  ],
};

export const generationSettings = {
  durations: ['5s', '10s'],
  resolutions: ['480p', '720p', '1080p'],
  ratios: ['16:9', '9:16', '4:3', '3:4', '1:1'],
};
