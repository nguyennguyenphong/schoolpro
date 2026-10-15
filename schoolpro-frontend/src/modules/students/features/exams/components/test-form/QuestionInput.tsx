import React from "react";
import { Input } from "@/components/ui/Input";
import type { ExamQuestion } from "@/modules/students/features/exams/types";

interface QuestionInputProps {
  question: ExamQuestion;
  value?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  correctAnswer?: string;
}

export const QuestionInput: React.FC<QuestionInputProps> = ({
  question,
  value = "",
  onChange,
  readOnly = false,
}) => {
  return (
    <div className="space-y-2">
      <Input
        placeholder={question.placeholder || "Nhập câu trả lời của bạn vào đây"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
        className="w-full"
        allowClear
      />
    </div>
  );
};

