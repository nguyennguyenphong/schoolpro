import React from "react";
import { Icon } from "@/components/ui/Icon";
import type { ExamItem } from "@/modules/students/features/exams/types";

interface ExamHeaderCardProps {
  exam: ExamItem;
}

export const ExamHeaderCard: React.FC<ExamHeaderCardProps> = ({ exam }) => {
  const isCompleted = exam.status === "completed";
  const isPassed = exam.score !== undefined && exam.score >= (exam.passingScore ?? 5.0);

  return (
    <div className="bg-white rounded-xl border border-[#f0f0f0] shadow-2xs overflow-hidden">
      <div className="p-4 sm:p-4 space-y-2">
        {/* Exam Information 4-Grid matching summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-[#f0f0f0]">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Thời gian làm bài
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-800">
              {exam.durationMinutes} phút
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-[#f0f0f0]">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Số lượng câu hỏi
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-800">
              {exam.questions.length || exam.totalQuestions} câu
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-[#f0f0f0]">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Thang điểm tối đa
            </span>
            <span className="text-sm sm:text-base font-extrabold text-blue-600">
              {exam.maxScore} điểm
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-[#f0f0f0]">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Điểm đạt yêu cầu
            </span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-600">
              ≥ {exam.passingScore ?? 5.0} điểm
            </span>
          </div>
        </div>

        {/* Completion Banner */}
        {isCompleted && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
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
                  {isPassed ? "Chúc mừng! Bạn đã hoàn thành và đạt bài thi này." : "Bạn đã hoàn thành bài thi (Chưa đạt mức điểm yêu cầu)."}
                </h4>
                <p className="text-[11px] opacity-80 mb-0">
                  Nộp lúc: {exam.completedAt || "Hôm nay"} • Đề thi đã được chấm điểm tự động.
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
      </div>
    </div>
  );
};
