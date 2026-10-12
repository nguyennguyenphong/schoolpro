import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(["card"]);

  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-xl shadow-2xs border-[#f0f0f0]">
            <div className="animate-pulse">
              {/* Row 1: Title & Icon box */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/70 shrink-0" />
              </div>

              {/* Row 2: Big metric number, unit & right Tag */}
              <div className="flex items-baseline gap-2 mb-2">
                <div className="h-8 sm:h-9 w-12 bg-slate-200 rounded-lg" />
                <div className="h-4 w-16 bg-slate-100 rounded" />
                <div className="ml-auto h-5.5 w-20 bg-slate-100 rounded-md" />
              </div>

              {/* Row 3: Bottom border info strip */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="h-4 w-28 bg-slate-100 rounded" />
                <div className="h-4 w-20 bg-slate-100 rounded" />
              </div>
            </div>
          </Card>
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
            {t("card:leaveRequests.summary.totalTitle")}
          </span>
          <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Icon name="file-text" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.total}
          </span>
          <span className="text-xs text-slate-400 font-semibold">
            {t("card:leaveRequests.summary.requestUnit")}
          </span>
          {summary.semesterName && (
            <Tag color="processing" className="ml-auto m-0 font-semibold">
              {summary.semesterName}
            </Tag>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            {t("card:leaveRequests.summary.classLabel")}{" "}
            <strong className="text-slate-700">{summary.className || "10A1"}</strong>
          </span>
          <span className="text-blue-600 font-medium">
            {t("card:leaveRequests.summary.allSemester")}
          </span>
        </div>
      </Card>

      {/* 2. Đơn đang chờ duyệt */}
      <Card className="rounded-xl shadow-2xs hover:border-amber-400 transition-all">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t("card:leaveRequests.summary.pendingTitle")}
          </span>
          <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Icon name="clock" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
            {summary.pendingCount}
          </span>
          <span className="text-xs text-slate-400 font-semibold">
            {t("card:leaveRequests.summary.pendingUnit")}
          </span>
          <Tag
            color={summary.pendingCount > 0 ? "warning" : "success"}
            className="ml-auto m-0 font-semibold"
          >
            {summary.pendingCount > 0
              ? t("card:leaveRequests.summary.processingTag")
              : t("card:leaveRequests.summary.allApprovedTag")}
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span className="truncate max-w-44">
            {t("card:leaveRequests.header.homeroomTeacherPrefix")}{" "}
            <strong className="text-slate-700">
              {summary.homeroomTeacherName || t("card:leaveRequests.header.teacherFallback")}
            </strong>
          </span>
          <span className="text-amber-600 font-medium">
            {t("card:leaveRequests.summary.editableHint")}
          </span>
        </div>
      </Card>

      {/* 3. Đơn đã được phê duyệt */}
      <Card className="rounded-xl shadow-2xs hover:border-emerald-400 transition-all">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t("card:leaveRequests.summary.approvedTitle")}
          </span>
          <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Icon name="checkCircle" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            {summary.approvedCount}
          </span>
          <span className="text-xs text-slate-400 font-semibold">
            {t("card:leaveRequests.summary.validUnit")}
          </span>
          <Tag color="success" className="ml-auto m-0 font-semibold">
            {approvalRate}%
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            {t("card:leaveRequests.summary.rejectedOrCancelled")}{" "}
            <strong className="text-rose-600">
              {summary.rejectedCount + summary.cancelledCount}
            </strong>
          </span>
          <span className="text-emerald-600 font-medium">
            {t("card:leaveRequests.summary.excusedAbsence")}
          </span>
        </div>
      </Card>

      {/* 4. Quỹ ngày nghỉ phép năm học */}
      <Card className="rounded-xl shadow-2xs hover:border-cyan-400 transition-all">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t("card:leaveRequests.summary.daysOffTitle")}
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
            {t("card:leaveRequests.summary.maxAllowedDays", { max: summary.maxAllowedDays })}
          </span>
          <Tag color="cyan" className="ml-auto m-0 font-semibold">
            {t("card:leaveRequests.summary.remainingDays", { count: remainingDays })}
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>{t("card:leaveRequests.summary.ministryRegulation")}</span>
          <span className="text-cyan-700 font-semibold">
            {t("card:leaveRequests.summary.maxSessionsPerYear")}
          </span>
        </div>
      </Card>
    </div>
  );
};
