import type React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Tabs } from "@/components/ui/Tabs";
import { Tag } from "@/components/ui/Tag";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";
import { formatDateTimeDisplay } from "@/modules/students/features/leave-requests/utils/leaveRequestHelpers";

interface LeaveRequestDetailSidebarProps {
  item: LeaveRequestItem;
}

export const LeaveRequestDetailSidebar: React.FC<LeaveRequestDetailSidebarProps> = ({ item }) => {
  const { t } = useTranslation(["card", "button", "input"]);
  const notifiedTeachers = item.notifiedTeachers || [];

  const homeroomAsSubject = notifiedTeachers.find((teacher) => teacher.isHomeroomTeacher);
  const otherSubjectTeachers = notifiedTeachers.filter((teacher) => !teacher.isHomeroomTeacher);
  const isPending = item.status === "pending";
  const isApproved = item.status === "approved";

  return (
    <div className="lg:col-span-1 space-y-4 sm:space-y-5">
      {/* Card 1: Tabs for Deadlines/Rules & Teachers in Charge */}
      <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs">
        <Tabs
          defaultActiveKey="deadline"
          size="small"
          items={[
            {
              key: "deadline",
              label: (
                <span className="inline-flex items-center gap-1.5 font-semibold text-xs">
                  <Icon name="clock" size={13} className="text-amber-500" />
                  <span>{t("card:leaveRequests.detail.tabDeadlineRules")}</span>
                </span>
              ),
              children: (
                <div className="pt-2 space-y-3.5 text-xs">
                  <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/70 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">
                        {t("card:leaveRequests.detail.submittedAtPrefix")}
                      </span>
                      <strong className="text-slate-800">
                        {formatDateTimeDisplay(item.createdAt)}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">
                        {t("card:leaveRequests.detail.approvalDeadlineShortLabel")}
                      </span>
                      <strong className={isPending ? "text-amber-700 font-bold" : "text-slate-800"}>
                        {formatDateTimeDisplay(item.approvalDeadline)}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">
                        {t("card:leaveRequests.detail.approvalMethodLabel")}
                      </span>
                      <strong
                        className={
                          item.isAutoApproved
                            ? "text-cyan-700"
                            : isApproved
                              ? "text-emerald-700"
                              : "text-slate-700"
                        }
                      >
                        {item.isAutoApproved
                          ? t("card:leaveRequests.detail.approvalMethodAuto")
                          : isApproved
                            ? t("card:leaveRequests.detail.approvalMethodDirect")
                            : t("card:leaveRequests.detail.stepMiniPending")}
                      </strong>
                    </div>

                    {item.reviewedAt && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">
                          {t("card:leaveRequests.detail.reviewedAtLabel")}
                        </span>
                        <strong className="text-slate-700">
                          {formatDateTimeDisplay(item.reviewedAt)}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: "teachers",
              label: (
                <span className="inline-flex items-center gap-1.5 font-semibold text-xs">
                  <Icon name="academic" size={13} className="text-blue-600" />
                  <span>{t("card:leaveRequests.detail.tabTeachers")}</span>
                </span>
              ),
              children: (
                <div className="pt-2 space-y-3.5 text-xs">
                  {/* Homeroom teacher card */}
                  <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/70 space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                        <Icon name="user" size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <strong className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                          {item.homeroomTeacherName}
                        </strong>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {t("card:leaveRequests.header.classBadge", { className: item.className })}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-[11px]">
                      {item.homeroomTeacherEmail && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500">
                            {t("card:leaveRequests.detail.notificationEmailLabel")}
                          </span>
                          <a
                            href={`mailto:${item.homeroomTeacherEmail}`}
                            className="text-blue-600 font-medium truncate max-w-36"
                          >
                            {item.homeroomTeacherEmail}
                          </a>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">
                          {t("card:leaveRequests.detail.authorityLabel")}
                        </span>
                        <span className="font-semibold text-blue-700 text-right truncate">
                          {homeroomAsSubject
                            ? t("card:leaveRequests.detail.authorityCombined", {
                                subjects: homeroomAsSubject.subjects.join(", "),
                              })
                            : t("card:leaveRequests.detail.authorityOfficial")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notified Subject Teachers */}
                  {otherSubjectTeachers.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          {t("card:leaveRequests.detail.subjectTeachersCardTitle")}
                        </span>
                        <Tag color="purple" className="m-0 text-[10px] font-semibold">
                          {t("card:leaveRequests.detail.subjectTeachersCountBadge", {
                            count: otherSubjectTeachers.length,
                          })}
                        </Tag>
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                        {otherSubjectTeachers.map((teacher, idx) => (
                          <div
                            key={teacher.teacherId || idx}
                            className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-slate-800 truncate text-[11px]">
                                {teacher.teacherName}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {teacher.subjects.join(", ")} (
                                {t("card:leaveRequests.form.periodsCount", { count: teacher.lessonCount })})
                              </div>
                            </div>
                            <Tag
                              color={item.status === "approved" ? "success" : "cyan"}
                              className="m-0 text-[9.5px] font-medium shrink-0"
                            >
                              {item.status === "approved"
                                ? t("card:leaveRequests.detail.notifiedAfterApprovalBadge")
                                : t("card:leaveRequests.detail.notifiedOnSubmitBadge")}
                            </Tag>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Card 2: Tabs for Guardian Confirmation & Academic Notes */}
      <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs">
        <Tabs
          defaultActiveKey="guardian"
          size="small"
          items={[
            {
              key: "guardian",
              label: (
                <span className="inline-flex items-center gap-1.5 font-semibold text-xs">
                  <Icon name="user" size={13} className="text-blue-600" />
                  <span>{t("card:leaveRequests.detail.tabGuardian")}</span>
                </span>
              ),
              children: (
                <div className="pt-2">
                  <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/70 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">{t("card:leaveRequests.detail.fullNameLabel")}</span>
                      <strong className="text-slate-800 text-right">
                        {item.guardianName || t("card:leaveRequests.detail.notUpdated")}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">
                        {t("card:leaveRequests.detail.relationshipLabel")}
                      </span>
                      <span className="font-semibold text-slate-700 text-right">
                        {item.guardianRelationship || t("input:leaveRequests.relationshipParentDefault")}
                      </span>
                    </div>

                    {item.guardianPhone && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">{t("card:leaveRequests.detail.phoneLabel")}</span>
                        <a
                          href={`tel:${item.guardianPhone}`}
                          className="text-blue-600 font-bold text-right hover:underline"
                        >
                          {item.guardianPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: "notes",
              label: (
                <span className="inline-flex items-center gap-1.5 font-semibold text-xs">
                  <Icon name="info" size={13} className="text-slate-600" />
                  <span>{t("card:leaveRequests.detail.tabAcademicNotes")}</span>
                </span>
              ),
              children: (
                <div className="pt-2 space-y-2.5 text-[11px] leading-relaxed">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <strong className="text-slate-900 block font-bold">
                      {t("card:leaveRequests.detail.academicNoteResponsibilityTitle")}
                    </strong>
                    <p className="text-slate-600 mb-0">
                      {t("card:leaveRequests.detail.academicNoteResponsibilityDesc")}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <strong className="text-slate-900 block font-bold">
                      {t("card:leaveRequests.detail.academicNoteAttendanceTitle")}
                    </strong>
                    <p className="text-slate-600 mb-0">
                      {t("card:leaveRequests.detail.academicNoteAttendanceDesc")}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <strong className="text-slate-900 block font-bold">
                      {t("card:leaveRequests.detail.academicNoteMakeupTitle")}
                    </strong>
                    <p className="text-slate-600 mb-0">
                      {t("card:leaveRequests.detail.academicNoteMakeupDesc")}
                    </p>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};
