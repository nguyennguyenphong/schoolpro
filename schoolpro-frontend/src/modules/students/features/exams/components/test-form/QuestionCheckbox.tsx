import React from "react";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { ExamQuestion } from "@/modules/students/features/exams/types";

interface QuestionCheckboxProps {
  question: ExamQuestion;
  value?: string[];
  onChange: (value: string[]) => void;
  readOnly?: boolean;
  correctAnswer?: string[];
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export const QuestionCheckbox: React.FC<QuestionCheckboxProps> = ({
  question,
  value = [],
  onChange,
  readOnly = false,
  correctAnswer = [],
}) => {
  const options = question.options || [];

  const handleToggle = (option: string) => {
    if (readOnly) return;
    const next = [...value];
    const index = next.indexOf(option);
    if (index > -1) {
      next.splice(index, 1);
    } else {
      next.push(option);
    }
    onChange(next);
  };

  return (
    <div className="space-y-2.5">
      {options.map((option, index) => {
        const isSelected = value.includes(option);
        const letter = OPTION_LETTERS[index] || String(index + 1);
        const isTargetCorrect = correctAnswer.some(
          (c) => c.trim().toLowerCase() === option.trim().toLowerCase()
        );

        let containerClass =
          "border-slate-200/90 bg-white hover:bg-slate-50/90 hover:border-slate-300 text-slate-800";
        let checkOuterClass = "border-slate-400 bg-white text-transparent";

        if (isSelected) {
          containerClass =
            "border-blue-500 bg-blue-50/40 text-slate-900 shadow-2xs ring-1 ring-blue-500/30";
          checkOuterClass = "border-blue-600 bg-blue-600 text-white";
        }

        if (readOnly) {
          if (isTargetCorrect) {
            containerClass =
              "border-emerald-500 bg-emerald-50/60 text-emerald-950 ring-1 ring-emerald-500/30";
            checkOuterClass = "border-emerald-600 bg-emerald-600 text-white";
          } else if (isSelected && !isTargetCorrect) {
            containerClass =
              "border-rose-400 bg-rose-50/60 text-rose-950 ring-1 ring-rose-400/30";
            checkOuterClass = "border-rose-500 bg-rose-500 text-white";
          } else {
            containerClass = "border-slate-200/70 bg-slate-50/30 opacity-60 text-slate-500";
            checkOuterClass = "border-slate-300 bg-white text-transparent";
          }
        }

        return (
          <label
            key={index}
            onClick={() => handleToggle(option)}
            className={`flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl border transition-all select-none group ${
              readOnly ? "cursor-default" : "cursor-pointer"
            } ${containerClass}`}
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              {/* Square Checkbox (Google Form / Microsoft Form standard) */}
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${checkOuterClass}`}
              >
                <Icon name="check" size={13} />
              </div>

              {/* Option Letter (A., B., C., D.) & Option text */}
              <div className="text-sm sm:text-base font-normal leading-relaxed text-slate-800 flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-600 shrink-0">{letter}.</span>
                <span className="font-medium text-slate-900">{option}</span>
              </div>
            </div>

            {/* Read-only Feedback Badges */}
            {readOnly && (
              <div className="shrink-0">
                {isTargetCorrect && (
                  <Tag color="success" className="font-bold text-xs m-0 flex items-center gap-1">
                    <Icon name="checkCircle" size={12} />
                    <span>Đáp án đúng</span>
                  </Tag>
                )}
                {isSelected && !isTargetCorrect && (
                  <Tag color="error" className="font-bold text-xs m-0 flex items-center gap-1">
                    <Icon name="close" size={12} />
                    <span>Lựa chọn của bạn</span>
                  </Tag>
                )}
              </div>
            )}

            <input
              type="checkbox"
              checked={isSelected}
              disabled={readOnly}
              onChange={() => {}}
              className="sr-only"
            />
          </label>
        );
      })}
    </div>
  );
};
