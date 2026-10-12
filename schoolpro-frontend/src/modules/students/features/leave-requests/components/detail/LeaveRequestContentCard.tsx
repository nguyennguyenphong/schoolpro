import dayjs from "dayjs";
import type React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";
import {
  LEAVE_TYPE_COLORS,
  formatLeaveDateRange,
  getLeaveTypeLabel,
  getSessionShiftLabel,
} from "@/modules/students/features/leave-requests/utils";

interface LeaveRequestContentCardProps {
  item: LeaveRequestItem;
}

export const LeaveRequestContentCard: React.FC<LeaveRequestContentCardProps> = ({ item }) => {
  const { t } = useTranslation("card");
  const affectedLessons = item.affectedLessons || [];

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
          {t("leaveRequests.detail.contentCardTitle")}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] text-slate-500 block mb-1">
            {t("leaveRequests.detail.dateRangeBoxLabel")}
          </span>
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
            <Icon name="calendar" size={14} className="text-blue-600 shrink-0" />
            <span>{formatLeaveDateRange(item.startDate, item.endDate)}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] text-slate-500 block mb-1">
            {t("leaveRequests.detail.daysAndShiftBoxLabel")}
          </span>
          <div className="flex items-center gap-1.5 font-bold text-blue-700 text-xs sm:text-sm">
            <Icon name="clock" size={14} className="text-blue-600 shrink-0" />
            <span>
              {t("leaveRequests.item.daysAndShift", {
                days: item.totalDays,
                shift: getSessionShiftLabel(item.sessionShift),
              })}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] text-slate-500 block mb-1">
            {t("leaveRequests.detail.reasonCategoryBoxLabel")}
          </span>
          <Tag
            color={LEAVE_TYPE_COLORS[item.leaveType] || "blue"}
            className="m-0 font-semibold text-xs"
          >
            {getLeaveTypeLabel(item.leaveType)}
          </Tag>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-700 block">
            {t("leaveRequests.detail.detailedReasonLabel")}
          </span>
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
            {item.reason}
          </div>
        </div>

        {item.commitment && (
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 block">
              {t("leaveRequests.detail.studentCommitmentLabel")}
            </span>
            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-slate-700 italic">
              {item.commitment}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2.5 pt-1 border-t border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <span className="text-xs font-bold text-slate-700">
            {t("leaveRequests.detail.affectedLessonsListTitle", {
              count: affectedLessons.length,
            })}
          </span>
          {item.affectedSubjects && item.affectedSubjects.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.affectedSubjects.map((subj) => (
                <Tag key={subj} color="blue" className="m-0 text-[11px] font-semibold">
                  {subj}
                </Tag>
              ))}
            </div>
          )}
        </div>

        {affectedLessons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {affectedLessons.map((lesson) => (
              <div
                key={lesson.lessonKey}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="font-bold text-slate-900 truncate">
                    {t("leaveRequests.detail.subjectAndPeriodItem", {
                      subject: lesson.subjectName,
                      period: lesson.periodNumber,
                    })}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {lesson.dayOfWeekLabel} ({dayjs(lesson.date).format("DD/MM/YYYY")}) •{" "}
                    {lesson.startTime} - {lesson.endTime}
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200/80 shrink-0 truncate max-w-36">
                  {lesson.teacherName}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
            {t("leaveRequests.detail.noMatchingLessons")}
          </div>
        )}
      </div>
    </div>
  );
};
