import Bell from 'lucide-react/dist/esm/icons/bell';
import BookOpenText from 'lucide-react/dist/esm/icons/book-open-text';
import Bot from 'lucide-react/dist/esm/icons/bot';
import Brush from 'lucide-react/dist/esm/icons/brush';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import Clapperboard from 'lucide-react/dist/esm/icons/clapperboard';
import Crown from 'lucide-react/dist/esm/icons/crown';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import Eraser from 'lucide-react/dist/esm/icons/eraser';
import Expand from 'lucide-react/dist/esm/icons/expand';
import Home from 'lucide-react/dist/esm/icons/home';
import ImageIcon from 'lucide-react/dist/esm/icons/image';
import ImagePlus from 'lucide-react/dist/esm/icons/image-plus';
import Images from 'lucide-react/dist/esm/icons/images';
import Menu from 'lucide-react/dist/esm/icons/menu';
import Mic2 from 'lucide-react/dist/esm/icons/mic-2';
import Paintbrush from 'lucide-react/dist/esm/icons/paintbrush';
import PanelLeftClose from 'lucide-react/dist/esm/icons/panel-left-close';
import PanelLeftOpen from 'lucide-react/dist/esm/icons/panel-left-open';
import ScanFace from 'lucide-react/dist/esm/icons/scan-face';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Shirt from 'lucide-react/dist/esm/icons/shirt';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Video from 'lucide-react/dist/esm/icons/video';
import WandSparkles from 'lucide-react/dist/esm/icons/wand-sparkles';
import X from 'lucide-react/dist/esm/icons/x';
import {
  type ComponentType,
  type CSSProperties,
  type ReactNode,
  type WheelEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Link,
  useCurrentLocale,
  usePathname,
} from '@/core/i18n/navigation';

import { LocaleSelector } from '@/components/blocks/common/locale-selector';
import {
  GLOBAL_CREATION_COMPOSER_DRAFT_EVENT_NAME,
  GLOBAL_CREATION_COMPOSER_HOME_VISIBILITY_EVENT_NAME,
  type GlobalCreationComposerDraftDetail,
  type GlobalCreationComposerHomeVisibilityDetail,
} from '@/components/features/ai-generator/components/global-creation-composer-events';
import {
  HeroCreationForm,
  type HeroCreationDraft,
} from '@/components/features/ai-generator/components/hero-creation-form';
import { SignUser } from '@/components/blocks/sign/sign-user';
import {
  UpgradePaywallDialog,
} from '@/components/blocks/pricing/upgrade-paywall-dialog';
import { useUpgradePaywall } from '@/components/blocks/pricing/use-upgrade-paywall';
import { LuseePublicFooter } from '@/components/layouts/public/lusee-public-footer';
import { useAppContext } from '@/hooks/use-app-context';
import { cn } from '@/lib/utils';
import type { MembershipTier } from '@/lib/membership';
import type { Footer as FooterType } from '@/types/blocks/landing';

type IconComponent = ComponentType<{ className?: string }>;

type ShellNavItem = {
  id: string;
  title: string;
  icon: IconComponent;
  href: string;
};

type ToolKind = 'image' | 'video';

type ToolOption = {
  id: string;
  title: string;
  description: string;
  icon: IconComponent;
  href?: string;
  badge?: string;
  badgeClassName?: string;
};

type ToolDefinition = {
  kind: ToolKind;
  title: string;
  href: string;
  icon: IconComponent;
  description: string;
  accentClassName: string;
  features: ToolOption[];
  models: ToolOption[];
};

type ToolOptionCopy = {
  title?: string;
  description?: string;
  badge?: string;
};

type ToolCopy = {
  title: string;
  description: string;
  options: Record<string, ToolOptionCopy>;
};

type PublicShellCopy = {
  nav: Record<string, string>;
  toolsTitle: string;
  toolLauncher: string;
  features: string;
  models: string;
  settings: string;
  expandSidebar: string;
  collapseSidebar: string;
  openNavigationMenu: string;
  closeNavigationMenu: string;
  upgrade: string;
  notifications: string;
  openToolMenu: (title: string) => string;
  tools: Record<ToolKind, ToolCopy>;
};

const BRAND_LOGO_SRC = '/logo.svg';
const BRAND_LOCKUP_SRC = '/seedance-lockup.svg';
const SHOW_TOOL_NAVIGATION = false;

export const PUBLIC_SURFACE_CLASS_NAME = [
  'min-h-screen bg-background text-foreground [color-scheme:light]',
  '[--background:#ffffff]',
  '[--foreground:#0f172a]',
  '[--card:#fffffff2]',
  '[--card-foreground:#0f172a]',
  '[--muted:#eff6ff]',
  '[--muted-foreground:#64748b]',
  '[--border:#dbeafe]',
  '[--primary:#2563eb]',
  '[--primary-foreground:#ffffff]',
].join(' ');

const TOP_UTILITY_ICON_BUTTON_CLASS =
  'flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-white/[0.04] p-0 text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground focus-visible:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-foreground)_30%,transparent)] focus-visible:outline-none [&_svg]:size-4';
const HEADER_SCROLL_THRESHOLD = 8;

const mainNav: ShellNavItem[] = [
  { id: 'home', title: 'Home', icon: Home, href: '/' },
  { id: 'generate', title: 'Generate', icon: Sparkles, href: '/generate' },
  { id: 'pricing', title: 'Pricing', icon: DollarSign, href: '/pricing' },
  { id: 'blog', title: 'Blog', icon: BookOpenText, href: '/blog' },
];

const toolNav: ShellNavItem[] = [
  {
    id: 'video-generate',
    title: 'Video Generate',
    icon: Video,
    href: '/video-generator',
  },
  {
    id: 'image-generate',
    title: 'Image Generate',
    icon: ImageIcon,
    href: '/image-generator',
  },
];

