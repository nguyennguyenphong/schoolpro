import React from "react";
import { Alert as AntAlert } from "antd";
import type { AlertProps } from "@/components/ui/Alert/types";
import { alertStyles } from "@/components/ui/Alert/styles";

export const Alert: React.FC<AlertProps> & {
  ErrorBoundary: typeof AntAlert.ErrorBoundary;
} = ({ style, ...props }) => {
  return (
    <AntAlert
      {...props}
      style={{
        ...alertStyles,
        ...style,
      }}
    />
  );
};

Alert.displayName = "Alert";
Alert.ErrorBoundary = AntAlert.ErrorBoundary;
