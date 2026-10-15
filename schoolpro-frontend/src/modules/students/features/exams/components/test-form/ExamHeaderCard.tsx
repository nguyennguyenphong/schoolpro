import React from "react";
import { Tag } from "@/components/ui/Tag";
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
      {/* Top Color Accent Bar */}
      <div className="h-2 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600" />

      <div className="p-5 sm:p-6 space-y-4">
        {/* Meta tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <Tag color="processing" className="font-semibold m-0 text-xs">
            {exam.courseName} ({exam.courseCode})
          </Tag>
          <Tag color="default" className="font-semibold m-0 text-xs">
            {exam.semester} • {exam.academicYear}
          </Tag>
          {isCompleted ? (
            <Tag color={isPassed ? "success" : "error"} className="font-bold m-0 text-xs">
              {isPassed ? "Đạt yêu cầu" : "Chưa đạt"}
            </Tag>
          ) : exam.status === "expired" ? (
            <Tag color="default" className="font-semibold m-0 text-xs">
              Đã kết thúc
            </Tag>
          ) : (
            <Tag color="warning" className="font-semibold m-0 text-xs">
              Đang diễn ra
            </Tag>
          )}
        </div>

        {/* Title & Teacher */}
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-0">
            {exam.title}
          </h2>
          {exam.teacherName && (
            <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium mb-0">
              <Icon name="user" size={13} className="text-slate-400" />
              <span>Giáo viên phụ trách: </span>
              <strong className="text-slate-700">{exam.teacherName}</strong>
            </p>
          )}
        </div>

        {/* Exam Information 4-Grid matching summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Thời gian làm bài
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-800">
              {exam.durationMinutes} phút
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Số lượng câu hỏi
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-800">
              {exam.questions.length || exam.totalQuestions} câu
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Thang điểm tối đa
            </span>
            <span className="text-sm sm:text-base font-extrabold text-blue-600">
              {exam.maxScore} điểm
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
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
