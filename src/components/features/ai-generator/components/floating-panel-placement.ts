type FloatingRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type FloatingPanelPlacement = {
  left: number;
  top: number;
  maxHeight: number;
  origin: string;
};

export function getFloatingPanelPlacement({
  viewportWidth,
  viewportHeight,
  rootRect,
  triggerRect,
  panelRect,
  margin = 12,
  gap = 8,
  maxPanelHeight = 560,
}: {
  viewportWidth: number;
  viewportHeight: number;
  rootRect: FloatingRect;
  triggerRect: FloatingRect;
  panelRect: FloatingRect;
  margin?: number;
  gap?: number;
  maxPanelHeight?: number;
}): FloatingPanelPlacement {
  const panelWidth = panelRect.width;
  const panelHeight = Math.min(panelRect.height, maxPanelHeight);
  const triggerCenter = triggerRect.left + triggerRect.width / 2;
  const minViewportLeft = Math.max(margin, rootRect.left + margin);
  const maxViewportLeft = Math.max(
    minViewportLeft,
    Math.min(
      viewportWidth - panelWidth - margin,
      rootRect.left + rootRect.width - panelWidth - margin
    )
  );
  const viewportLeft = clamp(
    triggerCenter - panelWidth / 2,
    minViewportLeft,
    maxViewportLeft
  );

  const triggerTop = triggerRect.top;
  const triggerBottom = triggerRect.top + triggerRect.height;
  const availableAbove = Math.max(0, triggerTop - margin - gap);
  const availableBelow = Math.max(
    0,
    viewportHeight - triggerBottom - margin - gap
  );
  const placeAbove =
    panelHeight > availableBelow && availableAbove > availableBelow;
  const availableHeight = placeAbove ? availableAbove : availableBelow;
  const maxHeight = Math.min(
    maxPanelHeight,
    panelRect.height,
    Math.max(0, availableHeight)
  );
  const visiblePanelHeight = Math.min(panelHeight, maxHeight || panelHeight);
  const viewportTop = placeAbove
    ? Math.max(margin, triggerTop - gap - visiblePanelHeight)
    : Math.min(
        triggerBottom + gap,
        viewportHeight - margin - visiblePanelHeight
      );

  return {
    left: viewportLeft - rootRect.left,
    top: viewportTop - rootRect.top,
    maxHeight,
    origin: placeAbove ? 'bottom center' : 'top center',
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
