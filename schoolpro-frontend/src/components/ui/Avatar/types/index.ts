import type { AvatarProps as AntAvatarProps } from "antd";
import type { AvatarGroupProps as AntAvatarGroupProps } from "antd/es/avatar";
import type { AvatarShape } from "@/components/ui/Avatar/constants";

export type { AvatarGroupRef } from "antd/es/avatar";
export type { AvatarShape } from "@/components/ui/Avatar/constants";

export interface AvatarProps extends AntAvatarProps {
  /**
   * Defines shape of avatar: 'circle' or 'square'
   * @default "circle"
   */
  shape?: AvatarShape;
}

export type AvatarGroupProps = AntAvatarGroupProps;
