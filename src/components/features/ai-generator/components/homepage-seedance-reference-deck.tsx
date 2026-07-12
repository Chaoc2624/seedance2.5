import FileAudio from 'lucide-react/dist/esm/icons/file-audio';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Video from 'lucide-react/dist/esm/icons/video';
import X from 'lucide-react/dist/esm/icons/x';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import type { HeroLocalAsset } from './hero-creation-form';
import type { HeroCreationFormCopy } from './hero-creation-form-i18n';
import type { HeroReferenceRole } from './hero-reference-assets';
import type { SeedanceReferenceKind } from './seedance-reference-media';

export type HomepageSeedancePickerTarget = HeroReferenceRole;

const CARD_ANGLES = [-8, 7, -4, 8, -6, 5, -3, 7, -5];
const CARD_STACK_VERTICAL_STEP_REM = 0.07;
const CARD_ACCORDION_STEP_REM = 3.2;
const CARD_WIDTH_REM = 3.75;
const DECK_EDGE_PADDING_REM = 0.5;
const EMPTY_ACTION_CARD_GAP_REM = 0.4;
export const HOMEPAGE_REFERENCE_GROUP_GAP_REM = 2 / 3;

export function getHomepageReferenceCardOffset(
  displayIndex: number,
  hoveredAssetIndex: number
) {
  return hoveredAssetIndex >= 0 ? displayIndex * CARD_ACCORDION_STEP_REM : 0;
}

export function getHomepageReferenceCardVerticalOffset(
  displayIndex: number,
  isExpanded: boolean
) {
  if (isExpanded || displayIndex === 0) return 0;

  const direction = displayIndex % 2 === 0 ? 1 : -1;
  return direction * Math.min(displayIndex, 3) * CARD_STACK_VERTICAL_STEP_REM;
}

export function getHomepageReferenceKind(
  role: HomepageSeedancePickerTarget
): SeedanceReferenceKind {
  if (role === 'reference-video') return 'video';
  if (role === 'reference-audio') return 'audio';
  return 'image';
}

export function getHomepageReferenceLabel(
  role: HomepageSeedancePickerTarget,
  copy: HeroCreationFormCopy
) {
  if (role === 'first-frame') return copy.upload.start;
  if (role === 'last-frame') return copy.upload.end;
  if (role === 'reference-video') return copy.upload.video;
  if (role === 'reference-audio') return copy.upload.audio;
  return copy.upload.image;
}

export function getHomepageReferenceActionRoles(
  frameWorkflow: boolean
): HomepageSeedancePickerTarget[] {
  if (frameWorkflow) return ['first-frame', 'last-frame'];
  return ['reference-image', 'reference-video'];
}

export function getHomepageReferenceEmptyCardOffset(index: number) {
  return index * (CARD_WIDTH_REM + EMPTY_ACTION_CARD_GAP_REM);
}

export function getHomepageReferenceEmptyCardRotation(
  index: number,
  direction: 'left' | 'right'
) {
  const rotation = index === 0 ? -7 : 7;
  return direction === 'left' ? rotation : -rotation;
}

export function getHomepageReferenceUploadCardsWidth(cardCount: number) {
  return (
    getHomepageReferenceEmptyCardOffset(Math.max(0, cardCount - 1)) +
    CARD_WIDTH_REM +
    DECK_EDGE_PADDING_REM
  );
}

export function getHomepageReferenceAssetDeckWidth({
  cardCount,
  isAssetHovered,
}: {
  cardCount: number;
  isAssetHovered: boolean;
}) {
  const normalizedCardCount = Math.max(cardCount, 0);
  if (normalizedCardCount === 0) return 0;

  return (
    getHomepageReferenceCardOffset(
      normalizedCardCount - 1,
      isAssetHovered ? 0 : -1
    ) +
    CARD_WIDTH_REM +
    DECK_EDGE_PADDING_REM
  );
}

export function getHomepageReferenceInlineUploadCardOffset(cardCount: number) {
  return getHomepageReferenceCardOffset(Math.max(cardCount, 0), 0);
}

export function getHomepageReferenceInlineUploadCardRotation(
  cardCount: number,
  direction: 'left' | 'right' = 'left'
) {
  const lastCardIndex = Math.max(cardCount - 1, 0);
  const lastCardRotation = CARD_ANGLES[lastCardIndex % CARD_ANGLES.length];
  const directionRotation =
    direction === 'left' ? lastCardRotation : -lastCardRotation;
  return -directionRotation;
}

export function getHomepageReferenceCardZIndex({
  cardCount,
  displayIndex,
  isActive,
  isPrimaryUploadHint,
}: {
  cardCount: number;
  displayIndex: number;
  isActive: boolean;
  isPrimaryUploadHint: boolean;
}) {
  if (isActive) return cardCount + 2;
  if (isPrimaryUploadHint) return cardCount + 1;
  return displayIndex + 1;
}

