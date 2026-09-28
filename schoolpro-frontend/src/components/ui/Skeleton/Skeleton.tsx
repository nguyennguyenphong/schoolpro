import {
  Skeleton as AntSkeleton,
} from "antd";

import type {
  SkeletonProps,
  SkeletonButtonProps,
  SkeletonAvatarProps,
  SkeletonInputProps,
  SkeletonNodeProps,
} from "@/components/ui/Skeleton/types";

export const Skeleton = (
  props: SkeletonProps,
) => {
  return (
    <AntSkeleton {...props} />
  );
};

Skeleton.displayName = "Skeleton";

export const SkeletonButton = (
  props: SkeletonButtonProps,
) => {
  return (
    <AntSkeleton.Button
      {...props}
    />
  );
};

SkeletonButton.displayName =
  "SkeletonButton";

export const SkeletonAvatar = (
  props: SkeletonAvatarProps,
) => {
  return (
    <AntSkeleton.Avatar
      {...props}
    />
  );
};

SkeletonAvatar.displayName =
  "SkeletonAvatar";

export const SkeletonInput = (
  props: SkeletonInputProps,
) => {
  return (
    <AntSkeleton.Input
      {...props}
    />
  );
};

SkeletonInput.displayName =
  "SkeletonInput";

export const SkeletonNode = (
  props: SkeletonNodeProps,
) => {
  return (
    <AntSkeleton.Node
      {...props}
    />
  );
};

SkeletonNode.displayName =
  "SkeletonNode";