const toolDefinitions: ToolDefinition[] = [
  {
    kind: 'video',
    title: 'Video Generate',
    href: '/video-generator',
    icon: Video,
    description: 'Pick a video workflow and model, then open the generator.',
    accentClassName: 'from-[#2563eb] to-[#1d4ed8]',
    features: [
      {
        id: 'create-videos',
        title: 'Create Videos',
        description: 'Generate AI videos',
        icon: Video,
        href: '/video-generator?feature=create-videos',
      },
      {
        id: 'animate-images',
        title: 'Animate Images',
        description: 'Add motion to uploaded images',
        icon: Images,
        href: '/video-generator?feature=animate-images',
      },
      {
        id: 'lipsync-studio',
        title: 'Lipsync Studio',
        description: 'Create talking videos',
        icon: Mic2,
        href: '/video-generator?feature=lipsync-studio',
      },
      {
        id: 'video-extend',
        title: 'Video Extend',
        description: 'Extend duration and motion',
        icon: Expand,
        href: '/video-generator?feature=video-extend',
      },
      {
        id: 'video-edit',
        title: 'Video Edit',
        description: 'Edit clips with prompts',
        icon: Clapperboard,
        href: '/video-generator?feature=video-edit',
      },
    ],
    models: [
      {
        id: 'seedance-2',
        title: 'Seedance 2.5',
        description: 'Synced audio-visual output',
        icon: Sparkles,
        badge: 'NEW',
        badgeClassName: 'bg-[#2563eb] text-[#151a0c]',
      },
      {
        id: 'pixverse-v6',
        title: 'Pixverse v6',
        description: "Pixverse's latest video model",
        icon: Video,
        badge: 'NEW',
        badgeClassName: 'bg-[#2563eb] text-[#151a0c]',
      },
      {
        id: 'google-veo-3-lite',
        title: 'Google Veo 3.1 lite',
        description: "Google's fastest video model",
        icon: Bot,
        badge: 'NEW',
        badgeClassName: 'bg-[#2563eb] text-[#151a0c]',
      },
      {
        id: 'kling-o3',
        title: 'Kling o3',
        description: 'Unified multimodal model',
        icon: Clapperboard,
        badge: 'HOT',
        badgeClassName: 'bg-[#a86642] text-white',
      },
      {
        id: 'sora-2',
        title: 'Sora 2',
        description: 'Ultimate choice for creators',
        icon: Bot,
      },
    ],
  },
  {
    kind: 'image',
    title: 'Image Generate',
    href: '/image-generator',
    icon: ImageIcon,
    description: 'Pick an image workflow and model, then open the generator.',
    accentClassName: 'from-[#2563eb] to-[#a88b54]',
    features: [
      {
        id: 'create-image',
        title: 'Create Image',
        description: 'Generate AI images',
        icon: ImagePlus,
        href: '/image-generator?feature=create-image',
      },
      {
        id: 'edit-image',
        title: 'Edit Image',
        description: 'Seamless alterations',
        icon: Paintbrush,
        href: '/image-generator?feature=edit-image',
      },
      {
        id: 'references',
        title: 'References',
        description: 'Create with visual references',
        icon: Images,
        href: '/image-generator?feature=references',
      },
      {
        id: 'style-reference',
        title: 'Style Reference',
        description: 'Match uploaded styles',
        icon: Brush,
        href: '/image-generator?feature=style-reference',
      },
      {
        id: 'inpaint',
        title: 'Inpaint',
        description: 'Precise selection edits',
        icon: Eraser,
        href: '/image-generator?feature=inpaint',
      },
      {
        id: 'upscale',
        title: 'Upscale',
        description: 'Enhance the details',
        icon: Expand,
        href: '/image-generator?feature=upscale',
      },
      {
        id: 'ai-clothes-changer',
        title: 'AI Clothes Changer',
        description: 'Try on outfits instantly',
        icon: Shirt,
        href: '/image-generator?feature=ai-clothes-changer',
      },
      {
        id: 'ai-face-swap',
        title: 'AI Face Swap',
        description: 'Swap faces realistically',
        icon: ScanFace,
        href: '/image-generator?feature=ai-face-swap',
      },
    ],
    models: [
      {
        id: 'gpt-image-2',
        title: 'GPT Image 2',
        description: "World's best text rendering",
        icon: Bot,
        badge: 'BEST',
        badgeClassName: 'bg-[#1d4ed8] text-[#fbffe3]',
      },
      {
        id: 'lusee-image-2',
        title: 'Lusee Image 2.0',
        description: 'Latest realistic model',
        icon: Sparkles,
        badge: 'BEST',
        badgeClassName: 'bg-[#1d4ed8] text-[#fbffe3]',
      },
      {
        id: 'recraft-v4-pro',
        title: 'Recraft V4 Pro',
        description: "Recraft's latest model",
        icon: WandSparkles,
        badge: 'HOT',
        badgeClassName: 'bg-[#a86642] text-white',
      },
      {
        id: 'nano-banana-2',
        title: 'Nano Banana 2',
        description: "Google's latest model",
        icon: Bot,
        badge: 'NEW',
        badgeClassName: 'bg-[#2563eb] text-[#151a0c]',
      },
      {
        id: 'seedream-v5-lite',
        title: 'Seedream v5.0 Lite',
        description: 'Advanced image editing',
        icon: Sparkles,
        badge: 'NEW',
        badgeClassName: 'bg-[#2563eb] text-[#151a0c]',
      },
    ],
  },
];

const enShellCopy: PublicShellCopy = {
  nav: {
    home: 'Home',
    generate: 'Generate',
    pricing: 'Pricing',
    blog: 'Blog',
    'video-generate': 'Video Generate',
    'image-generate': 'Image Generate',
  },
  toolsTitle: 'Tools',
  toolLauncher: 'Tool launcher',
  features: 'Features',
  models: 'Models',
  settings: 'Settings',
  expandSidebar: 'Expand sidebar',
  collapseSidebar: 'Collapse sidebar',
  openNavigationMenu: 'Open navigation menu',
  closeNavigationMenu: 'Close navigation menu',
  upgrade: 'Upgrade',
  notifications: 'Notifications',
  openToolMenu: (title) => `Open ${title} tool menu`,
  tools: {
    video: {
      title: 'Video Generate',
      description: 'Pick a video workflow and model, then open the generator.',
      options: {
        'create-videos': {
          title: 'Create Videos',
          description: 'Generate AI videos',
        },
        'animate-images': {
          title: 'Animate Images',
          description: 'Add motion to uploaded images',
        },
        'lipsync-studio': {
          title: 'Lipsync Studio',
          description: 'Create talking videos',
        },
        'video-extend': {
          title: 'Video Extend',
          description: 'Extend duration and motion',
        },
        'video-edit': {
          title: 'Video Edit',
          description: 'Edit clips with prompts',
        },
        'seedance-2': { description: 'Synced audio-visual output' },
        'pixverse-v6': { description: "Pixverse's latest video model" },
        'google-veo-3-lite': {
          description: "Google's fastest video model",
        },
        'kling-o3': { description: 'Unified multimodal model' },
        'sora-2': { description: 'Ultimate choice for creators' },
      },
    },
    image: {
      title: 'Image Generate',
      description: 'Pick an image workflow and model, then open the generator.',
      options: {
        'create-image': {
          title: 'Create Image',
          description: 'Generate AI images',
        },
        'edit-image': {
          title: 'Edit Image',
          description: 'Seamless alterations',
        },
        references: {
          title: 'References',
          description: 'Create with visual references',
        },
        'style-reference': {
          title: 'Style Reference',
          description: 'Match uploaded styles',
        },
        inpaint: {
          title: 'Inpaint',
          description: 'Precise selection edits',
        },
        upscale: {
          title: 'Upscale',
          description: 'Enhance the details',
        },
        'ai-clothes-changer': {
          title: 'AI Clothes Changer',
          description: 'Try on outfits instantly',
        },
        'ai-face-swap': {
          title: 'AI Face Swap',
          description: 'Swap faces realistically',
        },
        'gpt-image-2': { description: "World's best text rendering" },
        'lusee-image-2': { description: 'Latest realistic model' },
        'recraft-v4-pro': { description: "Recraft's latest model" },
        'nano-banana-2': { description: "Google's latest model" },
        'seedream-v5-lite': { description: 'Advanced image editing' },
      },
    },
  },
};

function mergeShellCopy(copy: Partial<PublicShellCopy>): PublicShellCopy {
  return {
    ...enShellCopy,
    ...copy,
    nav: { ...enShellCopy.nav, ...copy.nav },
    tools: {
      video: {
        ...enShellCopy.tools.video,
        ...copy.tools?.video,
        options: {
          ...enShellCopy.tools.video.options,
          ...copy.tools?.video?.options,
        },
      },
      image: {
        ...enShellCopy.tools.image,
        ...copy.tools?.image,
        options: {
          ...enShellCopy.tools.image.options,
          ...copy.tools?.image?.options,
        },
      },
    },
  };
}

