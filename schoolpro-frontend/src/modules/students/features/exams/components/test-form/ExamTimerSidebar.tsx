import React from "react";
import { Progress } from "antd";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { ExamQuestion } from "@/modules/students/features/exams/types";

interface ExamTimerSidebarProps {
  timeLeft: number;
  questions: ExamQuestion[];
  activeQuestionId?: string;
  isQuestionAnswered: (qId: string) => boolean;
  onScrollToQuestion: (qId: string) => void;
  onSubmit: () => void;
  submitting?: boolean;
  readOnly?: boolean;
  score?: number;
  maxScore?: number;
}

export const ExamTimerSidebar: React.FC<ExamTimerSidebarProps> = ({
  timeLeft,
  questions,
  activeQuestionId,
  isQuestionAnswered,
  onScrollToQuestion,
  onSubmit,
  submitting = false,
  readOnly = false,
  score,
  maxScore = 10,
}) => {
  const total = questions.length;
  const answeredCount = questions.filter((q) => isQuestionAnswered(q.id)).length;
  const progressPercent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  const isUrgent = timeLeft < 300 && !readOnly; // Under 5 minutes

  return (
    <div className="space-y-4">
      {/* 1. Timer / Score Box */}
      <Card className="rounded-xl shadow-2xs border-[#f0f0f0] p-4 sm:p-5 space-y-3.5">
        {readOnly ? (
          <div className="text-center space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kết quả bài thi
            </span>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-blue-600 tracking-tight">
                {score ?? 0}
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-400">/{maxScore}</span>
            </div>
            <p className="text-xs text-slate-500 mb-0">
              Đã hoàn thành {answeredCount}/{total} câu hỏi
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Icon name="clock" size={14} className={isUrgent ? "text-rose-500" : "text-blue-500"} />
                Thời gian còn lại
              </span>
              {isUrgent && (
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 animate-pulse">
                  Sắp hết giờ!
                </span>
              )}
            </div>

            <div
              className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-center py-2 px-3 rounded-xl border ${
                isUrgent
                  ? "bg-rose-50 text-rose-600 border-rose-200 animate-pulse"
                  : "bg-slate-50 text-slate-900 border-slate-200"
              }`}
            >
              {formattedTime}
            </div>
          </div>
        )}

        {/* 2. Progress */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Tiến độ làm bài</span>
            <span>
              {answeredCount}/{total} câu ({progressPercent}%)
            </span>
          </div>
          <Progress
            percent={progressPercent}
            showInfo={false}
            strokeColor={readOnly ? "#10b981" : "#2563eb"}
            railColor="#e2e8f0"
            size="small"
          />
        </div>
      </Card>

      {/* 3. Question Palette Card */}
      <Card className="rounded-xl shadow-2xs border-[#f0f0f0] p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-0">
            Danh sách câu hỏi ({total})
          </h4>
          <span className="text-[11px] font-medium text-blue-600">
            Đã làm {answeredCount}/{total}
          </span>
        </div>

        {/* Question numbers grid */}
        <div className="grid grid-cols-5 gap-2 max-h-64 sm:max-h-80 overflow-y-auto pr-1">
          {questions.map((q, idx) => {
            const isAnswered = isQuestionAnswered(q.id);
            const isActive = activeQuestionId === q.id;

            let buttonClass =
              "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-semibold";

            if (isAnswered) {
              buttonClass =
                "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 font-bold shadow-xs";
            }

            if (isActive) {
              buttonClass += " ring-2 ring-blue-500 ring-offset-2 z-10";
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onScrollToQuestion(q.id)}
                className={`h-9 rounded-lg text-xs transition-all flex items-center justify-center cursor-pointer border ${buttonClass}`}
                title={`Câu ${idx + 1}: ${isAnswered ? "Đã trả lời" : "Chưa trả lời"}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 pt-2.5 text-[11px] text-slate-500 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block shrink-0" />
            <span className="font-medium text-slate-700">Đã làm ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-white border border-slate-300 inline-block shrink-0" />
            <span>Chưa làm ({total - answeredCount})</span>
          </div>
        </div>
      </Card>

      {/* 4. Submit Action */}
      {!readOnly && (
        <Button
          variant="primary"
          onClick={onSubmit}
          loading={submitting}
          className="w-full h-11 text-xs sm:text-sm font-bold shadow-md shadow-blue-500/15"
        >
          <Icon name="checkCircle" size={16} className="mr-1.5" />
          <span>Nộp bài thi ngay</span>
        </Button>
      )}
    </div>
  );
};
