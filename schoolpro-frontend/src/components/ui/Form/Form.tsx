import React from "react";
import { Form as AntForm } from "antd";
import type { FormProps } from "@/components/ui/Form/types";
import { formStyles } from "@/components/ui/Form/styles";

interface FormComponent extends React.FC<FormProps> {
  Item: typeof AntForm.Item;
  List: typeof AntForm.List;
  ErrorList: typeof AntForm.ErrorList;
  useForm: typeof AntForm.useForm;
  useWatch: typeof AntForm.useWatch;
  useFormInstance: typeof AntForm.useFormInstance;
  Provider: typeof AntForm.Provider;
}

export const Form: FormComponent = (({ style, ...props }: FormProps) => {
  return (
    <AntForm
      {...props}
      style={{
        ...formStyles,
        ...style,
      }}
    />
  );
}) as FormComponent;

Form.displayName = "Form";
Form.Item = AntForm.Item;
Form.List = AntForm.List;
Form.ErrorList = AntForm.ErrorList;
Form.useForm = AntForm.useForm;
Form.useWatch = AntForm.useWatch;
Form.useFormInstance = AntForm.useFormInstance;
Form.Provider = AntForm.Provider;
