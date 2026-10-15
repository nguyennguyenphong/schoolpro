import React from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { ExamItem } from "@/modules/students/features/exams/types";

interface ExamListItemProps {
  item: ExamItem;
  onOpen: (item: ExamItem) => void;
}

export const ExamListItem: React.FC<ExamListItemProps> = ({ item, onOpen }) => {
  const { t } = useTranslation(["card", "button"]);
  const isPending = item.status === "pending";
  const isCompleted = item.status === "completed";
  const isExpired = item.status === "expired";

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <Tag color="success" className="m-0 font-semibold text-xs whitespace-nowrap">
          {item.score !== undefined
            ? `${item.score}/${item.maxScore} đ`
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
    <div
      onClick={() => onOpen(item)}
      className="bg-white rounded-xl border border-[#f0f0f0] hover:border-blue-300 shadow-2xs p-4 sm:p-5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
    >
      <div className="space-y-2 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-xl whitespace-nowrap">
            {item.courseCode}
          </span>
          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">
            {item.code}
          </span>
          <Tag color="purple" className="m-0 font-semibold text-xs whitespace-nowrap">
            {t("card:exams.card.multipleChoice")}
          </Tag>
          {getStatusBadge()}
        </div>

        <h3
          className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-0 truncate"
          title={item.title}
        >
          {item.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="font-medium text-slate-700 truncate">{item.courseName}</span>
          {item.teacherName && (
            <>
              <span className="hidden sm:inline">•</span>
              <span className="truncate">{item.teacherName}</span>
            </>
          )}
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Icon name="clock" size={13} className="text-slate-400" />
            <span>{t("card:exams.card.duration", { minutes: item.durationMinutes })}</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Icon name="file-text" size={13} className="text-slate-400" />
            <span>{t("card:exams.card.questionsCount", { count: item.totalQuestions })}</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Icon name="calendar" size={13} className="text-slate-400" />
            <span>{t("card:exams.card.deadline", { date: item.endDate })}</span>
          </span>
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
        {isPending && (
          <Button
            variant="primary"
            onClick={() => onOpen(item)}
            className="text-xs font-semibold h-8 whitespace-nowrap"
          >
            <span>{t("card:exams.card.startExam")}</span>
            <Icon name="arrow-right" size={13} />
          </Button>
        )}

        {isCompleted && (
          <Button
            variant="outline"
            onClick={() => onOpen(item)}
            className="text-xs font-semibold h-8 text-slate-700 hover:text-blue-600 whitespace-nowrap"
          >
            <Icon name="eye" size={13} />
            <span>{t("card:exams.card.reviewExam")}</span>
          </Button>
        )}

        {isExpired && (
          <span className="text-xs font-semibold text-slate-400 px-3 py-1 bg-slate-100 rounded-lg whitespace-nowrap">
            {t("card:exams.card.closed")}
          </span>
        )}
      </div>
    </div>
  );
};
