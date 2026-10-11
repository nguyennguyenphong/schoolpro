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

interface LeaveRequestListItemProps {
  item: LeaveRequestItem;
  onViewDetail: (item: LeaveRequestItem) => void;
}

export const LeaveRequestListItem: React.FC<LeaveRequestListItemProps> = ({
  item,
  onViewDetail,
}) => {
  return (
    <div
      onClick={() => onViewDetail(item)}
      className="bg-white rounded-xl border border-[#f0f0f0] hover:border-blue-400 shadow-2xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all cursor-pointer"
    >
      {/* Left: Key info */}
      <div className="space-y-1.5 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Tag
            color={LEAVE_TYPE_COLORS[item.leaveType] || "blue"}
            className="m-0 text-[11px] font-semibold px-2.5 py-0.5"
          >
            {LEAVE_TYPE_LABELS[item.leaveType] || "Xin nghỉ phép"}
          </Tag>
          <Tag
            color={LEAVE_STATUS_COLORS[item.status] || "default"}
            className="m-0 text-[11px] font-bold px-2.5 py-0.5"
          >
            {LEAVE_STATUS_LABELS[item.status] || item.status}
          </Tag>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 ml-1">
            <Icon name="calendar" size={13} className="text-blue-600" />
            <span>{formatLeaveDateRange(item.startDate, item.endDate)}</span>
            <span className="text-blue-600 font-semibold">
              ({item.totalDays} ngày • {SESSION_SHIFT_LABELS[item.sessionShift] || "Cả ngày"})
            </span>
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 line-clamp-1 mb-0">{item.reason}</p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
          <span>Ngày gửi: {formatDateTimeDisplay(item.createdAt)}</span>
          {item.affectedSubjects && item.affectedSubjects.length > 0 && (
            <span className="text-slate-600">
              • Môn nghỉ: <strong>{item.affectedSubjects.join(", ")}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Right: Single Detail Button */}
      <div
        className="flex items-center self-end md:self-center shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="primary"
          onClick={() => onViewDetail(item)}
          className="text-xs px-3 py-1.5"
        >
          <span>Chi tiết</span>
          <Icon name="chevron-right" size={13} />
        </Button>
      </div>
    </div>
  );
};
