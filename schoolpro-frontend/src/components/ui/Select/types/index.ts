import type { SelectProps as AntSelectProps } from "antd";
import type {
  BaseOptionType,
  DefaultOptionType,
  RefSelectProps,
} from "antd/es/select";
import type { FormItemProps } from "antd";

export type { BaseOptionType, DefaultOptionType, RefSelectProps };

export type BaseCustomSelectProps = {
  typeItem?: "none" | "form";
  formItemProps?: FormItemProps;
};

export interface SelectProps<
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
> extends AntSelectProps<ValueType, OptionType>,
    BaseCustomSelectProps {}
