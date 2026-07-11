import Copy from 'lucide-react/dist/esm/icons/copy';
import Download from 'lucide-react/dist/esm/icons/download';
import ImagePlus from 'lucide-react/dist/esm/icons/image-plus';
import RefreshCcw from 'lucide-react/dist/esm/icons/refresh-ccw';
import Video from 'lucide-react/dist/esm/icons/video';
import X from 'lucide-react/dist/esm/icons/x';
import { useMemo, useRef, useState } from 'react';

import { useCurrentLocale } from '@/core/i18n/navigation';

import type { ShowcasePrompt } from '@/config/showcase-data';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { getSafeDownloadFilename } from '@/lib/download-filename';
import { cn } from '@/lib/utils';

import type { GalleryItem } from './-home-data';
import {
  usePreviewEnterTransition,
  type PreviewTransitionRect,
} from './-preview-transition';

export type GalleryPromptSelection = {
  prompt: string;
  image: string;
  alt: string;
  title: string;
};

type ImagePromptViewerProps = {
  items: GalleryItem[];
  prompts: ShowcasePrompt[];
  onUsePrompt: (selection: GalleryPromptSelection) => void;
  onEditImage: (selection: GalleryPromptSelection) => void;
  onUseVideoReference: (selection: GalleryPromptSelection) => void;
};

type ImagePromptViewerCopy = {
  dialogDescription: string;
  close: string;
  prompt: string;
  copy: string;
  copied: string;
  information: string;
  model: string;
  mode: string;
  modeValue: string;
  quality: string;
  qualityValue: string;
  recreate: string;
  edit: string;
  video: string;
  download: string;
};

const imagePromptViewerCopyByLocale: Record<string, ImagePromptViewerCopy> = {
  en: {
    dialogDescription: 'GPT Image 2 prompt and reference image preview',
    close: 'Close',
    prompt: 'PROMPT',
    copy: 'Copy',
    copied: 'Copied',
    information: 'INFORMATION',
    model: 'Model',
    mode: 'Mode',
    modeValue: 'Text to Image',
    quality: 'Quality',
    qualityValue: 'High',
    recreate: 'Recreate',
    edit: 'Edit',
    video: 'Video',
    download: 'Download',
  },
  de: {
    dialogDescription: 'GPT Image 2 Prompt- und Referenzbildvorschau',
    close: 'Schliessen',
    prompt: 'PROMPT',
    copy: 'Kopieren',
    copied: 'Kopiert',
    information: 'INFORMATIONEN',
    model: 'Modell',
    mode: 'Modus',
    modeValue: 'Text zu Bild',
    quality: 'Qualitaet',
    qualityValue: 'Hoch',
    recreate: 'Neu erstellen',
    edit: 'Bearbeiten',
    video: 'Video',
    download: 'Herunterladen',
  },
  fr: {
    dialogDescription:
      'Apercu du prompt GPT Image 2 et de l image de reference',
    close: 'Fermer',
    prompt: 'PROMPT',
    copy: 'Copier',
    copied: 'Copie',
    information: 'INFORMATIONS',
    model: 'Modele',
    mode: 'Mode',
    modeValue: 'Texte vers image',
    quality: 'Qualite',
    qualityValue: 'Haute',
    recreate: 'Recreer',
    edit: 'Modifier',
    video: 'Video',
    download: 'Telecharger',
  },
  es: {
    dialogDescription:
      'Vista previa del prompt GPT Image 2 y la imagen de referencia',
    close: 'Cerrar',
    prompt: 'PROMPT',
    copy: 'Copiar',
    copied: 'Copiado',
    information: 'INFORMACION',
    model: 'Modelo',
    mode: 'Modo',
    modeValue: 'Texto a imagen',
    quality: 'Calidad',
    qualityValue: 'Alta',
    recreate: 'Recrear',
    edit: 'Editar',
    video: 'Video',
    download: 'Descargar',
  },
  it: {
    dialogDescription: 'Anteprima prompt GPT Image 2 e immagine di riferimento',
    close: 'Chiudi',
    prompt: 'PROMPT',
    copy: 'Copia',
    copied: 'Copiato',
    information: 'INFORMAZIONI',
    model: 'Modello',
    mode: 'Modalita',
    modeValue: 'Testo in immagine',
    quality: 'Qualita',
    qualityValue: 'Alta',
    recreate: 'Ricrea',
    edit: 'Modifica',
    video: 'Video',
    download: 'Scarica',
  },
  pl: {
    dialogDescription: 'Podglad promptu GPT Image 2 i obrazu referencyjnego',
    close: 'Zamknij',
    prompt: 'PROMPT',
    copy: 'Kopiuj',
    copied: 'Skopiowano',
    information: 'INFORMACJE',
    model: 'Model',
    mode: 'Tryb',
    modeValue: 'Tekst na obraz',
    quality: 'Jakosc',
    qualityValue: 'Wysoka',
    recreate: 'Odtworz',
    edit: 'Edytuj',
    video: 'Wideo',
    download: 'Pobierz',
  },
  ja: {
    dialogDescription: 'GPT Image 2 のプロンプトと参照画像プレビュー',
    close: '閉じる',
    prompt: 'プロンプト',
    copy: 'コピー',
    copied: 'コピー済み',
    information: '情報',
    model: 'モデル',
    mode: 'モード',
    modeValue: 'テキストから画像',
    quality: '品質',
    qualityValue: '高',
    recreate: '再作成',
    edit: '編集',
    video: '動画',
    download: 'ダウンロード',
  },
  ko: {
    dialogDescription: 'GPT Image 2 프롬프트 및 참조 이미지 미리보기',
    close: '닫기',
    prompt: '프롬프트',
    copy: '복사',
    copied: '복사됨',
    information: '정보',
    model: '모델',
    mode: '모드',
    modeValue: '텍스트에서 이미지',
    quality: '품질',
    qualityValue: '높음',
    recreate: '다시 만들기',
    edit: '편집',
    video: '동영상',
    download: '다운로드',
  },
  'zh-hant': {
    dialogDescription: 'GPT Image 2 提示詞與參考圖片預覽',
    close: '關閉',
    prompt: '提示詞',
    copy: '複製',
    copied: '已複製',
    information: '資訊',
    model: '模型',
    mode: '模式',
    modeValue: '文字轉圖片',
    quality: '品質',
    qualityValue: '高',
    recreate: '重新生成',
    edit: '編輯',
    video: '影片',
    download: '下載',
  },
};

