import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import type { ExamItem } from "@/modules/students/features/exams/types";
import { isScoreReleased } from "@/modules/students/features/exams/utils";

interface ExamHeaderCardProps {
  exam: ExamItem;
}

export const ExamHeaderCard: React.FC<ExamHeaderCardProps> = ({ exam }) => {
  const { t } = useTranslation(["card"]);
  const isCompleted = exam.status === "completed";
  const scoreReleased = isScoreReleased(exam);
  const isPassed = exam.score !== undefined && exam.score >= (exam.passingScore ?? 5.0);
  const mode = exam.scoreReleaseMode || exam.settings?.scoreReleaseMode;

  return (
    <div className="bg-white rounded-xl border border-[#f0f0f0] shadow-2xs overflow-hidden">
      <div className="p-4 sm:p-4 space-y-2">
        {/* Exam Information 4-Grid matching summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-[#f0f0f0]">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              {t("card:exams.detail.durationLabel")}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-800">
              {t("card:exams.card.duration", { minutes: exam.durationMinutes })}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-[#f0f0f0]">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              {t("card:exams.detail.totalQuestionsLabel")}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-800">
              {t("card:exams.card.questionsCount", { count: exam.questions.length || exam.totalQuestions })}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-[#f0f0f0]">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              {t("card:exams.detail.maxScoreLabel")}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-blue-600">
              {t("card:exams.question.points", { points: exam.maxScore })}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-[#f0f0f0]">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              {t("card:exams.detail.passingScoreLabel")}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-600">
              ≥ {t("card:exams.question.points", { points: exam.passingScore ?? 5.0 })}
            </span>
          </div>
        </div>

        {/* Completion Banner */}
        {isCompleted && scoreReleased && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-4 mt-3.5 ${
              isPassed
                ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                : "bg-rose-50/80 border-rose-200 text-rose-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isPassed ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                }`}
              >
                <Icon name={isPassed ? "checkCircle" : "warning"} size={20} />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold mb-0.5">
                  {isPassed
                    ? t("card:exams.detail.completedPassed")
                    : t("card:exams.detail.completedFailed")}
                </h4>
                <p className="text-[11px] opacity-80 mb-0">
                  {t("card:exams.detail.submittedAtAutoGraded", {
                    date: exam.completedAt || t("card:exams.detail.today"),
                  })}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-2xl sm:text-3xl font-extrabold">
                {exam.score}
              </span>
              <span className="text-xs opacity-75 font-bold">/{exam.maxScore}</span>
            </div>
          </div>
        )}

        {isCompleted && !scoreReleased && (
          <div className="p-4 rounded-xl border flex items-center justify-between gap-4 mt-3.5 bg-blue-50/80 border-blue-200 text-blue-900">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-600 text-white">
                <Icon name="info" size={20} />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold mb-0.5">
                  {mode === "hidden"
                    ? t("card:exams.scoreRelease.hiddenNotice")
                    : t("card:exams.scoreRelease.scheduledNotice", {
                        date: exam.scoreReleaseDate || exam.settings?.scoreReleaseDate,
                      })}
                </h4>
                <p className="text-[11px] opacity-80 mb-0">
                  {t("card:exams.detail.submittedAtAutoGraded", {
                    date: exam.completedAt || t("card:exams.detail.today"),
                  })}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-sm sm:text-base font-extrabold text-blue-700">
                {mode === "hidden"
                  ? t("card:exams.scoreRelease.hiddenScore")
                  : t("card:exams.scoreRelease.unreleasedScore")}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
