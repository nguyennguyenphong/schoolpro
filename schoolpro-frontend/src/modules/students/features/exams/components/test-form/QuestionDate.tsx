import React from "react";
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
      <input
        type="date"
        value={value}
        disabled={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full max-w-xs text-sm sm:text-base px-3.5 py-2.5 rounded-xl border bg-white outline-none transition-all ${
          readOnly
            ? "bg-slate-50 border-slate-200 text-slate-700 cursor-default"
            : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        }`}
      />
    </div>
  );
};
