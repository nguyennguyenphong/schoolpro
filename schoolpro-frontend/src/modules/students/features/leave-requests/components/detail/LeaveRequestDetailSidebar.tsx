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
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Giáo viên chủ nhiệm phê duyệt & Giáo viên bộ môn nhận thông báo */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-4">
        {/* Phần Giáo viên chủ nhiệm */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
            <h3 className="text-sm font-bold text-slate-900 mb-0">
              {t("card:leaveRequests.detail.homeroomCardTitle")}
            </h3>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">
                {t("card:leaveRequests.detail.homeroomFullNameLabel")}
              </span>
              <strong className="text-slate-800">{item.homeroomTeacherName}</strong>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">
                {t("card:leaveRequests.detail.authorityLabel")}
              </span>
              <span className="font-semibold text-blue-600 text-right">
                {homeroomAsSubject
                  ? t("card:leaveRequests.detail.authorityCombined", {
                      subjects: homeroomAsSubject.subjects.join(", "),
                    })
                  : t("card:leaveRequests.detail.authorityOfficial")}
              </span>
            </div>
            {item.homeroomTeacherEmail && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500">
                  {t("card:leaveRequests.detail.notificationEmailLabel")}
                </span>
                <a
                  href={`mailto:${item.homeroomTeacherEmail}`}
                  className="text-blue-600 hover:underline font-medium truncate"
                >
                  {item.homeroomTeacherEmail}
                </a>
              </div>
            )}
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
                <strong className="text-slate-700 font-mono">
                  {formatDateTimeDisplay(item.reviewedAt)}
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* Phần Giáo viên bộ môn nhận thông báo */}
        <div className="space-y-2.5 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              {t("card:leaveRequests.detail.subjectTeachersCardTitle")}
            </span>
            <Tag color="purple" className="m-0 text-[11px] font-semibold">
              {t("card:leaveRequests.detail.subjectTeachersCountBadge", {
                count: otherSubjectTeachers.length,
              })}
            </Tag>
          </div>

          {otherSubjectTeachers.length > 0 ? (
            <div className="space-y-2">
              {otherSubjectTeachers.map((teacher, idx) => (
                <div
                  key={teacher.teacherId || idx}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-xs"
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
          ) : !homeroomAsSubject ? (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
              {t("card:leaveRequests.detail.noOtherSubjectTeachers")}
            </div>
          ) : null}
        </div>
      </div>

      {/* 2. Thông tin Học sinh & Phụ huynh xác nhận */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-4">
        {/* Học sinh */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <span className="w-1.5 h-4 rounded-full bg-slate-700 inline-block" />
            <h3 className="text-sm font-bold text-slate-900 mb-0">
              {t("card:leaveRequests.detail.studentInfoCardTitle")}
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{t("card:leaveRequests.detail.fullNameLabel")}</span>
              <strong className="text-slate-800">{item.studentName}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">
                {t("card:leaveRequests.detail.studentCodeLabel")}
              </span>
              <strong className="text-slate-700 font-mono">{item.studentCode}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{t("card:leaveRequests.summary.classLabel")}</span>
              <strong className="text-blue-600">
                {t("card:leaveRequests.header.classBadge", { className: item.className })}
              </strong>
            </div>
          </div>
        </div>

        {/* Phụ huynh / Người giám hộ */}
        <div className="space-y-2.5 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 rounded-full bg-emerald-600 inline-block" />
            <span className="text-xs font-bold text-slate-800">
              {t("card:leaveRequests.detail.guardianCardTitle")}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{t("card:leaveRequests.detail.fullNameLabel")}</span>
              <strong className="text-slate-800">
                {item.guardianName || t("card:leaveRequests.detail.notUpdated")}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">
                {t("card:leaveRequests.detail.relationshipLabel")}
              </span>
              <strong className="text-slate-700">
                {item.guardianRelationship || t("input:leaveRequests.relationshipParentDefault")}
              </strong>
            </div>
            {item.guardianPhone && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t("card:leaveRequests.detail.phoneLabel")}</span>
                <strong className="text-blue-600 font-mono">{item.guardianPhone}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Tài liệu minh chứng đính kèm */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
          <h3 className="text-sm font-bold text-slate-900 mb-0">
            {t("card:leaveRequests.detail.attachmentsCardTitle")}
          </h3>
        </div>

        {hasAttachments ? (
          <div className="space-y-2">
            {item.attachments && item.attachments.length > 0 ? (
              item.attachments.map((att, idx) => (
                <div
                  key={att.id || idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon name="paperclip" size={14} className="text-blue-600 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{att.name}</span>
                    {att.size && <span className="text-slate-400">({att.size})</span>}
                  </div>
                  {att.url && (
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold shrink-0"
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
                className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <Icon name="paperclip" size={14} />
                  <span>{t("card:leaveRequests.detail.supportingDocumentDefault")}</span>
                </span>
                <Icon name="external-link" size={13} />
              </a>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-slate-500 mb-0">
            {t("card:leaveRequests.detail.noAttachments")}
          </p>
        )}
      </div>
    </div>
  );
};
