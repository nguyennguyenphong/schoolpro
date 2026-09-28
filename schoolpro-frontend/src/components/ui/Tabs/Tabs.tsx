import {
  Tabs as AntTabs,
} from "antd";

import type {
  TabsProps,
} from "@/components/ui/Tabs/types";

export const Tabs = (props: TabsProps) => {
  return <AntTabs {...props} />;
};

Tabs.displayName = "Tabs";
