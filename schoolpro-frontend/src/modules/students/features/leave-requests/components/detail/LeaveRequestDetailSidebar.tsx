import type React from "react";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";
import {
  LEAVE_STATUS_COLORS,
  LEAVE_STATUS_LABELS,
  formatDateTimeDisplay,
} from "@/modules/students/features/leave-requests/utils/leaveRequestHelpers";

interface LeaveRequestDetailSidebarProps {
  item: LeaveRequestItem;
}

export const LeaveRequestDetailSidebar: React.FC<LeaveRequestDetailSidebarProps> = ({ item }) => {
  const hasAttachments =
    (item.attachments && item.attachments.length > 0) || Boolean(item.supportingDocumentUrl);
  const notifiedTeachers = item.notifiedTeachers || [];

  const homeroomAsSubject = notifiedTeachers.find((t) => t.isHomeroomTeacher);
  const otherSubjectTeachers = notifiedTeachers.filter((t) => !t.isHomeroomTeacher);

  return (
    <div className="space-y-4">
      {/* 1. Thông tin Học sinh */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-slate-700 inline-block" />
          <h3 className="text-sm font-bold text-slate-900 mb-0">Thông tin học sinh</h3>
        </div>

        <div className="space-y-2 text-xs">
          {item.code && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Mã đơn (12 số):</span>
              <strong className="text-slate-800 font-mono">{item.code}</strong>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Họ và tên:</span>
            <strong className="text-slate-800">{item.studentName}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Mã số học sinh:</span>
            <strong className="text-slate-700 font-mono">{item.studentCode}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Lớp học:</span>
            <strong className="text-blue-600">Lớp {item.className}</strong>
          </div>
        </div>
      </div>

      {/* 2. Người phê duyệt: Giáo viên chủ nhiệm & Hạn phê duyệt trước 3 giờ */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
            <h3 className="text-sm font-bold text-slate-900 mb-0">
              Giáo viên chủ nhiệm (Người duyệt)
            </h3>
          </div>
          <Tag
            color={LEAVE_STATUS_COLORS[item.status] || "default"}
            className="m-0 text-xs font-bold"
          >
            {LEAVE_STATUS_LABELS[item.status] || item.status}
          </Tag>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Họ và tên Giáo viên chủ nhiệm:</span>
            <strong className="text-slate-800">{item.homeroomTeacherName}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Thẩm quyền:</span>
            <span className="font-semibold text-blue-600">
              {homeroomAsSubject
                ? `Giáo viên chủ nhiệm kiêm Giáo viên bộ môn (${homeroomAsSubject.subjects.join(", ")}) • Gửi 1 lần`
                : "Phê duyệt đơn chính thức"}
            </span>
          </div>
          {item.homeroomTeacherEmail && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Email nhận thông báo:</span>
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
              <span className="text-slate-500">Hạn duyệt (trước 03h):</span>
              <strong className="text-amber-700 font-mono">
                {formatDateTimeDisplay(item.approvalDeadline)}
              </strong>
            </div>
          )}
          {item.status === "approved" && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Hình thức duyệt:</span>
              <strong className={item.isAutoApproved ? "text-cyan-700" : "text-emerald-700"}>
                {item.isAutoApproved
                  ? "Hệ thống tự động duyệt (quá hạn 3h)"
                  : "Giáo viên chủ nhiệm phê duyệt trực tiếp"}
              </strong>
            </div>
          )}
          {item.reviewedAt && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Thời gian duyệt:</span>
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
              {item.isAutoApproved ? "Ghi chú hệ thống:" : "Lời phê của Giáo viên chủ nhiệm:"}
            </div>
            <p className="mb-0 italic leading-relaxed">{item.teacherNote}</p>
          </div>
        ) : item.status === "pending" ? (
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-800 text-xs">
            Hạn phê duyệt từ lúc đăng ký đến trước thời gian diễn ra môn học 03 giờ (
            <strong>{formatDateTimeDisplay(item.approvalDeadline)}</strong>). Nếu quá hạn chưa duyệt, hệ thống sẽ tự động phê duyệt và gửi Email kết quả.
          </div>
        ) : null}
      </div>

      {/* 3. Danh sách Giáo viên bộ môn nhận thông báo */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-purple-600 inline-block" />
            <h3 className="text-sm font-bold text-slate-900 mb-0">
              Giáo viên bộ môn nhận thông báo
            </h3>
          </div>
          <Tag color="purple" className="m-0 text-[11px] font-semibold">
            {otherSubjectTeachers.length} Giáo viên bộ môn
          </Tag>
        </div>

        <p className="text-[11px] text-slate-500 mb-0">
          Hệ thống thông báo khi học sinh đăng ký và thông báo lại sau khi đơn được duyệt. Trường hợp Giáo viên chủ nhiệm cũng là Giáo viên bộ môn thì chỉ gửi 01 lần duy nhất.
        </p>

        {homeroomAsSubject && (
          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1">
            <div className="flex items-center justify-between gap-2">
              <strong className="text-slate-900 truncate">{homeroomAsSubject.teacherName}</strong>
              <Tag color="blue" className="m-0 text-[10px] font-semibold shrink-0">
                Giáo viên chủ nhiệm kiêm Giáo viên bộ môn (Gửi 1 lần)
              </Tag>
            </div>
            <div className="text-[11px] text-slate-600">
              Môn dạy: <strong>{homeroomAsSubject.subjects.join(", ")}</strong> (
              {homeroomAsSubject.lessonCount} tiết)
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
                    {item.status === "approved" ? "Đã báo sau duyệt" : "Đã báo đăng ký"}
                  </Tag>
                </div>
                <div className="text-[11px] text-slate-600">
                  Môn dạy: <strong>{teacher.subjects.join(", ")}</strong> ({teacher.lessonCount} tiết)
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
            Không có giáo viên bộ môn nào khác bị ảnh hưởng.
          </div>
        ) : null}
      </div>

      {/* 4. Minh chứng / Tài liệu đính kèm */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
          <h3 className="text-sm font-bold text-slate-900 mb-0">
            Giấy tờ & Minh chứng đính kèm
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
                      <span>Mở</span>
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
                  <span>Tài liệu minh chứng đính kèm</span>
                </span>
                <Icon name="external-link" size={13} />
              </a>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-slate-500 mb-0">
            Không có tệp minh chứng đính kèm cho đơn này.
          </p>
        )}
      </div>

      {/* 5. Thông tin Phụ huynh xác nhận */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-emerald-600 inline-block" />
          <h3 className="text-sm font-bold text-slate-900 mb-0">
            Thông tin Phụ huynh xác nhận
          </h3>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Họ và tên:</span>
            <strong className="text-slate-800">{item.guardianName || "Chưa cập nhật"}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Mối quan hệ:</span>
            <strong className="text-slate-700">{item.guardianRelationship || "Phụ huynh"}</strong>
          </div>
          {item.guardianPhone && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Số điện thoại:</span>
              <strong className="text-blue-600">{item.guardianPhone}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
