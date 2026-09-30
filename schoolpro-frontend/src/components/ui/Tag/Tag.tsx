import React from "react";
import { Tag as AntTag } from "antd";
import type { TagProps } from "@/components/ui/Tag/types";
import { tagStyles } from "@/components/ui/Tag/styles";

export const Tag: React.FC<TagProps> & {
  CheckableTag: typeof AntTag.CheckableTag;
} = ({ style, ...props }) => {
  return (
    <AntTag
      {...props}
      style={{
        ...tagStyles,
        ...style,
      }}
    />
  );
};

Tag.displayName = "Tag";
Tag.CheckableTag = AntTag.CheckableTag;
