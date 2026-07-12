import { describe, expect, test } from 'bun:test';

import {
  getHomepageReferenceActionRoles,
  getHomepageReferenceAssetDeckWidth,
  getHomepageReferenceCardZIndex,
  canAddHomepageReferenceCard,
  getHomepageReferenceCardOffset,
  getHomepageReferenceCardVerticalOffset,
  getHomepageReferenceDeckWidth,
  getHomepageReferenceDisplayOrder,
  getHomepageReferenceEmptyCardRotation,
  getHomepageReferenceInlineUploadCardOffset,
  getHomepageReferenceInlineUploadCardRotation,
  isHomepageReferencePrimaryUploadHint,
  getHomepageReferenceUploadCardZIndex,
  isHomepageReferenceCardActive,
} from './homepage-seedance-reference-deck';

describe('Homepage Seedance reference actions', () => {
  test('keeps both upload cards in the collapsed reference deck', () => {
    expect(getHomepageReferenceActionRoles(false)).toEqual([
      'reference-image',
      'reference-video',
    ]);
  });

  test('keeps the same upload cards when the reference deck expands', () => {
    expect(getHomepageReferenceActionRoles(false)).toEqual([
      'reference-image',
      'reference-video',
    ]);
  });

  test('keeps the uploaded card positions stable while a later card is hovered', () => {
    const references = [{ id: 'first' }, { id: 'second' }, { id: 'third' }];

    expect(
      getHomepageReferenceDisplayOrder(references, 'second').map(
        (reference) => reference.id
      )
    ).toEqual(['first', 'second', 'third']);
  });

  test('keeps the most recently uploaded card on top in the collapsed stack', () => {
    expect(
      isHomepageReferencePrimaryUploadHint({
        cardCount: 3,
        displayIndex: 2,
        isExpanded: false,
        isEnabled: true,
      })
    ).toBe(true);
    expect(
      isHomepageReferencePrimaryUploadHint({
        cardCount: 3,
        displayIndex: 0,
        isExpanded: false,
        isEnabled: true,
      })
    ).toBe(false);
  });

  test('fans cards out without changing their order while a reference is hovered', () => {
    expect(getHomepageReferenceCardOffset(1, 0)).toBeCloseTo(3.2);
    expect(getHomepageReferenceCardOffset(2, 1)).toBeGreaterThan(
      getHomepageReferenceCardOffset(2, -1)
    );
  });

  test('keeps the collapsed image stack at its initial horizontal position', () => {
    expect(getHomepageReferenceCardOffset(8, -1)).toBe(0);
    expect(getHomepageReferenceCardVerticalOffset(1, false)).toBeLessThan(0);
    expect(getHomepageReferenceCardVerticalOffset(2, false)).toBeGreaterThan(0);
    expect(getHomepageReferenceCardVerticalOffset(2, true)).toBe(0);
  });

  test('keeps every supported image in the expanded accordion', () => {
    expect(
      getHomepageReferenceAssetDeckWidth({
        cardCount: 9,
        isAssetHovered: true,
      })
    ).toBeCloseTo(29.85);
  });

  test('places the available image upload card at the end of the accordion', () => {
    expect(getHomepageReferenceInlineUploadCardOffset(9)).toBeCloseTo(28.8);
  });

  test('hides the image upload card when the selected model limit is reached', () => {
    expect(canAddHomepageReferenceCard({ cardCount: 8, limit: 9 })).toBe(true);
    expect(canAddHomepageReferenceCard({ cardCount: 9, limit: 9 })).toBe(false);
  });

  test('uses the same expanded arrangement regardless of the hovered card', () => {
    const firstHover = [0, 1, 2].map((index) =>
      getHomepageReferenceCardOffset(index, 0)
    );
    const lastHover = [0, 1, 2].map((index) =>
      getHomepageReferenceCardOffset(index, 2)
    );

    expect(lastHover).toEqual(firstHover);
  });

  test('keeps the video upload deck at the initial position beside any collapsed image stack', () => {
    expect(
      getHomepageReferenceDeckWidth({
        imageCardCount: 3,
        videoCardCount: 0,
        frameWorkflow: false,
      })
    ).toBeCloseTo(9.17);
  });

  test('keeps an active reference card above the inline upload card', () => {
    expect(
      getHomepageReferenceCardZIndex({
        cardCount: 4,
        isActive: true,
        isPrimaryUploadHint: false,
        displayIndex: 3,
      })
    ).toBeGreaterThan(
      getHomepageReferenceUploadCardZIndex({
        cardCount: 4,
        isHovered: false,
      })
    );
  });

  test('raises a hovered upload card above the last reference card', () => {
    expect(
      getHomepageReferenceUploadCardZIndex({
        cardCount: 4,
        isHovered: true,
      })
    ).toBeGreaterThan(
      getHomepageReferenceCardZIndex({
        cardCount: 4,
        isActive: true,
        isPrimaryUploadHint: false,
        displayIndex: 3,
      })
    );
    expect(getHomepageReferenceInlineUploadCardRotation(3)).toBeCloseTo(4);
    expect(
      getHomepageReferenceInlineUploadCardRotation(3, 'right')
    ).toBeCloseTo(-4);
  });

  test('keeps a collapsed video accordion at its initial footprint', () => {
    expect(
      getHomepageReferenceDeckWidth({
        imageCardCount: 0,
        videoCardCount: 3,
        frameWorkflow: false,
      })
    ).toBeCloseTo(9.17);
  });

  test('reserves separate space for initial upload cards', () => {
    expect(
      getHomepageReferenceDeckWidth({
        imageCardCount: 0,
        videoCardCount: 0,
        frameWorkflow: false,
      })
    ).toBeCloseTo(9.17);
  });

  test('opens the image and video upload cards toward opposite sides', () => {
    expect(getHomepageReferenceEmptyCardRotation(0, 'left')).toBeLessThan(0);
    expect(getHomepageReferenceEmptyCardRotation(0, 'right')).toBeGreaterThan(
      0
    );
  });

  test('activates the card under the pointer instead of the first card', () => {
    expect(
      isHomepageReferenceCardActive({
        assetId: 'second',
        hoveredAssetId: 'second',
      })
    ).toBe(true);
  });
});
