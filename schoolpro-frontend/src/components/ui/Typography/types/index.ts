import type { TextProps } from "antd/es/typography/Text";
import type { TitleProps } from "antd/es/typography/Title";
import type { ParagraphProps } from "antd/es/typography/Paragraph";
import type { LinkProps } from "antd/es/typography/Link";

export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "body"
  | "body-sm"
  | "caption"
  | "label"
  | "secondary"
  | "link";

export type TypographyWeight =
  | "regular"
  | "medium"
  | "semibold"
  | "bold";

type BaseTypographyProps = Omit<TextProps, "type" | "style"> & {
  weight?: TypographyWeight;
  style?: React.CSSProperties;
};

export type TypographyProps = BaseTypographyProps & (
  | {
      variant?: Exclude<TypographyVariant, "link">;
      href?: never;
    }
  | {
      variant: "link";
      href?: string;
    } & Omit<LinkProps, keyof BaseTypographyProps>
);

export type TypographyTitleProps = Omit<
  TitleProps,
  "level"
> & {
  variant?: Extract<
    TypographyVariant,
    "h1" | "h2" | "h3" | "h4" | "h5"
  >;
};

export type TypographyLinkProps = LinkProps;
export type TypographyParagraphProps = ParagraphProps;
