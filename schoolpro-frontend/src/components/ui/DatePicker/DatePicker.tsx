import {
  DatePicker as AntDatePicker,
} from "antd";

import type {
  DatePickerProps,
  RangePickerProps,
} from "@/components/ui/DatePicker/types";

export const DatePicker = (
  props: DatePickerProps,
) => {
  return (
    <AntDatePicker {...props} />
  );
};

DatePicker.displayName = "DatePicker";

export const RangePicker = (
  props: RangePickerProps,
) => {
  return (
    <AntDatePicker.RangePicker
      {...props}
    />
  );
};

RangePicker.displayName = "RangePicker";
