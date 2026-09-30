import React from "react";
import { Empty } from "antd";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { WeeklyReportItem } from "@/modules/students/features/contact-book/types";

interface WeeklyReportListViewProps {
  reports: WeeklyReportItem[];
  onOpenConfirmModal: (weekNumber: number) => void;
  onResetFilters: () => void;
  hasFilters: boolean;
}

export const WeeklyReportListView: React.FC<WeeklyReportListViewProps> = ({
  reports,
  onOpenConfirmModal,
  onResetFilters,
  hasFilters,
}) => {
  if (reports.length === 0) {
    return (
      <div className="p-10 sm:p-14 text-center bg-white rounded-xl border border-slate-200 shadow-2xs">
        <Empty
          description={
            <div className="space-y-1.5">
              <p className="text-sm font-bold text-slate-700 mb-0">
                Không tìm thấy phiếu liên lạc tuần phù hợp
              </p>
              <p className="text-xs text-slate-500 mb-0 max-w-md mx-auto">
                {hasFilters
                  ? "Không có báo cáo tuần nào khớp với tuần hoặc từ khóa tìm kiếm đã chọn."
                  : "Chưa có báo cáo tuần nào được cập nhật trong học kỳ này."}
              </p>
            </div>
          }
        >
          {hasFilters && (
            <Button variant="outline" onClick={onResetFilters} className="mt-3">
              Đặt lại bộ lọc
            </Button>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => {
        const isConfirmed = Boolean(report.parentFeedback?.isConfirmed);

        return (
          <Card
            key={report.id}
            className="rounded-xl border-slate-200 shadow-2xs overflow-hidden transition-all hover:border-blue-300 [&>.ant-card-body]:p-5"
          >
            {/* Header: Week number, dates & tags */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-extrabold text-sm flex items-center justify-center shrink-0">
                  T{report.weekNumber}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 mb-0">
                      Phiếu liên lạc Tuần {report.weekNumber}
                    </h3>
                    {isConfirmed ? (
                      <Tag color="success" className="m-0 font-semibold text-[10px]">
                        Phụ huynh đã ký
                      </Tag>
                    ) : (
                      <Tag color="warning" className="m-0 font-semibold text-[10px]">
                        Chờ ký nhận
                      </Tag>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Icon name="calendar" size={12} className="text-slate-400" />
                    Từ ngày <strong>{report.startDate}</strong> đến <strong>{report.endDate}</strong>
                  </span>
                </div>
              </div>

              {/* Attendance quick badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold flex items-center gap-1">
                  <Icon name="checkCircle" size={13} />
                  <span>{report.attendanceSummary.present} buổi có mặt</span>
                </div>
                {report.attendanceSummary.excused > 0 && (
                  <div className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-semibold">
                    {report.attendanceSummary.excused} nghỉ có phép
                  </div>
                )}
                {report.attendanceSummary.unexcused > 0 && (
                  <div className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                    {report.attendanceSummary.unexcused} không phép
                  </div>
                )}
                <div className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold">
                  Nề nếp: {report.disciplinePoints} đ
                </div>
              </div>
            </div>

            {/* Body: Teacher's evaluation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              {/* Study evaluation */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Icon name="book" size={14} className="text-blue-600" />
                  Đánh giá học tập trong tuần
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-0">
                  {report.studyComment}
                </p>
              </div>

              {/* Discipline evaluation */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Icon name="userCheck" size={14} className="text-emerald-600" />
                  Kỷ luật & Tinh thần nề nếp
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-0">
                  {report.disciplineComment}
                </p>
              </div>
            </div>

            {/* Teacher signature info */}
            <div className="flex items-center justify-between text-xs text-slate-500 py-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <Icon name="check" size={13} className="text-emerald-600" />
                Giáo viên ký duyệt: <strong className="text-slate-800">{report.teacherSignature}</strong>
              </span>
              <span>Ngày gửi: {report.signedDate}</span>
            </div>

            {/* Parent Feedback Block */}
            <div className="mt-3 pt-3 border-t border-dashed border-slate-200">
              {report.parentFeedback ? (
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <Icon name="mail" size={14} className="text-blue-600" />
                        Ý kiến phản hồi từ gia đình:
                      </span>
                      <span className="text-[11px] text-blue-600 font-medium">
                        ({report.parentFeedback.senderName} • {report.parentFeedback.submittedAt})
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 italic mb-0">
                      "{report.parentFeedback.content}"
                    </p>
                  </div>

                  <Tag color="success" className="shrink-0 m-0 font-semibold text-xs">
                    <Icon name="check" size={12} className="inline mr-1" />
                    Đã ký xác nhận
                  </Tag>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Icon name="warning" size={14} className="text-amber-600" />
                      Gia đình chưa ký xác nhận phiếu tuần này
                    </span>
                    <p className="text-xs text-amber-700 mb-0">
                      Quý phụ huynh vui lòng đọc kỹ nhận xét và gửi ý kiến phản hồi kèm ký xác nhận điện tử.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => onOpenConfirmModal(report.weekNumber)}
                    className="shrink-0 text-xs font-semibold"
                  >
                    <Icon name="edit" size={14} />
                    <span>Ký xác nhận & Phản hồi</span>
                  </Button>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
