import React from "react";
import { Tag as AntTag } from "antd";
import type { TagProps } from "./types";
import { tagStyles } from "./styles";

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
