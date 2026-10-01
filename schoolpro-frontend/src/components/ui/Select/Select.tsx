import React, { forwardRef } from "react";
import { Select as AntSelect } from "antd";
import type {
  SelectProps,
  BaseOptionType,
  DefaultOptionType,
  RefSelectProps,
} from "@/components/ui/Select/types";
import { selectStyles } from "@/components/ui/Select/styles";

const InternalSelect = <
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
>(
  {
    className = "",
    styles,
    typeItem: _typeItem,
    formItemProps: _formItemProps,
    ...props
  }: SelectProps<ValueType, OptionType>,
  ref: React.Ref<RefSelectProps>,
) => {
  const mergedStyles =
    typeof styles === "function"
      ? (info: any) => {
          const resolved = styles(info);
          return {
            ...resolved,
            root: { ...selectStyles, ...resolved?.root },
          };
        }
      : {
          ...styles,
          root: { ...selectStyles, ...styles?.root },
        };

  return (
    <AntSelect<ValueType, OptionType>
      ref={ref}
      {...props}
      styles={mergedStyles}
      className={`schoolpro-select ${className}`.trim()}
    />
  );
};

const ForwardedSelect = forwardRef(InternalSelect) as unknown as (<
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
>(
  props: React.PropsWithChildren<SelectProps<ValueType, OptionType>> & {
    ref?: React.Ref<RefSelectProps>;
  },
) => React.ReactElement) & {
  displayName?: string;
  Option: typeof AntSelect.Option;
  OptGroup: typeof AntSelect.OptGroup;
};

ForwardedSelect.displayName = "Select";
ForwardedSelect.Option = AntSelect.Option;
ForwardedSelect.OptGroup = AntSelect.OptGroup;

export const Select = ForwardedSelect;
