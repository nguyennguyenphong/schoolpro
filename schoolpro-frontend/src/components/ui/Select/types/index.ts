import type { SelectProps as AntSelectProps } from "antd";

export type SelectProps<
  ValueType = any,
  OptionType extends Record<string, any> = Record<string, any>,
> = AntSelectProps<ValueType, OptionType>;
