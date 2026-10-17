import type React from "react";
import { Icon } from "@/components/ui/Icon";

export interface TimetableWeekBadgeProps {
  currentWeekLabel?: string;
  semesterLabel?: string;
}

export const TimetableWeekBadge: React.FC<TimetableWeekBadgeProps> = ({
  currentWeekLabel,
  semesterLabel,
}) => {
  if (!currentWeekLabel && !semesterLabel) {
    return null;
  }

  return (
    <div className="flex items-center flex-wrap gap-2">
      {currentWeekLabel && (
        <div className="inline-flex items-center h-8 px-2.5 rounded-lg bg-blue-50/80 border border-blue-100 text-blue-700 text-xs font-semibold shadow-2xs shrink-0">
          <Icon name="calendar" size={13} className="text-blue-600 shrink-0 mr-1.5" />
          <span>{currentWeekLabel}</span>
        </div>
      )}

      {semesterLabel && (
        <div className="inline-flex items-center h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium shrink-0">
          <Icon name="academic" size={13} className="text-slate-500 shrink-0 mr-1.5" />
          <span>{semesterLabel}</span>
        </div>
      )}
    </div>
  );
};
