import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(["card"]);

  return (
    <div className="space-y-2">
      <Input
        placeholder={question.placeholder || t("card:exams.question.inputPlaceholder")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
        className="w-full"
        allowClear
      />
    </div>
  );
};

