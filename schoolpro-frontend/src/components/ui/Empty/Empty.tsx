import React from "react";
import { Empty as AntEmpty } from "antd";
import type { EmptyProps } from "@/components/ui/Empty/types";

export const Empty: React.FC<EmptyProps> & {
  PRESENTED_IMAGE_DEFAULT: typeof AntEmpty.PRESENTED_IMAGE_DEFAULT;
  PRESENTED_IMAGE_SIMPLE: typeof AntEmpty.PRESENTED_IMAGE_SIMPLE;
} = (props) => {
  return <AntEmpty {...props} />;
};

Empty.displayName = "Empty";
Empty.PRESENTED_IMAGE_DEFAULT = AntEmpty.PRESENTED_IMAGE_DEFAULT;
Empty.PRESENTED_IMAGE_SIMPLE = AntEmpty.PRESENTED_IMAGE_SIMPLE;
