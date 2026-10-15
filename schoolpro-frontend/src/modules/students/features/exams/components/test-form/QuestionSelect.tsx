import React from "react";
import { Select } from "@/components/ui/Select";
import type { ExamQuestion } from "@/modules/students/features/exams/types";

interface QuestionSelectProps {
  question: ExamQuestion;
  value?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  correctAnswer?: string;
}

export const QuestionSelect: React.FC<QuestionSelectProps> = ({
  question,
  value,
  onChange,
  readOnly = false,
}) => {
  const options = (question.options || []).map((opt) => ({
    label: opt,
    value: opt,
  }));

  return (
    <div className="space-y-1">
      <Select
        placeholder={question.placeholder || "Chọn câu trả lời từ danh sách"}
        value={value || undefined}
        onChange={(val) => onChange(String(val))}
        disabled={readOnly}
        options={options}
        className="w-full"
        allowClear
      />
    </div>
  );
};

