import type React from "react";
import type { AttendanceViewMode } from "@/modules/students/features/attendance/types";

interface AttendanceSkeletonProps {
  count?: number;
  viewMode?: AttendanceViewMode;
}

/**
 * Skeleton for Student Attendance matching SubjectAttendanceCard (grid) and AttendanceListView (list).
 */
export const AttendanceSkeleton: React.FC<AttendanceSkeletonProps> = ({
  count = 4,
  viewMode = "grid",
}) => {
  const placeholders = Array.from({ length: count }, (_, idx) => idx + 1);

  if (viewMode === "list") {
    return (
      <div className="bg-white border border-[#f0f0f0] rounded-xl shadow-2xs p-4 space-y-3 animate-pulse">
        {placeholders.map((n) => (
          <div
            key={n}
            className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-b-0"
          >
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-4 w-36 bg-slate-100 rounded" />
            <div className="h-4 w-48 bg-slate-200 rounded" />
            <div className="h-5 w-24 bg-slate-100 rounded-full" />
            <div className="h-8 w-28 bg-slate-200 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {placeholders.map((n) => (
        <div
          key={n}
          className="w-full h-full min-h-105 bg-white border border-[#f0f0f0] rounded-xl p-3.5 flex flex-col justify-between shadow-2xs"
        >
          <div className="space-y-2.5">
            <div className="pb-2 border-b border-slate-100 min-h-14.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-5 w-20 bg-slate-100 rounded-xl" />
                <div className="h-5 w-24 bg-slate-200 rounded-md" />
              </div>
              <div className="h-4 w-4/5 bg-slate-200 rounded" />
            </div>

            <div className="h-8 bg-slate-100 rounded" />
            <div className="h-5 w-3/4 bg-slate-100 rounded" />
            <div className="h-8 bg-slate-100 rounded" />
            <div className="h-5 w-full bg-slate-100 rounded" />
            <div className="h-5 w-full bg-slate-100 rounded" />
            <div className="h-5 w-full bg-slate-100 rounded" />
          </div>

          <div className="space-y-2.5 pt-2.5 border-t border-slate-100 mt-2.5">
            <div className="h-12 bg-slate-50 rounded-lg border border-slate-100" />
            <div className="h-8 w-full bg-slate-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};