imagePromptViewerCopyByLocale.zh = imagePromptViewerCopyByLocale['zh-hant'];

function getDownloadName(image: string) {
  return getSafeDownloadFilename(image, 'gpt-image-2-reference.jpg');
}

function toSelection(
  item: GalleryItem,
  promptByImage: Map<string, ShowcasePrompt>
): GalleryPromptSelection {
  const prompt = promptByImage.get(item.src);
  return {
    prompt: prompt?.prompt ?? item.alt,
    image: item.src,
    alt: item.alt,
    title: prompt?.title ?? item.alt,
  };
}

function getGalleryItemAspectRatio(item: GalleryItem) {
  if (!item.width || !item.height) return undefined;
  return `${item.width} / ${item.height}`;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] py-3 text-sm last:border-b-0">
      <span className="text-white/45">{label}</span>
      <span className="text-right font-semibold text-white/86">{value}</span>
    </div>
  );
}

export function ImagePromptViewer({
  items,
  prompts,
  onUsePrompt,
  onEditImage,
  onUseVideoReference,
}: ImagePromptViewerProps) {
  const locale = useCurrentLocale();
  const copy =
    imagePromptViewerCopyByLocale[locale] ?? imagePromptViewerCopyByLocale.en;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(
    () => new Set()
  );
  const [transitionSourceRect, setTransitionSourceRect] =
    useState<PreviewTransitionRect | null>(null);
  const previewImageRef = useRef<HTMLImageElement | null>(null);
  const previewSidePanelRef = useRef<HTMLElement | null>(null);
  const promptByImage = useMemo(
    () => new Map(prompts.map((prompt) => [prompt.image, prompt])),
    [prompts]
  );
  const activeItem =
    activeIndex === null
      ? null
      : items[Math.min(activeIndex, items.length - 1)];
  const selection = activeItem ? toSelection(activeItem, promptByImage) : null;

  const copyPrompt = async () => {
    if (!selection) return;
    await navigator.clipboard.writeText(selection.prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const closeAndRun = (action: (selection: GalleryPromptSelection) => void) => {
    if (!selection) return;
    action(selection);
    setActiveIndex(null);
  };

  const markImageLoaded = (src: string) => {
    setLoadedImages((current) => {
      if (current.has(src)) return current;
      const next = new Set(current);
      next.add(src);
      return next;
    });
  };

  usePreviewEnterTransition({
    openKey: selection?.image ?? null,
    sourceRect: transitionSourceRect,
    previewRef: previewImageRef,
    sidePanelRef: previewSidePanelRef,
  });

  return (
    <>
      <div className="columns-2 gap-2 md:columns-4">
        {items.map((item, index) => {
          const loaded = loadedImages.has(item.src);

          return (
            <button
              key={`${item.src}-${index}`}
              type="button"
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setTransitionSourceRect({
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height,
                });
                setActiveIndex(index);
              }}
              style={{ aspectRatio: getGalleryItemAspectRatio(item) }}
              className={cn(
                'group relative mb-2 block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-lg border border-transparent bg-[#11140f] text-left transition-colors duration-300 hover:border-[#d8f269]/80 focus-visible:border-[#d8f269] focus-visible:ring-2 focus-visible:ring-[#d8f269]/60 focus-visible:outline-none',
                !item.width || !item.height ? 'aspect-[4/5]' : '',
                item.className
              )}
            >
              <div
                aria-hidden
                className={cn(
                  'absolute inset-0 bg-[linear-gradient(110deg,#11140f_8%,#1d2316_18%,#11140f_33%)] bg-[length:200%_100%] transition-opacity duration-300',
                  loaded ? 'opacity-0' : 'animate-pulse opacity-100'
                )}
              />
              <img
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                decoding="async"
                onLoad={() => markImageLoaded(item.src)}
                onError={() => markImageLoaded(item.src)}
              />
            </button>
          );
        })}
      </div>

      <Dialog
        open={Boolean(selection)}
        onOpenChange={() => setActiveIndex(null)}
      >
        {selection && (
          <DialogContent
            showCloseButton={false}
            disableContentAnimation
            disableScaleAnimation
            fullScreen
            overlayClassName="bg-black/48 backdrop-blur-[1px]"
            onWheel={(event) => event.stopPropagation()}
            className="bg-[#050604] text-white"
          >
            <DialogTitle className="sr-only">{selection.title}</DialogTitle>
            <DialogDescription className="sr-only">
              {copy.dialogDescription}
            </DialogDescription>

            <div className="relative z-10 h-full min-h-0 w-full overflow-hidden [--preview-panel-width:410px]">
              <div
                role="button"
                tabIndex={-1}
                onClick={() => setActiveIndex(null)}
                className="absolute inset-x-0 top-0 bottom-[min(48dvh,26rem)] isolate flex min-h-0 cursor-pointer items-center justify-center overflow-hidden bg-[#050604] p-7 sm:p-10 md:p-12 lg:inset-y-0 lg:right-[var(--preview-panel-width)] lg:bottom-0 lg:p-14 xl:p-16"
              >
                <img
                  aria-hidden
                  src={selection.image}
                  alt=""
                  className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-72 blur-xl brightness-110 saturate-125"
                  decoding="async"
                />
                <div className="pointer-events-none absolute inset-0 bg-black/24" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_40%,rgba(255,255,255,0.08)_0,rgba(0,0,0,0.02)_34%,rgba(0,0,0,0.34)_92%)]" />
                <img
                  ref={previewImageRef}
                  src={selection.image}
                  alt={selection.alt}
                  className="relative z-10 h-auto max-h-full w-auto max-w-full cursor-pointer rounded-xl object-contain shadow-[0_30px_140px_rgba(0,0,0,0.52)]"
                  decoding="async"
                />
              </div>

              <aside
                ref={previewSidePanelRef}
                onWheel={(event) => event.stopPropagation()}
                className="absolute inset-x-0 bottom-0 z-20 flex max-h-[48dvh] min-h-0 flex-col border-t border-white/[0.08] bg-[#101112]/92 p-4 pt-16 backdrop-blur-2xl lg:inset-y-0 lg:right-0 lg:left-auto lg:h-full lg:max-h-none lg:w-[var(--preview-panel-width)] lg:border-t-0 lg:border-l lg:p-5 lg:pt-16"
              >
                <DialogClose className="absolute top-4 right-4 inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/72 transition-colors hover:bg-white/[0.09] hover:text-white focus-visible:ring-2 focus-visible:ring-[#d8f269]/70 focus-visible:outline-none">
                  <X className="size-5" />
                  <span className="sr-only">{copy.close}</span>
                </DialogClose>

                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  <section className="rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/[0.07]">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="text-xs font-bold tracking-normal text-white/46">
                        {copy.prompt}
                      </h3>
                      <button
                        type="button"
                        onClick={copyPrompt}
                        className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-white/[0.1] px-2.5 text-xs font-semibold text-white/82 transition-colors hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-[#d8f269]/70 focus-visible:outline-none"
                      >
                        <Copy className="size-3.5" />
                        {copied ? copy.copied : copy.copy}
                      </button>
                    </div>
                    <p className="max-h-48 overflow-y-auto text-sm leading-6 whitespace-pre-wrap text-white/64">
                      {selection.prompt}
                    </p>
                  </section>

                  <section className="mt-4 rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/[0.07]">
                    <h3 className="mb-2 text-xs font-bold tracking-normal text-white/46">
                      {copy.information}
                    </h3>
                    <InfoRow label={copy.model} value="GPT Image 2" />
                    <InfoRow label={copy.mode} value={copy.modeValue} />
                    <InfoRow label={copy.quality} value={copy.qualityValue} />
                  </section>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    onClick={() => closeAndRun(onUsePrompt)}
                    className="h-12 rounded-xl bg-[#d8f269] text-sm font-bold text-[#111407] hover:bg-[#e6ff4f]"
                  >
                    <RefreshCcw className="size-4" />
                    {copy.recreate}
                  </Button>
                  <button
                    type="button"
                    onClick={() => closeAndRun(onEditImage)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-semibold text-white/86 transition-colors hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-[#d8f269]/70 focus-visible:outline-none"
                  >
                    <ImagePlus className="size-4" />
                    {copy.edit}
                  </button>
                  <button
                    type="button"
                    onClick={() => closeAndRun(onUseVideoReference)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-semibold text-white/86 transition-colors hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-[#d8f269]/70 focus-visible:outline-none"
                  >
                    <Video className="size-4" />
                    {copy.video}
                  </button>
                  <a
                    href={selection.image}
                    download={getDownloadName(selection.image)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-semibold text-white/86 transition-colors hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-[#d8f269]/70 focus-visible:outline-none"
                  >
                    <Download className="size-4" />
                    {copy.download}
                  </a>
                </div>
              </aside>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
