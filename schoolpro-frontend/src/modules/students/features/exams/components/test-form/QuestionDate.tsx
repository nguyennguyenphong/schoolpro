import React from "react";
import dayjs from "dayjs";
import { DatePicker } from "@/components/ui/DatePicker";
import type { ExamQuestion } from "@/modules/students/features/exams/types";

interface QuestionDateProps {
  question: ExamQuestion;
  value?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export const QuestionDate: React.FC<QuestionDateProps> = ({
  value = "",
  onChange,
  readOnly = false,
}) => {
  return (
    <div className="space-y-2">
      <DatePicker
        value={value ? dayjs(value) : null}
        disabled={readOnly}
        onChange={(date) => {
          if (date && !Array.isArray(date)) {
            onChange(date.format("YYYY-MM-DD"));
          } else {
            onChange("");
          }
        }}
        format="DD/MM/YYYY"
        placeholder="Chọn ngày..."
        className="w-full max-w-xs"
      />
    </div>
  );
};

