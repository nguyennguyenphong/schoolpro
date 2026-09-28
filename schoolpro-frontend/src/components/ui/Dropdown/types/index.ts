import type { DropdownProps as AntDropdownProps } from "antd";

export type DropdownTrigger = NonNullable<
  AntDropdownProps["trigger"]
>[number];

export type DropdownPlacement = NonNullable<
  AntDropdownProps["placement"]
>;

export interface DropdownProps extends AntDropdownProps {
  /**
   * Defines the interaction trigger for opening the dropdown.
   *
   * @default "hover"
   */
  trigger?: AntDropdownProps["trigger"];
}
