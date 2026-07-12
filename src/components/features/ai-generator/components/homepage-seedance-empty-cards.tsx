import Plus from 'lucide-react/dist/esm/icons/plus';
import Video from 'lucide-react/dist/esm/icons/video';
import { useState } from 'react';

import type { HeroReferenceRole } from './hero-reference-assets';
import {
  getHomepageReferenceEmptyCardOffset,
  getHomepageReferenceEmptyCardRotation,
  getHomepageReferenceUploadCardsWidth,
} from './homepage-seedance-reference-deck';

type EmptyCardRole = Extract<
  HeroReferenceRole,
  'first-frame' | 'last-frame' | 'reference-image' | 'reference-video'
>;

export function HomepageSeedanceEmptyCards({
  frameWorkflow,
  startLabel,
  endLabel,
  imageLabel,
  videoLabel,
  roles,
  direction = 'left',
  offsetRem = 0,
  isVisible = true,
  isPickerDisabled,
  onPick,
}: {
  frameWorkflow: boolean;
  startLabel: string;
  endLabel: string;
  imageLabel: string;
  videoLabel: string;
  roles: EmptyCardRole[];
  direction?: 'left' | 'right';
  offsetRem?: number;
  isVisible?: boolean;
  isPickerDisabled?: (role: EmptyCardRole) => boolean;
  onPick: (role: EmptyCardRole) => void;
}) {
  const labelByRole: Record<EmptyCardRole, string> = {
    'first-frame': startLabel,
    'last-frame': endLabel,
    'reference-image': imageLabel,
    'reference-video': videoLabel,
  };
  const [hoveredRole, setHoveredRole] = useState<EmptyCardRole | null>(null);

  return (
    <div
      className="absolute top-0 h-[5.8rem] shrink-0"
      style={{
        width: `${getHomepageReferenceUploadCardsWidth(roles.length)}rem`,
        left: `${offsetRem}rem`,
      }}
    >
      {roles.map((role, index) => {
        const Icon = role === 'reference-video' ? Video : Plus;
        return (
          <button
            key={role}
            type="button"
            disabled={isPickerDisabled?.(role)}
            aria-label={`Upload ${labelByRole[role]}`}
            onClick={() => onPick(role)}
            onMouseEnter={() => setHoveredRole(role)}
            onMouseLeave={() => setHoveredRole(null)}
            className="absolute top-1 grid h-[4.85rem] w-[3.75rem] cursor-pointer place-items-center rounded-lg border border-dashed border-blue-200 bg-white/88 text-slate-500 shadow-[0_10px_28px_rgba(15,23,42,0.08)] transition-[transform,opacity,border-color,background-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none"
            style={{
              left: `${getHomepageReferenceEmptyCardOffset(index)}rem`,
              opacity: isVisible ? 1 : 0,
              pointerEvents: isVisible ? 'auto' : 'none',
              transform: `rotate(${getHomepageReferenceEmptyCardRotation(index, direction)}deg) translateY(${index === 0 ? 2 : 0}px) scale(${hoveredRole === role ? 1.06 : 1})`,
            }}
          >
            <Icon className="size-5" />
            {frameWorkflow && (
              <span className="absolute bottom-1.5 text-[9px] font-bold text-slate-500 uppercase">
                {labelByRole[role]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
