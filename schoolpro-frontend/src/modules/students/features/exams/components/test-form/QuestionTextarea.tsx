import React from "react";
import { Input } from "@/components/ui/Input";
import type { ExamQuestion } from "@/modules/students/features/exams/types";

interface QuestionTextareaProps {
  question: ExamQuestion;
  value?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export const QuestionTextarea: React.FC<QuestionTextareaProps> = ({
  question,
  value = "",
  onChange,
  readOnly = false,
}) => {
  return (
    <div className="space-y-1">
      <Input.TextArea
        rows={4}
        placeholder={question.placeholder || "Nhập câu trả lời tự luận của bạn"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
        className="w-full"
      />
      {!readOnly && (
        <div className="text-right text-xs text-slate-400 mt-1">
          <span>{value.length} ký tự</span>
        </div>
      )}
    </div>
  );
};

