import type React from "react";

/**
 * Pixel-accurate Skeleton for LeaveRequestDetailPage to prevent Cumulative Layout Shift (CLS).
 * Synchronized with AssignmentSubmitPage layout:
 * 1. Detail Header Card (Breadcrumbs + Title/Code/LeaveType/Status + Action Buttons)
 * 2. Full-width Workflow Steps Card (Header + Steps + Banner)
 * 3. 2-Column Grid (lg:grid-cols-3):
 *    - Left 2 columns: Tabbed Content Card (Tabs: Content / Approval / Activity Log)
 *                      + Workspace Card (Actions toolbar + Attachments list)
 *    - Right 1 column: Tabbed Card 1 (Deadline & Rules / Teachers in Charge)
 *                      + Tabbed Card 2 (Guardian Confirmation / Academic Notes)
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
              <div className="h-6 w-20 bg-slate-100 rounded-lg border border-slate-200" />
              <div className="h-6 w-20 bg-slate-200 rounded-md" />
            </div>
            <div className="h-4 w-96 max-w-full bg-slate-100 rounded" />
            <div className="h-3.5 w-44 bg-slate-100 rounded" />
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="h-8 w-24 bg-slate-100 border border-slate-200 rounded-lg" />
            <div className="h-8 w-32 bg-slate-100 border border-slate-200 rounded-lg" />
            <div className="h-8 w-36 bg-slate-200 rounded-lg" />
          </div>
        </div>
      </div>

      {/* 2. Full-Width Workflow Steps Card Skeleton */}
      <div className="p-5 sm:p-6 rounded-xl border border-[#f0f0f0] bg-white shadow-2xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f0f0] pb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
            <div className="h-5 w-48 bg-slate-200 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-36 bg-slate-100 rounded-lg" />
            <div className="h-6 w-20 bg-slate-200 rounded-md" />
          </div>
        </div>

        {/* 4 Steps Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 py-1">
          {[1, 2, 3, 4].map((step) => (
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

      {/* 3. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-start">
        {/* Left Column (2 spans): Tabbed Content Card + Workspace Card */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          {/* Tabbed Content Card */}
          <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-4">
            {/* Tabs Header */}
            <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
              <div className="h-7 w-28 bg-blue-100 rounded-lg" />
              <div className="h-7 w-32 bg-slate-100 rounded-lg" />
              <div className="h-7 w-28 bg-slate-100 rounded-lg" />
            </div>

            {/* 3 Metric Highlight Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
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
              <div className="h-12 w-full bg-blue-50/40 border border-blue-200/50 rounded-xl" />
            </div>

            {/* Affected Lessons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[1, 2].map((lesson) => (
                <div
                  key={lesson}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3"
                >
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                    <div className="h-3 w-32 bg-slate-100 rounded" />
                    <div className="h-3 w-24 bg-slate-100 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-white border border-slate-200 rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          {/* Workspace Card */}
          <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#f0f0f0]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
                <div className="h-5 w-48 bg-slate-200 rounded" />
              </div>
              <div className="h-6 w-20 bg-slate-100 rounded" />
            </div>

            {/* Actions Bar */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-3">
              <div className="h-4 w-44 bg-slate-200 rounded" />
              <div className="flex gap-2">
                <div className="h-9 w-32 bg-slate-200 rounded-lg" />
                <div className="h-9 w-36 bg-blue-600/60 rounded-lg" />
              </div>
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <div className="h-4 w-40 bg-slate-200 rounded" />
              <div className="h-12 w-full bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Tabbed Sidebar Cards */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-5">
          {/* Sidebar Card 1: Deadlines & Teachers */}
          <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-3">
            <div className="flex gap-3 border-b border-slate-200 pb-2">
              <div className="h-6 w-28 bg-blue-100 rounded" />
              <div className="h-6 w-28 bg-slate-100 rounded" />
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-2">
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-4 w-3/4 bg-slate-200 rounded" />
              <div className="h-4 w-1/2 bg-slate-200 rounded" />
            </div>
          </div>

          {/* Sidebar Card 2: Guardian & Academic Notes */}
          <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-3">
            <div className="flex gap-3 border-b border-slate-200 pb-2">
              <div className="h-6 w-28 bg-blue-100 rounded" />
              <div className="h-6 w-28 bg-slate-100 rounded" />
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-2">
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-4 w-2/3 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