export function getHomepageReferenceUploadCardZIndex({
  cardCount,
  isHovered,
}: {
  cardCount: number;
  isHovered: boolean;
}) {
  return isHovered ? cardCount + 3 : 0;
}

export function canAddHomepageReferenceCard({
  cardCount,
  limit,
}: {
  cardCount: number;
  limit: number;
}) {
  return cardCount < limit;
}

export function getHomepageReferenceUploadDeckOffset({
  cardCount,
  isAssetHovered,
}: {
  cardCount: number;
  isAssetHovered: boolean;
}) {
  const assetDeckWidth = getHomepageReferenceAssetDeckWidth({
    cardCount,
    isAssetHovered,
  });
  return assetDeckWidth;
}

export function getHomepageReferenceMediaDeckLayout({
  cardCount,
  isAssetHovered,
  uploadCardCount,
}: {
  cardCount: number;
  isAssetHovered: boolean;
  uploadCardCount: number;
}) {
  const assetDeckWidth = getHomepageReferenceAssetDeckWidth({
    cardCount,
    isAssetHovered,
  });
  const uploadDeckOffset = getHomepageReferenceUploadDeckOffset({
    cardCount,
    isAssetHovered,
  });
  const uploadDeckWidth = getHomepageReferenceUploadCardsWidth(uploadCardCount);

  return {
    assetDeckWidth,
    uploadDeckOffset,
    width: uploadDeckOffset + uploadDeckWidth,
  };
}

export function getHomepageReferenceStaticMediaDeckLayout({
  cardCount,
  uploadCardCount,
  hideUploadWhenAssetsPresent = false,
}: {
  cardCount: number;
  uploadCardCount: number;
  hideUploadWhenAssetsPresent?: boolean;
}) {
  const deck = getHomepageReferenceMediaDeckLayout({
    cardCount,
    isAssetHovered: false,
    uploadCardCount,
  });

  if (!hideUploadWhenAssetsPresent || cardCount === 0) return deck;

  return {
    ...deck,
    width: getHomepageReferenceAssetDeckWidth({
      cardCount: 1,
      isAssetHovered: false,
    }),
  };
}

export function getHomepageReferenceDeckWidth({
  imageCardCount,
  videoCardCount,
  frameWorkflow,
}: {
  imageCardCount: number;
  videoCardCount: number;
  frameWorkflow: boolean;
}) {
  const imageDeck = getHomepageReferenceStaticMediaDeckLayout({
    cardCount: imageCardCount,
    uploadCardCount: frameWorkflow ? 2 : 1,
    hideUploadWhenAssetsPresent: !frameWorkflow,
  });
  const videoDeckWidth = frameWorkflow
    ? 0
    : getHomepageReferenceStaticMediaDeckLayout({
        cardCount: videoCardCount,
        uploadCardCount: 1,
        hideUploadWhenAssetsPresent: true,
      }).width;
  return (
    imageDeck.width +
    (videoDeckWidth > 0 ? HOMEPAGE_REFERENCE_GROUP_GAP_REM + videoDeckWidth : 0)
  );
}

export function getHomepageReferenceDisplayOrder<T extends { id: string }>(
  assets: T[],
  _hoveredAssetId: string | null
) {
  return assets;
}

export function isHomepageReferenceCardActive({
  assetId,
  hoveredAssetId,
}: {
  assetId: string;
  hoveredAssetId: string | null;
}) {
  return assetId === hoveredAssetId;
}

export function isHomepageReferencePrimaryUploadHint({
  cardCount,
  displayIndex,
  isExpanded,
  isEnabled,
}: {
  cardCount: number;
  displayIndex: number;
  isExpanded: boolean;
  isEnabled: boolean;
}) {
  return isEnabled && !isExpanded && displayIndex === cardCount - 1;
}

