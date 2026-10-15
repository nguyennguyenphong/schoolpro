import React from "react";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { ExamQuestion } from "@/modules/students/features/exams/types";
import { QuestionRadio } from "./QuestionRadio";
import { QuestionCheckbox } from "./QuestionCheckbox";
import { QuestionInput } from "./QuestionInput";
import { QuestionTextarea } from "./QuestionTextarea";
import { QuestionSelect } from "./QuestionSelect";
import { QuestionRating } from "./QuestionRating";
import { QuestionBoolean } from "./QuestionBoolean";
import { QuestionDate } from "./QuestionDate";

interface QuestionCardProps {
  question: ExamQuestion;
  index: number;
  value?: number | string | string[] | boolean;
  onChange: (value: number | string | string[] | boolean) => void;
  readOnly?: boolean;
  isCorrect?: boolean | null;
  awardedScore?: number;
}


export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  value,
  onChange,
  readOnly = false,
  isCorrect,
  awardedScore,
}) => {
  const points = question.points ?? 1.0;
  const normalizedType =
    question.type === "single_choice"
      ? "radio"
      : question.type === "multiple_choice"
      ? "checkbox"
      : question.type;

  // Auto-evaluate correctness if readOnly and not explicitly passed
  let effectiveIsCorrect = isCorrect;
  if (
    readOnly &&
    effectiveIsCorrect === undefined &&
    question.correctAnswer !== undefined &&
    value !== undefined
  ) {
    if (normalizedType === "radio" || normalizedType === "select") {
      effectiveIsCorrect = String(value).trim() === String(question.correctAnswer).trim();
    } else if (normalizedType === "checkbox") {
      if (Array.isArray(value) && Array.isArray(question.correctAnswer)) {
        effectiveIsCorrect =
          value.length === question.correctAnswer.length &&
          value.every((v) => (question.correctAnswer as string[]).includes(v));
      }
    } else if (normalizedType === "input" || normalizedType === "text") {
      effectiveIsCorrect =
        typeof value === "string" &&
        value.trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
    } else if (normalizedType === "boolean") {
      effectiveIsCorrect = Boolean(value) === Boolean(question.correctAnswer);
    } else if (
      normalizedType === "rating" ||
      normalizedType === "textarea" ||
      normalizedType === "date"
    ) {
      effectiveIsCorrect = true;
    }
  }

  // Render question field dynamically based on type
  const renderField = () => {
    switch (normalizedType) {
      case "radio":
        return (
          <QuestionRadio
            question={question}
            value={typeof value === "string" ? value : undefined}
            onChange={(val) => onChange(val)}
            readOnly={readOnly}
            correctAnswer={typeof question.correctAnswer === "string" ? question.correctAnswer : undefined}
          />
        );

      case "checkbox":
        return (
          <QuestionCheckbox
            question={question}
            value={Array.isArray(value) ? (value as string[]) : []}
            onChange={(val) => onChange(val)}
            readOnly={readOnly}
            correctAnswer={Array.isArray(question.correctAnswer) ? (question.correctAnswer as string[]) : []}
          />
        );

      case "input":
      case "text":
        return (
          <QuestionInput
            question={question}
            value={typeof value === "string" ? value : ""}
            onChange={(val) => onChange(val)}
            readOnly={readOnly}
            correctAnswer={typeof question.correctAnswer === "string" ? question.correctAnswer : undefined}
          />
        );

      case "textarea":
        return (
          <QuestionTextarea
            question={question}
            value={typeof value === "string" ? value : ""}
            onChange={(val) => onChange(val)}
            readOnly={readOnly}
          />
        );

      case "select":
        return (
          <QuestionSelect
            question={question}
            value={typeof value === "string" ? value : ""}
            onChange={(val) => onChange(val)}
            readOnly={readOnly}
            correctAnswer={typeof question.correctAnswer === "string" ? question.correctAnswer : undefined}
          />
        );

      case "rating":
        return (
          <QuestionRating
            question={question}
            value={typeof value === "number" ? value : 0}
            onChange={(val) => onChange(val)}
            readOnly={readOnly}
          />
        );

      case "boolean":
        return (
          <QuestionBoolean
            question={question}
            value={typeof value === "boolean" ? value : undefined}
            onChange={(val) => onChange(val)}
            readOnly={readOnly}
            correctAnswer={typeof question.correctAnswer === "boolean" ? question.correctAnswer : undefined}
          />
        );

      case "date":
        return (
          <QuestionDate
            question={question}
            value={typeof value === "string" ? value : ""}
            onChange={(val) => onChange(val)}
            readOnly={readOnly}
          />
        );

      default:
        return (
          <QuestionRadio
            question={question}
            value={typeof value === "string" ? value : undefined}
            onChange={(val) => onChange(val)}
            readOnly={readOnly}
          />
        );
    }
  };

  return (
    <div
      id={`question-${question.id}`}
      className="bg-white rounded-xl border transition-all space-y-4 border-[#f0f0f0] shadow-2xs p-4 sm:p-4"
    >
      {/* 1. Header: Question Index, Points badge, Required marker */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
            Câu {index + 1}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
            {points.toFixed(1)} điểm
          </span>
          {question.sectionName && (
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-medium text-xs border border-indigo-200 hidden sm:inline-block">
              {question.sectionName}
            </span>
          )}
        </div>

        {/* Read-only evaluation badge or required indicator */}
        {readOnly ? (
          <div>
            {effectiveIsCorrect === true ? (
              <Tag color="success" className="font-bold flex items-center gap-1 m-0">
                <Icon name="checkCircle" size={13} />
                +{awardedScore ?? points} điểm
              </Tag>
            ) : effectiveIsCorrect === false ? (
              <Tag color="error" className="font-bold flex items-center gap-1 m-0">
                <Icon name="close" size={13} />
                {awardedScore ?? 0} / {points} điểm
              </Tag>
            ) : (
              <Tag color="processing" className="font-semibold m-0">
                Đã ghi nhận
              </Tag>
            )}
          </div>
        ) : (
          question.required && (
            <span
              className="text-rose-500 font-bold text-xs bg-rose-50 px-2 py-0.5 rounded border border-rose-200"
              title="Câu hỏi bắt buộc"
            >
              * Bắt buộc
            </span>
          )
        )}
      </div>

      {/* 2. Title & Description */}
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {question.title}
          {question.required && !readOnly && (
            <span className="text-rose-500 ml-1 font-bold">*</span>
          )}
        </h3>
        {question.description && (
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
            {question.description}
          </p>
        )}
      </div>

      {/* 3. Interactive Input Field */}
      <div className="pt-1">{renderField()}</div>

      {/* 4. Review Mode / Feedback Section */}
      {readOnly && (question.correctAnswer !== undefined || question.explanation) && (
        <div className="pt-3 border-t border-[#f0f0f0] space-y-2.5">
          {question.correctAnswer !== undefined && (
            <div className="flex items-center gap-2 text-xs sm:text-sm bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200">
              <span className="font-bold shrink-0">Đáp án chính xác:</span>
              <span className="font-semibold">
                {Array.isArray(question.correctAnswer)
                  ? question.correctAnswer.join(", ")
                  : String(question.correctAnswer)}
              </span>
            </div>
          )}

          {question.explanation && (
            <div className="text-xs sm:text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-700 flex items-center gap-1.5">
                <Icon name="info" size={14} className="text-blue-500" />
                Giải thích chi tiết:
              </div>
              <p className="leading-relaxed m-0">{question.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
