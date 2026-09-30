import {
  Rate as AntRate,
} from "antd";

import type {
  RateProps,
} from "@/components/ui/Rate/types";

export const Rate = (
  props: RateProps,
) => {
  return (
    <AntRate {...props} />
  );
};

Rate.displayName = "Rate";