const shellCopyByLocale: Record<string, PublicShellCopy> = {
  en: enShellCopy,
  de: mergeShellCopy({
    nav: {
      home: 'Start',
      generate: 'Generieren',
      pricing: 'Preise',
      blog: 'Blog',
      'video-generate': 'Video generieren',
      'image-generate': 'Bild generieren',
    },
    toolsTitle: 'Tools',
    toolLauncher: 'Tool-Launcher',
    features: 'Funktionen',
    models: 'Modelle',
    settings: 'Einstellungen',
    expandSidebar: 'Seitenleiste erweitern',
    collapseSidebar: 'Seitenleiste einklappen',
    openNavigationMenu: 'Navigationsmenu oeffnen',
    closeNavigationMenu: 'Navigationsmenu schliessen',
    upgrade: 'Upgrade',
    notifications: 'Benachrichtigungen',
    openToolMenu: (title) => `${title} Toolmenu oeffnen`,
    tools: {
      video: {
        title: 'Video generieren',
        description: 'Waehle Workflow und Modell, dann oeffne den Generator.',
        options: {
          'create-videos': {
            title: 'Videos erstellen',
            description: 'KI-Videos generieren',
          },
          'animate-images': {
            title: 'Bilder animieren',
            description: 'Uploads in Bewegung setzen',
          },
          'lipsync-studio': {
            title: 'Lipsync Studio',
            description: 'Sprechende Videos erstellen',
          },
          'video-extend': {
            title: 'Video erweitern',
            description: 'Dauer und Bewegung erweitern',
          },
          'video-edit': {
            title: 'Video bearbeiten',
            description: 'Clips per Prompt bearbeiten',
          },
        },
      },
      image: {
        title: 'Bild generieren',
        description: 'Waehle Workflow und Modell, dann oeffne den Generator.',
        options: {
          'create-image': {
            title: 'Bild erstellen',
            description: 'KI-Bilder generieren',
          },
          'edit-image': {
            title: 'Bild bearbeiten',
            description: 'Nahtlose Aenderungen',
          },
          references: {
            title: 'Referenzen',
            description: 'Mit visuellen Referenzen erstellen',
          },
          'style-reference': {
            title: 'Stilreferenz',
            description: 'Hochgeladene Stile abgleichen',
          },
          inpaint: {
            title: 'Inpaint',
            description: 'Praezise Auswahledits',
          },
          upscale: {
            title: 'Upscale',
            description: 'Details verbessern',
          },
          'ai-clothes-changer': {
            title: 'KI-Outfitwechsel',
            description: 'Outfits sofort testen',
          },
          'ai-face-swap': {
            title: 'KI-Face-Swap',
            description: 'Gesichter realistisch tauschen',
          },
        },
      },
    },
  }),
  fr: mergeShellCopy({
    nav: {
      home: 'Accueil',
      generate: 'Generer',
      pricing: 'Tarifs',
      blog: 'Blog',
      'video-generate': 'Generation video',
      'image-generate': 'Generation image',
    },
    toolsTitle: 'Outils',
    toolLauncher: 'Lanceur d outils',
    features: 'Fonctionnalites',
    models: 'Modeles',
    settings: 'Reglages',
    expandSidebar: 'Deployer la barre laterale',
    collapseSidebar: 'Reduire la barre laterale',
    openNavigationMenu: 'Ouvrir le menu de navigation',
    closeNavigationMenu: 'Fermer le menu de navigation',
    upgrade: 'Mettre a niveau',
    notifications: 'Notifications',
    openToolMenu: (title) => `Ouvrir le menu ${title}`,
    tools: {
      video: {
        title: 'Generation video',
        description: 'Choisissez un workflow video et un modele.',
        options: {
          'create-videos': {
            title: 'Creer des videos',
            description: 'Generer des videos IA',
          },
          'animate-images': {
            title: 'Animer des images',
            description: 'Ajouter du mouvement aux images',
          },
          'lipsync-studio': {
            title: 'Studio lipsync',
            description: 'Creer des videos parlantes',
          },
          'video-extend': {
            title: 'Etendre la video',
            description: 'Prolonger duree et mouvement',
          },
          'video-edit': {
            title: 'Modifier la video',
            description: 'Editer les clips par prompt',
          },
        },
      },
      image: {
        title: 'Generation image',
        description: 'Choisissez un workflow image et un modele.',
        options: {
          'create-image': {
            title: 'Creer une image',
            description: 'Generer des images IA',
          },
          'edit-image': {
            title: 'Modifier image',
            description: 'Alterations fluides',
          },
          references: {
            title: 'References',
            description: 'Creer avec references visuelles',
          },
          'style-reference': {
            title: 'Reference style',
            description: 'Faire correspondre les styles',
          },
          inpaint: {
            title: 'Inpaint',
            description: 'Editions de selection precises',
          },
          upscale: {
            title: 'Upscale',
            description: 'Ameliorer les details',
          },
          'ai-clothes-changer': {
            title: 'Changement de tenue IA',
            description: 'Essayer des tenues',
          },
          'ai-face-swap': {
            title: 'Face swap IA',
            description: 'Remplacer les visages',
          },
        },
      },
    },
  }),
  es: mergeShellCopy({
    nav: {
      home: 'Inicio',
      generate: 'Generar',
      pricing: 'Precios',
      blog: 'Blog',
      'video-generate': 'Generar video',
      'image-generate': 'Generar imagen',
    },
    toolsTitle: 'Herramientas',
    toolLauncher: 'Lanzador de herramientas',
    features: 'Funciones',
    models: 'Modelos',
    settings: 'Ajustes',
    expandSidebar: 'Expandir barra lateral',
    collapseSidebar: 'Contraer barra lateral',
    openNavigationMenu: 'Abrir menu de navegacion',
    closeNavigationMenu: 'Cerrar menu de navegacion',
    upgrade: 'Actualizar',
    notifications: 'Notificaciones',
    openToolMenu: (title) => `Abrir menu de ${title}`,
    tools: {
      video: {
        title: 'Generar video',
        description: 'Elige un flujo de video y un modelo.',
        options: {
          'create-videos': {
            title: 'Crear videos',
            description: 'Generar videos con IA',
          },
          'animate-images': {
            title: 'Animar imagenes',
            description: 'Agregar movimiento a imagenes',
          },
          'lipsync-studio': {
            title: 'Lipsync Studio',
            description: 'Crear videos hablados',
          },
          'video-extend': {
            title: 'Extender video',
            description: 'Extender duracion y movimiento',
          },
          'video-edit': {
            title: 'Editar video',
            description: 'Editar clips con prompts',
          },
        },
      },
      image: {
        title: 'Generar imagen',
        description: 'Elige un flujo de imagen y un modelo.',
        options: {
          'create-image': {
            title: 'Crear imagen',
            description: 'Generar imagenes con IA',
          },
          'edit-image': {
            title: 'Editar imagen',
            description: 'Alteraciones fluidas',
          },
          references: {
            title: 'Referencias',
            description: 'Crear con referencias visuales',
          },
          'style-reference': {
            title: 'Referencia de estilo',
            description: 'Igualar estilos cargados',
          },
          inpaint: {
            title: 'Inpaint',
            description: 'Ediciones de seleccion precisas',
          },
          upscale: {
            title: 'Upscale',
            description: 'Mejorar detalles',
          },
          'ai-clothes-changer': {
            title: 'Cambiar ropa con IA',
            description: 'Probar looks al instante',
          },
          'ai-face-swap': {
            title: 'Face swap con IA',
            description: 'Cambiar rostros con realismo',
          },
        },
      },
    },
  }),
  it: mergeShellCopy({
    nav: {
      home: 'Home',
      generate: 'Genera',
      pricing: 'Prezzi',
      blog: 'Blog',
      'video-generate': 'Genera video',
      'image-generate': 'Genera immagini',
    },
    toolsTitle: 'Strumenti',
    toolLauncher: 'Launcher strumenti',
    features: 'Funzioni',
    models: 'Modelli',
    settings: 'Impostazioni',
    expandSidebar: 'Espandi sidebar',
    collapseSidebar: 'Riduci sidebar',
    openNavigationMenu: 'Apri menu di navigazione',
    closeNavigationMenu: 'Chiudi menu di navigazione',
    upgrade: 'Upgrade',
    notifications: 'Notifiche',
    openToolMenu: (title) => `Apri menu ${title}`,
    tools: {
      video: {
        title: 'Genera video',
        description: 'Scegli workflow video e modello.',
        options: {
          'create-videos': {
            title: 'Crea video',
            description: 'Genera video IA',
          },
          'animate-images': {
            title: 'Anima immagini',
            description: 'Aggiungi movimento alle immagini',
          },
          'lipsync-studio': {
            title: 'Lipsync Studio',
            description: 'Crea video parlanti',
          },
          'video-extend': {
            title: 'Estendi video',
            description: 'Estendi durata e movimento',
          },
          'video-edit': {
            title: 'Modifica video',
            description: 'Modifica clip con prompt',
          },
        },
      },
      image: {
        title: 'Genera immagini',
        description: 'Scegli workflow immagine e modello.',
        options: {
          'create-image': {
            title: 'Crea immagine',
            description: 'Genera immagini IA',
          },
          'edit-image': {
            title: 'Modifica immagine',
            description: 'Alterazioni fluide',
          },
          references: {
            title: 'Reference',
            description: 'Crea con reference visive',
          },
          'style-reference': {
            title: 'Reference stile',
            description: 'Abbina stili caricati',
          },
          inpaint: {
            title: 'Inpaint',
            description: 'Edit di selezione precisi',
          },
          upscale: {
            title: 'Upscale',
            description: 'Migliora dettagli',
          },
          'ai-clothes-changer': {
            title: 'Cambio abiti IA',
            description: 'Prova outfit subito',
          },
          'ai-face-swap': {
            title: 'Face swap IA',
            description: 'Scambia volti realisticamente',
          },
        },
      },
    },
  }),
  pl: mergeShellCopy({
    nav: {
      home: 'Start',
      generate: 'Generuj',
      pricing: 'Cennik',
      blog: 'Blog',
      'video-generate': 'Generuj wideo',
      'image-generate': 'Generuj obraz',
    },
    toolsTitle: 'Narzędzia',
    toolLauncher: 'Launcher narzędzi',
    features: 'Funkcje',
    models: 'Modele',
    settings: 'Ustawienia',
    expandSidebar: 'Rozwiń panel boczny',
    collapseSidebar: 'Zwiń panel boczny',
    openNavigationMenu: 'Otwórz menu nawigacji',
    closeNavigationMenu: 'Zamknij menu nawigacji',
    upgrade: 'Ulepsz',
    notifications: 'Powiadomienia',
    openToolMenu: (title) => `Otwórz menu ${title}`,
    tools: {
      video: {
        title: 'Generuj wideo',
        description: 'Wybierz workflow wideo i model.',
        options: {
          'create-videos': {
            title: 'Twórz wideo',
            description: 'Generuj wideo AI',
          },
          'animate-images': {
            title: 'Animuj obrazy',
            description: 'Dodaj ruch do obrazów',
          },
          'lipsync-studio': {
            title: 'Lipsync Studio',
            description: 'Twórz mówiące wideo',
          },
          'video-extend': {
            title: 'Wydłuż wideo',
            description: 'Wydłuż czas i ruch',
          },
          'video-edit': {
            title: 'Edytuj wideo',
            description: 'Edytuj klipy promptem',
          },
        },
      },
      image: {
        title: 'Generuj obraz',
        description: 'Wybierz workflow obrazu i model.',
        options: {
          'create-image': {
            title: 'Twórz obraz',
            description: 'Generuj obrazy AI',
          },
          'edit-image': {
            title: 'Edytuj obraz',
            description: 'Płynne zmiany',
          },
          references: {
            title: 'Referencje',
            description: 'Twórz z referencjami',
          },
          'style-reference': {
            title: 'Referencja stylu',
            description: 'Dopasuj wgrane style',
          },
          inpaint: {
            title: 'Inpaint',
            description: 'Precyzyjne edycje zaznaczeń',
          },
          upscale: {
            title: 'Upscale',
            description: 'Popraw szczegóły',
          },
          'ai-clothes-changer': {
            title: 'Zmiana ubrań AI',
            description: 'Testuj stylizacje',
          },
          'ai-face-swap': {
            title: 'Face swap AI',
            description: 'Realistycznie zamień twarze',
          },
        },
      },
    },
  }),
  ja: mergeShellCopy({
    nav: {
      home: 'ホーム',
      generate: '生成',
      pricing: '料金',
      blog: 'ブログ',
      'video-generate': '動画生成',
      'image-generate': '画像生成',
    },
    toolsTitle: 'ツール',
    toolLauncher: 'ツールランチャー',
    features: '機能',
    models: 'モデル',
    settings: '設定',
    expandSidebar: 'サイドバーを開く',
    collapseSidebar: 'サイドバーを閉じる',
    openNavigationMenu: 'ナビゲーションを開く',
    closeNavigationMenu: 'ナビゲーションを閉じる',
    upgrade: 'アップグレード',
    notifications: '通知',
    openToolMenu: (title) => `${title} のツールメニューを開く`,
    tools: {
      video: {
        title: '動画生成',
        description: '動画ワークフローとモデルを選択して開始します。',
        options: {
          'create-videos': {
            title: '動画を作成',
            description: 'AI 動画を生成',
          },
          'animate-images': {
            title: '画像を動かす',
            description: 'アップロード画像に動きを追加',
          },
          'lipsync-studio': {
            title: 'リップシンク',
            description: '話す動画を作成',
          },
          'video-extend': {
            title: '動画を延長',
            description: '長さと動きを拡張',
          },
          'video-edit': {
            title: '動画を編集',
            description: 'プロンプトでクリップを編集',
          },
        },
      },
      image: {
        title: '画像生成',
        description: '画像ワークフローとモデルを選択して開始します。',
        options: {
          'create-image': {
            title: '画像を作成',
            description: 'AI 画像を生成',
          },
          'edit-image': {
            title: '画像を編集',
            description: '自然な変更',
          },
          references: {
            title: '参照',
            description: '視覚参照から作成',
          },
          'style-reference': {
            title: 'スタイル参照',
            description: 'アップロードしたスタイルに合わせる',
          },
          inpaint: {
            title: 'インペイント',
            description: '選択範囲を精密編集',
          },
          upscale: {
            title: 'アップスケール',
            description: 'ディテールを強化',
          },
          'ai-clothes-changer': {
            title: 'AI 服装変更',
            description: '服装をすぐに試す',
          },
          'ai-face-swap': {
            title: 'AI 顔交換',
            description: '自然に顔を交換',
          },
        },
      },
    },
  }),
  ko: mergeShellCopy({
    nav: {
      home: '홈',
      generate: '생성',
      pricing: '요금',
      blog: '블로그',
      'video-generate': '동영상 생성',
      'image-generate': '이미지 생성',
    },
    toolsTitle: '도구',
    toolLauncher: '도구 런처',
    features: '기능',
    models: '모델',
    settings: '설정',
    expandSidebar: '사이드바 펼치기',
    collapseSidebar: '사이드바 접기',
    openNavigationMenu: '내비게이션 메뉴 열기',
    closeNavigationMenu: '내비게이션 메뉴 닫기',
    upgrade: '업그레이드',
    notifications: '알림',
    openToolMenu: (title) => `${title} 도구 메뉴 열기`,
    tools: {
      video: {
        title: '동영상 생성',
        description: '동영상 워크플로와 모델을 선택해 생성기를 엽니다.',
        options: {
          'create-videos': {
            title: '동영상 만들기',
            description: 'AI 동영상 생성',
          },
          'animate-images': {
            title: '이미지 애니메이션',
            description: '업로드 이미지에 움직임 추가',
          },
          'lipsync-studio': {
            title: '립싱크 스튜디오',
            description: '말하는 동영상 만들기',
          },
          'video-extend': {
            title: '동영상 연장',
            description: '길이와 움직임 확장',
          },
          'video-edit': {
            title: '동영상 편집',
            description: '프롬프트로 클립 편집',
          },
        },
      },
      image: {
        title: '이미지 생성',
        description: '이미지 워크플로와 모델을 선택해 생성기를 엽니다.',
        options: {
          'create-image': {
            title: '이미지 만들기',
            description: 'AI 이미지 생성',
          },
          'edit-image': {
            title: '이미지 편집',
            description: '자연스러운 수정',
          },
          references: {
            title: '참조',
            description: '시각 참조로 생성',
          },
          'style-reference': {
            title: '스타일 참조',
            description: '업로드 스타일 맞춤',
          },
          inpaint: {
            title: '인페인트',
            description: '선택 영역 정밀 편집',
          },
          upscale: {
            title: '업스케일',
            description: '디테일 향상',
          },
          'ai-clothes-changer': {
            title: 'AI 의상 변경',
            description: '의상을 즉시 시도',
          },
          'ai-face-swap': {
            title: 'AI 얼굴 교체',
            description: '얼굴을 자연스럽게 교체',
          },
        },
      },
    },
  }),
  'zh-hant': mergeShellCopy({
    nav: {
      home: '首頁',
      generate: '生成',
      pricing: '價格',
      blog: '部落格',
      'video-generate': '影片生成',
      'image-generate': '圖片生成',
    },
    toolsTitle: '工具',
    toolLauncher: '工具啟動器',
    features: '功能',
    models: '模型',
    settings: '設定',
    expandSidebar: '展開側邊欄',
    collapseSidebar: '收合側邊欄',
    openNavigationMenu: '開啟導覽選單',
    closeNavigationMenu: '關閉導覽選單',
    upgrade: '升級',
    notifications: '通知',
    openToolMenu: (title) => `開啟 ${title} 工具選單`,
    tools: {
      video: {
        title: '影片生成',
        description: '選擇影片工作流程與模型，然後開啟生成器。',
        options: {
          'create-videos': {
            title: '建立影片',
            description: '生成 AI 影片',
          },
          'animate-images': {
            title: '讓圖片動起來',
            description: '為上傳圖片加入動態',
          },
          'lipsync-studio': {
            title: '對嘴工作室',
            description: '建立說話影片',
          },
          'video-extend': {
            title: '延長影片',
            description: '延展時長與動態',
          },
          'video-edit': {
            title: '編輯影片',
            description: '用提示詞編輯片段',
          },
        },
      },
      image: {
        title: '圖片生成',
        description: '選擇圖片工作流程與模型，然後開啟生成器。',
        options: {
          'create-image': {
            title: '建立圖片',
            description: '生成 AI 圖片',
          },
          'edit-image': {
            title: '編輯圖片',
            description: '自然修改圖片',
          },
          references: {
            title: '參考素材',
            description: '使用視覺參考創作',
          },
          'style-reference': {
            title: '風格參考',
            description: '匹配上傳風格',
          },
          inpaint: {
            title: '局部重繪',
            description: '精準選區編輯',
          },
          upscale: {
            title: '放大',
            description: '提升細節',
          },
          'ai-clothes-changer': {
            title: 'AI 換衣',
            description: '快速試穿造型',
          },
          'ai-face-swap': {
            title: 'AI 換臉',
            description: '自然替換臉部',
          },
        },
      },
    },
  }),
};

