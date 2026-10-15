import type React from "react";
import type { AttendanceViewMode } from "@/modules/students/features/attendance/types";

interface AttendanceSkeletonProps {
  count?: number;
  viewMode?: AttendanceViewMode;
}

/**
 * Pixel-accurate Skeleton for AttendancePage matching the exact 4 content rows + 1 footer row
 * of SubjectAttendanceCard and AttendanceListView.
 */
export const AttendanceSkeleton: React.FC<AttendanceSkeletonProps> = ({
  count = 6,
  viewMode = "grid",
}) => {
  const skeletonKeys = Array.from(
    { length: count },
    (_, index) => `attendance-skeleton-${index + 1}`,
  );

  if (viewMode === "list") {
    return (
      <div className="bg-white border border-[#f0f0f0] rounded-xl shadow-2xs overflow-hidden divide-y divide-slate-100 animate-pulse">
        {skeletonKeys.map((key) => (
          <div
            key={key}
            className="p-4 flex items-center justify-between gap-4"
          >
            <div className="h-5 w-36 bg-slate-200 rounded-md" />
            <div className="h-5 w-52 bg-slate-200 rounded-md" />
            <div className="h-5 w-28 bg-slate-100 rounded-md" />
            <div className="h-5 w-36 bg-slate-100 rounded-md" />
            <div className="h-7 w-28 bg-slate-200 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-pulse">
      {skeletonKeys.map((key) => (
        <div
          key={key}
          className="w-full h-full bg-white border border-[#f0f0f0] rounded-xl p-4 flex flex-col justify-between gap-3.5 shadow-2xs"
        >
          <div className="space-y-3">
            {/* 1. Period & Status Tag */}
            <div className="flex items-center justify-between gap-2">
              <div className="h-5.5 w-20 bg-slate-200 rounded-md" />
              <div className="h-5.5 w-28 bg-slate-200 rounded-md shrink-0" />
            </div>

            {/* 2. TimeSlot & Shift Box */}
            <div className="flex items-center justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-[#f0f0f0]">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="h-5 w-20 bg-blue-100/70 rounded-full border border-blue-200/60 shrink-0" />
            </div>

            {/* 3. Subject Name */}
            <div className="space-y-1.5 min-h-10">
              <div className="h-4 w-4/5 bg-slate-200 rounded" />
              <div className="h-4 w-3/5 bg-slate-100 rounded" />
            </div>

            {/* 4. Room & Teacher */}
            <div className="flex items-center justify-between gap-2">
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-4 w-36 bg-slate-100 rounded" />
            </div>
          </div>

          {/* 5. Footer */}
          <div className="pt-2.5 border-t border-[#f0f0f0] flex items-center justify-between gap-2">
            <div className="h-4 w-24 bg-slate-100 rounded" />
            <div className="h-7 w-28 bg-slate-200 rounded-lg shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
};
