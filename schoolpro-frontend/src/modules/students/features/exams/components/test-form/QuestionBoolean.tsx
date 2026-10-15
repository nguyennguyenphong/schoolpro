import React from "react";
import { Radio } from "antd";
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
  return (
    <Radio.Group
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={readOnly}
    >
      <div className="flex items-center gap-6">
        <Radio value={true} className="text-sm text-slate-800">
          Đúng (True)
        </Radio>
        <Radio value={false} className="text-sm text-slate-800">
          Sai (False)
        </Radio>

        {readOnly && correctAnswer !== undefined && (
          <Tag color="success" className="font-semibold m-0 text-xs">
            Đáp án đúng: {correctAnswer ? "Đúng" : "Sai"}
          </Tag>
        )}
      </div>
    </Radio.Group>
  );
};