shellCopyByLocale.zh = shellCopyByLocale['zh-hant'];

function getPublicShellCopy(locale?: string | null) {
  return (locale && shellCopyByLocale[locale]) || enShellCopy;
}

function getLocalizedNavItems(items: ShellNavItem[], copy: PublicShellCopy) {
  return items.map((item) => ({
    ...item,
    title: copy.nav[item.id] ?? item.title,
  }));
}

function getLocalizedToolDefinitions(copy: PublicShellCopy) {
  return toolDefinitions.map((tool) => {
    const toolCopy = copy.tools[tool.kind];
    return {
      ...tool,
      title: toolCopy.title,
      description: toolCopy.description,
      features: tool.features.map((option) => ({
        ...option,
        ...toolCopy.options[option.id],
      })),
      models: tool.models.map((option) => ({
        ...option,
        ...toolCopy.options[option.id],
      })),
    };
  });
}

function isLandingHomePath(pathname: string) {
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/';
  return (
    normalizedPathname === '/' ||
    /^\/[a-z]{2}(?:-[a-z]{2,4})?$/.test(normalizedPathname)
  );
}

function isGenerateWorkspacePath(pathname: string) {
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/';
  return (
    normalizedPathname === '/generate' ||
    normalizedPathname.endsWith('/generate')
  );
}

