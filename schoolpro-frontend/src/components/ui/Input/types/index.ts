import type { InputProps as AntInputProps } from "antd";
import type { PasswordProps as AntPasswordProps, SearchProps as AntSearchProps, TextAreaProps as AntTextAreaProps } from "antd/es/input";
import type { OTPProps as AntOTPProps } from "antd/es/input/OTP";
import type { FormItemProps } from "antd";

export type BaseCustomInputProps = {
  typeItem?: "none" | "form";
  formItemProps?: FormItemProps;
};

export type InputProps = AntInputProps & BaseCustomInputProps;

export type PasswordProps = AntPasswordProps & BaseCustomInputProps;

export type SearchProps = AntSearchProps & BaseCustomInputProps;

export type TextAreaProps = AntTextAreaProps & BaseCustomInputProps;

export type OTPProps = AntOTPProps & BaseCustomInputProps;
