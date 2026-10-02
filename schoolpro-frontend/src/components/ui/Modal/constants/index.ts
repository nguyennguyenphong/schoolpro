export const MODAL_SIZES = {
  sm: 400,
  md: 520,
  lg: 800,
  xl: 1000,
} as const;

export type ModalSize = keyof typeof MODAL_SIZES;

export const DEFAULT_MODAL_WIDTH = MODAL_SIZES.md;
