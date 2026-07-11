export type HeaderPosition = 'top' | 'left';

export const DEFAULT_HEADER_POSITION: HeaderPosition = 'top';
export const SIDE_HEADER_COLLAPSED_WIDTH = 68;
export const SIDE_HEADER_EXPANDED_WIDTH = 208;

export function normalizeHeaderPosition(
  value: string | null | undefined
): HeaderPosition {
  return value === 'left' ? 'left' : DEFAULT_HEADER_POSITION;
}
