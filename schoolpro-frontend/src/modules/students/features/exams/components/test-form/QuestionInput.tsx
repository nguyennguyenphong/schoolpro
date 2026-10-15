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
  correctAnswer,
}) => {
  const isMatch =
    readOnly &&
    correctAnswer &&
    value.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          placeholder={question.placeholder || "Nhập câu trả lời của bạn vào đây..."}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
          className={`w-full text-sm sm:text-base px-3.5 py-2.5 rounded-xl transition-all ${
            readOnly
              ? isMatch
                ? "bg-emerald-50/70 border-emerald-500 text-emerald-900 font-semibold"
                : "bg-rose-50/70 border-rose-400 text-rose-900 font-semibold"
              : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          }`}
        />
      </div>
      {!readOnly && (
        <p className="text-xs text-slate-400 flex items-center justify-between">
          <span>Nhập chính xác từ khóa hoặc số cần điền</span>
          <span>{value.length} ký tự</span>
        </p>
      )}
    </div>
  );
};
