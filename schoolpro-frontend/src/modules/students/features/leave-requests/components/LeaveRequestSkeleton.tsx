import type React from "react";
import type { LeaveRequestViewMode } from "@/modules/students/features/leave-requests/types";

interface LeaveRequestSkeletonProps {
  viewMode?: LeaveRequestViewMode;
  count?: number;
}

/**
 * Pixel-accurate Skeleton for LeaveRequestsPage (supports both Grid Card & List Item modes).
 * Mirrors the exact 4 content rows + 1 footer row of LeaveRequestCard and 3 rows + action button
 * of LeaveRequestListItem, plus the pagination bar, eliminating Cumulative Layout Shift (CLS).
 */
export const LeaveRequestSkeleton: React.FC<LeaveRequestSkeletonProps> = ({
  viewMode = "grid",
  count = 6,
}) => {
  const placeholders = Array.from({ length: count }, (_, idx) => idx + 1);

  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {placeholders.map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-[#f0f0f0] shadow-2xs p-4 flex flex-col justify-between gap-3.5 h-full"
            >
              <div className="flex flex-col gap-3">
                {/* Row 1: Leave Type Tag & Status Tag */}
                <div className="flex items-center justify-between gap-2">
                  <div className="h-5.5 w-28 bg-slate-200 rounded-md" />
                  <div className="h-5.5 w-24 bg-slate-200 rounded-md shrink-0" />
                </div>

                {/* Row 2: Highlighted Date Range & Days/Shift Badge Box */}
                <div className="flex items-center justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2.5 border border-[#f0f0f0]">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-4 h-4 rounded bg-slate-200 shrink-0" />
                    <div className="h-4 w-36 bg-slate-200 rounded" />
                  </div>
                  <div className="h-5 w-24 bg-blue-100/70 rounded-full border border-blue-200/60 shrink-0" />
                </div>

                {/* Row 3: Affected Subjects Label & Tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="h-3.5 w-20 bg-slate-100 rounded" />
                  <div className="h-4.5 w-12 bg-slate-200/80 rounded-md" />
                  <div className="h-4.5 w-14 bg-slate-200/80 rounded-md" />
                  <div className="h-4.5 w-12 bg-slate-200/80 rounded-md" />
                </div>

                {/* Row 4: Reason Summary (2 lines matching line-clamp-2) */}
                <div className="flex flex-col gap-1.5 py-0.5">
                  <div className="h-3.5 w-full bg-slate-100 rounded" />
                  <div className="h-3.5 w-4/5 bg-slate-100 rounded" />
                </div>
              </div>

              {/* Footer Row: CreatedAt Timestamp & View Detail Button */}
              <div className="pt-2.5 border-t border-[#f0f0f0] flex items-center justify-between gap-2">
                <div className="h-3.5 w-28 bg-slate-100 rounded" />
                <div className="h-7 w-24 bg-slate-200 rounded-lg shrink-0" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {placeholders.map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-[#f0f0f0] shadow-2xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left: 3 rows of key info matching LeaveRequestListItem */}
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                {/* Row 1: Type tag, Status tag, Calendar date range & shift */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="h-5.5 w-28 bg-slate-200 rounded-md" />
                  <div className="h-5.5 w-24 bg-slate-200 rounded-md" />
                  <div className="h-4 w-52 bg-slate-100 rounded ml-1" />
                </div>

                {/* Row 2: 1-line reason */}
                <div className="h-4 w-3/4 bg-slate-100 rounded" />

                {/* Row 3: Submitted timestamp & affected subjects */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <div className="h-3.5 w-36 bg-slate-100 rounded" />
                  <div className="h-3.5 w-44 bg-slate-100 rounded" />
                </div>
              </div>

              {/* Right: Detail Button */}
              <div className="flex items-center self-end md:self-center shrink-0">
                <div className="h-8 w-28 bg-slate-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar Skeleton matching LeaveRequestsPagination */}
      <div className="bg-white px-4 py-3 rounded-xl border border-[#f0f0f0] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="h-4 w-48 bg-slate-100 rounded" />
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100" />
          <div className="w-8 h-8 rounded-lg bg-slate-200" />
          <div className="w-8 h-8 rounded-lg bg-slate-100" />
        </div>
      </div>
    </div>
  );
};
