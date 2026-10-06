import type {
  CardProps as AntCardProps,
} from "antd";
import type { SkeletonProps } from "@/components/ui/Skeleton";

export interface CardProps extends AntCardProps {
  skeletonProps?: SkeletonProps;
}