export function HomepageSeedanceReferenceDeck({
  assets,
  offsetRem = 0,
  hoveredAssetId,
  isExpanded,
  showPrimaryUploadHint = false,
  uploadHintAriaLabel = 'Upload another reference',
  direction = 'left',
  onHoveredAssetChange,
  onAdd,
  uploadAction,
  onPreview,
  onRemove,
}: {
  assets: HeroLocalAsset[];
  offsetRem?: number;
  hoveredAssetId: string | null;
  isExpanded: boolean;
  showPrimaryUploadHint?: boolean;
  uploadHintAriaLabel?: string;
  direction?: 'left' | 'right';
  onHoveredAssetChange: (id: string | null) => void;
  onAdd?: () => void;
  uploadAction?: {
    ariaLabel: string;
    onPick: () => void;
  };
  onPreview: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const visibleAssets = assets;
  const [isUploadCardHovered, setIsUploadCardHovered] = useState(false);
  const displayedAssets = getHomepageReferenceDisplayOrder(
    visibleAssets,
    hoveredAssetId
  );

  return (
    <div
      className="absolute top-0 h-[5.5rem]"
      style={{ left: `${offsetRem}rem` }}
    >
      {displayedAssets.map((asset, displayIndex) => {
        const originalIndex = visibleAssets.findIndex(
          (visibleAsset) => visibleAsset.id === asset.id
        );
        const isActive = isHomepageReferenceCardActive({
          assetId: asset.id,
          hoveredAssetId,
        });
        const isPrimaryUploadHint = isHomepageReferencePrimaryUploadHint({
          cardCount: visibleAssets.length,
          displayIndex,
          isExpanded,
          isEnabled: showPrimaryUploadHint,
        });
        const horizontalOffset = getHomepageReferenceCardOffset(
          displayIndex,
          isExpanded ? 0 : -1
        );
        const verticalOffset = getHomepageReferenceCardVerticalOffset(
          displayIndex,
          isExpanded
        );
        const rotation = CARD_ANGLES[originalIndex % CARD_ANGLES.length];
        const directionalRotation = direction === 'left' ? rotation : -rotation;

        return (
          <div
            key={asset.id}
            onMouseEnter={() => onHoveredAssetChange(asset.id)}
            onClick={() => onPreview(asset.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onPreview(asset.id);
              }
            }}
            role="button"
            tabIndex={0}
            className={cn(
              'group absolute top-1 left-1 h-[4.85rem] w-[3.75rem] cursor-pointer overflow-hidden rounded-lg border border-white bg-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.2)] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none motion-reduce:transition-none'
            )}
            style={{
              zIndex: getHomepageReferenceCardZIndex({
                cardCount: visibleAssets.length,
                displayIndex,
                isActive,
                isPrimaryUploadHint,
              }),
              transform: `translate(${horizontalOffset}rem, ${verticalOffset}rem) rotate(${directionalRotation}deg) scale(${isActive ? 1.06 : 1})`,
            }}
          >
            {asset.mediaType === 'image' || asset.posterUrl ? (
              <img
                src={asset.posterUrl ?? asset.previewUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <span className="flex size-full flex-col items-center justify-center gap-1 bg-slate-900 text-white">
                {asset.mediaType === 'video' ? (
                  <Video className="size-5" />
                ) : (
                  <FileAudio className="size-5" />
                )}
                <span className="max-w-12 truncate text-[8px] font-semibold">
                  {asset.file?.name ?? asset.slotLabel}
                </span>
              </span>
            )}
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute inset-0 bg-slate-700/45 transition-opacity duration-200',
                isActive ? 'opacity-100' : 'opacity-0'
              )}
            />
            {asset.mediaType === 'video' && !isExpanded ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-1 bottom-1 z-10 grid size-6 place-items-center rounded-full bg-slate-950/85 text-white shadow-sm"
              >
                <Video className="size-3.5" />
              </span>
            ) : null}
            {isPrimaryUploadHint && onAdd ? (
              <button
                type="button"
                aria-label={uploadHintAriaLabel}
                onClick={(event) => {
                  event.stopPropagation();
                  onAdd();
                }}
                className="absolute top-1/2 left-1/2 z-10 grid size-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-slate-950/82 text-white shadow-lg transition-[transform,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110 hover:bg-slate-950 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none motion-reduce:transition-none"
              >
                <Plus className="size-4" />
              </button>
            ) : null}
            <button
              type="button"
              aria-label={`Remove ${asset.slotLabel}`}
              onClick={(event) => {
                event.stopPropagation();
                onRemove(asset.id);
              }}
              className={cn(
                'absolute -top-1 -right-1 z-20 grid size-5 cursor-pointer place-items-center text-white drop-shadow-[0_1px_2px_rgba(15,23,42,0.9)] transition-opacity focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none',
                isActive ? 'opacity-100' : 'opacity-0'
              )}
            >
              <X className="size-3" />
            </button>
          </div>
        );
      })}
      {uploadAction && isExpanded && (
        <button
          type="button"
          aria-label={uploadAction.ariaLabel}
          onClick={uploadAction.onPick}
          onMouseEnter={() => {
            onHoveredAssetChange(null);
            setIsUploadCardHovered(true);
          }}
          onMouseLeave={() => setIsUploadCardHovered(false)}
          className="absolute top-1 left-1 grid h-[4.85rem] w-[3.75rem] cursor-pointer place-items-center rounded-lg border border-dashed border-blue-200 bg-white/88 text-slate-500 shadow-[0_10px_28px_rgba(15,23,42,0.08)] transition-[transform,border-color,background-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none motion-reduce:transition-none"
          style={{
            zIndex: getHomepageReferenceUploadCardZIndex({
              cardCount: visibleAssets.length,
              isHovered: isUploadCardHovered,
            }),
            transform: `translateX(${getHomepageReferenceInlineUploadCardOffset(visibleAssets.length)}rem) rotate(${getHomepageReferenceInlineUploadCardRotation(visibleAssets.length, direction)}deg) scale(${isUploadCardHovered ? 1.06 : 1})`,
          }}
        >
          <Plus className="size-5" />
        </button>
      )}
    </div>
  );
}
