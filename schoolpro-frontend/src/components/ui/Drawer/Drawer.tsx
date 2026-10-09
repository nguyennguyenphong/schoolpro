import React from "react";
import { Drawer as AntDrawer } from "antd";
import type { DrawerProps } from "@/components/ui/Drawer/types";

export const Drawer: React.FC<DrawerProps> = ({
  className = "",
  rootClassName = "",
  ...props
}) => {
  return (
    <AntDrawer
      className={className}
      rootClassName={`custom-drawer ${rootClassName}`.trim()}
      {...props}
    />
  );
};

Drawer.displayName = "Drawer";
