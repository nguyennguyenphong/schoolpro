import type { CheckboxProps as AntCheckboxProps } from "antd";
import type { CheckboxGroupProps } from "antd/es/checkbox";

export type CheckboxProps = AntCheckboxProps & {
  Group?: React.FC<CheckboxGroupProps>;
};

export type CheckboxValue = NonNullable<AntCheckboxProps["value"]>;
