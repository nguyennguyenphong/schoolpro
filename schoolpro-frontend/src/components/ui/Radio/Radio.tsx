import {
  Radio as AntRadio,
} from "antd";

import type {
  RadioGroupProps,
  RadioProps,
} from "@/components/ui/Radio/types";

export const Radio = (
  props: RadioProps,
) => {
  return (
    <AntRadio {...props} />
  );
};

Radio.displayName = "Radio";

export const RadioGroup = (
  props: RadioGroupProps,
) => {
  return (
    <AntRadio.Group {...props} />
  );
};

RadioGroup.displayName = "RadioGroup";
