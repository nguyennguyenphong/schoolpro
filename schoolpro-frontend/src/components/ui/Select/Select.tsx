import { Select as AntSelect } from "antd";
import type { SelectProps } from "@/components/ui/Select/types";
import { selectStyles } from "@/components/ui/Select/styles";

export const Select = <
  ValueType = any,
  OptionType extends Record<string, any> = Record<string, any>,
>(
  props: SelectProps<ValueType, OptionType>,
) => {
  return <AntSelect {...props} style={selectStyles} />;
};

Select.displayName = "Select";
Select.Option = AntSelect.Option;
Select.OptGroup = AntSelect.OptGroup;
