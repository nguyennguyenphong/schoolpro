import type { CSSProperties } from "react";
import type { GlobalToken } from "antd";

import type {
  TypographyVariant,
  TypographyWeight,
} from "@/components/ui/Typography/types";

import {
  TYPOGRAPHY_WEIGHTS,
} from "@/components/ui/Typography/constants";

export const getTypographyStyle = (
  variant: TypographyVariant,
  token: GlobalToken,
  weight?: TypographyWeight,
): CSSProperties => {
  const style: CSSProperties = {};

  switch (variant) {
    case "h1":
      style.fontSize = token.fontSizeHeading1;
      style.lineHeight = token.lineHeightHeading1;
      style.color = token.colorTextHeading;
      break;

    case "h2":
      style.fontSize = token.fontSizeHeading2;
      style.lineHeight = token.lineHeightHeading2;
      style.color = token.colorTextHeading;
      break;

    case "h3":
      style.fontSize = token.fontSizeHeading3;
      style.lineHeight = token.lineHeightHeading3;
      style.color = token.colorTextHeading;
      break;

    case "h4":
      style.fontSize = token.fontSizeHeading4;
      style.lineHeight = token.lineHeightHeading4;
      style.color = token.colorTextHeading;
      break;

    case "h5":
      style.fontSize = token.fontSizeHeading5;
      style.lineHeight = token.lineHeightHeading5;
      style.color = token.colorTextHeading;
      break;

    case "body":
      style.fontSize = token.fontSize;
      style.lineHeight = token.lineHeight;
      style.color = token.colorText;
      break;

    case "body-sm":
      style.fontSize = token.fontSizeSM;
      style.lineHeight = token.lineHeightSM;
      style.color = token.colorText;
      break;

    case "caption":
      style.fontSize = token.fontSizeSM;
      style.lineHeight = token.lineHeightSM;
      style.color = token.colorTextTertiary;
      break;

    case "label":
      style.fontSize = token.fontSize;
      style.lineHeight = token.lineHeight;
      style.color = token.colorText;
      style.fontWeight = TYPOGRAPHY_WEIGHTS.semibold;
      break;

    case "secondary":
      style.fontSize = token.fontSize;
      style.lineHeight = token.lineHeight;
      style.color = token.colorTextSecondary;
      break;

    case "link":
      style.fontSize = token.fontSize;
      style.lineHeight = token.lineHeight;
      style.color = token.colorLink;
      break;

    default:
      break;
  }

  if (weight) {
    style.fontWeight = TYPOGRAPHY_WEIGHTS[weight];
  }

  return style;
};
