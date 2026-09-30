import React from "react";
import { Timeline as AntTimeline } from "antd";
import type { TimelineProps } from "@/components/ui/Timeline/types";
import { timelineStyles } from "@/components/ui/Timeline/styles";

export const Timeline: React.FC<TimelineProps> & {
  Item: typeof AntTimeline.Item;
} = ({ style, ...props }) => {
  return (
    <AntTimeline
      {...props}
      style={{
        ...timelineStyles,
        ...style,
      }}
    />
  );
};

Timeline.displayName = "Timeline";
Timeline.Item = AntTimeline.Item;
