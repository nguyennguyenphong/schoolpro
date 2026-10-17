import type React from "react";

/**
 * Pixel-accurate Skeleton for MaterialDetailPage to prevent Cumulative Layout Shift (CLS).
 * Mirrors the exact layout:
 * 1. Detail Header Card (Breadcrumb + Title/Subject/Category/Format + Action Buttons)
 * 2. 3-Column Grid:
 *    - Left 2 columns: Preview Card (Pedagogy badge + overview + document canvas) + Outline Card (chapters)
 *    - Right 1 column: File Specifications Card + Teacher Card + Quick Download Action Card
 */
export const MaterialDetailSkeleton: React.FC = () => {
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
          <div className="h-4 w-32 bg-slate-200 rounded" />
        </div>

        {/* Title & Action buttons row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-blue-600 inline-block" />
              <div className="h-7 w-64 sm:w-96 bg-slate-200 rounded-lg" />
              <div className="h-6 w-24 bg-slate-100 rounded-lg border border-slate-200" />
              <div className="h-6 w-20 bg-slate-200 rounded-md" />
            </div>
            <div className="flex flex-wrap items-center gap-3 pl-3.5">
              <div className="h-4 w-36 bg-slate-100 rounded" />
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-4 w-28 bg-slate-100 rounded" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="h-9 w-24 bg-slate-100 border border-slate-200 rounded-lg" />
            <div className="h-9 w-32 bg-slate-100 border border-slate-200 rounded-lg" />
            <div className="h-9 w-28 bg-slate-200 rounded-lg" />
          </div>
        </div>
      </div>

      {/* 2. Main Grid: Left 2 cols, Right 1 col */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-start">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          {/* Preview Card Skeleton */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-4">
              <div className="h-6 w-48 bg-slate-200 rounded" />
              <div className="h-6 w-36 bg-slate-100 rounded-lg border border-slate-200" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-28 bg-slate-100 rounded" />
              <div className="h-20 bg-slate-50 rounded-xl border border-[#f0f0f0]" />
            </div>
            <div className="h-96 bg-slate-100 rounded-xl border border-slate-200" />
          </div>

          {/* Outline Card Skeleton */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-3.5">
              <div className="h-5 w-56 bg-slate-200 rounded" />
              <div className="h-5 w-24 bg-slate-100 rounded-full" />
            </div>
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-slate-50 rounded-xl border border-[#f0f0f0]" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-4 sm:space-y-5">
          {/* File Specs Skeleton */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
            <div className="h-5 w-44 bg-slate-200 rounded border-b border-[#f0f0f0] pb-2.5" />
            <div className="space-y-2 pt-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-8 bg-slate-50 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Teacher Card Skeleton */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
            <div className="h-5 w-44 bg-slate-200 rounded border-b border-[#f0f0f0] pb-2.5" />
            <div className="h-24 bg-slate-50 rounded-xl border border-[#f0f0f0]" />
          </div>

          {/* Action Card Skeleton */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-2.5">
            <div className="h-10 bg-slate-200 rounded-lg" />
            <div className="h-9 bg-slate-100 border border-slate-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};
