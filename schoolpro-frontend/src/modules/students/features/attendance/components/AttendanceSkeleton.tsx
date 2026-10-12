import type React from "react";

interface AttendanceSkeletonProps {
  count?: number;
}

/**
 * Pixel-accurate Skeleton for SubjectAttendanceCard grid.
 * Mirrors the exact 4 content rows + 1 footer row of SubjectAttendanceCard
 * with explicit flex gap spacing so cards never stick together or cause layout shift.
 */
export const AttendanceSkeleton: React.FC<AttendanceSkeletonProps> = ({
  count = 4,
}) => {
  const placeholders = Array.from({ length: count }, (_, idx) => idx + 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
      {placeholders.map((n) => (
        <div
          key={n}
          className="bg-white rounded-xl border border-[#f0f0f0] p-5 shadow-2xs flex flex-col justify-between gap-4 h-full"
        >
          <div className="flex flex-col gap-3.5">
            {/* Row 1: Period Badge, Time Slot & Status Badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/70 shrink-0" />
                <div className="flex flex-col gap-1.5">
                  <div className="h-4 w-36 bg-slate-200 rounded" />
                  <div className="h-3 w-28 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="h-6 w-28 bg-slate-200 rounded-full shrink-0" />
            </div>

            {/* Row 2: Subject Title & Teacher / Room Grid */}
            <div className="flex flex-col gap-2">
              <div className="h-6 w-3/4 bg-slate-200 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-slate-100 shrink-0" />
                  <div className="h-3.5 w-36 bg-slate-100 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-slate-100 shrink-0" />
                  <div className="h-3.5 w-32 bg-slate-100 rounded" />
                </div>
              </div>
            </div>

            {/* Row 3: Anti-cheat GPS Radius & Countdown Strip */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-24 bg-slate-200 rounded" />
                <div className="h-5 w-28 bg-slate-200 rounded" />
              </div>
              <div className="h-5 w-28 bg-slate-200 rounded" />
            </div>

            {/* Row 4: Note Box */}
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex flex-col gap-1.5">
              <div className="h-3.5 w-full bg-slate-100 rounded" />
              <div className="h-3.5 w-4/5 bg-slate-100 rounded" />
            </div>
          </div>

          {/* Footer Row: Deadline Info & Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="h-4 w-36 bg-slate-100 rounded" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-24 bg-slate-100 rounded-lg" />
              <div className="h-8 w-32 bg-slate-200 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
