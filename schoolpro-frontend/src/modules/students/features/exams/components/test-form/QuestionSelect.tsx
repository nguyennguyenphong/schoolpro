import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation(["card"]);
  const options = (question.options || []).map((opt) => ({
    label: opt,
    value: opt,
  }));
  const placeholder =
    question.placeholder && i18n.language === "vi"
      ? question.placeholder
      : t("card:exams.question.selectPlaceholder");

  return (
    <div className="space-y-1">
      <Select
        placeholder={placeholder}
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

