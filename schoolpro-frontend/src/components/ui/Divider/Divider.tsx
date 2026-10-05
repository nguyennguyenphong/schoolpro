import React from "react";
import { Divider as AntDivider } from "antd";
import type { DividerProps } from "@/components/ui/Divider/types";
import { dividerStyles } from "@/components/ui/Divider/styles";

export const Divider: React.FC<DividerProps> = ({ style, ...props }) => {
  return (
    <AntDivider
      {...props}
      style={{
        ...dividerStyles,
        ...style,
      }}
    />
  );
};

Divider.displayName = "Divider";
