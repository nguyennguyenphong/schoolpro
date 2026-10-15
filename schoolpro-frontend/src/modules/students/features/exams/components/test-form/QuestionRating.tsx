import React from "react";
import { Rate } from "antd";
import type { ExamQuestion } from "@/modules/students/features/exams/types";

interface QuestionRatingProps {
  question: ExamQuestion;
  value?: number;
  onChange: (value: number) => void;
  readOnly?: boolean;
}

export const QuestionRating: React.FC<QuestionRatingProps> = ({
  question,
  value = 0,
  onChange,
  readOnly = false,
}) => {
  const max = question.ratingMax || 5;

  return (
    <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Thang điểm đánh giá (1 - {max} sao)
        </span>
        <div className="flex items-center gap-3">
          <Rate
            count={max}
            value={value}
            disabled={readOnly}
            onChange={(val) => {
              if (!readOnly) {
                onChange(val === value ? 0 : val);
              }
            }}
            className="text-amber-500 text-xl"
          />
          {value > 0 && (
            <span className="text-sm font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
              {value} / {max} sao
            </span>
          )}
        </div>
      </div>
      <div className="text-xs text-slate-400 font-medium">
        {value === 0 ? "Chưa đánh giá" : value <= 2 ? "Cần cải thiện" : value <= 4 ? "Khá / Tốt" : "Xuất sắc"}
      </div>
    </div>
  );
};