function isActivePath(pathname: string, href: string) {
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/';
  const normalizedHref = href.split('?')[0];
  if (normalizedHref === '/') return isLandingHomePath(normalizedPathname);
  return (
    normalizedPathname === normalizedHref ||
    normalizedPathname.endsWith(normalizedHref)
  );
}

function getDefaultToolSelection(tool: ToolDefinition) {
  return {
    featureId: tool.features[0]?.id || '',
    modelId: tool.models[0]?.id || '',
  };
}

function createDefaultToolSelections() {
  return Object.fromEntries(
    toolDefinitions.map((tool) => [tool.kind, getDefaultToolSelection(tool)])
  ) as Record<ToolKind, { featureId: string; modelId: string }>;
}

function useScrolledPastTop() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScrolled = () => {
      setScrolled(window.scrollY > HEADER_SCROLL_THRESHOLD);
    };

    updateScrolled();
    window.addEventListener('scroll', updateScrolled, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateScrolled);
    };
  }, []);

  return scrolled;
}

function useFooterComposerSuppression(enabled: boolean, observeKey: string) {
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setFooterVisible(false);
      return;
    }

    const footer = document.querySelector('footer');
    if (!footer) {
      setFooterVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setFooterVisible(Boolean(entry?.isIntersecting));
      },
      { threshold: 0 }
    );

    observer.observe(footer);

    return () => {
      observer.disconnect();
    };
  }, [enabled, observeKey]);

  return footerVisible;
}

function isolatePanelWheel(event: WheelEvent<HTMLDivElement>) {
  event.stopPropagation();

  const target = event.target;
  if (!(target instanceof Element)) {
    event.preventDefault();
    return;
  }

  const scrollArea = target.closest<HTMLElement>('[data-tool-panel-scroll]');
  if (!scrollArea) {
    event.preventDefault();
    return;
  }

  const maxScrollTop = scrollArea.scrollHeight - scrollArea.clientHeight;
  if (maxScrollTop <= 0) {
    event.preventDefault();
    return;
  }

  const atTop = scrollArea.scrollTop <= 0 && event.deltaY < 0;
  const atBottom = scrollArea.scrollTop >= maxScrollTop - 1 && event.deltaY > 0;

  if (atTop || atBottom) {
    event.preventDefault();
  }
}

