import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import Copy from 'lucide-react/dist/esm/icons/copy';
import Download from 'lucide-react/dist/esm/icons/download';
import Play from 'lucide-react/dist/esm/icons/play';
import Video from 'lucide-react/dist/esm/icons/video';
import X from 'lucide-react/dist/esm/icons/x';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Link, useCurrentLocale } from '@/core/i18n/navigation';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { getSafeDownloadFilename } from '@/lib/download-filename';
import { cn } from '@/lib/utils';

import {
  CONTENT_FRAME_CLASS,
  type SeedanceVideoAsset,
  seedanceVideos,
} from './-home-data';
import { getHomePageCopy } from './-home-page-copy';
import {
  usePreviewEnterTransition,
  type PreviewTransitionRect,
} from './-preview-transition';

function getDownloadName(src: string) {
  return getSafeDownloadFilename(src, 'seedance-2-reference.mp4');
}

type SeedanceGalleryCopy = {
  preview: (title: string) => string;
  dialogDescription: string;
  close: string;
  prompt: string;
  copy: string;
  copied: string;
  information: string;
  clip: string;
  model: string;
  mode: string;
  modeValue: string;
  source: string;
  generate: string;
  download: string;
  eyebrow: string;
  title: string;
  description: string;
  viewAll: string;
};

function buildGalleryCopy(
  locale: string,
  chrome: Omit<
    SeedanceGalleryCopy,
    'dialogDescription' | 'title' | 'description'
  >
): SeedanceGalleryCopy {
  const seo = getHomePageCopy(locale).gallery;
  return {
    ...chrome,
    dialogDescription: seo.dialogDescription,
    title: seo.title,
    description: seo.description,
  };
}

const seedanceCopyByLocale: Record<string, SeedanceGalleryCopy> = {
  en: buildGalleryCopy('en', {
    preview: (title) => `Preview ${title}`,
    close: 'Close',
    prompt: 'PROMPT',
    copy: 'Copy',
    copied: 'Copied',
    information: 'INFORMATION',
    clip: 'Clip',
    model: 'Model',
    mode: 'Mode',
    modeValue: 'Video preview',
    source: 'Source',
    generate: 'Generate',
    download: 'Download',
    eyebrow: 'Video effects',
    viewAll: 'View all',
  }),
  de: buildGalleryCopy('de', {
    preview: (title) => `${title} ansehen`,
    close: 'Schliessen',
    prompt: 'PROMPT',
    copy: 'Kopieren',
    copied: 'Kopiert',
    information: 'INFORMATIONEN',
    clip: 'Clip',
    model: 'Modell',
    mode: 'Modus',
    modeValue: 'Videovorschau',
    source: 'Quelle',
    generate: 'Generieren',
    download: 'Herunterladen',
    eyebrow: 'Videoeffekte',
    viewAll: 'Alle ansehen',
  }),
  fr: buildGalleryCopy('fr', {
    preview: (title) => `Apercu ${title}`,
    close: 'Fermer',
    prompt: 'PROMPT',
    copy: 'Copier',
    copied: 'Copie',
    information: 'INFORMATIONS',
    clip: 'Clip',
    model: 'Modele',
    mode: 'Mode',
    modeValue: 'Apercu video',
    source: 'Source',
    generate: 'Generer',
    download: 'Telecharger',
    eyebrow: 'Effets video',
    viewAll: 'Tout voir',
  }),
  es: buildGalleryCopy('es', {
    preview: (title) => `Vista previa de ${title}`,
    close: 'Cerrar',
    prompt: 'PROMPT',
    copy: 'Copiar',
    copied: 'Copiado',
    information: 'INFORMACION',
    clip: 'Clip',
    model: 'Modelo',
    mode: 'Modo',
    modeValue: 'Vista previa',
    source: 'Fuente',
    generate: 'Generar',
    download: 'Descargar',
    eyebrow: 'Efectos de video',
    viewAll: 'Ver todo',
  }),
  it: buildGalleryCopy('it', {
    preview: (title) => `Anteprima ${title}`,
    close: 'Chiudi',
    prompt: 'PROMPT',
    copy: 'Copia',
    copied: 'Copiato',
    information: 'INFORMAZIONI',
    clip: 'Clip',
    model: 'Modello',
    mode: 'Modalita',
    modeValue: 'Anteprima video',
    source: 'Fonte',
    generate: 'Genera',
    download: 'Scarica',
    eyebrow: 'Effetti video',
    viewAll: 'Vedi tutto',
  }),
  pl: buildGalleryCopy('pl', {
    preview: (title) => `Podglad ${title}`,
    close: 'Zamknij',
    prompt: 'PROMPT',
    copy: 'Kopiuj',
    copied: 'Skopiowano',
    information: 'INFORMACJE',
    clip: 'Klip',
    model: 'Model',
    mode: 'Tryb',
    modeValue: 'Podglad wideo',
    source: 'Zrodlo',
    generate: 'Generuj',
    download: 'Pobierz',
    eyebrow: 'Efekty wideo',
    viewAll: 'Zobacz wszystko',
  }),
  ja: buildGalleryCopy('ja', {
    preview: (title) => `${title} をプレビュー`,
    close: '閉じる',
    prompt: 'プロンプト',
    copy: 'コピー',
    copied: 'コピー済み',
    information: '情報',
    clip: 'クリップ',
    model: 'モデル',
    mode: 'モード',
    modeValue: '動画プレビュー',
    source: 'ソース',
    generate: '生成',
    download: 'ダウンロード',
    eyebrow: '動画エフェクト',
    viewAll: 'すべて見る',
  }),
  ko: buildGalleryCopy('ko', {
    preview: (title) => `${title} 미리보기`,
    close: '닫기',
    prompt: '프롬프트',
    copy: '복사',
    copied: '복사됨',
    information: '정보',
    clip: '클립',
    model: '모델',
    mode: '모드',
    modeValue: '동영상 미리보기',
    source: '소스',
    generate: '생성',
    download: '다운로드',
    eyebrow: '동영상 효과',
    viewAll: '전체 보기',
  }),
  'zh-hant': buildGalleryCopy('zh-hant', {
    preview: (title) => `預覽 ${title}`,
    close: '關閉',
    prompt: '提示詞',
    copy: '複製',
    copied: '已複製',
    information: '資訊',
    clip: '片段',
    model: '模型',
    mode: '模式',
    modeValue: '影片預覽',
    source: '來源',
    generate: '生成',
    download: '下載',
    eyebrow: '影片效果',
    viewAll: '查看全部',
  }),
};

