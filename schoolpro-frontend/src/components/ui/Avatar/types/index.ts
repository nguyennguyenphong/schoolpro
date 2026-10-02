import type { AvatarProps as AntAvatarProps } from "antd";
import type {
  AvatarGroupProps as AntAvatarGroupProps,
  AvatarGroupRef,
} from "antd/es/avatar/AvatarGroup";
import type { AvatarShape } from "@/components/ui/Avatar/constants";

export type { AvatarGroupRef };
export type { AvatarShape } from "@/components/ui/Avatar/constants";

export interface AvatarProps extends AntAvatarProps {
  /**
   * Defines shape of avatar: 'circle' or 'square'
   * @default "circle"
   */
  shape?: AvatarShape;
}

export type AvatarGroupProps = AntAvatarGroupProps;
