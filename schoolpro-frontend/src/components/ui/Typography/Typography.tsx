import {
  forwardRef,
} from "react";

import {
  theme,
  Typography as AntTypography,
} from "antd";

import {
  TYPOGRAPHY_HEADINGS,
  TYPOGRAPHY_VARIANTS,
} from "@/components/ui/Typography/constants";

import {
  getTypographyStyle,
} from "@/components/ui/Typography/styles";

import type {
  TypographyProps,
} from "@/components/ui/Typography/types";

const BaseTypography = forwardRef<
  HTMLElement,
  TypographyProps
>(
  (
    {
      variant = "body",
      weight,
      style,
      ...props
    },
    ref,
  ) => {
    const { token } = theme.useToken();

    const variantConfig =
      TYPOGRAPHY_VARIANTS[variant];

    const typographyStyle = {
      ...getTypographyStyle(
        variant,
        token,
        weight,
      ),
      ...style,
    };

    if (variantConfig.element === "title") {
      const level =
        TYPOGRAPHY_HEADINGS[variant as keyof typeof TYPOGRAPHY_HEADINGS];

      return (
        <AntTypography.Title
          ref={ref as React.Ref<HTMLHeadingElement>}
          level={level}
          style={typographyStyle}
          {...props}
        />
      );
    }

    if (variantConfig.element === "link") {
      const { editable: _editable, copyable: _copyable, ellipsis, ...linkProps } = props;

      return (
        <AntTypography.Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          style={typographyStyle}
          ellipsis={typeof ellipsis === "boolean" ? ellipsis : undefined}
          {...linkProps}
        />
      );
    }

    return (
      <AntTypography.Text
        ref={ref as React.Ref<HTMLSpanElement>}
        style={typographyStyle}
        {...props}
      />
    );
  },
);

type CompoundedTypography = typeof BaseTypography & {
  Title: typeof AntTypography.Title;
  Text: typeof AntTypography.Text;
  Paragraph: typeof AntTypography.Paragraph;
  Link: typeof AntTypography.Link;
};

const Compounded = BaseTypography as CompoundedTypography;
Compounded.displayName = "Typography";
Compounded.Title = AntTypography.Title;
Compounded.Text = AntTypography.Text;
Compounded.Paragraph = AntTypography.Paragraph;
Compounded.Link = AntTypography.Link;

export { Compounded as Typography };