seedanceCopyByLocale.zh = seedanceCopyByLocale['zh-hant'];

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] py-3 text-sm last:border-b-0">
      <span className="text-white/45">{label}</span>
      <span className="text-right font-semibold text-white/86">{value}</span>
    </div>
  );
}

function PreviewVideo({
  item,
  className,
  autoPlay = false,
  controls = false,
}: {
  item: SeedanceVideoAsset;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
}) {
  if (!autoPlay && !controls) {
    return (
      <img
        src={item.poster}
        alt=""
        className={cn('h-full w-full object-cover', className)}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <video
      key={item.src}
      src={item.src}
      poster={item.poster}
      className={cn('h-full w-full object-cover', className)}
      muted={!controls}
      loop={!controls}
      playsInline
      preload={autoPlay ? 'auto' : 'metadata'}
      autoPlay={autoPlay}
      controls={controls}
    />
  );
}

function VideoTile({
  item,
  index,
  onPreview,
  copy,
  className,
}: {
  item: SeedanceVideoAsset;
  index: number;
  onPreview: (sourceRect: PreviewTransitionRect) => void;
  copy: SeedanceGalleryCopy;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        onPreview({
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        });
      }}
      className={cn(
        'group relative block w-full overflow-hidden rounded-xl bg-[#11140f] text-left ring-1 ring-[#f4f2df14] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:outline-none md:min-h-52',
        className
      )}
      aria-label={copy.preview(item.title)}
    >
      <PreviewVideo item={item} className="absolute inset-0" />
      <div className="absolute inset-0 bg-linear-to-t from-black/78 via-black/12 to-transparent" />
      <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <span className="mb-2 inline-flex min-h-7 items-center gap-1.5 rounded-full bg-black/52 px-3 text-[11px] font-semibold text-white backdrop-blur-md">
            <Play className="size-3 fill-white" />
            {item.label}
          </span>
          <h3 className="line-clamp-1 text-sm font-semibold text-[#f4f2e6]">
            {item.title}
          </h3>
        </div>
        <span className="hidden shrink-0 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white transition-transform duration-300 group-hover:-translate-y-0.5 sm:inline-flex">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
    </button>
  );
}

