import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(["card"]);

  return (
    <div className="space-y-1">
      <Input.TextArea
        rows={4}
        placeholder={question.placeholder || t("card:exams.question.textareaPlaceholder")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
        className="w-full"
      />
      {!readOnly && (
        <div className="text-right text-xs text-slate-400 mt-1">
          <span>{t("card:exams.question.charactersCount", { count: value.length })}</span>
        </div>
      )}
    </div>
  );
};

