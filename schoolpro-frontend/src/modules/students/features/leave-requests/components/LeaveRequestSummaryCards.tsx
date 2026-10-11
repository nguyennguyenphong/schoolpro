import React from "react";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { LeaveRequestSummary } from "@/modules/students/features/leave-requests/types";

interface LeaveRequestSummaryCardsProps {
  summary?: LeaveRequestSummary | null;
  loading?: boolean;
}

export const LeaveRequestSummaryCards: React.FC<LeaveRequestSummaryCardsProps> = ({
  summary,
  loading = false,
}) => {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            loading={true}
            className="rounded-xl shadow-2xs border-[#f0f0f0] h-[145px]"
            skeletonProps={{
              paragraph: { rows: 2 },
            }}
          />
        ))}
      </div>
    );
  }

  const remainingDays = Math.max(0, summary.maxAllowedDays - summary.totalDaysOff);
  const approvalRate =
    summary.total > 0 ? Math.round((summary.approvedCount / summary.total) * 100) : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng số đơn xin nghỉ */}
      <Card className="rounded-xl shadow-2xs hover:border-blue-400 transition-all">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tổng số đơn đã gửi
          </span>
          <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Icon name="file-text" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.total}
          </span>
          <span className="text-xs text-slate-400 font-semibold">đơn</span>
          {summary.semesterName && (
            <Tag color="processing" className="ml-auto m-0 font-semibold">
              {summary.semesterName}
            </Tag>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Lớp học:{" "}
            <strong className="text-slate-700">{summary.className || "10A1"}</strong>
          </span>
          <span className="text-blue-600 font-medium">Toàn học kỳ</span>
        </div>
      </Card>

      {/* 2. Đơn đang chờ duyệt */}
      <Card className="rounded-xl shadow-2xs hover:border-amber-400 transition-all">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Đang chờ GVCN duyệt
          </span>
          <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Icon name="clock" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
            {summary.pendingCount}
          </span>
          <span className="text-xs text-slate-400 font-semibold">đơn chờ</span>
          <Tag
            color={summary.pendingCount > 0 ? "warning" : "success"}
            className="ml-auto m-0 font-semibold"
          >
            {summary.pendingCount > 0 ? "Đang xử lý" : "Đã duyệt hết"}
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span className="truncate max-w-44">
            GVCN:{" "}
            <strong className="text-slate-700">
              {summary.homeroomTeacherName || "Giáo viên"}
            </strong>
          </span>
          <span className="text-amber-600 font-medium">Có thể sửa/hủy</span>
        </div>
      </Card>

      {/* 3. Đơn đã được phê duyệt */}
      <Card className="rounded-xl shadow-2xs hover:border-emerald-400 transition-all">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Đơn đã phê duyệt
          </span>
          <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Icon name="checkCircle" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            {summary.approvedCount}
          </span>
          <span className="text-xs text-slate-400 font-semibold">đơn hợp lệ</span>
          <Tag color="success" className="ml-auto m-0 font-semibold">
            {approvalRate}%
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Từ chối / Đã hủy:{" "}
            <strong className="text-rose-600">
              {summary.rejectedCount + summary.cancelledCount}
            </strong>
          </span>
          <span className="text-emerald-600 font-medium">Vắng có phép</span>
        </div>
      </Card>

      {/* 4. Quỹ ngày nghỉ phép năm học */}
      <Card className="rounded-xl shadow-2xs hover:border-cyan-400 transition-all">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tổng ngày nghỉ có phép
          </span>
          <span className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200 flex items-center justify-center shrink-0">
            <Icon name="calendar" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-cyan-600 tracking-tight">
            {summary.totalDaysOff}
          </span>
          <span className="text-xs text-slate-400 font-semibold">
            / {summary.maxAllowedDays} ngày
          </span>
          <Tag color="cyan" className="ml-auto m-0 font-semibold">
            Còn {remainingDays} ngày
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Quy định Bộ GD&ĐT</span>
          <span className="text-cyan-700 font-semibold">Tối đa 45 buổi/năm</span>
        </div>
      </Card>
    </div>
  );
};
