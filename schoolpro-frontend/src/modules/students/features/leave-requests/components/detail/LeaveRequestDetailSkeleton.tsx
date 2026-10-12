import type React from "react";

/**
 * Pixel-accurate Skeleton for LeaveRequestDetailPage to prevent Cumulative Layout Shift (CLS).
 * Mirrors the exact layout:
 * 1. Detail Header Card (Breadcrumb + Title/Code/Status + 4 Action Buttons)
 * 2. Full-width Workflow Card (Header + 4-step Horizontal Workflow + Deadline/Note Banner)
 * 3. 3-Column Grid:
 *    - Left 2 columns: Content Card (3 summary boxes + reason + commitment + 4 affected lessons)
 *                      + Activity Log Card (timeline with 3 event log cards)
 *    - Right 1 column: Homeroom & Subject Teachers Card (4 homeroom rows + 2 subject teacher boxes)
 *                      + Student & Guardian Card (3 student rows + 3 guardian rows)
 *                      + Attachments Card (header + attachment box)
 */
export const LeaveRequestDetailSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 sm:gap-5 pb-8 animate-pulse">
      {/* 1. Header Card Skeleton (LeaveRequestDetailHeader) */}
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
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
              <div className="h-7 w-52 bg-slate-200 rounded-lg" />
              <div className="h-6 w-28 bg-slate-100 rounded-lg border border-slate-200" />
              <div className="h-6 w-24 bg-slate-200 rounded-md" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-4 w-44 bg-slate-100 rounded" />
              <div className="h-4 w-24 bg-slate-100 rounded" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="h-8 w-24 bg-slate-100 border border-slate-200 rounded-lg" />
            <div className="h-8 w-40 bg-slate-200 rounded-lg" />
            <div className="h-8 w-24 bg-slate-100 border border-slate-200 rounded-lg" />
            <div className="h-8 w-24 bg-slate-100 border border-slate-200 rounded-lg" />
          </div>
        </div>
      </div>

      {/* 2. Full-Width Workflow Card Skeleton (LeaveRequestWorkflowCard) */}
      <div className="w-full bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs flex flex-col gap-5">
        {/* Card header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
            <div className="h-5 w-64 bg-slate-200 rounded" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-7 w-52 bg-slate-50 border border-slate-200 rounded-lg" />
            <div className="h-6 w-24 bg-slate-200 rounded-md" />
          </div>
        </div>

        {/* 4-Step Horizontal Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 px-1 sm:px-2">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-slate-200 shrink-0 mt-0.5" />
              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
                <div className="h-3.5 w-full bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Deadline / Teacher note status banner */}
        <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
          <div className="h-4 w-72 max-w-full bg-slate-200/80 rounded" />
          <div className="h-4 w-40 bg-slate-200/80 rounded" />
        </div>
      </div>

      {/* 3. Main 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-start">
        {/* Left Column (2 spans): Content Card + Activity Log Card */}
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-5">
          {/* Card 3A: LeaveRequestContentCard */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
              <div className="h-5 w-48 bg-slate-200 rounded" />
            </div>

            {/* 3 Summary Boxes (Date Range, Days & Shift, Category) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((box) => (
                <div
                  key={box}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5"
                >
                  <div className="h-3 w-24 bg-slate-200/80 rounded" />
                  <div className="h-5 w-36 bg-slate-200 rounded" />
                </div>
              ))}
            </div>

            {/* Detailed Reason & Student Commitment Boxes */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="h-4 w-36 bg-slate-200 rounded" />
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col gap-2">
                  <div className="h-3.5 w-full bg-slate-200/70 rounded" />
                  <div className="h-3.5 w-4/5 bg-slate-200/70 rounded" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="h-4 w-44 bg-slate-200 rounded" />
                <div className="p-3 rounded-xl bg-blue-50/40 border border-blue-100 flex flex-col gap-1.5">
                  <div className="h-3.5 w-5/6 bg-slate-200/70 rounded" />
                </div>
              </div>
            </div>

            {/* Affected Lessons Section */}
            <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="h-4 w-52 bg-slate-200 rounded" />
                <div className="flex flex-wrap gap-1.5">
                  <div className="h-5 w-14 bg-slate-100 rounded-md" />
                  <div className="h-5 w-16 bg-slate-100 rounded-md" />
                  <div className="h-5 w-14 bg-slate-100 rounded-md" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[1, 2, 3, 4].map((lesson) => (
                  <div
                    key={lesson}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex flex-col gap-1.5 flex-1">
                      <div className="h-4 w-32 bg-slate-200 rounded" />
                      <div className="h-3 w-40 bg-slate-100 rounded" />
                    </div>
                    <div className="h-6 w-24 bg-white border border-slate-200/80 rounded-lg shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3B: LeaveRequestActivityLogCard */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-emerald-600 inline-block" />
                <div className="h-5 w-52 bg-slate-200 rounded" />
              </div>
              <div className="h-4 w-20 bg-slate-100 rounded" />
            </div>

            <div className="relative pl-4 flex flex-col gap-3 before:content-[''] before:absolute before:left-1.75 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {[1, 2, 3].map((log) => (
                <div key={log} className="relative pl-4">
                  <span className="w-3 h-3 rounded-full border-2 border-white shadow-xs absolute -left-3.5 top-1.5 bg-slate-300" />
                  <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="h-4 w-44 bg-slate-200 rounded" />
                      <div className="flex items-center gap-1.5">
                        <div className="h-5 w-16 bg-slate-200 rounded-md" />
                        <div className="h-5 w-28 bg-white border border-slate-200 rounded-lg" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="h-3.5 w-36 bg-slate-100 rounded" />
                      <div className="h-3.5 w-32 bg-slate-100 rounded" />
                    </div>
                    <div className="h-3.5 w-5/6 bg-slate-100 rounded pt-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): LeaveRequestDetailSidebar (3 separate cards) */}
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Sidebar Card 1: Homeroom Teacher & Subject Teachers */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs flex flex-col gap-4">
            {/* Homeroom section (4 rows) */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
                <div className="h-4.5 w-48 bg-slate-200 rounded" />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2.5">
                {[1, 2, 3, 4].map((row) => (
                  <div key={row} className="flex items-center justify-between gap-2">
                    <div className="h-3.5 w-24 bg-slate-200/70 rounded" />
                    <div className="h-3.5 w-32 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Subject teachers section (2 teacher cards) */}
            <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="h-4 w-44 bg-slate-200 rounded" />
                <div className="h-5 w-16 bg-slate-100 rounded-md" />
              </div>

              <div className="flex flex-col gap-2">
                {[1, 2].map((teacher) => (
                  <div
                    key={teacher}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="h-4 w-28 bg-slate-200 rounded" />
                      <div className="h-3 w-36 bg-slate-100 rounded" />
                    </div>
                    <div className="h-5 w-20 bg-slate-200 rounded-md shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Card 2: Student (3 rows) & Guardian (3 rows) */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs flex flex-col gap-4">
            {/* Student Info (3 rows) */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <span className="w-1.5 h-4 rounded-full bg-slate-700 inline-block" />
                <div className="h-4.5 w-40 bg-slate-200 rounded" />
              </div>

              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((row) => (
                  <div key={row} className="flex items-center justify-between gap-2">
                    <div className="h-3.5 w-24 bg-slate-100 rounded" />
                    <div className="h-3.5 w-28 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Guardian Info (3 rows) */}
            <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 rounded-full bg-emerald-600 inline-block" />
                <div className="h-4 w-44 bg-slate-200 rounded" />
              </div>

              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((row) => (
                  <div key={row} className="flex items-center justify-between gap-2">
                    <div className="h-3.5 w-24 bg-slate-100 rounded" />
                    <div className="h-3.5 w-28 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Card 3: Attachments */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
              <div className="h-4.5 w-44 bg-slate-200 rounded" />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-slate-200 shrink-0" />
                <div className="h-4 w-36 bg-slate-200 rounded" />
              </div>
              <div className="h-4 w-16 bg-slate-100 rounded shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
