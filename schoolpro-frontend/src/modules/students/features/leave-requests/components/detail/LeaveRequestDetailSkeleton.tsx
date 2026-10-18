import type React from "react";

/**
 * Pixel-accurate Skeleton for LeaveRequestDetailPage to prevent Cumulative Layout Shift (CLS).
 * Mirrors the redesigned layout with rounded-xl containers:
 * 1. Detail Header Card (Breadcrumb + Title/Code/Status + Action Buttons)
 * 2. Full-width Status & Progress Banner (Status icon + title/description + 3-step mini stepper)
 * 3. 2-Column Grid (lg:grid-cols-3):
 *    - Left 2 columns: Content Card (3 metric highlights + reason + commitment + 4 affected lessons)
 *                      + Activity Log Card (header + timeline rows)
 *    - Right 1 column: Homeroom Teacher Card (avatar + teacher info + subject teachers)
 *                      + Guardian Card (3 rows)
 *                      + Attachments Card (header + attachment box)
 */
export const LeaveRequestDetailSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 sm:gap-5 pb-8 animate-pulse">
      {/* 1. Header Card Skeleton */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs flex flex-col gap-3">
        {/* Breadcrumb row */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 bg-slate-200 rounded" />
          <span className="text-slate-300 text-xs">/</span>
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <span className="text-slate-300 text-xs">/</span>
          <div className="h-4 w-24 bg-slate-200 rounded" />
        </div>

        {/* Title & Action buttons row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
              <div className="h-7 w-56 bg-slate-200 rounded-lg" />
              <div className="h-6 w-28 bg-slate-100 rounded-lg border border-slate-200" />
              <div className="h-6 w-20 bg-slate-200 rounded-md" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-4 w-44 bg-slate-100 rounded" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="h-8 w-24 bg-slate-100 border border-slate-200 rounded-lg" />
            <div className="h-8 w-36 bg-slate-200 rounded-lg" />
            <div className="h-8 w-20 bg-slate-100 border border-slate-200 rounded-lg" />
            <div className="h-8 w-24 bg-slate-100 border border-slate-200 rounded-lg" />
          </div>
        </div>
      </div>

      {/* 2. Full-Width Status Banner Skeleton */}
      <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-200 shrink-0" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-64 bg-slate-200 rounded" />
                <div className="h-5 w-20 bg-slate-100 rounded" />
              </div>
              <div className="h-4 w-96 max-w-full bg-slate-100 rounded" />
            </div>
          </div>
          <div className="h-9 w-48 bg-slate-100 rounded-xl" />
        </div>

        {/* 3-Step Horizontal Stepper Skeleton */}
        <div className="pt-3 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-slate-200 shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="h-3.5 w-20 bg-slate-200 rounded" />
                  <div className="h-3 w-28 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-start">
        {/* Left Column (2 spans): Content Card + Activity Log */}
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-5">
          {/* Card: LeaveRequestContentCard */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-[#f0f0f0] pb-3.5">
              <span className="w-1.5 h-4.5 rounded-full bg-blue-600 inline-block" />
              <div className="h-5 w-52 bg-slate-200 rounded" />
            </div>

            {/* 3 Metric Highlight Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[1, 2, 3].map((box) => (
                <div
                  key={box}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col gap-2"
                >
                  <div className="h-3.5 w-24 bg-slate-200/80 rounded" />
                  <div className="h-5 w-32 bg-slate-200 rounded" />
                </div>
              ))}
            </div>

            {/* Reason Box */}
            <div className="flex flex-col gap-2">
              <div className="h-4 w-36 bg-slate-200 rounded" />
              <div className="h-20 w-full bg-slate-50 border border-slate-200/80 rounded-xl" />
            </div>

            {/* Commitment Box */}
            <div className="flex flex-col gap-2">
              <div className="h-4 w-44 bg-slate-200 rounded" />
              <div className="h-14 w-full bg-blue-50/40 border border-blue-200/50 rounded-xl" />
            </div>

            {/* Affected Lessons Grid */}
            <div className="space-y-3 pt-2 border-t border-[#f0f0f0]">
              <div className="flex items-center justify-between">
                <div className="h-4 w-44 bg-slate-200 rounded" />
                <div className="h-5 w-24 bg-slate-100 rounded-md" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((lesson) => (
                  <div
                    key={lesson}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-12 bg-slate-200 rounded" />
                        <div className="h-4 w-24 bg-slate-200 rounded" />
                      </div>
                      <div className="h-3 w-32 bg-slate-100 rounded" />
                      <div className="h-3 w-28 bg-slate-100 rounded" />
                    </div>
                    <div className="h-6 w-24 bg-white border border-slate-200 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card: Activity Log Skeleton */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-4.5 rounded-full bg-blue-600 inline-block" />
                <div className="h-5 w-44 bg-slate-200 rounded" />
              </div>
              <div className="h-5 w-20 bg-slate-100 rounded-full" />
            </div>

            <div className="space-y-3 pl-6">
              {[1, 2].map((log) => (
                <div
                  key={log}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-40 bg-slate-200 rounded" />
                    <div className="h-4 w-24 bg-slate-100 rounded" />
                  </div>
                  <div className="h-3 w-48 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Sidebar */}
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Card: Homeroom Approver */}
          <div className="bg-white p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#f0f0f0] pb-3">
              <span className="w-1.5 h-4.5 rounded-full bg-blue-600 inline-block" />
              <div className="h-4.5 w-40 bg-slate-200 rounded" />
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-3 w-20 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-slate-100 rounded" />
              <div className="h-3.5 w-3/4 bg-slate-100 rounded" />
            </div>
          </div>

          {/* Card: Guardian */}
          <div className="bg-white p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2.5 border-b border-[#f0f0f0] pb-3">
              <span className="w-1.5 h-4.5 rounded-full bg-emerald-600 inline-block" />
              <div className="h-4.5 w-40 bg-slate-200 rounded" />
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
              <div className="h-3.5 w-full bg-slate-100 rounded" />
              <div className="h-3.5 w-3/4 bg-slate-100 rounded" />
              <div className="h-3.5 w-1/2 bg-slate-100 rounded" />
            </div>
          </div>

          {/* Card: Attachments */}
          <div className="bg-white p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2.5 border-b border-[#f0f0f0] pb-3">
              <span className="w-1.5 h-4.5 rounded-full bg-indigo-600 inline-block" />
              <div className="h-4.5 w-44 bg-slate-200 rounded" />
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0" />
                <div className="h-3.5 w-28 bg-slate-200 rounded" />
              </div>
              <div className="h-6 w-16 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
