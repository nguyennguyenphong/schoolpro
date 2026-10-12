import type React from "react";
import type { AssignmentViewMode } from "@/modules/students/features/assignments/types";

interface AssignmentSkeletonProps {
  viewMode?: AssignmentViewMode;
  count?: number;
}

/**
 * Pixel-accurate Skeleton for AssignmentsPage (supports both Grid Card & List Item modes).
 * Mirrors the exact 4 content rows + footer row of AssignmentCard and 3 rows + action button
 * of AssignmentListItem to prevent Cumulative Layout Shift (CLS).
 */
export const AssignmentSkeleton: React.FC<AssignmentSkeletonProps> = ({
  viewMode = "grid",
  count = 6,
}) => {
  const placeholders = Array.from({ length: count }, (_, idx) => idx + 1);

  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {placeholders.map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-[#f0f0f0] shadow-2xs p-4 flex flex-col justify-between gap-3.5 h-full"
            >
              <div className="flex flex-col gap-2.5">
                {/* Row 1: Subject Badge & Status Tag */}
                <div className="flex items-center justify-between gap-2">
                  <div className="h-5.5 w-28 bg-slate-200 rounded-xl" />
                  <div className="h-5.5 w-24 bg-slate-200 rounded-md shrink-0" />
                </div>

                {/* Row 2: Assignment Title (2 lines) */}
                <div className="flex flex-col gap-1.5 py-0.5 min-h-10">
                  <div className="h-4 w-full bg-slate-200 rounded" />
                  <div className="h-4 w-3/4 bg-slate-200 rounded" />
                </div>

                {/* Row 3: Highlighted Due Date Box */}
                <div className="flex items-center justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded bg-slate-200 shrink-0" />
                    <div className="h-3.5 w-36 bg-slate-200 rounded" />
                  </div>
                  <div className="h-4 w-16 bg-slate-100 rounded" />
                </div>

                {/* Row 4: Teacher & Attachments Meta */}
                <div className="flex items-center justify-between gap-2">
                  <div className="h-3.5 w-40 bg-slate-100 rounded" />
                  <div className="h-3.5 w-16 bg-slate-100 rounded" />
                </div>
              </div>

              {/* Footer Row: Type Badge & Action Button */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="h-5.5 w-28 bg-slate-100 rounded-md" />
                <div className="h-8 w-24 bg-slate-200 rounded-lg shrink-0" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {placeholders.map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-[#f0f0f0] shadow-2xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1 min-w-0">
                {/* Row 1: Subject, Type & Status Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="h-5.5 w-28 bg-slate-200 rounded-xl" />
                  <div className="h-5.5 w-24 bg-slate-100 rounded-md" />
                  <div className="h-5.5 w-28 bg-slate-200 rounded-md" />
                </div>

                {/* Row 2: Title */}
                <div className="h-5 w-3/4 bg-slate-200 rounded" />

                {/* Row 3: Due date, teacher, attachments */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="h-3.5 w-40 bg-slate-100 rounded" />
                  <div className="h-3.5 w-36 bg-slate-100 rounded" />
                  <div className="h-3.5 w-24 bg-slate-100 rounded" />
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-end">
                <div className="h-8 w-28 bg-slate-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
