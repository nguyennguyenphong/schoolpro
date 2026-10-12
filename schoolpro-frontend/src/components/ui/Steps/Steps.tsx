import { Steps as AntSteps } from "antd";
import type React from "react";
import { stepsStyles } from "@/components/ui/Steps/styles";
import type { StepsProps } from "@/components/ui/Steps/types";

export const Steps: React.FC<StepsProps> = ({ style, ...props }) => {
  return (
    <AntSteps
      {...props}
      style={{
        ...stepsStyles,
        ...style,
      }}
    />
  );
};

Steps.displayName = "Steps";