function VideoPreviewDialog({
  items,
  selectedIndex,
  onSelectedIndexChange,
  copy,
  sourceRect,
}: {
  items: SeedanceVideoAsset[];
  selectedIndex: number | null;
  onSelectedIndexChange: (index: number | null) => void;
  copy: SeedanceGalleryCopy;
  sourceRect: PreviewTransitionRect | null;
}) {
  const [copied, setCopied] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);
  const previewMediaRef = useRef<HTMLDivElement | null>(null);
  const previewSidePanelRef = useRef<HTMLElement | null>(null);
  const selectedItem =
    selectedIndex === null ? null : (items[selectedIndex] ?? null);

  useEffect(() => {
    setPromptExpanded(false);
  }, [selectedItem?.src]);

  const copyPrompt = async () => {
    if (!selectedItem) return;
    await navigator.clipboard.writeText(selectedItem.prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  usePreviewEnterTransition({
    openKey: selectedItem?.src ?? null,
    sourceRect,
    previewRef: previewMediaRef,
    sidePanelRef: previewSidePanelRef,
  });

  return (
    <Dialog
      open={selectedItem !== null}
      onOpenChange={(open) => {
        if (!open) onSelectedIndexChange(null);
      }}
    >
      {selectedItem && (
        <DialogContent
          showCloseButton={false}
          disableContentAnimation
          disableScaleAnimation
          overlayClassName="bg-black/30 backdrop-blur-[2px]"
          onWheel={(event) => event.stopPropagation()}
          className="h-[100dvh] max-h-none w-screen max-w-none overflow-y-auto rounded-none border-0 bg-[#050604]/72 p-0 text-white shadow-none backdrop-blur-sm sm:max-w-none lg:overflow-hidden lg:bg-[#050604]"
        >
          <DialogTitle className="sr-only">{selectedItem.title}</DialogTitle>
          <DialogDescription className="sr-only">
            {copy.dialogDescription}
          </DialogDescription>

          <div className="relative z-10 min-h-full lg:grid lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_410px]">
            <div
              role="button"
              tabIndex={-1}
              onClick={() => onSelectedIndexChange(null)}
              className="relative isolate flex min-h-[56dvh] cursor-pointer items-center justify-center overflow-hidden bg-transparent p-5 pt-16 sm:p-8 sm:pt-18 md:p-10 lg:min-h-0 lg:bg-[#050604] lg:p-14 xl:p-16"
            >
              <img
                aria-hidden
                src={selectedItem.poster}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover opacity-40 blur-2xl saturate-110"
                loading="lazy"
                decoding="async"
              />
              <div className="pointer-events-none absolute inset-0 bg-black/48" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_40%,rgba(255,255,255,0.04)_0,rgba(0,0,0,0.08)_34%,rgba(0,0,0,0.62)_92%)]" />
              <div
                ref={previewMediaRef}
                className="relative z-10 inline-flex max-h-full max-w-full cursor-default items-center justify-center rounded-xl shadow-[0_30px_140px_rgba(0,0,0,0.52)]"
                onClick={(event) => event.stopPropagation()}
              >
                <PreviewVideo
                  item={selectedItem}
                  autoPlay
                  controls
                  className="h-auto max-h-full w-auto max-w-full cursor-pointer rounded-xl object-contain"
                />
              </div>
            </div>

            <aside
              ref={previewSidePanelRef}
              onWheel={(event) => event.stopPropagation()}
              className="relative mx-4 mb-5 flex min-h-0 flex-col rounded-[1.75rem] border border-white/[0.08] bg-[#202326]/54 p-4 pt-16 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:m-0 lg:max-h-none lg:rounded-none lg:border-t-0 lg:border-r-0 lg:border-b-0 lg:border-l lg:bg-[#101112]/92 lg:p-5 lg:pt-16"
            >
              <DialogClose className="absolute top-4 right-4 inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/72 transition-colors hover:bg-white/[0.09] hover:text-white focus-visible:ring-2 focus-visible:ring-[#2563eb]/70 focus-visible:outline-none">
                <X className="size-5" />
                <span className="sr-only">{copy.close}</span>
              </DialogClose>

              <div className="min-h-0 flex-1 overflow-y-visible pr-0 lg:overflow-y-auto lg:pr-1">
                <section className="rounded-xl bg-white/[0.07] p-4 ring-1 ring-white/[0.08]">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-xs font-bold tracking-normal text-white/46">
                      {copy.prompt}
                    </h3>
                    <button
                      type="button"
                      onClick={copyPrompt}
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-white/[0.1] px-2.5 text-xs font-semibold text-white/82 transition-colors hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-[#2563eb]/70 focus-visible:outline-none"
                    >
                      <Copy className="size-3.5" />
                      {copied ? copy.copied : copy.copy}
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-expanded={promptExpanded}
                    onClick={() => setPromptExpanded((value) => !value)}
                    className={cn(
                      'block w-full text-left text-sm leading-6 whitespace-pre-wrap text-white/64 transition-colors hover:text-white/78 focus-visible:ring-2 focus-visible:ring-[#2563eb]/70 focus-visible:outline-none',
                      !promptExpanded && 'line-clamp-4'
                    )}
                  >
                    {selectedItem.prompt}
                  </button>
                </section>

                <section className="mt-4 rounded-xl bg-white/[0.07] p-4 ring-1 ring-white/[0.08]">
                  <h3 className="mb-2 text-xs font-bold tracking-normal text-white/46">
                    {copy.information}
                  </h3>
                  <InfoRow label={copy.clip} value={selectedItem.title} />
                  <InfoRow label={copy.model} value="Seedance 2.5" />
                  <InfoRow label={copy.mode} value={copy.modeValue} />
                  <InfoRow label={copy.source} value="Seedance 2.5" />
                </section>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href="/#create"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2563eb] text-sm font-bold text-[#111407] transition-colors hover:bg-[#60a5fa] focus-visible:ring-2 focus-visible:ring-[#2563eb]/70 focus-visible:outline-none"
                >
                  <Video className="size-4" />
                  {copy.generate}
                </Link>
                <a
                  href={selectedItem.src}
                  download={getDownloadName(selectedItem.src)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-semibold text-white/86 transition-colors hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-[#2563eb]/70 focus-visible:outline-none"
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
  );
}

export function SeedanceVideoGallerySection() {
  const locale = useCurrentLocale();
  const copy = seedanceCopyByLocale[locale] ?? seedanceCopyByLocale.en;
  const items = useMemo(() => seedanceVideos, []);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [transitionSourceRect, setTransitionSourceRect] =
    useState<PreviewTransitionRect | null>(null);

  return (
    <section className={cn(CONTENT_FRAME_CLASS, 'mt-16')}>
      <div className="mb-10 max-w-2xl">
        <h2 className="font-display text-3xl leading-tight font-semibold text-slate-950 md:text-5xl">
          {copy.title}
        </h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
          {copy.description}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              setTransitionSourceRect({
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
              });
              setSelectedIndex(0);
            }}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {copy.viewAll} <ChevronRight className="size-4" />
          </button>
          <Link
            href="/#create"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-blue-200 bg-white px-5 text-sm font-semibold text-blue-700 transition-colors hover:border-blue-400 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
          >
            {copy.generate} <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
        {items.map((item, index) => (
          <VideoTile
            key={item.src}
            item={item}
            index={index}
            copy={copy}
            className={cn(
              'mb-4 min-h-64 break-inside-avoid border-0 ring-0',
              index % 5 === 1 && 'min-h-80',
              index % 5 === 3 && 'min-h-96'
            )}
            onPreview={(sourceRect) => {
              setTransitionSourceRect(sourceRect);
              setSelectedIndex(index);
            }}
          />
        ))}
      </div>
      <VideoPreviewDialog
        items={items}
        selectedIndex={selectedIndex}
        onSelectedIndexChange={setSelectedIndex}
        copy={copy}
        sourceRect={transitionSourceRect}
      />
    </section>
  );
}
