import type { StepsProps as AntStepsProps } from "antd";

export type StepItemProps = NonNullable<AntStepsProps["items"]>[number];

export interface StepsProps extends AntStepsProps {
  className?: string;
}
