import {
  Skeleton as AntSkeleton,
} from "antd";

import type {
  SkeletonProps as AntSkeletonProps,
} from "antd";

export type SkeletonProps =
  AntSkeletonProps;

export type SkeletonButtonProps =
  React.ComponentProps<
    typeof AntSkeleton.Button
  >;

export type SkeletonAvatarProps =
  React.ComponentProps<
    typeof AntSkeleton.Avatar
  >;

export type SkeletonInputProps =
  React.ComponentProps<
    typeof AntSkeleton.Input
  >;

export type SkeletonNodeProps =
  React.ComponentProps<
    typeof AntSkeleton.Node
  >;
