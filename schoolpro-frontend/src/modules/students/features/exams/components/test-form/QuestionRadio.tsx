import React from "react";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { ExamQuestion } from "@/modules/students/features/exams/types";

interface QuestionRadioProps {
  question: ExamQuestion;
  value?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  correctAnswer?: string;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export const QuestionRadio: React.FC<QuestionRadioProps> = ({
  question,
  value,
  onChange,
  readOnly = false,
  correctAnswer,
}) => {
  const options = question.options || [];

  return (
    <div className="space-y-2.5">
      {options.map((option, index) => {
        const isSelected = value === option;
        const letter = OPTION_LETTERS[index] || String(index + 1);
        const isTargetCorrect = correctAnswer ? option.trim() === correctAnswer.trim() : false;

        // Microsoft / Google Form style classes
        let containerClass =
          "border-slate-200/90 bg-white hover:bg-slate-50/90 hover:border-slate-300 text-slate-800";
        let radioOuterClass = "border-slate-400 bg-white";
        let radioInnerClass = "hidden";

        if (isSelected) {
          containerClass =
            "border-blue-500 bg-blue-50/40 text-slate-900 shadow-2xs ring-1 ring-blue-500/30";
          radioOuterClass = "border-blue-600 bg-white";
          radioInnerClass = "w-2.5 h-2.5 rounded-full bg-blue-600";
        }

        if (readOnly) {
          if (isTargetCorrect) {
            containerClass =
              "border-emerald-500 bg-emerald-50/60 text-emerald-950 ring-1 ring-emerald-500/30";
            radioOuterClass = "border-emerald-600 bg-white";
            radioInnerClass = "w-2.5 h-2.5 rounded-full bg-emerald-600";
          } else if (isSelected && !isTargetCorrect) {
            containerClass =
              "border-rose-400 bg-rose-50/60 text-rose-950 ring-1 ring-rose-400/30";
            radioOuterClass = "border-rose-500 bg-white";
            radioInnerClass = "w-2.5 h-2.5 rounded-full bg-rose-500";
          } else {
            containerClass = "border-slate-200/70 bg-slate-50/30 opacity-60 text-slate-500";
            radioOuterClass = "border-slate-300 bg-white";
          }
        }

        return (
          <label
            key={index}
            onClick={() => {
              if (!readOnly) {
                onChange(option);
              }
            }}
            className={`flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl border transition-all select-none group ${
              readOnly ? "cursor-default" : "cursor-pointer"
            } ${containerClass}`}
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              {/* Circular Radio Button (Google Form / Microsoft Form standard) */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${radioOuterClass}`}
              >
                <span className={radioInnerClass} />
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

            {/* Native invisible radio for accessibility */}
            <input
              type="radio"
              name={`radio-${question.id}`}
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
