import { describe, expect, test } from 'bun:test';

import { getFloatingPanelPlacement } from './floating-panel-placement';

describe('getFloatingPanelPlacement', () => {
  test('places the panel above the trigger when the trigger is near the viewport bottom', () => {
    const placement = getFloatingPanelPlacement({
      viewportWidth: 1440,
      viewportHeight: 900,
      rootRect: {
        left: 220,
        top: 720,
        width: 1000,
        height: 164,
      },
      triggerRect: {
        left: 520,
        top: 820,
        width: 260,
        height: 44,
      },
      panelRect: {
        left: 0,
        top: 0,
        width: 760,
        height: 360,
      },
    });

    expect(placement.origin).toBe('bottom center');
    expect(placement.top).toBeLessThan(0);
    expect(placement.top + 720).toBeGreaterThanOrEqual(12);
    expect(placement.maxHeight).toBe(360);
  });

  test('keeps the panel inside the visible root boundary', () => {
    const placement = getFloatingPanelPlacement({
      viewportWidth: 2048,
      viewportHeight: 1000,
      rootRect: {
        left: 333,
        top: 120,
        width: 1500,
        height: 760,
      },
      triggerRect: {
        left: 420,
        top: 700,
        width: 280,
        height: 46,
      },
      panelRect: {
        left: 0,
        top: 0,
        width: 620,
        height: 380,
      },
    });

    expect(placement.left + 333).toBeGreaterThanOrEqual(345);
  });
});
