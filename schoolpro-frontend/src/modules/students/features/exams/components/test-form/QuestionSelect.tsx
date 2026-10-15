import React from "react";
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
  value = "",
  onChange,
  readOnly = false,
  correctAnswer,
}) => {
  const options = question.options || [];
  const isMatch = readOnly && correctAnswer && value === correctAnswer;

  return (
    <div className="space-y-2">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
        className={`w-full text-sm sm:text-base px-3.5 py-2.5 rounded-xl border bg-white cursor-pointer outline-none transition-all ${
          readOnly
            ? isMatch
              ? "bg-emerald-50/70 border-emerald-500 text-emerald-900 font-semibold cursor-default"
              : "bg-rose-50/70 border-rose-400 text-rose-900 font-semibold cursor-default"
            : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        }`}
      >
        <option value="">-- Chọn câu trả lời từ danh sách --</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};
