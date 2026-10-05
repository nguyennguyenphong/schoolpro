import React from "react";
import { Progress as AntProgress } from "antd";
import type { ProgressProps } from "@/components/ui/Progress/types";
import { progressStyles } from "@/components/ui/Progress/styles";

export const Progress: React.FC<ProgressProps> = ({ style, ...props }) => {
  return (
    <AntProgress
      {...props}
      style={{
        ...progressStyles,
        ...style,
      }}
    />
  );
};

Progress.displayName = "Progress";
