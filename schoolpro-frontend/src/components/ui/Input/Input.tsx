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

const BaseInput = ({
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

type CompoundedInput = typeof BaseInput & {
  displayName?: string;
  TextArea: typeof TextArea;
  Password: typeof Password;
  Search: typeof Search;
  OTP: typeof OTP;
};

const Compounded = BaseInput as CompoundedInput;
Compounded.displayName = "Input";
Compounded.TextArea = TextArea;
Compounded.Password = Password;
Compounded.Search = Search;
Compounded.OTP = OTP;

export { Compounded as Input };
