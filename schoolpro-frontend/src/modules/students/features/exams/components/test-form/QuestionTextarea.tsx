import React from "react";
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
    <div className="space-y-2">
      <textarea
        rows={4}
        placeholder={question.placeholder || "Nhập bài làm tự luận hoặc giải thích chi tiết..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
        className={`w-full text-sm sm:text-base p-3.5 rounded-xl border transition-all resize-y outline-none ${
          readOnly
            ? "bg-slate-50 border-slate-200 text-slate-800"
            : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        }`}
      />
      {!readOnly && (
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Câu trả lời dạng văn bản dài</span>
          <span>{value.length} ký tự</span>
        </div>
      )}
    </div>
  );
};
