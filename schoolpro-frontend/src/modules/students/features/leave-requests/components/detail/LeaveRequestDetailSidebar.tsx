import type React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";
import {
  LEAVE_STATUS_COLORS,
  formatDateTimeDisplay,
  getLeaveStatusLabel,
} from "@/modules/students/features/leave-requests/utils/leaveRequestHelpers";

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
    <div className="space-y-4">
      {/* 1. Thông tin Học sinh */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-slate-700 inline-block" />
          <h3 className="text-sm font-bold text-slate-900 mb-0">
            {t("card:leaveRequests.detail.studentInfoCardTitle")}
          </h3>
        </div>

        <div className="space-y-2 text-xs">
          {item.code && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">
                {t("card:leaveRequests.detail.code12DigitsLabel")}
              </span>
              <strong className="text-slate-800 font-mono">{item.code}</strong>
            </div>
          )}
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
            <span className="text-slate-500">
              {t("card:leaveRequests.summary.classLabel")}
            </span>
            <strong className="text-blue-600">
              {t("card:leaveRequests.header.classBadge", { className: item.className })}
            </strong>
          </div>
        </div>
      </div>

      {/* 2. Người phê duyệt: Giáo viên chủ nhiệm & Hạn phê duyệt trước 3 giờ */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
            <h3 className="text-sm font-bold text-slate-900 mb-0">
              {t("card:leaveRequests.detail.homeroomCardTitle")}
            </h3>
          </div>
          <Tag
            color={LEAVE_STATUS_COLORS[item.status] || "default"}
            className="m-0 text-xs font-bold"
          >
            {getLeaveStatusLabel(item.status)}
          </Tag>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">
              {t("card:leaveRequests.detail.homeroomFullNameLabel")}
            </span>
            <strong className="text-slate-800">{item.homeroomTeacherName}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">
              {t("card:leaveRequests.detail.authorityLabel")}
            </span>
            <span className="font-semibold text-blue-600">
              {homeroomAsSubject
                ? t("card:leaveRequests.detail.authorityCombined", {
                    subjects: homeroomAsSubject.subjects.join(", "),
                  })
                : t("card:leaveRequests.detail.authorityOfficial")}
            </span>
          </div>
          {item.homeroomTeacherEmail && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">
                {t("card:leaveRequests.detail.notificationEmailLabel")}
              </span>
              <a
                href={`mailto:${item.homeroomTeacherEmail}`}
                className="text-blue-600 hover:underline font-medium"
              >
                {item.homeroomTeacherEmail}
              </a>
            </div>
          )}
          {item.approvalDeadline && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">
                {t("card:leaveRequests.detail.approvalDeadlineShortLabel")}
              </span>
              <strong className="text-amber-700 font-mono">
                {formatDateTimeDisplay(item.approvalDeadline)}
              </strong>
            </div>
          )}
          {item.status === "approved" && (
            <div className="flex items-center justify-between">
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
            <div className="flex items-center justify-between">
              <span className="text-slate-500">
                {t("card:leaveRequests.detail.reviewedAtLabel")}
              </span>
              <strong className="text-slate-700 font-mono">
                {formatDateTimeDisplay(item.reviewedAt)}
              </strong>
            </div>
          )}
        </div>

        {item.teacherNote ? (
          <div
            className={`p-3 rounded-xl border text-xs ${
              item.status === "rejected"
                ? "bg-rose-50/70 border-rose-200 text-rose-900"
                : "bg-emerald-50/70 border-emerald-200 text-emerald-900"
            }`}
          >
            <div className="font-bold mb-1">
              {item.isAutoApproved
                ? t("card:leaveRequests.detail.systemNoteLabel")
                : t("card:leaveRequests.detail.homeroomNoteLabel")}
            </div>
            <p className="mb-0 italic leading-relaxed">{item.teacherNote}</p>
          </div>
        ) : item.status === "pending" ? (
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-800 text-xs">
            {t("card:leaveRequests.detail.pendingDeadlineWarning", {
              deadline: formatDateTimeDisplay(item.approvalDeadline),
            })}
          </div>
        ) : null}
      </div>

      {/* 3. Danh sách Giáo viên bộ môn nhận thông báo */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-purple-600 inline-block" />
            <h3 className="text-sm font-bold text-slate-900 mb-0">
              {t("card:leaveRequests.detail.subjectTeachersCardTitle")}
            </h3>
          </div>
          <Tag color="purple" className="m-0 text-[11px] font-semibold">
            {t("card:leaveRequests.detail.subjectTeachersCountBadge", {
              count: otherSubjectTeachers.length,
            })}
          </Tag>
        </div>

        <p className="text-[11px] text-slate-500 mb-0">
          {t("card:leaveRequests.detail.subjectTeachersCardDesc")}
        </p>

        {homeroomAsSubject && (
          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1">
            <div className="flex items-center justify-between gap-2">
              <strong className="text-slate-900 truncate">{homeroomAsSubject.teacherName}</strong>
              <Tag color="blue" className="m-0 text-[10px] font-semibold shrink-0">
                {t("card:leaveRequests.detail.homeroomCombinedShortBadge")}
              </Tag>
            </div>
            <div className="text-[11px] text-slate-600">
              {t("card:leaveRequests.detail.teachingSubjectsPrefix")}{" "}
              <strong>{homeroomAsSubject.subjects.join(", ")}</strong> (
              {t("card:leaveRequests.form.periodsCount", {
                count: homeroomAsSubject.lessonCount,
              })}
              )
            </div>
          </div>
        )}

        {otherSubjectTeachers.length > 0 ? (
          <div className="space-y-2">
            {otherSubjectTeachers.map((teacher, idx) => (
              <div
                key={teacher.teacherId || idx}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-slate-800 truncate">{teacher.teacherName}</strong>
                  <Tag
                    color={item.status === "approved" ? "success" : "cyan"}
                    className="m-0 text-[10px] font-semibold shrink-0"
                  >
                    {item.status === "approved"
                      ? t("card:leaveRequests.detail.notifiedAfterApprovalBadge")
                      : t("card:leaveRequests.detail.notifiedOnSubmitBadge")}
                  </Tag>
                </div>
                <div className="text-[11px] text-slate-600">
                  {t("card:leaveRequests.detail.teachingSubjectsPrefix")}{" "}
                  <strong>{teacher.subjects.join(", ")}</strong> (
                  {t("card:leaveRequests.form.periodsCount", { count: teacher.lessonCount })})
                </div>
                {teacher.teacherEmail && (
                  <div className="text-[11px] text-slate-400 truncate">
                    {teacher.teacherEmail}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : !homeroomAsSubject ? (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
            {t("card:leaveRequests.detail.noOtherSubjectTeachers")}
          </div>
        ) : null}
      </div>

      {/* 4. Minh chứng / Tài liệu đính kèm */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
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

      {/* 5. Thông tin Phụ huynh xác nhận */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-emerald-600 inline-block" />
          <h3 className="text-sm font-bold text-slate-900 mb-0">
            {t("card:leaveRequests.detail.guardianCardTitle")}
          </h3>
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
              <span className="text-slate-500">
                {t("card:leaveRequests.detail.phoneLabel")}
              </span>
              <strong className="text-blue-600">{item.guardianPhone}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
