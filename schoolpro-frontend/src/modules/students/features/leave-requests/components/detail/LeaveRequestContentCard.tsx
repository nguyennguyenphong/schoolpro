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
  const { t } = useTranslation(["card"]);
  const affectedLessons = item.affectedLessons || [];

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-6">
      {/* 1. Header Section */}
      <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-4.5 rounded-full bg-blue-600 inline-block" />
          <h3 className="text-base font-bold text-slate-900 mb-0">
            {t("card:leaveRequests.detail.contentCardTitle")}
          </h3>
        </div>
      </div>

      {/* 2. Three Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Date Range */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-[#f0f0f0]">
          <div className="flex items-center gap-2 text-slate-500 mb-1.5">
            <Icon name="calendar" size={15} className="text-blue-600 shrink-0" />
            <span className="text-xs font-medium">
              {t("card:leaveRequests.detail.dateRangeBoxLabel")}
            </span>
          </div>
          <div className="font-bold text-slate-900 text-sm sm:text-base">
            {formatLeaveDateRange(item.startDate, item.endDate)}
          </div>
        </div>

        {/* Days & Shift */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-[#f0f0f0]">
          <div className="flex items-center gap-2 text-slate-500 mb-1.5">
            <Icon name="clock" size={15} className="text-indigo-600 shrink-0" />
            <span className="text-xs font-medium">
              {t("card:leaveRequests.detail.daysAndShiftBoxLabel")}
            </span>
          </div>
          <div className="font-bold text-indigo-700 text-sm sm:text-base">
            {t("card:leaveRequests.item.daysAndShift", {
              days: item.totalDays,
              shift: getSessionShiftLabel(item.sessionShift),
            })}
          </div>
        </div>

        {/* Reason Category */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-[#f0f0f0]">
          <div className="flex items-center gap-2 text-slate-500 mb-1.5">
            <Icon name="bookmark" size={15} className="text-amber-600 shrink-0" />
            <span className="text-xs font-medium">
              {t("card:leaveRequests.detail.reasonCategoryBoxLabel")}
            </span>
          </div>
          <div>
            <Tag
              color={LEAVE_TYPE_COLORS[item.leaveType] || "blue"}
              className="m-0 font-semibold text-xs px-2.5 py-0.5"
            >
              {getLeaveTypeLabel(item.leaveType)}
            </Tag>
          </div>
        </div>
      </div>

      {/* 3. Detailed Reason */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 block">
          {t("card:leaveRequests.detail.detailedReasonLabel")}
        </span>
        <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/80 text-sm text-slate-800 leading-relaxed whitespace-pre-line shadow-2xs">
          {item.reason}
        </div>
      </div>

      {/* 4. Student Commitment (if any) */}
      {item.commitment && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 block">
            {t("card:leaveRequests.detail.studentCommitmentLabel")}
          </span>
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/70 text-xs sm:text-sm text-blue-950 flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="check" size={12} strokeWidth={3} />
            </div>
            <div className="flex-1 font-medium italic leading-relaxed">{item.commitment}</div>
          </div>
        </div>
      )}

      {/* 5. Affected Lessons Schedule */}
      <div className="space-y-3 pt-2 border-t border-[#f0f0f0]">
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              {t("card:leaveRequests.detail.lessonsScheduleTitle")}
            </span>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {t("card:leaveRequests.detail.lessonsScheduleCount", {
                count: affectedLessons.length,
              })}
            </span>
          </div>

          {item.affectedSubjects && item.affectedSubjects.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.affectedSubjects.map((subj) => (
                <Tag key={subj} color="blue" className="m-0 text-[11px] font-semibold">
                  {subj}
                </Tag>
              ))}
            </div>
          )}
        </div>

        {affectedLessons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {affectedLessons.map((lesson) => (
              <div
                key={lesson.lessonKey}
                className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
              >
                <div className="min-w-0 space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[10px] shrink-0">
                      {t("card:leaveRequests.form.periodBadge", { period: lesson.periodNumber })}
                    </span>
                    <strong className="text-slate-900 text-xs sm:text-sm font-bold truncate">
                      {lesson.subjectName}
                    </strong>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Icon name="calendar" size={13} className="text-slate-400 shrink-0" />
                    <span>
                      {lesson.dayOfWeekLabel} ({dayjs(lesson.date).format("DD/MM/YYYY")})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Icon name="clock" size={13} className="text-slate-400 shrink-0" />
                    <span>
                      {lesson.startTime} - {lesson.endTime}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[11px] font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs truncate max-w-40">
                    {lesson.teacherName}
                  </span>
                  <Tag color="cyan" className="m-0 text-[9.5px] font-medium">
                    {t("card:leaveRequests.detail.notifiedSubjectTeacherBadge")}
                  </Tag>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
            {t("card:leaveRequests.detail.noMatchingLessons")}
          </div>
        )}
      </div>
    </div>
  );
};
