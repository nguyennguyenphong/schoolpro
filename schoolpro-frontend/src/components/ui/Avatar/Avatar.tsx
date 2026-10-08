import { forwardRef } from "react";
import { Avatar as AntAvatar } from "antd";

import type { AvatarProps, AvatarGroupProps } from "@/components/ui/Avatar/types";
import { avatarStyles, avatarGroupStyles } from "@/components/ui/Avatar/styles";

const InternalAvatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ style, className = "", shape = "circle", src, ...props }, ref) => {
    // Prevent browser warnings when empty string is passed as src attribute
    const safeSrc = typeof src === "string" && src.trim() === "" ? undefined : src;

    return (
      <AntAvatar
        ref={ref}
        src={safeSrc}
        shape={shape}
        style={{
          ...avatarStyles,
          ...style,
        }}
        className={`custom-avatar ${className}`.trim()}
        {...props}
      />
    );
  },
);

InternalAvatar.displayName = "Avatar";

const Group = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ style, className = "", ...props }, ref) => {
    return (
      <AntAvatar.Group
        ref={ref as any}
        style={{
          ...avatarGroupStyles,
          ...style,
        }}
        className={`custom-avatar-group ${className}`.trim()}
        {...props}
      />
    );
  },
);

Group.displayName = "AvatarGroup";

export const Avatar = InternalAvatar as typeof InternalAvatar & {
  Group: typeof Group;
};

Avatar.Group = Group;
