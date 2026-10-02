export const AVATAR_SHAPES = ["circle", "square"] as const;

export type AvatarShape = (typeof AVATAR_SHAPES)[number];

export const AVATAR_SIZES = {
  xs: 20,
  sm: 24,
  default: 32,
  md: 40,
  lg: 48,
  xl: 64,
  "2xl": 80,
} as const;

export const DEFAULT_AVATAR_SHAPE: AvatarShape = "circle";
export const DEFAULT_AVATAR_SIZE = "default";