export function LuseePublicShell({
  children,
  footer,
}: {
  children: ReactNode;
  footer: FooterType;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const isHome = isLandingHomePath(pathname);
  const isGenerateWorkspace = isGenerateWorkspacePath(pathname);
  const headerHasScrolled = useScrolledPastTop();
  const transparentHeader = isHome && !headerHasScrolled;
  const showPublicFooter =
    !isGenerateWorkspace &&
    !pathname.startsWith('/activity') &&
    !pathname.startsWith('/settings');

  return (
    <div
      className={PUBLIC_SURFACE_CLASS_NAME}
      style={
        {
          '--lusee-sidebar-offset': collapsed ? '62px' : '224px',
        } as CSSProperties
      }
    >
      <PublicSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />
      <MobileTopbar transparentAtTop={transparentHeader} />
      <TopUtilityBar
        transparentAtTop={transparentHeader}
        collapsed={collapsed}
      />
      <div
        className={cn(
          'min-h-screen transition-[padding-left] duration-300 ease-out',
          collapsed ? 'lg:pl-[62px]' : 'lg:pl-[224px]'
        )}
      >
        <main className="min-h-screen pt-16">{children}</main>
        {showPublicFooter && <LuseePublicFooter footer={footer} />}
      </div>
      <GlobalCreationComposer
        visible={isHome || isGenerateWorkspace}
        suppressForHomeHero={isHome}
        footerObserveKey={pathname}
      />
    </div>
  );
}

function GlobalCreationComposer({
  visible,
  suppressForHomeHero,
  footerObserveKey,
}: {
  visible: boolean;
  suppressForHomeHero: boolean;
  footerObserveKey: string;
}) {
  const [draft, setDraft] = useState<HeroCreationDraft | null>(null);
  const [expandSignal, setExpandSignal] = useState(0);
  const [resetCollapsedSignal, setResetCollapsedSignal] = useState(0);
  const [homeHeroVisible, setHomeHeroVisible] = useState(false);
  const suppressedForHomeHero = suppressForHomeHero && homeHeroVisible;
  const footerVisible = useFooterComposerSuppression(
    visible && !suppressedForHomeHero,
    footerObserveKey
  );
  const composerVisible = visible && !suppressedForHomeHero && !footerVisible;

  useEffect(() => {
    if (composerVisible) return;
    setResetCollapsedSignal((value) => value + 1);
  }, [composerVisible]);

  useEffect(() => {
    const handleDraftRequest = (event: Event) => {
      const detail = (event as CustomEvent<GlobalCreationComposerDraftDetail>)
        .detail;
      if (!detail?.draft) return;

      setDraft(detail.draft);
      setExpandSignal((value) => value + 1);
    };

    window.addEventListener(
      GLOBAL_CREATION_COMPOSER_DRAFT_EVENT_NAME,
      handleDraftRequest
    );
    return () => {
      window.removeEventListener(
        GLOBAL_CREATION_COMPOSER_DRAFT_EVENT_NAME,
        handleDraftRequest
      );
    };
  }, []);

  useEffect(() => {
    const handleHomeHeroVisibility = (event: Event) => {
      const detail = (
        event as CustomEvent<GlobalCreationComposerHomeVisibilityDetail>
      ).detail;
      setHomeHeroVisible(Boolean(detail?.visible));
    };

    window.addEventListener(
      GLOBAL_CREATION_COMPOSER_HOME_VISIBILITY_EVENT_NAME,
      handleHomeHeroVisibility
    );
    return () => {
      window.removeEventListener(
        GLOBAL_CREATION_COMPOSER_HOME_VISIBILITY_EVENT_NAME,
        handleHomeHeroVisibility
      );
    };
  }, []);

  return (
    <div
      aria-hidden={!composerVisible}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 px-3 pb-4 transition-[opacity,transform] duration-300 ease-out lg:left-[var(--lusee-sidebar-offset,224px)] lg:px-8',
        composerVisible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-8 opacity-0'
      )}
    >
      <HeroCreationForm
        videoOnly
        variant="composer"
        defaultCollapsed
        expandSignal={expandSignal}
        resetCollapsedSignal={resetCollapsedSignal}
        draft={draft}
        onDraftChange={setDraft}
      />
    </div>
  );
}

function PublicSidebar({
  collapsed,
  onCollapsedChange,
}: {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  const locale = useCurrentLocale();
  const copy = getPublicShellCopy(locale);
  const localizedMainNav = useMemo(() => getLocalizedNavItems(mainNav, copy), [copy]);
  const localizedToolNav = useMemo(() => getLocalizedNavItems(toolNav, copy), [copy]);
  const localizedToolDefinitions = useMemo(
    () => getLocalizedToolDefinitions(copy),
    [copy]
  );
  const localizedToolDefinitionByHref = useMemo(
    () => new Map(localizedToolDefinitions.map((tool) => [tool.href, tool])),
    [localizedToolDefinitions]
  );
  const [activeToolKind, setActiveToolKind] = useState<ToolKind | null>(null);
  const [toolSelections, setToolSelections] = useState(
    createDefaultToolSelections
  );
  const activeTool =
    localizedToolDefinitions.find((tool) => tool.kind === activeToolKind) ??
    null;
  const activeSelection = activeTool
    ? (toolSelections[activeTool.kind] ?? getDefaultToolSelection(activeTool))
    : null;
  const updateToolSelection = (
    kind: ToolKind,
    nextSelection: Partial<{ featureId: string; modelId: string }>
  ) => {
    setToolSelections((current) => ({
      ...current,
      [kind]: {
        ...current[kind],
        ...nextSelection,
      },
    }));
  };
  const closeToolPreview = () => setActiveToolKind(null);

  return (
    <aside
      onMouseLeave={closeToolPreview}
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden overflow-visible border-r border-border bg-background text-foreground transition-[width] duration-300 ease-out lg:flex',
        collapsed ? 'w-[62px]' : 'w-[224px]'
      )}
    >
      <div
        className={cn(
          'flex min-h-0 flex-col py-4',
          collapsed ? 'w-[62px] shrink-0 px-2' : 'w-[224px] px-3'
        )}
      >
        <SidebarBrand
          collapsed={collapsed}
          copy={copy}
          onCollapsedChange={onCollapsedChange}
          onMouseEnter={closeToolPreview}
        />
        <nav className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-4">
          <div onMouseEnter={closeToolPreview}>
            <NavGroup
              items={localizedMainNav}
              copy={copy}
              toolDefinitionByHref={localizedToolDefinitionByHref}
              collapsed={collapsed}
            />
          </div>
          {SHOW_TOOL_NAVIGATION && (
            <NavGroup
              title={copy.toolsTitle}
              items={localizedToolNav}
              copy={copy}
              toolDefinitionByHref={localizedToolDefinitionByHref}
              collapsed={collapsed}
              activeToolKind={activeToolKind}
              onToolPreview={(tool) => setActiveToolKind(tool.kind)}
            />
          )}
          <div
            aria-hidden
            className="min-h-0 flex-1"
            onMouseEnter={closeToolPreview}
          />
        </nav>
        <div
          onMouseEnter={closeToolPreview}
          className={cn(
            'border-t border-border pt-3',
            collapsed && 'flex justify-center'
          )}
        >
          <button
            type="button"
            aria-label={copy.settings}
            className="flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-foreground)_30%,transparent)] focus-visible:outline-none"
          >
            <Settings className="size-4" />
          </button>
        </div>
      </div>
      {SHOW_TOOL_NAVIGATION && activeTool && activeSelection ? (
        <div
          className={cn(
            'absolute top-[13.75rem] left-full z-50 hidden before:absolute before:inset-y-0 before:right-full before:w-3 before:content-[""] lg:block',
            collapsed && 'top-[12rem]'
          )}
          onMouseEnter={() => setActiveToolKind(activeTool.kind)}
        >
          <ToolSelectionPanel
            tool={activeTool}
            copy={copy}
            featureId={activeSelection.featureId}
            modelId={activeSelection.modelId}
            onFeatureChange={(featureId) =>
              updateToolSelection(activeTool.kind, { featureId })
            }
            onModelChange={(modelId) =>
              updateToolSelection(activeTool.kind, { modelId })
            }
          />
        </div>
      ) : null}
    </aside>
  );
}

function SidebarBrand({
  collapsed,
  copy,
  onCollapsedChange,
  onMouseEnter,
}: {
  collapsed: boolean;
  copy: PublicShellCopy;
  onCollapsedChange: (collapsed: boolean) => void;
  onMouseEnter?: () => void;
}) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      className={cn(
        'mb-4 flex min-h-11 items-center',
        collapsed ? 'justify-center' : 'gap-2'
      )}
    >
      {collapsed ? (
        <button
          type="button"
          aria-label={copy.expandSidebar}
          onClick={() => onCollapsedChange(false)}
          className="group relative flex size-11 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted/60 focus-visible:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-foreground)_30%,transparent)] focus-visible:outline-none"
        >
          <img
            src={BRAND_LOGO_SRC}
            alt=""
            className="size-8 object-contain transition-opacity duration-150 group-hover:opacity-0 group-focus-visible:opacity-0"
          />
          <PanelLeftOpen className="absolute size-5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100" />
        </button>
      ) : (
        <>
          <Link
            href="/"
            className="flex min-h-11 min-w-0 flex-1 items-center rounded-md px-2 focus-visible:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-foreground)_30%,transparent)] focus-visible:outline-none"
          >
            <img
              src={BRAND_LOCKUP_SRC}
              alt="Seedance 2.5"
              className="h-9 w-auto max-w-40 object-contain"
            />
          </Link>
          <button
            type="button"
            aria-label={copy.collapseSidebar}
            onClick={() => onCollapsedChange(true)}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-foreground)_30%,transparent)] focus-visible:outline-none"
          >
            <PanelLeftClose className="size-4" />
          </button>
        </>
      )}
    </div>
  );
}

