import React from "react";
import { Form as AntForm } from "antd";
import type { FormProps } from "@/components/ui/Form/types";
import { formStyles } from "@/components/ui/Form/styles";

export interface FormComponent {
  <Values = any>(props: FormProps<Values>): React.ReactElement | null;
  displayName?: string;
  Item: typeof AntForm.Item;
  List: typeof AntForm.List;
  ErrorList: typeof AntForm.ErrorList;
  useForm: typeof AntForm.useForm;
  useWatch: typeof AntForm.useWatch;
  useFormInstance: typeof AntForm.useFormInstance;
  Provider: typeof AntForm.Provider;
}

const FormElement = AntForm as React.ComponentType<any>;

export const Form: FormComponent = (({ style, children, ...props }: FormProps) => {
  return (
    <FormElement
      {...props}
      style={{
        ...formStyles,
        ...style,
      }}
    >
      {children}
    </FormElement>
  );
}) as unknown as FormComponent;

Form.displayName = "Form";
Form.Item = AntForm.Item;
Form.List = AntForm.List;
Form.ErrorList = AntForm.ErrorList;
Form.useForm = AntForm.useForm;
Form.useWatch = AntForm.useWatch;
Form.useFormInstance = AntForm.useFormInstance;
Form.Provider = AntForm.Provider;
