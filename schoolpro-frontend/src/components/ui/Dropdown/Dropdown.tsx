import { Dropdown as AntDropdown } from "antd";

import type { DropdownProps } from "@/components/ui/Dropdown/types";
import { dropdownStyles } from "@/components/ui/Dropdown/styles";

export const Dropdown = ({
  menu,
  styles,
  rootClassName = "",
  ...props
}: DropdownProps) => {
  const mergedStyles =
    typeof styles === "function"
      ? (info: any) => {
          const resolved = styles(info);
          return {
            ...resolved,
            root: { ...dropdownStyles, ...resolved?.root },
          };
        }
      : {
          ...styles,
          root: { ...dropdownStyles, ...styles?.root },
        };

  const mergedMenu = menu
    ? {
        ...menu,
        style: {
          borderRadius: 6,
          backdropFilter: "none",
          WebkitBackdropFilter: "none",
          filter: "none",
          ...menu.style,
        },
      }
    : undefined;

  return (
    <AntDropdown
      {...props}
      menu={mergedMenu}
      styles={mergedStyles}
      rootClassName={`custom-dropdown ${rootClassName}`.trim()}
    />
  );
};

Dropdown.displayName = "Dropdown";