function NavGroup({
  title,
  items,
  copy,
  toolDefinitionByHref,
  collapsed = false,
  activeToolKind,
  onToolPreview,
}: {
  title?: string;
  items: ShellNavItem[];
  copy: PublicShellCopy;
  toolDefinitionByHref: Map<string, ToolDefinition>;
  collapsed?: boolean;
  activeToolKind?: ToolKind | null;
  onToolPreview?: (tool: ToolDefinition) => void;
}) {
  return (
    <div className={cn('space-y-1.5', collapsed && 'space-y-2')}>
      {title && collapsed && (
        <div aria-hidden className="mx-auto mb-3 h-px w-9 bg-border" />
      )}
      {title && (
        <p
          className={cn(
            'px-3 text-[10px] font-semibold text-muted-foreground uppercase',
            collapsed && 'sr-only'
          )}
        >
          {title}
        </p>
      )}
      {items.map((item) => (
        <NavItem
          key={item.title}
          item={item}
          copy={copy}
          toolDefinitionByHref={toolDefinitionByHref}
          collapsed={collapsed}
          activeToolKind={activeToolKind}
          onToolPreview={onToolPreview}
        />
      ))}
    </div>
  );
}

function NavItem({
  item,
  copy,
  toolDefinitionByHref,
  collapsed,
  activeToolKind,
  onToolPreview,
}: {
  item: ShellNavItem;
  copy: PublicShellCopy;
  toolDefinitionByHref: Map<string, ToolDefinition>;
  collapsed: boolean;
  activeToolKind?: ToolKind | null;
  onToolPreview?: (tool: ToolDefinition) => void;
}) {
  const pathname = usePathname();
  const tool = toolDefinitionByHref.get(item.href);
  const active = tool
    ? isActivePath(pathname, item.href) || activeToolKind === tool.kind
    : isActivePath(pathname, item.href);
  const itemClassName = cn(
    'group flex min-h-9 w-full items-center gap-2 rounded-md px-3 text-[13px] font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-foreground)_30%,transparent)] focus-visible:outline-none dark:hover:bg-white/[0.07]',
    collapsed &&
      'mx-auto min-h-12 flex-col justify-center gap-1 px-0 text-center text-[10px]',
    active && 'bg-muted text-foreground dark:bg-white/[0.08]'
  );

  if (tool && !collapsed) {
    return (
      <div
        onMouseEnter={() => onToolPreview?.(tool)}
        onFocusCapture={() => onToolPreview?.(tool)}
        className={cn(itemClassName, 'px-0')}
      >
        <Link
          href={item.href}
          aria-current={active ? 'page' : undefined}
          aria-expanded={activeToolKind === tool.kind}
          className="flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-l-md px-3 focus-visible:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-foreground)_30%,transparent)] focus-visible:outline-none"
        >
          <item.icon className="size-4" />
          <span className="min-w-0 truncate">{item.title}</span>
        </Link>
        <button
          type="button"
          aria-label={copy.openToolMenu(item.title)}
          aria-expanded={activeToolKind === tool.kind}
          onClick={() => onToolPreview?.(tool)}
          className="flex min-h-9 w-9 shrink-0 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:bg-white/[0.07] hover:text-foreground focus-visible:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-foreground)_30%,transparent)] focus-visible:outline-none"
        >
          <ChevronRight className="size-3.5 opacity-65" />
        </button>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? item.title : undefined}
      aria-expanded={tool ? activeToolKind === tool.kind : undefined}
      onMouseEnter={() => tool && onToolPreview?.(tool)}
      onFocusCapture={() => tool && onToolPreview?.(tool)}
      className={itemClassName}
    >
      <item.icon className={cn('size-4', collapsed && 'size-5')} />
      <span
        className={collapsed ? 'block max-w-[46px] truncate leading-3' : undefined}
      >
        {item.title}
      </span>
    </Link>
  );
}

