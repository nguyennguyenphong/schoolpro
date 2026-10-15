import React from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { ExamItem } from "@/modules/students/features/exams/types";

interface ExamCardProps {
  item: ExamItem;
  onOpen: (item: ExamItem) => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({ item, onOpen }) => {
  const { t } = useTranslation(["card", "button"]);
  const isPending = item.status === "pending";
  const isCompleted = item.status === "completed";
  const isExpired = item.status === "expired";

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <Tag color="success" className="m-0 font-semibold text-xs whitespace-nowrap">
          {item.score !== undefined
            ? `${item.score}/${item.maxScore} ${t("card:exams.detail.pointsSuffix")}`
            : t("card:exams.statuses.completed")}
        </Tag>
      );
    }
    if (isPending) {
      return (
        <Tag color="warning" className="m-0 font-semibold text-xs whitespace-nowrap">
          {t("card:exams.statuses.pending")}
        </Tag>
      );
    }
    return (
      <Tag color="default" className="m-0 font-semibold text-xs whitespace-nowrap">
        {t("card:exams.statuses.expired")}
      </Tag>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-[#f0f0f0] shadow-2xs p-4 sm:p-5 flex flex-col justify-between h-full transition-all group">
      <div className="space-y-3">
        {/* 1. Course Code & Status Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag color="purple" className="m-0 font-semibold text-xs whitespace-nowrap">
              {t("card:exams.card.multipleChoice")}
            </Tag>
          </div>

          <div className="shrink-0">{getStatusBadge()}</div>
        </div>

        {/* 2. Exam Title */}
        <h3
          className="text-sm sm:text-base font-bold text-slate-900 transition-colors line-clamp-2 mb-2"
          title={item.title}
        >
          {item.title}
        </h3>

        {/* 3. Subject Box matching LeaveRequestCard's info bar */}
        <div className="flex items-center justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-[#f0f0f0]">
          <div className="flex items-center gap-2 min-w-0">
            <Icon name="book" size={14} className="text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-800 truncate">
              {item.courseName}
            </span>
          </div>
          {item.teacherName && (
            <span className="text-[11px] font-semibold text-slate-500 truncate shrink-0">
              {item.teacherName}
            </span>
          )}
        </div>

        {/* 4. Meta row: Duration, Questions count, and Deadline */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 pt-0.5">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Icon name="clock" size={13} className="text-slate-400" />
            <span>{t("card:exams.card.duration", { minutes: item.durationMinutes })}</span>
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Icon name="file-text" size={13} className="text-slate-400" />
            <span>{t("card:exams.card.questionsCount", { count: item.totalQuestions })}</span>
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Icon name="calendar" size={13} className="text-slate-400" />
            <span>{t("card:exams.card.deadline", { date: item.endDate })}</span>
          </span>
        </div>
      </div>

      {/* 5. Footer Row with Action */}
      <div className="pt-3.5 mt-3.5 border-t border-[#f0f0f0] flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-400 truncate">
          {isCompleted && item.completedAt
            && t("card:exams.card.submittedAt", { date: item.completedAt })}
        </span>

        <div className="shrink-0">
          {isPending && (
            <Button
              variant="primary"
              onClick={() => onOpen(item)}
              className="text-xs font-semibold h-8"
            >
              <span>{t("card:exams.card.startExam")}</span>
              <Icon name="arrow-right" size={13} />
            </Button>
          )}

          {isCompleted && (
            <Button
              variant="outline"
              onClick={() => onOpen(item)}
              className="text-xs font-semibold h-8 text-slate-700 hover:text-blue-600"
            >
              <Icon name="eye" size={13} />
              <span>{t("card:exams.card.reviewExam")}</span>
            </Button>
          )}

          {isExpired && (
            <Button
              variant="ghost"
              disabled
            >
              <Icon name="close" size={13} />
              <span>{t("card:exams.card.closed")}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
