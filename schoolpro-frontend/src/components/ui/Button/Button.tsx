import { forwardRef } from "react";
import { Button as AntButton, theme } from "antd";

import { BUTTON_VARIANTS } from "@/components/ui/Button/constants";
import { getButtonStyle } from "@/components/ui/Button/styles";
import type { ButtonProps } from "@/components/ui/Button/types";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "middle",
      fullWidth = false,
      danger = false,
      style,
      ...props
    },
    ref,
  ) => {
    const { token } = theme.useToken();

    const variantConfig = BUTTON_VARIANTS[variant];

    const buttonStyle = getButtonStyle(variant, token);

    return (
      <AntButton
        ref={ref}
        {...props}
        type={variantConfig.type}
        size={size}
        danger={danger || variantConfig.danger}
        ghost={variantConfig.ghost}
        style={{
          ...buttonStyle,
          ...(fullWidth && {
            width: "100%",
          }),
          ...style,
        }}
      />
    );
  },
);

Button.displayName = "Button";
