import React from "react";
import { Switch as AntSwitch } from "antd";
import type { SwitchProps } from "@/components/ui/Switch/types";
import { switchStyles } from "@/components/ui/Switch/styles";

export const Switch: React.FC<SwitchProps> = ({ style, ...props }) => {
  return (
    <AntSwitch
      {...props}
      style={{
        ...switchStyles,
        ...style,
      }}
    />
  );
};

Switch.displayName = "Switch";
