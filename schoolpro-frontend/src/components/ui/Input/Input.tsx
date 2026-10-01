import {
  Input as AntInput,
} from "antd";

import type {
  InputProps,
  PasswordProps,
  SearchProps,
  TextAreaProps,
  OTPProps,
} from "@/components/ui/Input/types";
import { inputStyles } from "@/components/ui/Input/styles";

export const Input = ({
  typeItem: _typeItem,
  formItemProps: _formItemProps,
  ...props
}: InputProps) => {
  return (
    <AntInput
      {...props}
      styles={{
        root: inputStyles,
      }}
    />
  );
};

Input.displayName = "Input";

export const Password = ({
  typeItem: _typeItem,
  formItemProps: _formItemProps,
  ...props
}: PasswordProps) => {
  return (
    <AntInput.Password
      {...props}
      styles={{
        root: inputStyles,
      }}
    />
  );
};

Password.displayName = "Password";

export const Search = ({
  typeItem: _typeItem,
  formItemProps: _formItemProps,
  ...props
}: SearchProps) => {
  return (
    <AntInput.Search
      {...props}
      styles={{
        root: inputStyles,
      }}
    />
  );
};

Search.displayName = "Search";

export const TextArea = ({
  typeItem: _typeItem,
  formItemProps: _formItemProps,
  ...props
}: TextAreaProps) => {
  return (
    <AntInput.TextArea
      {...props}
      styles={{
        root: inputStyles,
      }}
    />
  );
};

TextArea.displayName = "TextArea";

export const OTP = ({
  typeItem: _typeItem,
  formItemProps: _formItemProps,
  ...props
}: OTPProps) => {
  return (
    <AntInput.OTP
      {...props}
      styles={{
        root: inputStyles,
      }}
    />
  );
};

OTP.displayName = "OTP";
