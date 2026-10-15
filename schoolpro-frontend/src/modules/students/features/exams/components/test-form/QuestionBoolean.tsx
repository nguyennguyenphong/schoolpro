import React from "react";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { ExamQuestion } from "@/modules/students/features/exams/types";

interface QuestionBooleanProps {
  question: ExamQuestion;
  value?: boolean;
  onChange: (value: boolean) => void;
  readOnly?: boolean;
  correctAnswer?: boolean;
}

export const QuestionBoolean: React.FC<QuestionBooleanProps> = ({
  question,
  value,
  onChange,
  readOnly = false,
  correctAnswer,
}) => {
  const options = [
    { label: "Đúng (True)", val: true },
    { label: "Sai (False)", val: false },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((opt) => {
        const isSelected = value === opt.val;
        const isTargetCorrect = correctAnswer === opt.val;

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
            key={String(opt.val)}
            onClick={() => {
              if (!readOnly) {
                onChange(opt.val);
              }
            }}
            className={`flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl border transition-all select-none group ${
              readOnly ? "cursor-default" : "cursor-pointer"
            } ${containerClass}`}
          >
            <div className="flex items-center gap-3">
              {/* Circular Radio Button */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${radioOuterClass}`}
              >
                <span className={radioInnerClass} />
              </div>
              <span className="text-sm sm:text-base font-semibold">{opt.label}</span>
            </div>

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
                    <span>Đã chọn</span>
                  </Tag>
                )}
              </div>
            )}

            <input
              type="radio"
              name={`boolean-${question.id}`}
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
