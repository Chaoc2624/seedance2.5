import { gsap } from 'gsap';
import { useEffect, useLayoutEffect, type RefObject } from 'react';

export type PreviewTransitionRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type PreviewTransitionOptions = {
  openKey: string | number | null;
  sourceRect: PreviewTransitionRect | null;
  previewRef: RefObject<HTMLElement | null>;
  sidePanelRef: RefObject<HTMLElement | null>;
};

const useBrowserLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function usePreviewEnterTransition({
  openKey,
  sourceRect,
  previewRef,
  sidePanelRef,
}: PreviewTransitionOptions) {
  useBrowserLayoutEffect(() => {
    if (openKey === null) return;

    const preview = previewRef.current;
    const sidePanel = sidePanelRef.current;
    if (!preview || !sidePanel) return;

    if (prefersReducedMotion()) {
      preview.style.opacity = '1';
      sidePanel.style.opacity = '1';
      return;
    }

    const targetRect = preview.getBoundingClientRect();
    const source = sourceRect ?? targetRect;
    const sourceCenterX = source.left + source.width / 2;
    const sourceCenterY = source.top + source.height / 2;
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    const scaleX = source.width / Math.max(targetRect.width, 1);
    const scaleY = source.height / Math.max(targetRect.height, 1);
    const startX = sourceCenterX - targetCenterX;
    const startY = sourceCenterY - targetCenterY;

    const context = gsap.context(() => {
      gsap.set(preview, {
        autoAlpha: 0,
        transformOrigin: '50% 50%',
        x: startX,
        y: startY,
        scaleX,
        scaleY,
        borderRadius: 18,
        willChange: 'transform, opacity',
      });
      gsap.set(sidePanel, {
        autoAlpha: 0,
        xPercent: 100,
        willChange: 'transform, opacity',
      });

      gsap
        .timeline({ defaults: { ease: 'power3.out', overwrite: 'auto' } })
        .to(
          preview,
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            borderRadius: 12,
            duration: 0.52,
            clearProps: 'transform,visibility,willChange',
          },
          0
        )
        .to(
          sidePanel,
          {
            autoAlpha: 1,
            xPercent: 0,
            duration: 0.42,
            clearProps: 'transform,visibility,willChange',
          },
          0.1
        );
    });

    return () => context.revert();
  }, [openKey, previewRef, sidePanelRef, sourceRect]);
}