function ToolSelectionPanel({
  tool,
  copy,
  featureId,
  modelId,
  onFeatureChange,
  onModelChange,
}: {
  tool: ToolDefinition;
  copy: PublicShellCopy;
  featureId: string;
  modelId: string;
  onFeatureChange: (id: string) => void;
  onModelChange: (id: string) => void;
}) {
  return (
    <div
      role="dialog"
      aria-label={tool.title}
      onWheel={isolatePanelWheel}
      className="flex max-h-[80vh] w-[min(760px,calc(100vw-236px))] flex-col overscroll-contain rounded-2xl border border-border bg-card/96 p-4 text-card-foreground shadow-[0_24px_90px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#121214]/96 dark:text-white dark:shadow-[0_24px_90px_rgba(0,0,0,0.45)]"
    >
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className={cn(
              'h-2 w-8 rounded-full bg-linear-to-r',
              tool.accentClassName
            )}
          />
          <p className="text-[11px] font-semibold text-muted-foreground/78 uppercase dark:text-zinc-500">
            {copy.toolLauncher}
          </p>
        </div>
        <h2 className="mt-2 text-xl font-semibold tracking-normal">
          {tool.title}
        </h2>
        <p className="mt-1 text-[12px] text-muted-foreground dark:text-zinc-500">
          {tool.description}
        </p>
      </div>
      <div className="mb-2 grid gap-4 md:grid-cols-2">
        <p className="px-2 text-[12px] font-medium text-muted-foreground dark:text-zinc-500">
          {copy.features}
        </p>
        <p className="px-2 text-[12px] font-medium text-muted-foreground dark:text-zinc-500">
          {copy.models}
        </p>
      </div>
      <div
        data-tool-panel-scroll
        className="min-h-0 overflow-y-auto overscroll-contain pr-1"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="min-w-0 space-y-1">
            {tool.features.map((feature) => (
              <ToolOptionRow
                key={feature.id}
                option={feature}
                active={feature.id === featureId}
                onClick={() => onFeatureChange(feature.id)}
              />
            ))}
          </div>
          <div className="min-w-0 space-y-1">
            {tool.models.map((model) => (
              <ToolOptionRow
                key={model.id}
                option={model}
                active={model.id === modelId}
                onClick={() => onModelChange(model.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolOptionRow({
  option,
  active,
  onClick,
}: {
  option: ToolOption;
  active: boolean;
  onClick: () => void;
}) {
  const content = (
    <>
      <span
        aria-hidden
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background/70 text-muted-foreground transition-colors group-hover:text-foreground dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-300 dark:group-hover:text-white',
          active &&
            'border-primary/40 bg-primary/14 text-primary dark:border-primary/45 dark:bg-primary/16 dark:text-primary'
        )}
      >
        <option.icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-[14px] font-semibold">
            {option.title}
          </span>
          {option.badge ? (
            <span
              className={cn(
                'shrink-0 rounded px-1.5 py-0.5 text-[9px] font-black tracking-normal',
                option.badgeClassName
              )}
            >
              {option.badge}
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 line-clamp-2 text-[12px] leading-4 text-muted-foreground dark:text-zinc-500">
          {option.description}
        </span>
      </span>
    </>
  );
  const className = cn(
    'group flex min-h-15 w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-[background-color,color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
    active
      ? 'bg-primary/10 text-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-primary)_28%,transparent)] dark:bg-white/[0.08]'
      : 'text-foreground/74 hover:bg-muted/70 hover:text-foreground dark:text-zinc-300 dark:hover:bg-white/[0.05] dark:hover:text-white'
  );

  if (option.href) {
    return (
      <Link href={option.href} onClick={onClick} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={className}>
      {content}
    </button>
  );
}

function MobileTopbar({ transparentAtTop }: { transparentAtTop: boolean }) {
  const locale = useCurrentLocale();
  const copy = getPublicShellCopy(locale);
  const localizedMainNav = useMemo(() => getLocalizedNavItems(mainNav, copy), [copy]);
  const localizedToolNav = useMemo(() => getLocalizedNavItems(toolNav, copy), [copy]);
  const localizedToolDefinitions = useMemo(
    () => getLocalizedToolDefinitions(copy),
    [copy]
  );
  const localizedToolDefinitionByHref = useMemo(
    () => new Map(localizedToolDefinitions.map((tool) => [tool.href, tool])),
    [localizedToolDefinitions]
  );
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label={copy.closeNavigationMenu}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[45] bg-black/22 backdrop-blur-[3px] lg:hidden"
        />
      )}
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b px-3 py-3 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 sm:px-4 lg:hidden',
          transparentAtTop && !open
            ? 'border-transparent bg-transparent shadow-none backdrop-blur-0'
            : 'border-[color-mix(in_oklab,var(--border)_90%,transparent)] bg-[color-mix(in_oklab,var(--background)_92%,transparent)] shadow-sm shadow-slate-900/5 backdrop-blur-xl'
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              aria-label={
                open ? copy.closeNavigationMenu : copy.openNavigationMenu
              }
              onClick={() => setOpen((value) => !value)}
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card/70 text-foreground sm:size-11"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <Link
              href="/"
              className="flex min-w-0 shrink items-center gap-2 font-semibold"
            >
              <img
                src={BRAND_LOGO_SRC}
                alt="Seedance 2.5"
                className="h-9 w-9 object-contain sm:hidden"
              />
              <img
                src={BRAND_LOCKUP_SRC}
                alt="Seedance 2.5"
                className="hidden h-9 w-auto max-w-40 object-contain sm:block"
              />
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <HeaderUtilityActions compact />
          </div>
        </div>
        {open && (
          <div className="mt-4 space-y-4 rounded-lg border border-border bg-card/72 p-3 shadow-xl shadow-slate-950/10 backdrop-blur-2xl">
            <NavGroup
              items={localizedMainNav}
              copy={copy}
              toolDefinitionByHref={localizedToolDefinitionByHref}
            />
            {SHOW_TOOL_NAVIGATION && (
              <NavGroup
                title={copy.toolsTitle}
                items={localizedToolNav}
                copy={copy}
                toolDefinitionByHref={localizedToolDefinitionByHref}
              />
            )}
          </div>
        )}
      </header>
    </>
  );
}

function HeaderUtilityActions({
  compact = false,
  hideLocale = false,
  hideNotifications = false,
}: {
  compact?: boolean;
  hideLocale?: boolean;
  hideNotifications?: boolean;
}) {
  const locale = useCurrentLocale();
  const copy = getPublicShellCopy(locale);
  const { user } = useAppContext();
  const [membershipTier, setMembershipTier] = useState<MembershipTier>('free');
  const { closeUpgradePaywall, requestUpgrade, upgradeReason } =
    useUpgradePaywall();

  useEffect(() => {
    if (!user?.id) {
      setMembershipTier('free');
      return;
    }

    let cancelled = false;
    import('@/server/ai.functions')
      .then(({ getAIEntitlementsFn }) => getAIEntitlementsFn())
      .then((entitlements) => {
        if (!cancelled) setMembershipTier(entitlements.tier);
      })
      .catch((error) => {
        console.error('Failed to load membership badge:', error);
        if (!cancelled) setMembershipTier('free');
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const isUltra = membershipTier === 'ultra';
  const nextPlan = membershipTier === 'starter' ? 'Pro' : 'Ultra';
  const label =
    membershipTier === 'free'
      ? copy.upgrade
      : isUltra
        ? 'Ultra'
        : `${copy.upgrade} ${nextPlan}`;

  return (
    <>
      <button
        aria-label={label}
        className={cn(
          'inline-flex min-h-9 items-center gap-1.5 rounded-full border text-[11px] font-bold transition-colors focus-visible:ring-2 focus-visible:ring-[#3b82f6]/70 focus-visible:outline-none',
          membershipTier === 'free' &&
            'border-[#3b82f6] bg-[#3b82f6] text-[#151a0c] shadow-[0_0_28px_rgba(216,242,105,0.28)] hover:bg-[#f1ff93]',
          membershipTier === 'starter' &&
            'border-[#2563eb]/45 bg-[#1e40af] text-[#efffb1] shadow-[0_0_24px_rgba(216,242,105,0.18)] hover:bg-[#1e3a8a]',
          membershipTier === 'pro' &&
            'border-[#3b82f6] bg-[#60a5fa] text-[#151a0c] shadow-[0_0_30px_rgba(216,242,105,0.32)] hover:bg-[#3b82f6]',
          isUltra &&
            'border-[#ffe08a] bg-[#d9a733] text-[#211806] shadow-[0_0_30px_rgba(232,185,67,0.35)] hover:bg-[#f3c958]',
          compact ? 'px-2.5 sm:px-3' : 'px-3.5'
        )}
        onClick={() => void requestUpgrade('capacity')}
        type="button"
      >
        {membershipTier === 'free' ? (
          <Sparkles className="size-3.5" />
        ) : (
          <Crown className="size-4 fill-current stroke-[2.25] drop-shadow-[0_1px_0_rgba(255,255,255,0.22)]" />
        )}
        <span>{label}</span>
      </button>
      <UpgradePaywallDialog
        onClose={closeUpgradePaywall}
        open={upgradeReason !== null}
        reason={upgradeReason || 'capacity'}
      />
      {!hideLocale && (
        <LocaleSelector
          compact
          className={cn(
            TOP_UTILITY_ICON_BUTTON_CLASS,
            'h-10 w-10 px-0 text-foreground [&>span:first-child]:bg-transparent'
          )}
        />
      )}
      {!hideNotifications && (
        <button
          type="button"
          aria-label={copy.notifications}
          className={TOP_UTILITY_ICON_BUTTON_CLASS}
        >
          <Bell className="size-4" />
        </button>
      )}
      <AccountButton compact={compact} />
    </>
  );
}

function TopUtilityBar({
  transparentAtTop,
  collapsed,
}: {
  transparentAtTop: boolean;
  collapsed: boolean;
}) {
  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 hidden border-b transition-[left,background-color,border-color,box-shadow,backdrop-filter] duration-300 lg:block',
        collapsed ? 'left-[62px]' : 'left-[224px]',
        transparentAtTop
          ? 'border-transparent bg-transparent shadow-none backdrop-blur-0'
          : 'border-[color-mix(in_oklab,var(--border)_70%,transparent)] bg-[color-mix(in_oklab,var(--background)_42%,transparent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.055),0_18px_52px_-42px_rgba(0,0,0,0.68)] backdrop-blur-2xl backdrop-saturate-150'
      )}
    >
      <div className="flex h-16 w-full items-center justify-end gap-2.5 px-4 text-[12px] text-muted-foreground sm:px-6 lg:px-8">
        <HeaderUtilityActions />
      </div>
    </header>
  );
}

function AccountButton({ compact = false }: { compact?: boolean }) {
  return (
    <SignUser
      signButtonSize="sm"
      userNav={{
        items: [],
        show_credits: true,
        show_name: true,
        show_sign_out: true,
      }}
      className="w-auto md:w-auto"
      iconOnly={compact}
      buttonClassName={cn(
        'ml-0 h-10 rounded-full border border-[#2563eb]/45 bg-primary text-[12px] font-semibold text-primary-foreground shadow-[0_0_28px_rgba(216,242,105,0.18)] hover:bg-[#e5ff78] hover:text-[#151a0c] data-[state=open]:bg-[#e5ff78]',
        compact ? 'w-10 px-0' : 'px-4'
      )}
      userButtonClassName="ml-0 size-10 rounded-full border border-[#f4f2df18] bg-white/[0.04] p-1 text-[#2563eb] shadow-none hover:border-[#2563eb]/45 hover:bg-white/[0.08] data-[state=open]:border-[#2563eb]/45 data-[state=open]:bg-white/[0.08]"
    />
  );
}
