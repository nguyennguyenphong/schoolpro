import React from "react";
import { Radio } from "antd";
import { Tag } from "@/components/ui/Tag";
import type { ExamQuestion } from "@/modules/students/features/exams/types";
import { OPTION_LETTERS } from "@/modules/students/features/exams/utils";

interface QuestionRadioProps {
  question: ExamQuestion;
  value?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  correctAnswer?: string;
}

export const QuestionRadio: React.FC<QuestionRadioProps> = ({
  question,
  value,
  onChange,
  readOnly = false,
  correctAnswer,
}) => {
  const options = question.options || [];

  return (
    <Radio.Group
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={readOnly}
      className="w-full"
    >
      <div className="flex flex-col gap-2 w-full">
        {options.map((option, index) => {
          const letter = OPTION_LETTERS[index] || String(index + 1);
          const isTargetCorrect = correctAnswer ? option.trim() === correctAnswer.trim() : false;
          const isSelected = value === option;

          return (
            <div
              key={index}
              className="flex items-center justify-between gap-2 p-1 rounded"
            >
              <Radio value={option} className="text-sm text-slate-800">
                <span className="font-semibold text-slate-600 mr-2">{letter}.</span>
                <span>{option}</span>
              </Radio>

              {readOnly && (
                <div className="shrink-0">
                  {isTargetCorrect && (
                    <Tag color="success" className="font-semibold m-0 text-xs">
                      Đáp án đúng
                    </Tag>
                  )}
                  {isSelected && !isTargetCorrect && (
                    <Tag color="error" className="font-semibold m-0 text-xs">
                      Đã chọn
                    </Tag>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Radio.Group>
  );
};
