import type {
  FormProps as AntFormProps,
  FormItemProps as AntFormItemProps,
  FormInstance as AntFormInstance,
  Rule as AntRule,
} from "antd/es/form";

export type FormProps<T = any> = AntFormProps<T>;
export type FormItemProps<T = any> = AntFormItemProps<T>;
export type FormInstance<T = any> = AntFormInstance<T>;
export type Rule = AntRule;
