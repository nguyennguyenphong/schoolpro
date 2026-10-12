import { Popconfirm as AntPopconfirm } from "antd";
import type React from "react";
import { popconfirmStyles } from "@/components/ui/Popconfirm/styles";
import type { PopconfirmProps } from "@/components/ui/Popconfirm/types";

export const Popconfirm: React.FC<PopconfirmProps> = ({ style, ...props }) => {
  return (
    <AntPopconfirm
      {...props}
      style={{
        ...popconfirmStyles,
        ...style,
      }}
    />
  );
};

Popconfirm.displayName = "Popconfirm";
