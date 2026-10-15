import React from "react";
import { useTranslation } from "react-i18next";
import { Rate } from "@/components/ui/Rate";
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
  const { t } = useTranslation(["card"]);
  const max = question.ratingMax || 5;

  return (
    <div className="flex items-center gap-3 py-1">
      <Rate
        count={max}
        value={value}
        disabled={readOnly}
        onChange={(val) => {
          if (!readOnly) {
            onChange(val === value ? 0 : val);
          }
        }}
      />
      {value > 0 && (
        <span className="text-sm font-medium text-slate-600">
          {t("card:exams.question.starsCount", { value, max })}
        </span>
      )}
    </div>
  );
};

