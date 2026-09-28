import React from "react";
import { Badge as AntBadge } from "antd";
import type { BadgeProps } from "./types";
import { badgeStyles } from "./styles";

export const Badge: React.FC<BadgeProps> & {
  Ribbon: typeof AntBadge.Ribbon;
} = ({ styles, ...props }) => {
  const mergedStyles =
    typeof styles === "function"
      ? (info: any) => {
          const resolved = styles(info);
          return {
            ...resolved,
            root: { ...badgeStyles, ...resolved?.root },
          };
        }
      : {
          ...styles,
          root: { ...badgeStyles, ...styles?.root },
        };

  return <AntBadge {...props} styles={mergedStyles} />;
};

Badge.displayName = "Badge";
Badge.Ribbon = AntBadge.Ribbon;
