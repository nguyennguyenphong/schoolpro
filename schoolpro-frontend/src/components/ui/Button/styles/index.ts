import type { CSSProperties } from "react";
import type { GlobalToken } from "antd";

import type { ButtonVariant } from "@/components/ui/Button/types";

export const getButtonStyle = (
  variant: ButtonVariant,
  token: GlobalToken,
): CSSProperties => {
  const baseStyle: CSSProperties = {
    fontWeight: 500,
    fontSize: 13,
    borderRadius: 6,
  };

  switch (variant) {
    case "outline":
      return {
        ...baseStyle,
        color: token.colorPrimary,
        borderColor: token.colorPrimary,
        backgroundColor: token.colorBgContainer,
      };

    case "ghost":
      return {
        ...baseStyle,
        backgroundColor: "transparent",
        boxShadow: "none",
      };

    case "link":
      return {
        ...baseStyle,
        paddingInline: 4,
      };

    default:
      return baseStyle;
  }
};
