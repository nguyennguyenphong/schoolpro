import { useTranslation } from "react-i18next";
import { Radio, RadioGroup } from "@/components/ui/Radio";
import { Tag } from "@/components/ui/Tag";
import type { ExamQuestion } from "@/modules/students/features/exams/types";

interface QuestionBooleanProps {
  question: ExamQuestion;
  value?: boolean;
  onChange: (value: boolean) => void;
  readOnly?: boolean;
  correctAnswer?: boolean;
}

export const QuestionBoolean: React.FC<QuestionBooleanProps> = ({
  value,
  onChange,
  readOnly = false,
  correctAnswer,
}) => {
  const { t } = useTranslation(["card"]);

  return (
    <RadioGroup
      value={typeof value === "boolean" ? value : null}
      onChange={(e) => onChange(e.target.value as boolean)}
      disabled={readOnly}
    >
      <div className="flex items-center gap-6">
        <Radio value={true} className="text-sm text-slate-800">
          {t("card:exams.question.booleanTrue")}
        </Radio>
        <Radio value={false} className="text-sm text-slate-800">
          {t("card:exams.question.booleanFalse")}
        </Radio>

        {readOnly && correctAnswer !== undefined && (
          <Tag color="success" className="font-semibold m-0 text-xs">
            {t("card:exams.question.correctAnswerIs", {
              answer: correctAnswer
                ? t("card:exams.question.booleanTrue")
                : t("card:exams.question.booleanFalse"),
            })}
          </Tag>
        )}
      </div>
    </RadioGroup>
  );
};

