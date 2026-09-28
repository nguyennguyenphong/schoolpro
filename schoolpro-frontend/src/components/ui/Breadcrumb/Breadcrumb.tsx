import React from "react";
import { Breadcrumb as AntBreadcrumb } from "antd";
import type { BreadcrumbProps } from "./types";
import { breadcrumbStyles } from "./styles";

export const Breadcrumb: React.FC<BreadcrumbProps> & {
  Item: typeof AntBreadcrumb.Item;
  Separator: typeof AntBreadcrumb.Separator;
} = ({ className = "", style, ...props }) => {
  return (
    <AntBreadcrumb
      {...props}
      style={{ ...breadcrumbStyles, ...style }}
      className={`custom-breadcrumb ${className}`.trim()}
    />
  );
};

Breadcrumb.displayName = "Breadcrumb";
Breadcrumb.Item = AntBreadcrumb.Item;
Breadcrumb.Separator = AntBreadcrumb.Separator;
