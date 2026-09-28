import type { ButtonProps as AntButtonProps } from "antd";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "link";

export type ButtonSize = NonNullable<AntButtonProps["size"]>;

export interface ButtonProps
  extends Omit<AntButtonProps, "type" | "size" | "danger" | "variant"> {
  /**
   * Defines the visual style of the button.
   *
   * @default "primary"
   */
  variant?: ButtonVariant;

  /**
   * Defines the size of the button.
   *
   * @default "middle"
   */
  size?: ButtonSize;

  /**
   * Makes the button take the full width of its container.
   *
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Applies danger styling to the button.
   */
  danger?: boolean;
}
