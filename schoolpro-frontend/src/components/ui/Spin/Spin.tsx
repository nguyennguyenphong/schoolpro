import {
  Spin as AntSpin,
} from "antd";

import type {
  SpinProps,
} from "@/components/ui/Spin/types";
import "@/components/ui/Spin/styles";

export const Spin = ({
  role = "status",
  ...props
}: SpinProps & { role?: string }) => {
  const spinRole = props.spinning === false ? undefined : role;
  return (
    <AntSpin
      {...props}
      {...({ role: spinRole } as unknown as SpinProps)}
    />
  );
};

Spin.displayName = "Spin";
