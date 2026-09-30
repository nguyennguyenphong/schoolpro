import type { ButtonVariant } from "@/components/ui/Button/types";

export interface ButtonVariantConfig {
  type: "primary" | "default" | "text" | "link";
  danger?: boolean;
  ghost?: boolean;
}

export const BUTTON_VARIANTS: Record<
  ButtonVariant,
  ButtonVariantConfig
> = {
  primary: {
    type: "primary",
  },

  secondary: {
    type: "default",
  },

  outline: {
    type: "default",
  },

  ghost: {
    type: "text",
  },

  danger: {
    type: "primary",
    danger: true,
  },

  link: {
    type: "link",
  },
};
