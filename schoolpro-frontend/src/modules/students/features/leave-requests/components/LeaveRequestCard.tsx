import type React from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";
import {
  LEAVE_STATUS_COLORS,
  LEAVE_STATUS_LABELS,
  LEAVE_TYPE_COLORS,
  LEAVE_TYPE_LABELS,
  SESSION_SHIFT_LABELS,
  formatDateTimeDisplay,
  formatLeaveDateRange,
} from "@/modules/students/features/leave-requests/utils/leaveRequestHelpers";

interface LeaveRequestCardProps {
  item: LeaveRequestItem;
  onViewDetail: (item: LeaveRequestItem) => void;
}

export const LeaveRequestCard: React.FC<LeaveRequestCardProps> = ({
  item,
  onViewDetail,
}) => {
  return (
    <div
      className="bg-white rounded-xl border border-[#f0f0f0] shadow-2xs p-4 flex flex-col justify-between gap-3.5 h-full transition-all"
    >
      <div className="space-y-3">
        {/* 1. Type and Status */}
        <div className="flex items-center justify-between gap-2">
          <Tag
            color={LEAVE_TYPE_COLORS[item.leaveType] || "blue"}
            className="m-0 text-[11px] font-semibold px-2.5 py-0.5 truncate"
          >
            {LEAVE_TYPE_LABELS[item.leaveType] || "Xin nghỉ phép"}
          </Tag>

          <Tag
            color={LEAVE_STATUS_COLORS[item.status] || "default"}
            className="m-0 text-[11px] font-bold px-2.5 py-0.5 shrink-0"
          >
            {LEAVE_STATUS_LABELS[item.status] || item.status}
          </Tag>
        </div>

        {/* 2. Time and Number of days */}
        <div className="flex items-center justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            <Icon name="calendar" size={15} className="text-blue-600 shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
              {formatLeaveDateRange(item.startDate, item.endDate)}
            </span>
          </div>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 shrink-0">
            {item.totalDays} ngày • {SESSION_SHIFT_LABELS[item.sessionShift] || "Cả ngày"}
          </span>
        </div>

        {/* 3. Subject */}
        {item.affectedSubjects && item.affectedSubjects.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Môn nghỉ:</span>
            {item.affectedSubjects.slice(0, 3).map((subj) => (
              <Tag key={subj} color="cyan" className="m-0 text-[10px] font-semibold px-2 py-0">
                {subj}
              </Tag>
            ))}
            {item.affectedSubjects.length > 3 && (
              <span className="text-[11px] font-semibold text-slate-500">
                +{item.affectedSubjects.length - 3} môn
              </span>
            )}
          </div>
        )}

        {/* 4. Summary */}
        <p
          className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-0"
          title={item.reason}
        >
          {item.reason}
        </p>
      </div>

      {/* 4. Send Date and Detail Button */}
      <div
        className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-[11px] text-slate-400 truncate">
          {formatDateTimeDisplay(item.createdAt)}
        </span>

        <Button
          variant="ghost"
          onClick={() => onViewDetail(item)}
          href={`/student/leave-requests/${item.id}`}
          className="text-xs text-blue-600 font-semibold px-2.5 py-1 h-7 shrink-0"
        >
          <span>Chi tiết</span>
          <Icon name="chevron-right" size={13} />
        </Button>
      </div>
    </div>
  );
};
