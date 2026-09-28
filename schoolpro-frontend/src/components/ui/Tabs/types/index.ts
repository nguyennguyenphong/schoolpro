import type {
  TabsProps as AntTabsProps,
} from "antd";

export type TabsProps = AntTabsProps;

export type TabsItems = NonNullable<
  AntTabsProps["items"]
>;

export type TabsItem = TabsItems[number];

export type TabsActiveKey =
  NonNullable<AntTabsProps["activeKey"]>;
