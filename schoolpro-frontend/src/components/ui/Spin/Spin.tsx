import {
  Spin as AntSpin,
} from "antd";

import type {
  SpinProps,
} from "@/components/ui/Spin/types";
import "@/components/ui/Spin/styles";

export const Spin = (
  props: SpinProps,
) => {
  return (
    <AntSpin {...props} />
  );
};

Spin.displayName = "Spin";
