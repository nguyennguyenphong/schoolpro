import React from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { ExamItem } from "@/modules/students/features/exams/types";

interface ExamDetailHeaderProps {
  exam: ExamItem;
  onBack: () => void;
}

export const ExamDetailHeader: React.FC<ExamDetailHeaderProps> = ({
  exam,
  onBack,
}) => {
  const { t } = useTranslation(["navigation", "card", "button"]);
  const isCompleted = exam.status === "completed";
  const isExpired = exam.status === "expired";
  const isPassed = exam.score !== undefined && exam.score >= (exam.passingScore ?? 5.0);

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <Tag
          color={isPassed ? "success" : "error"}
          className="m-0 text-xs font-bold px-2.5 py-0.5 whitespace-nowrap"
        >
          {isPassed ? t("card:exams.statuses.completed") : "Chưa đạt"}
        </Tag>
      );
    }
    if (isExpired) {
      return (
        <Tag color="default" className="m-0 text-xs font-semibold px-2.5 py-0.5 whitespace-nowrap">
          {t("card:exams.statuses.expired")}
        </Tag>
      );
    }
    return (
      <Tag color="warning" className="m-0 text-xs font-semibold px-2.5 py-0.5 whitespace-nowrap">
        {t("card:exams.statuses.pending")}
      </Tag>
    );
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
      {/* 1. Breadcrumb navigation */}
      <Breadcrumb
        items={[
          {
            href: "/student/home",
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                <Icon name="home" size={13} className="text-slate-400 shrink-0" />
                <span>{t("navigation:breadcrumb.home")}</span>
              </span>
            ),
          },
          {
            href: "/student/exams",
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                <Icon name="file-text" size={13} className="text-slate-400 shrink-0" />
                <span>{t("navigation:breadcrumb.exams")}</span>
              </span>
            ),
          },
          {
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium truncate max-w-xs sm:max-w-md">
                <span>{exam.title}</span>
              </span>
            ),
          },
        ]}
      />

      {/* 2. Title, Badges and Back Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block shrink-0" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0 truncate">
              {exam.title}
            </h1>
            {getStatusBadge()}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Icon name="book" size={13} className="text-slate-400" />
              <span>{exam.courseName}</span>
            </span>
            {exam.teacherName && (
              <>
                <span className="flex items-center gap-1.5 truncate">
                  <Icon name="user" size={13} className="text-slate-400" />
                  <span>{exam.teacherName}</span>
                </span>
              </>
            )}
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Icon name="clock" size={13} className="text-slate-400" />
              <span>{exam.durationMinutes} phút làm bài</span>
            </span>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Icon name="calendar" size={13} className="text-slate-400" />
              <span>Hạn: {exam.endDate}</span>
            </span>
          </div>
        </div>

        {/* Right action buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {isCompleted && exam.score !== undefined && (
            <div className="flex items-baseline gap-1 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-emerald-800">
              <span className="text-xs font-bold">Điểm đạt:</span>
              <span className="text-base font-extrabold text-emerald-700">{exam.score}</span>
              <span className="text-xs font-bold text-emerald-600">/{exam.maxScore}</span>
            </div>
          )}

          <Button
            variant="outline"
            onClick={onBack}
            className="text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5"
          >
            <Icon name="arrow-left" size={14} />
            <span>{t("button:back")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
