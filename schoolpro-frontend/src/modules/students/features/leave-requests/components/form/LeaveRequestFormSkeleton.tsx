import type React from "react";

/**
 * Pixel-accurate Skeleton for LeaveRequestFormBody (Create/Edit Leave Request Page).
 * Mirrors the exact 3-column layout:
 * - Left 2 columns: Form card with 8 distinct field rows/sections
 *   (LeaveType/Shift selects, StartDate/EndDate/Duration, Lessons Selector grid,
 *    Reason textarea, Guardian 3-input box, Upload dragger, Commitment textarea, Action buttons)
 * - Right 1 column: Sidebar with 3 distinct cards
 *   (Summary card with 6 key-value rows + deadline box, Notification Recipients card, Policy card with 4 rules)
 */
export const LeaveRequestFormSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 animate-pulse">
      {/* Left 2 Columns: Form Card */}
      <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs flex flex-col gap-5">
        {/* 1. Leave Type and Session Shift Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-9 w-full bg-slate-100 border border-slate-200 rounded-lg" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-9 w-full bg-slate-100 border border-slate-200 rounded-lg" />
          </div>
        </div>

        {/* 2. Date Range and Total Duration Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-9 w-full bg-slate-100 border border-slate-200 rounded-lg" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-9 w-full bg-slate-100 border border-slate-200 rounded-lg" />
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-200/70 flex flex-col items-center justify-center gap-1">
            <div className="h-3 w-24 bg-slate-200/80 rounded" />
            <div className="h-4 w-20 bg-blue-200/70 rounded" />
          </div>
        </div>

        {/* 3. Lessons Selector Skeleton */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="h-4 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-32 bg-slate-200 rounded" />
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/70 h-9" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[1, 2, 3, 4].map((lesson) => (
              <div
                key={lesson}
                className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5"
              >
                <div className="w-4 h-4 rounded bg-slate-200 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                    <div className="h-4 w-14 bg-slate-100 rounded" />
                  </div>
                  <div className="h-3 w-40 bg-slate-100 rounded" />
                  <div className="h-3 w-32 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Reason Skeleton */}
        <div className="flex flex-col gap-1.5">
          <div className="h-4 w-40 bg-slate-200 rounded" />
          <div className="h-24 w-full bg-slate-100 border border-slate-200 rounded-lg" />
        </div>

        {/* 5. Guardian Confirmation Skeleton */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col gap-3">
          <div className="h-4 w-52 bg-slate-200 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((field) => (
              <div key={field} className="flex flex-col gap-1">
                <div className="h-3.5 w-28 bg-slate-200/80 rounded" />
                <div className="h-9 w-full bg-white border border-slate-200 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* 6. Evidence Attachments Skeleton */}
        <div className="flex flex-col gap-2.5">
          <div className="h-4 w-48 bg-slate-200 rounded" />
          <div className="h-28 w-full rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1.5">
            <div className="w-9 h-9 rounded-xl bg-slate-200" />
            <div className="h-3.5 w-48 bg-slate-200 rounded" />
            <div className="h-3 w-64 bg-slate-100 rounded" />
          </div>
        </div>

        {/* 7. Student Commitment Skeleton */}
        <div className="flex flex-col gap-1.5">
          <div className="h-4 w-48 bg-slate-200 rounded" />
          <div className="h-20 w-full bg-slate-100 border border-slate-200 rounded-lg" />
        </div>

        {/* 8. Submit Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#f0f0f0]">
          <div className="h-9 w-24 bg-slate-100 border border-slate-200 rounded-lg" />
          <div className="h-9 w-36 bg-slate-200 rounded-lg" />
        </div>
      </div>

      {/* Right Column: 3 Sidebar Cards matching LeaveRequestFormSidebar */}
      <div className="flex flex-col gap-4">
        {/* Sidebar Card 1: Request Summary Skeleton */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
            <div className="h-4.5 w-40 bg-slate-200 rounded" />
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col gap-2.5">
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <div key={row} className="flex items-center justify-between gap-2">
                <div className="h-3.5 w-24 bg-slate-200/70 rounded" />
                <div className="h-3.5 w-28 bg-slate-200 rounded" />
              </div>
            ))}

            <div className="pt-2 border-t border-slate-200/80 flex flex-col gap-1.5">
              <div className="h-3.5 w-48 bg-slate-200/70 rounded" />
              <div className="h-11 w-full bg-amber-50/70 border border-amber-200/70 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Sidebar Card 2: Notified Instructors Skeleton */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
              <div className="h-4.5 w-44 bg-slate-200 rounded" />
            </div>
            <div className="h-5 w-16 bg-slate-100 rounded-md" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/70 flex items-center justify-between gap-2">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-3 w-40 bg-slate-100 rounded" />
              </div>
              <div className="h-5 w-20 bg-blue-200/70 rounded-md shrink-0" />
            </div>

            {[1, 2].map((teacher) => (
              <div
                key={teacher}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-3 w-36 bg-slate-100 rounded" />
                </div>
                <div className="h-5 w-16 bg-slate-200 rounded-md shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Card 3: Regulations Skeleton */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-amber-500 inline-block" />
            <div className="h-4.5 w-36 bg-slate-200 rounded" />
          </div>
          <div className="flex flex-col gap-2 pl-2">
            {[1, 2, 3, 4].map((rule) => (
              <div key={rule} className="h-3.5 w-full bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
