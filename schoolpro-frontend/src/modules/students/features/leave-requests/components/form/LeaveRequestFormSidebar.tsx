import type React from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import type {
  LeaveSessionShift,
  LeaveType,
} from "@/modules/students/features/leave-requests/types";
import {
  formatLeaveDateRange,
  getLeaveTypeLabel,
  getSessionShiftLabel,
  type NotificationRecipientsPreview,
} from "@/modules/students/features/leave-requests/utils";

interface LeaveRequestFormSidebarProps {
  homeroomDisplayName: string;
  classDisplayName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  calculatedDays: number;
  sessionShift: LeaveSessionShift;
  selectedLessonsCount: number;
  approvalDeadlineInfo: {
    firstLessonLabel: string;
    deadlineFormatted: string;
  } | null;
  notificationRecipients: NotificationRecipientsPreview;
}

export const LeaveRequestFormSidebar: React.FC<LeaveRequestFormSidebarProps> = ({
  homeroomDisplayName,
  classDisplayName,
  leaveType,
  startDate,
  endDate,
  calculatedDays,
  sessionShift,
  selectedLessonsCount,
  approvalDeadlineInfo,
  notificationRecipients,
}) => {
  const { t } = useTranslation(["card"]);

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
          <h3 className="text-sm font-bold text-slate-900 mb-0">
            {t("card:leaveRequests.form.summaryCardTitle")}
          </h3>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{t("card:leaveRequests.form.approverLabel")}</span>
            <strong className="text-slate-900">{homeroomDisplayName}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{t("card:leaveRequests.summary.classLabel")}</span>
            <strong className="text-blue-600">
              {t("card:leaveRequests.header.classBadge", { className: classDisplayName })}
            </strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{t("card:leaveRequests.form.categoryLabel")}</span>
            <strong className="text-slate-800">{getLeaveTypeLabel(leaveType)}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{t("card:leaveRequests.form.leaveTimeLabel")}</span>
            <strong className="text-slate-800">{formatLeaveDateRange(startDate, endDate)}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{t("card:leaveRequests.form.totalDaysLabel")}</span>
            <strong className="text-blue-700">
              {t("card:leaveRequests.item.daysAndShift", {
                days: calculatedDays,
                shift: getSessionShiftLabel(sessionShift),
              })}
            </strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">
              {t("card:leaveRequests.form.selectedLessonsCountLabel")}
            </span>
            <strong className="text-indigo-600">
              {t("card:leaveRequests.form.periodsCount", { count: selectedLessonsCount })}
            </strong>
          </div>

          {approvalDeadlineInfo && (
            <div className="pt-2 border-t border-slate-200/80 space-y-1">
              <div className="text-[11px] text-slate-500">
                {t("card:leaveRequests.form.firstLessonLabel")}{" "}
                <strong className="text-slate-700">{approvalDeadlineInfo.firstLessonLabel}</strong>
              </div>
              <div className="text-[11px] text-amber-800 bg-amber-50/90 border border-amber-200 rounded-xl px-2.5 py-1.5">
                {t("card:leaveRequests.form.deadlineLabel")}{" "}
                <strong className="font-mono">{approvalDeadlineInfo.deadlineFormatted}</strong>
                <span className="block text-[10px] text-amber-700 mt-0.5">
                  {t("card:leaveRequests.form.deadlineAutoApproveHint")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danh sách Giáo viên nhận thông báo & Email */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
            <h3 className="text-sm font-bold text-slate-900 mb-0">
              {t("card:leaveRequests.form.recipientsCardTitle")}
            </h3>
          </div>
          <Tag color="purple" className="m-0 text-[11px] font-semibold">
            {t("card:leaveRequests.form.recipientsCount", {
              count: notificationRecipients.otherSubjectTeachers.length + 1,
            })}
          </Tag>
        </div>

        <div className="space-y-2 text-xs">
          {/* Giáo viên chủ nhiệm */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-2">
            <div className="min-w-0 space-y-0.5">
              <div className="font-bold text-slate-900 truncate">{homeroomDisplayName}</div>
              <div className="text-[11px] text-slate-600">
                {notificationRecipients.homeroomAlsoSubjectTeacher ? (
                  <span>
                    {t("card:leaveRequests.form.homeroomCombinedDesc", {
                      subjects: notificationRecipients.homeroomTeachingSubjects.join(", "),
                      count: notificationRecipients.homeroomLessonCount,
                    })}
                  </span>
                ) : (
                  <span>
                    {t("card:leaveRequests.form.homeroomOnlyDesc", {
                      className: classDisplayName,
                    })}
                  </span>
                )}
              </div>
            </div>
            <Tag color="blue" className="m-0 text-[10px] font-bold shrink-0">
              {notificationRecipients.homeroomAlsoSubjectTeacher
                ? t("card:leaveRequests.form.homeroomCombinedBadge")
                : t("card:leaveRequests.form.approverBadge")}
            </Tag>
          </div>

          {/* Các Giáo viên bộ môn khác */}
          {notificationRecipients.otherSubjectTeachers.map((teacher, idx) => (
            <div
              key={teacher.teacherId || idx}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="font-semibold text-slate-800 truncate">{teacher.teacherName}</div>
                <div className="text-[11px] text-slate-500 truncate">
                  {t("card:leaveRequests.form.subjectLessonsSummary", {
                    subjects: teacher.subjects.join(", "),
                    count: teacher.lessonCount,
                  })}
                </div>
              </div>
              <Tag color="cyan" className="m-0 text-[10px] font-semibold shrink-0">
                {t("card:leaveRequests.form.notifiedBadge")}
              </Tag>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-amber-500 inline-block" />
          <h3 className="text-sm font-bold text-slate-900 mb-0">
            {t("card:leaveRequests.form.policyCardTitle")}
          </h3>
        </div>
        <ul className="list-disc pl-4 space-y-1.5 text-slate-600 mb-0">
          <li>{t("card:leaveRequests.form.policyRule1")}</li>
          <li>{t("card:leaveRequests.form.policyRule2")}</li>
          <li>{t("card:leaveRequests.form.policyRule3")}</li>
          <li>{t("card:leaveRequests.form.policyRule4")}</li>
        </ul>
      </div>
    </div>
  );
};
