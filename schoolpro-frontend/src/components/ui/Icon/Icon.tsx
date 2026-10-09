import {
  iconMap,
} from "@/components/ui/Icon/icons";

import type {
  IconProps,
} from "@/components/ui/Icon/types";

export const Icon = ({
  name,
  size = 20,
  strokeWidth = 2,
  absoluteStrokeWidth = false,
  ...props
}: IconProps) => {
  const IconComponent =
    iconMap[name] || iconMap["file"];

  if (!IconComponent) {
    return null;
  }

  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      absoluteStrokeWidth={
        absoluteStrokeWidth
      }
      aria-hidden={
        props["aria-label"]
          ? undefined
          : true
      }
      {...props}
    />
  );
};

Icon.displayName = "Icon";
