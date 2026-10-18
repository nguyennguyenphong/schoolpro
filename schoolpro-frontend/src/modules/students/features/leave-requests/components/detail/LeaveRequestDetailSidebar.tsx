import type React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";
import { formatDateTimeDisplay } from "@/modules/students/features/leave-requests/utils/leaveRequestHelpers";

interface LeaveRequestDetailSidebarProps {
  item: LeaveRequestItem;
}

export const LeaveRequestDetailSidebar: React.FC<LeaveRequestDetailSidebarProps> = ({ item }) => {
  const { t } = useTranslation(["card", "button", "input"]);
  const hasAttachments =
    (item.attachments && item.attachments.length > 0) || Boolean(item.supportingDocumentUrl);
  const notifiedTeachers = item.notifiedTeachers || [];

  const homeroomAsSubject = notifiedTeachers.find((teacher) => teacher.isHomeroomTeacher);
  const otherSubjectTeachers = notifiedTeachers.filter((teacher) => !teacher.isHomeroomTeacher);

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* 1. Homeroom Teacher & Reviewer Card */}
      <div className="bg-white p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[#f0f0f0] pb-3">
          <span className="w-1.5 h-4.5 rounded-full bg-blue-600 inline-block" />
          <h3 className="text-base font-bold text-slate-900 mb-0">
            {t("card:leaveRequests.detail.homeroomCardTitle")}
          </h3>
        </div>

        {/* Homeroom Teacher Details */}
        <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/70 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
              <Icon name="user" size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <strong className="text-sm font-bold text-slate-900 block truncate">
                {item.homeroomTeacherName}
              </strong>
              <span className="text-xs text-slate-500 block truncate">
                {t("card:leaveRequests.header.classBadge", { className: item.className })}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 space-y-2 text-xs">
            {item.homeroomTeacherEmail && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500">
                  {t("card:leaveRequests.detail.notificationEmailLabel")}
                </span>
                <a
                  href={`mailto:${item.homeroomTeacherEmail}`}
                  className="text-blue-600 font-medium truncate max-w-44"
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

            {item.status === "approved" && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500">
                  {t("card:leaveRequests.detail.approvalMethodLabel")}
                </span>
                <strong className={item.isAutoApproved ? "text-cyan-700" : "text-emerald-700"}>
                  {item.isAutoApproved
                    ? t("card:leaveRequests.detail.approvalMethodAuto")
                    : t("card:leaveRequests.detail.approvalMethodDirect")}
                </strong>
              </div>
            )}

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

        {/* Notified Subject Teachers Section */}
        {otherSubjectTeachers.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-[#f0f0f0]">
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

            <div className="space-y-2">
              {otherSubjectTeachers.map((teacher, idx) => (
                <div
                  key={teacher.teacherId || idx}
                  className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 truncate">{teacher.teacherName}</div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {teacher.subjects.join(", ")} (
                      {t("card:leaveRequests.form.periodsCount", { count: teacher.lessonCount })})
                    </div>
                  </div>
                  <Tag
                    color={item.status === "approved" ? "success" : "cyan"}
                    className="m-0 text-[10px] font-semibold shrink-0"
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

      {/* 2. Guardian Confirmation Card */}
      <div className="bg-white p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3.5">
        <div className="flex items-center gap-2.5 border-b border-[#f0f0f0] pb-3">
          <span className="w-1.5 h-4.5 rounded-full bg-emerald-600 inline-block" />
          <h3 className="text-base font-bold text-slate-900 mb-0">
            {t("card:leaveRequests.detail.guardianCardTitle")}
          </h3>
        </div>

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
                className="text-blue-600 font-bold text-right"
              >
                {item.guardianPhone}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 3. Supporting Documents & Attachments Card */}
      <div className="bg-white p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3.5">
        <div className="flex items-center gap-2.5 border-b border-[#f0f0f0] pb-3">
          <span className="w-1.5 h-4.5 rounded-full bg-indigo-600 inline-block" />
          <h3 className="text-base font-bold text-slate-900 mb-0">
            {t("card:leaveRequests.detail.attachmentsCardTitle")}
          </h3>
        </div>

        {hasAttachments ? (
          <div className="space-y-2">
            {item.attachments && item.attachments.length > 0 ? (
              item.attachments.map((att, idx) => (
                <div
                  key={att.id || idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Icon name="paperclip" size={15} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-900 block truncate">
                        {att.name}
                      </span>
                      {att.size && <span className="text-slate-400 text-[11px]">{att.size}</span>}
                    </div>
                  </div>
                  {att.url && (
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 font-semibold shrink-0 ml-2"
                    >
                      <span>{t("button:openAttachment")}</span>
                      <Icon name="external-link" size={12} />
                    </a>
                  )}
                </div>
              ))
            ) : item.supportingDocumentUrl ? (
              <a
                href={item.supportingDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs font-semibold text-blue-700"
              >
                <span className="inline-flex items-center gap-2">
                  <Icon name="paperclip" size={15} />
                  <span>{t("card:leaveRequests.detail.supportingDocumentDefault")}</span>
                </span>
                <Icon name="external-link" size={13} />
              </a>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-slate-400 mb-0 py-2 text-center">
            {t("card:leaveRequests.detail.noAttachments")}
          </p>
        )}
      </div>
    </div>
  );
};
