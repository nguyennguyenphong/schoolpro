import type {
  TypographyVariant,
  TypographyWeight,
} from "@/components/ui/Typography/types";

export const TYPOGRAPHY_WEIGHTS: Record<
  TypographyWeight,
  number
> = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

export const TYPOGRAPHY_HEADINGS = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
} as const;

export const TYPOGRAPHY_VARIANTS: Record<
  TypographyVariant,
  {
    element:
      | "title"
      | "text"
      | "paragraph"
      | "link";
  }
> = {
  h1: {
    element: "title",
  },

  h2: {
    element: "title",
  },

  h3: {
    element: "title",
  },

  h4: {
    element: "title",
  },

  h5: {
    element: "title",
  },

  body: {
    element: "text",
  },

  "body-sm": {
    element: "text",
  },

  caption: {
    element: "text",
  },

  label: {
    element: "text",
  },

  secondary: {
    element: "text",
  },

  link: {
    element: "link",
  },
};
