import {
  Checkbox as AntCheckbox,
} from "antd";

import type {
  CheckboxProps,
} from "@/components/ui/Checkbox/types";
import { checkboxStyles } from "@/components/ui/Checkbox/styles";

export const Checkbox = (
  props: CheckboxProps,
) => {
  const { styles, className = "", ...rest } = props;

  const mergedStyles = typeof styles === "function"
    ? (info: any) => {
        const resolved = styles(info);
        return {
          ...resolved,
          root: { ...checkboxStyles, ...resolved?.root },
          icon: { borderRadius: 3, ...resolved?.icon },
        };
      }
    : {
        ...styles,
        root: { ...checkboxStyles, ...styles?.root },
        icon: { borderRadius: 3, ...styles?.icon },
      };

  return (
    <AntCheckbox
      {...rest}
      styles={mergedStyles}
      className={`custom-checkbox ${className}`.trim()}
    />
  );
};

Checkbox.displayName = "Checkbox";

Checkbox.Group = AntCheckbox.Group;
