import type {
  ComponentPropsWithoutRef,
} from "react";

import type {
  iconMap,
} from "@/components/ui/Icon/icons";

export type IconName =
  keyof typeof iconMap;

export interface IconProps
  extends ComponentPropsWithoutRef<"svg"> {
  name: IconName;
  size?: number | string;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
}
